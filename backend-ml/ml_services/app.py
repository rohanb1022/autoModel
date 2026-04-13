import os
import shutil
import uvicorn
import pandas as pd
from fastapi import FastAPI, UploadFile, File, Depends, HTTPException
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
from dotenv import load_dotenv

# Load environment variables early
load_dotenv()

from src.data_cleaning import basic_cleaning
from src.eda import analyze_target_column, plot_target_distribution, plot_correlation_heatmap, plot_feature_distributions
from src.train import prepare_data, train_models
from rag.store_training_memory import store_training_memory
from rag.rag_chat import ask_ai
from auth.jwt_handler import get_current_user

from fastapi.middleware.cors import CORSMiddleware

# ----------------------------------------
# App Init
# ----------------------------------------
app = FastAPI()

# ----------------------------------------
# CORS — explicitly list allowed origins
# SECURITY: allow_origins=["*"] + allow_credentials=True is invalid and
# a security misconfiguration. Always use explicit origins in production.
# ----------------------------------------
_frontend_url   = os.getenv("FRONTEND_URL", "http://localhost:8080")
_node_backend   = os.getenv("NODE_BACKEND_URL", "http://localhost:5000")

ALLOWED_ORIGINS = [
    "http://localhost:8080",
    "http://localhost:5173",
    "http://localhost:3000",
    _frontend_url,
    _node_backend,
]
# De-duplicate and remove empty strings
ALLOWED_ORIGINS = list(set(o for o in ALLOWED_ORIGINS if o))

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

# ----------------------------------------
# Serve static files (Plots)
# ----------------------------------------
OUTPUT_DIR = "outputs"
if not os.path.exists(OUTPUT_DIR):
    os.makedirs(OUTPUT_DIR)

app.mount("/outputs", StaticFiles(directory=OUTPUT_DIR), name="outputs")

# ----------------------------------------
# File path for uploaded dataset
# ----------------------------------------
UPLOAD_PATH = "temp.csv"

# ----------------------------------------
# Request schemas with validation (L1 fix)
# ----------------------------------------
class ChatRequest(BaseModel):
    question: str = Field(..., min_length=1, max_length=2000)

class ConfirmTargetRequest(BaseModel):
    target_column: str = Field(..., min_length=1, max_length=200)
    dataset_name: str  = Field("uploaded_dataset.csv", min_length=1, max_length=500)

# ----------------------------------------
# Root route
# ----------------------------------------
@app.get("/")
def home():
    return {"message": "AI Analyst API running"}

# ----------------------------------------
# ANALYZE DATASET (no training yet)
# ----------------------------------------
@app.post("/analyze")
async def analyze_dataset(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    try:
        # Save uploaded file
        with open(UPLOAD_PATH, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Load dataset
        df = pd.read_csv(UPLOAD_PATH)

        if df.empty:
            return {"error": "Uploaded file is empty."}

        # Cleaning
        df = basic_cleaning(df)

        if df.shape[1] < 2:
            return {"error": "Dataset must contain at least 2 columns."}

        # Target detection
        target_column, problem_type, ranked = analyze_target_column(df)

        # Generate EDA
        plot_target_distribution(df, target_column, problem_type)
        plot_correlation_heatmap(df)
        plot_feature_distributions(df)

        return {
            "dataset_name": file.filename,
            "rows": df.shape[0],
            "columns_count": df.shape[1],
            "all_columns": list(df.columns),
            "suggested_target": target_column,
            "problem_type": problem_type,
            "ranked_suggestions": ranked[:5],
            "message": "Dataset analyzed successfully. Please confirm target column."
        }

    except Exception as e:
        return {
            "error": "Failed to analyze dataset",
            "details": str(e)
        }

# ----------------------------------------
# CONFIRM TARGET + TRAIN MODEL
# ----------------------------------------
@app.post("/confirm-target")
async def confirm_target(
    data: dict,
    current_user: dict = Depends(get_current_user)
):
    try:
        target_column = data.get("target_column")
        dataset_name = data.get("dataset_name", "uploaded_dataset.csv")

        df = pd.read_csv(UPLOAD_PATH)
        df = basic_cleaning(df)

        if target_column not in df.columns:
            return {"error": "Invalid target column selected."}

        y = df[target_column]

        if y.nunique() < 2:
            return {"error": "Target must contain at least 2 unique values."}

        # Detect problem type
        unique_values = y.nunique()
        total_rows = len(df)
        unique_ratio = unique_values / total_rows

        if not pd.api.types.is_numeric_dtype(y):
            if unique_ratio > 0.5:
                # To prevent errors for high-cardinality strings, we fallback to regression (which will fail upstream if string, but handles high cardinality numbers masquerading as strings)
                problem_type = "regression" 
            else:
                problem_type = "classification"
        else:
            if unique_ratio > 0.1 and unique_values > 10:
                problem_type = "regression"
            else:
                problem_type = "classification"

        import traceback
        from src.auto_healer import auto_heal_dataset
        
        system_messages = []
        best_model_name = None
        best_score = None

        try:
            # First attempt
            X_train, X_test, y_train, y_test = prepare_data(df, target_column)
            best_model_name, best_score = train_models(X_train, X_test, y_train, y_test, problem_type)
        except Exception as first_error:
            # We hit an error! Kick in the Auto-Healer.
            traceback_str = traceback.format_exc()
            system_messages.append({
                "type": "error",
                "title": "Pipeline Error Detected",
                "content": f"We encountered a crash during training. Engaging Gemini Auto-Healer. Error snippet: {str(first_error)}",
                "traceback": traceback_str
            })

            try:
                # Ask LLM for the fix
                df, generated_code = auto_heal_dataset(df, traceback_str)
                
                system_messages.append({
                    "type": "info",
                    "title": "Auto-Heal Code Generated",
                    "content": "Gemini provided a Pandas script to repair the dataset formatting.",
                    "llmCode": generated_code
                })
                
                # Second attempt
                X_train, X_test, y_train, y_test = prepare_data(df, target_column)
                best_model_name, best_score = train_models(X_train, X_test, y_train, y_test, problem_type)

                system_messages.append({
                    "type": "success",
                    "title": "Healing Successful!",
                    "content": "We successfully applied the fix. Don't worry, we handled it, go and check your accuracy!"
                })
            except Exception as second_error:
                # The auto-heal also failed.
                system_messages.append({
                    "type": "error",
                    "title": "Fatal Error",
                    "content": f"The auto-healer attempted a fix but it failed: {str(second_error)}"
                })
                return {
                    "error": "Training failed after auto-heal attempt.",
                    "system_messages": system_messages,
                    "details": str(second_error)
                }

        # Store training memory (for RAG/chatbot)
        store_training_memory(
            current_user["id"],
            {
                "dataset_name": dataset_name,
                "rows": df.shape[0],
                "columns": df.shape[1],
                "target": target_column,
                "problem_type": problem_type,
                "best_model": best_model_name,
                "score": round(best_score, 4),
                "notes": "User-confirmed training result"
            }
        )

        return {
            "message": "Training completed successfully.",
            "dataset_name": dataset_name,
            "target_column": target_column,
            "problem_type": problem_type,
            "best_model": best_model_name,
            "score": round(best_score, 4),
            "rows": df.shape[0],
            "columns": df.shape[1],
            "system_messages": system_messages
        }

    except Exception as e:
        return {
            "error": "Training failed due to unexpected system error.",
            "details": str(e)
        }

# ----------------------------------------
# AI INSIGHTS
# ----------------------------------------
class InsightRequest(BaseModel):
    datasetName: str
    problemType: str
    bestModel: str
    accuracy: float

@app.post("/generate-insights")
def generate_insights(
    request: InsightRequest,
    current_user: dict = Depends(get_current_user)
):
    # Uses Groq (gemma2-9b-it, open-source) → HuggingFace → static fallback
    # No Gemini here — keeps open-source and avoids 15 RPM Gemini limit
    from rag.rag_chat import call_llm_cascade

    prompt = f"""You are an expert AI data scientist. Analyze the following ML training result and provide exactly 3 concise, actionable bullet points formatted in markdown.

Dataset: {request.datasetName}
Problem Type: {request.problemType}
Best Model: {request.bestModel}
Accuracy: {request.accuracy * 100:.1f}%

Provide 3 bullet points covering:
1. Model performance assessment — is this accuracy good or poor for this problem type?
2. What this accuracy means in practice for the end user.
3. One concrete next step to meaningfully improve results."""

    static_fb = (
        f"- **Performance**: Your **{request.bestModel}** achieved **{request.accuracy*100:.1f}%** accuracy "
        f"on a {request.problemType} task — a solid baseline result.\n"
        f"- **Interpretation**: For {request.problemType}, this score indicates the model generalises "
        f"reasonably well; check for class imbalance if accuracy seems misleadingly high.\n"
        f"- **Next step**: Try hyperparameter tuning (GridSearchCV) or feature engineering to push "
        f"accuracy higher before moving to production."
    )

    insights = call_llm_cascade(prompt, static_fallback=static_fb)
    return {"insights": insights}

# ----------------------------------------
# VISUALIZATION AI INSIGHTS (GEMMA 4)
# ----------------------------------------
@app.get("/visualization-insights/{chart_name}")
async def get_visualization_insights(
    chart_name: str,
    current_user: dict = Depends(get_current_user)
):
    try:
        plot_path = os.path.join(OUTPUT_DIR, f"{chart_name}.png")
        if not os.path.exists(plot_path):
            raise HTTPException(status_code=404, detail="Chart not found")

        # ---- Gemini 1.5 Flash Multimodal Analysis (replaces local Ollama/Gemma) ----
        import google.generativeai as genai
        import PIL.Image

        genai.configure(api_key=os.getenv("GEMINI_API_KEY_2"))
        gemini = genai.GenerativeModel("gemini-1.5-flash")

        # Tailor the prompt based on chart type
        if "correlation" in chart_name:
            prompt = "Analyze this Correlation Heatmap from a machine learning dataset. Which features are most strongly correlated? Are there any multicollinearity issues? Provide exactly 2 short, bullet-pointed insights."
        elif "target_distribution" in chart_name:
            prompt = "Analyze this Target Distribution chart from a machine learning dataset. Is the dataset balanced or imbalanced? How might class imbalance affect model training? Provide exactly 2 short, bullet-pointed insights."
        else:
            prompt = "Analyze this data science chart from a machine learning workflow. Provide exactly 2 short, bullet-pointed insights about the key patterns, trends, or anomalies you observe."

        image = PIL.Image.open(plot_path)
        response = gemini.generate_content([prompt, image])

        return {"insight": response.text}

    except Exception as e:
        print(f"GEMINI VISION ERROR for {chart_name}: {e}")
        # Friendly fallback with chart-type-specific message
        if "correlation" in chart_name:
            return {"insight": "• Review the heatmap for high correlations (>0.8) which may indicate multicollinearity.\n• Consider removing or combining highly correlated features before training."}
        elif "target_distribution" in chart_name:
            return {"insight": "• Check if target classes are balanced — imbalanced datasets may bias the model.\n• If imbalanced, consider SMOTE oversampling or adjusting class weights."}
        else:
            return {"insight": "• Examine this chart for outliers or unusual distributions in your features.\n• Statistical anomalies here may require additional preprocessing steps."}

# ----------------------------------------
# RAG CHATBOT
# ----------------------------------------

@app.post("/chat")
def chat(
    request: ChatRequest,
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user["id"]
    answer = ask_ai(user_id, request.question)
    return {"response": answer}

# ----------------------------------------
# GET SAMPLE DATA (to assist Gemini auto-healer)
# ----------------------------------------
@app.get("/sample-data")
async def get_sample_data(
    current_user: dict = Depends(get_current_user)
):
    try:
        if not os.path.exists(UPLOAD_PATH):
            return {"error": "No dataset currently active."}
            
        df = pd.read_csv(UPLOAD_PATH)
        # Return first 10 rows as dictionary records
        sample = df.head(10).to_dict(orient="records")
        return {
            "sample": sample,
            "columns": list(df.columns),
            "rows": len(df)
        }
    except Exception as e:
        return {"error": str(e)}

# ----------------------------------------
# IMPORTANT FOR RENDER DEPLOYMENT
# ----------------------------------------
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("ml_services.app:app", host="0.0.0.0", port=port)
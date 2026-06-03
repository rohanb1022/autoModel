import sys
import os

# Align path resolving to allow importing from backend-ml directory
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_ml_dir = os.path.join(current_dir, "backend-ml")
if backend_ml_dir not in sys.path:
    sys.path.append(backend_ml_dir)
if current_dir not in sys.path:
    sys.path.append(current_dir)

import shutil
import uvicorn
import pandas as pd
import io
import requests as http_requests
from fastapi import FastAPI, UploadFile, File, Depends, HTTPException, Request
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
from dotenv import load_dotenv

# Load environment variables early
load_dotenv()

from src.score_columns import score_columns, detect_problem_type
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
# ----------------------------------------
_frontend_url   = os.getenv("FRONTEND_URL", "http://localhost:8080")
# Default to the production Render backend so the HF space can call it even without the env var
_node_backend   = os.getenv("NODE_BACKEND_URL", "https://automodel-backend-g5oh.onrender.com")

ALLOWED_ORIGINS = [
    "http://localhost:8080",
    "http://localhost:5173",
    "http://localhost:3000",
    # Production frontend on Vercel
    "https://auto-model-73ap.vercel.app",
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
# Request schemas with validation
# ----------------------------------------
class ChatRequest(BaseModel):
    question: str = Field(..., min_length=1, max_length=2000)

class AnalyzeRequest(BaseModel):
    dataset_id: str
    dataset_name: str

class ConfirmTargetRequest(BaseModel):
    target_column: str = Field(..., min_length=1, max_length=200)
    dataset_name: str  = Field("uploaded_dataset.csv", min_length=1, max_length=500)
    dataset_id: str

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
    data: AnalyzeRequest,
    req: Request,
    current_user: dict = Depends(get_current_user)
):
    try:
        user_id = current_user["id"]
        token = req.headers.get("Authorization")

        # Fetch dataset from Node.js backend GridFS
        resp = http_requests.get(f"{_node_backend}/api/dataset/{data.dataset_id}/download", headers={"Authorization": token})
        if resp.status_code != 200:
            return {"error": f"Failed to download dataset: {resp.text}"}

        # Load dataset into memory
        df = pd.read_csv(io.BytesIO(resp.content))

        if df.empty:
            return {"error": "Uploaded file is empty."}

        # Cleaning
        df = basic_cleaning(df)

        if df.shape[1] < 2:
            return {"error": "Dataset must contain at least 2 columns."}

        # Target detection
        ranked = score_columns(df)
        target_column = ranked[0]["column"]
        problem_type = detect_problem_type(df[target_column])

        # Generate EDA
        plot_target_distribution(df, target_column, problem_type)
        plot_correlation_heatmap(df)
        plot_feature_distributions(df)

        return {
            "dataset_name": data.dataset_name,
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
    data: ConfirmTargetRequest,
    req: Request,
    current_user: dict = Depends(get_current_user)
):
    try:
        target_column = data.target_column
        dataset_name = data.dataset_name

        user_id = current_user["id"]
        token = req.headers.get("Authorization")

        # Fetch dataset from Node.js backend GridFS
        resp = http_requests.get(f"{_node_backend}/api/dataset/{data.dataset_id}/download", headers={"Authorization": token})
        if resp.status_code != 200:
            return {"error": f"Failed to download dataset: {resp.text}"}

        # Load dataset into memory
        df = pd.read_csv(io.BytesIO(resp.content))
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
                problem_type = "regression" 
            else:
                problem_type = "classification"
        else:
            problem_type = detect_problem_type(y)

        import traceback
        from src.auto_healer import auto_heal_dataset
        
        system_messages = []
        best_model_name = None
        best_score = None
        top_features = []

        try:
            # First attempt
            X_train, X_test, y_train, y_test, dropped_cols = prepare_data(df, target_column)
            best_model_name, best_score, top_features = train_models(X_train, X_test, y_train, y_test, problem_type)
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
                X_train, X_test, y_train, y_test, dropped_cols = prepare_data(df, target_column)
                best_model_name, best_score, top_features = train_models(X_train, X_test, y_train, y_test, problem_type)

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
                "all_columns": list(df.columns),
                "dropped_columns": dropped_cols,
                "target": target_column,
                "problem_type": problem_type,
                "best_model": best_model_name,
                "score": round(best_score, 4),
                "top_features": top_features,
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
    import google.generativeai as genai

    prompt = (
        f"You are an expert AI data scientist. Analyze the following ML training result "
        f"and provide exactly 3 concise, actionable bullet points formatted in markdown.\n\n"
        f"Dataset: {request.datasetName}\n"
        f"Problem Type: {request.problemType}\n"
        f"Best Model: {request.bestModel}\n"
        f"Accuracy: {request.accuracy * 100:.1f}%\n\n"
        f"Provide 3 bullet points covering:\n"
        f"1. Model performance assessment — is this accuracy good or poor for this problem type?\n"
        f"2. What this accuracy means in practice for the end user.\n"
        f"3. One concrete next step to meaningfully improve results."
    )

    gemini_key = os.getenv("GEMINI_API_KEY")
    if gemini_key:
        try:
            genai.configure(api_key=gemini_key)
            model = genai.GenerativeModel("gemini-1.5-flash")
            response = model.generate_content(
                prompt,
                generation_config=genai.GenerationConfig(
                    temperature=0.3,
                    max_output_tokens=512,
                )
            )
            if response.text:
                return {"insights": response.text.strip()}
        except Exception as e:
            print(f"[INSIGHTS] Gemini error: {e}")

    insights = (
        f"- **Performance**: Your **{request.bestModel}** achieved **{request.accuracy*100:.1f}%** accuracy "
        f"on a {request.problemType} task — a solid baseline result.\n"
        f"- **Interpretation**: For {request.problemType}, this score indicates the model generalises "
        f"reasonably well.\n"
        f"- **Next step**: Try hyperparameter tuning or feature engineering to push "
        f"accuracy higher before moving to production."
    )
    return {"insights": insights}


# ----------------------------------------
# VISUALIZATION AI INSIGHTS
# ----------------------------------------
@app.get("/visualization-insights/{chart_name}")
async def get_visualization_insights(
    chart_name: str,
    current_user: dict = Depends(get_current_user)
):
    try:
        if "correlation" in chart_name:
            return {"insight": "• Review the heatmap for high correlations (>0.8) which may indicate multicollinearity.\n• Consider removing or combining highly correlated features before training."}
        elif "target_distribution" in chart_name:
            return {"insight": "• Check if target classes are balanced — imbalanced datasets may bias the model.\n• If imbalanced, consider SMOTE oversampling or adjusting class weights."}
        else:
            return {"insight": "• Examine this chart for outliers or unusual distributions in your features.\n• Statistical anomalies here may require additional preprocessing steps."}
    except Exception as e:
        print(f"INSIGHT ERROR for {chart_name}: {e}")
        return {"insight": "• Statistical trends are being calculated. Check back in a moment."}


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
    dataset_id: str,
    req: Request,
    current_user: dict = Depends(get_current_user)
):
    try:
        user_id = current_user["id"]
        token = req.headers.get("Authorization")

        resp = http_requests.get(f"{_node_backend}/api/dataset/{dataset_id}/download", headers={"Authorization": token})
        if resp.status_code != 200:
            return {"error": f"Failed to download dataset: {resp.text}"}
            
        df = pd.read_csv(io.BytesIO(resp.content))
        sample = df.head(10).to_dict(orient="records")
        return {
            "sample": sample,
            "columns": list(df.columns),
            "rows": len(df)
        }
    except Exception as e:
        return {"error": str(e)}


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("hf_app:app", host="0.0.0.0", port=port)
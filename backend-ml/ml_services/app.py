import os
import shutil
import uvicorn
import pandas as pd
import io
import requests as http_requests
from fastapi import FastAPI, Depends, HTTPException, Request, BackgroundTasks
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
from dotenv import load_dotenv
from src.score_columns import score_columns, detect_problem_type
# Load environment variables early
load_dotenv()

from src.data_cleaning import basic_cleaning
from src.data_loader import smart_load_csv
from src.eda import analyze_target_column, plot_target_distribution, plot_correlation_heatmap, plot_feature_distributions, plot_missing_values, plot_outliers_boxplot
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
_frontend_url   = os.getenv("FRONTEND_URL", "http://localhost:8080").rstrip("/")
# Default to the production Render backend so the HF space can call it even without the env var
_node_backend   = os.getenv("NODE_BACKEND_URL", "https://automodel-backend-g5oh.onrender.com").rstrip("/")

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
# Helper function for user-specific upload path (deprecated)
# ----------------------------------------

# ----------------------------------------
# Request schemas with validation (L1 fix)
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
        print("[ANALYZE REQUEST] Received:", data.dict())
        token = req.headers.get("Authorization")

        # Fetch dataset from Node.js backend GridFS
        resp = http_requests.get(f"{_node_backend}/api/dataset/{data.dataset_id}/download", headers={"Authorization": token})
        if resp.status_code != 200:
            return {"error": f"Failed to download dataset: {resp.text}"}

        # Load dataset into memory
        df = smart_load_csv(resp.content)

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
        
        from src.profiler import DatasetProfiler
        profiler = DatasetProfiler(df, target_column, problem_type)
        profile_report = profiler.profile()

        # Generate EDA safely
        try:
            plot_target_distribution(df, target_column, problem_type)
        except Exception as e:
            print(f"[EDA WARNING] Target distribution plot skipped: {e}")

        try:
            plot_correlation_heatmap(df)
        except Exception as e:
            print(f"[EDA WARNING] Correlation heatmap plot skipped: {e}")

        try:
            plot_feature_distributions(df)
        except Exception as e:
            print(f"[EDA WARNING] Feature distributions plot skipped: {e}")

        try:
            plot_missing_values(df)
        except Exception as e:
            print(f"[EDA WARNING] Missing values plot skipped: {e}")

        try:
            plot_outliers_boxplot(df)
        except Exception as e:
            print(f"[EDA WARNING] Outliers boxplot skipped: {e}")

        return {
            "dataset_name": data.dataset_name,
            "rows": df.shape[0],
            "columns_count": df.shape[1],
            "all_columns": list(df.columns),
            "suggested_target": target_column,
            "problem_type": problem_type,
            "ranked_suggestions": ranked[:5],
            "profile_report": profile_report,
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
    background_tasks: BackgroundTasks,
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
        df = smart_load_csv(resp.content)
        df = basic_cleaning(df)

        if target_column == "__clustering__":
            problem_type = "clustering"
        else:
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

        # Profile the dataset to generate a quality report
        from src.profiler import DatasetProfiler
        profiler = DatasetProfiler(df, target_column, problem_type)
        profile_report = profiler.profile()

        import traceback
        from src.auto_healer import auto_heal_dataset
        
        system_messages = []
        best_model_name = None
        best_score = None
        leaderboard = []
        optuna_results = {}

        try:
            # First attempt
            X_train, X_test, y_train, y_test, dropped_cols = prepare_data(df, target_column)
            best_model_name, best_score, top_features, leaderboard, optuna_results = train_models(X_train, X_test, y_train, y_test, problem_type)
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
                
                # Update profiling report with healed dataset
                profiler = DatasetProfiler(df, target_column, problem_type)
                profile_report = profiler.profile()
                
                # Second attempt
                X_train, X_test, y_train, y_test, dropped_cols = prepare_data(df, target_column)
                best_model_name, best_score, top_features, leaderboard, optuna_results = train_models(X_train, X_test, y_train, y_test, problem_type)

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

        from src.explainability import ModelExplainer
        import joblib
        try:
            best_model_obj = joblib.load("outputs/best_model.pkl")
            explainer = ModelExplainer(best_model_obj, X_train)
            explain_report = explainer.explain()
        except Exception as e:
            explain_report = {"status": "error", "message": f"Explanation failed: {str(e)}"}

        # Store training memory in the background (for RAG/chatbot)
        background_tasks.add_task(
            store_training_memory,
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
            "system_messages": system_messages,
            "explain_report": explain_report,
            "leaderboard": leaderboard,
            "optuna_results": optuna_results,
            "profile_report": profile_report
        }

    except Exception as e:
        return {
            "error": "Training failed due to unexpected system error.",
            "details": str(e)
        }


# ----------------------------------------
# AI INSIGHTS
# ----------------------------------------
from typing import Optional, List, Dict, Any

class InsightRequest(BaseModel):
    datasetName: str
    problemType: str
    bestModel: str
    accuracy: float
    datasetQualityReport: Optional[Dict[str, Any]] = None
    leaderboard: Optional[List[Dict[str, Any]]] = None
    bestHyperparameters: Optional[Dict[str, Any]] = None
    featureImportance: Optional[List[Dict[str, Any]]] = None

@app.post("/generate-insights")
def generate_insights(
    request: InsightRequest,
    current_user: dict = Depends(get_current_user)
):
    import google.generativeai as genai

    metric_name = "Silhouette Score" if request.problemType == "clustering" else "Accuracy"
    metric_value = f"{request.accuracy:.3f}" if request.problemType == "clustering" else f"{request.accuracy * 100:.1f}%"

    quality_report_str = "N/A"
    if request.datasetQualityReport:
        q = request.datasetQualityReport
        quality_report_str = f"Rows: {q.get('rows')}, Columns: {q.get('columns')}, Duplicates: {q.get('duplicates')}, Missing values: {q.get('missing_values')}, Warnings: {q.get('warnings')}"

    leaderboard_str = "N/A"
    if request.leaderboard:
        leaderboard_str = ", ".join([f"{item.get('model')}: {item.get('score'):.4f}" for item in request.leaderboard])

    best_hyperparameters_str = "N/A"
    if request.bestHyperparameters:
        best_hyperparameters_str = str(request.bestHyperparameters)

    feature_importance_str = "N/A"
    if request.featureImportance:
        feature_importance_str = ", ".join([f"{item.get('feature')}: {item.get('importance'):.4f}" for item in request.featureImportance])

    # Extract ANN details from leaderboard if present
    ann_details = None
    if request.leaderboard:
        for item in request.leaderboard:
            if item.get("model", "").startswith("ANN"):
                ann_details = item.get("metrics", {}).get("ann_details")
                break

    ann_details_str = "N/A"
    if ann_details:
        es_info = "Early stopping triggered" if ann_details.get("early_stopping_triggered") else "Completed full epochs"
        ann_details_str = (
            f"Architecture: {ann_details.get('architecture')}, "
            f"Parameters: {ann_details.get('num_params')}, "
            f"Epochs Completed: {ann_details.get('epochs_completed')}, "
            f"Early Stopping: {es_info}, "
            f"Final Validation Loss: {ann_details.get('final_val_loss'):.4f}"
        )

    prompt = (
        f"You are an expert AI data scientist. Analyze the following ML training result and dataset profiling report, "
        f"and provide a set of natural-language insights formatted in markdown. The insights must cover:\n"
        f"1. Most influential features (refer to the Feature Importance: {feature_importance_str})\n"
        f"2. Potential data quality issues (refer to the Dataset Quality Report: {quality_report_str})\n"
        f"3. Best-performing model details and leaderboard performance assessment (refer to: {request.bestModel} and leaderboard: {leaderboard_str})\n"
        f"4. Concrete next steps to improve model performance\n"
        f"5. Observations about the dataset characteristics (rows/columns/warnings)\n\n"
        f"Dataset: {request.datasetName}\n"
        f"Problem Type: {request.problemType}\n"
        f"Best Model: {request.bestModel}\n"
        f"{metric_name}: {metric_value}\n"
        f"Best Hyperparameters: {best_hyperparameters_str}\n\n"
    )

    if "ANN" in request.bestModel:
        prompt += (
            f"Additionally, since the best-performing model is an Artificial Neural Network (ANN), you MUST explicitly include the following details in your report:\n"
            f"- ANN architecture used: {ann_details.get('architecture') if ann_details else 'N/A'}\n"
            f"- Number of parameters: {ann_details.get('num_params') if ann_details else 'N/A'}\n"
            f"- Training epochs completed: {ann_details.get('epochs_completed') if ann_details else 'N/A'}\n"
            f"- Early stopping info: {'Yes (validation loss stopped improving)' if ann_details and ann_details.get('early_stopping_triggered') else 'No'} (Final Val Loss: {ann_details.get('final_val_loss') if ann_details else 'N/A'})\n"
            f"- Comparison against traditional ML models: {leaderboard_str}\n"
            f"- Reason why the selected ANN won over traditional models (e.g. learning non-linear relationships, better generalizability, capacity of weights)\n\n"
        )
    else:
        prompt += (
            f"Additionally, if an ANN was trained, you should include a brief comparison of how the winning traditional model compares against the ANN model: {ann_details_str} and the reason why the traditional model won (e.g., simpler linear patterns, overfitting of the neural net on a small dataset).\n\n"
        )

    prompt += "Provide 4-5 direct, actionable bullet points formatted in clean markdown. Output should be easy to read for a business stakeholder."

    gemini_key = os.getenv("GEMINI_API_KEY")
    if gemini_key:
        try:
            genai.configure(api_key=gemini_key)
            model = genai.GenerativeModel("gemini-3.5-flash")
            response = model.generate_content(
                prompt,
                generation_config=genai.GenerationConfig(
                    temperature=0.3,
                    max_output_tokens=768,
                )
            )
            if response.text:
                return {"insights": response.text.strip()}
        except Exception as e:
            print(f"[INSIGHTS] Gemini error: {e}")

    # Dynamic fallback — always works, no external dependency
    fallback_insights = f"### AI Insights Summary\n\n"
    
    # 1. Best model & leaderboard
    fallback_insights += f"- **Best Model Performance**: The AutoML competition selected **{request.bestModel}** as the top performer with a baseline {metric_name} of **{metric_value}**.\n"
    if request.leaderboard and len(request.leaderboard) > 1:
        leaderboard_list = ", ".join([f"{item.get('model')} ({item.get('score'):.4f})" for item in request.leaderboard[:3]])
        fallback_insights += f"  - **Competition Leaderboard**: Tested models include: {leaderboard_list}.\n"
        
    # 2. ANN details if best or trained
    if ann_details:
        es_info = "Yes (validation loss did not improve for 10 epochs)" if ann_details.get("early_stopping_triggered") else "No (completed full training)"
        fallback_insights += (
            f"- **Artificial Neural Network (ANN) Metrics**:\n"
            f"  - **Architecture**: `{ann_details.get('architecture')}`\n"
            f"  - **Parameters**: {ann_details.get('num_params')}\n"
            f"  - **Epochs Run**: {ann_details.get('epochs_completed')}\n"
            f"  - **Early Stopping**: {es_info}\n"
            f"  - **Final Validation Loss**: {ann_details.get('final_val_loss'):.4f}\n"
        )

    # 3. Winning reason
    if "ANN" in request.bestModel:
        fallback_insights += f"- **Why the ANN Won**: The neural network's non-linear layers, ReLU activations, and dropout regularization allowed it to capture complex, non-linear relationships in the dataset without overfitting, outperforming the simpler assumptions of traditional algorithms.\n"
    else:
        fallback_insights += f"- **Why the Traditional Model Won**: Traditional models (like {request.bestModel}) performed better because the dataset is likely linear or small, where high-capacity neural networks can easily overfit or fail to generalize compared to robust ensembles or linear regressors.\n"

    # 4. Features
    if request.featureImportance:
        top_feats = request.featureImportance[:3]
        feat_list = ", ".join([f"**{item.get('feature')}** ({item.get('importance')*100:.1f}%)" for item in top_feats])
        fallback_insights += f"- **Most Influential Features**: The top predictors determining predictions are: {feat_list}.\n"
        
    # 5. Quality report
    if request.datasetQualityReport:
        q = request.datasetQualityReport
        fallback_insights += f"- **Dataset Characteristics**: Analyzed dataset **{request.datasetName}** containing **{q.get('rows')}** rows and **{q.get('columns')}** columns.\n"
        
        warnings_list = q.get('warnings', [])
        if warnings_list:
            fallback_insights += "- **Data Quality Warnings & Issues**:\n"
            for warning in warnings_list[:3]:
                fallback_insights += f"  - {warning}\n"
    
    # 6. Hyperparameters
    if request.bestHyperparameters and len(request.bestHyperparameters) > 0:
        fallback_insights += f"- **Best Hyperparameters**: Optuna successfully tuned: `{request.bestHyperparameters}`.\n"
        
    # 7. Recommendations
    fallback_insights += f"- **Business Recommendations**: Address any active data quality warnings, double down on engineering features derived from **{request.featureImportance[0].get('feature') if request.featureImportance else 'the top predictor'}**, and proceed to generate the inference code for model deployment."

    return {"insights": fallback_insights}


# ----------------------------------------
# VISUALIZATION AI INSIGHTS (GEMMA 4)
# ----------------------------------------
@app.get("/visualization-insights/{chart_name}")
async def get_visualization_insights(
    chart_name: str,
    current_user: dict = Depends(get_current_user)
):
    try:
        # Friendly fallback as Gemini is exhausted — avoids 429 and latency
        if "correlation" in chart_name:
            return {"insight": "• Review the heatmap for high correlations (>0.8) which may indicate multicollinearity.\n• Consider removing or combining highly correlated features before training."}
        elif "target_distribution" in chart_name:
            return {"insight": "• Check if target classes are balanced — imbalanced datasets may bias the model.\n• If imbalanced, consider SMOTE oversampling or adjusting class weights."}
        elif "missing_values" in chart_name:
            return {"insight": "• Columns with missing values should be handled. If missingness is high (>30%), consider removing or imputing the data.\n• Target column should have 0% missing values for reliable results."}
        elif "outliers_boxplot" in chart_name:
            return {"insight": "• Check boxplots for outlier markers (red diamonds) beyond the whiskers.\n• High count of outliers can skew linear models; standardizing or capping outliers may help."}
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
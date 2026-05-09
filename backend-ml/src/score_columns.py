import pandas as pd
import numpy as np
import os
import requests
import json
import google.generativeai as genai

def score_columns(df: pd.DataFrame):
    # Try AI-based detection first (Llama/Groq preferred)
    ai_target = detect_target_with_ai(df)
    
    scores = []

    n_rows = len(df)

    for col in df.columns:
        col_data = df[col]

        unique_count = col_data.nunique()
        missing_ratio = col_data.isnull().mean()

        score = 0
        reasons = []

        # ❌ Reject obvious bad columns
        if unique_count == 1:
            continue

        # Penalize ID-like columns
        if unique_count == n_rows:
            score -= 3
            reasons.append("Looks like ID (all unique)")

        # Penalize too many missing
        if missing_ratio > 0.5:
            score -= 2
            reasons.append("Too many missing values")

        # Reward reasonable uniqueness
        if 2 <= unique_count <= 20:
            score += 3
            reasons.append("Good for classification")

        elif unique_count > 20 and unique_count < n_rows * 0.8:
            score += 2
            reasons.append("Good for regression")

        # Numeric preference
        if pd.api.types.is_numeric_dtype(col_data):
            score += 1
            reasons.append("Numeric column")

        else:
            score += 0.5
            reasons.append("Categorical column")

        # Extra boost if AI suggested this column
        if ai_target and col == ai_target:
            score += 15
            reasons.append("Highly recommended by AI Analyst")

        scores.append({
            "column": col,
            "score": score,
            "unique": unique_count,
            "missing_ratio": round(missing_ratio, 2),
            "reasons": reasons
        })

    # Sort by score descending
    scores = sorted(scores, key=lambda x: x["score"], reverse=True)

    return scores

def detect_problem_type(y):
    if not pd.api.types.is_numeric_dtype(y):
        return "classification"

    if y.nunique() <= 15:
        return "classification"

    return "regression"

def detect_target_with_ai(df: pd.DataFrame):
    """
    Robustly identifies the target column using a cascade of AI providers.
    Order: local Ollama -> Groq (Llama 3.1) -> Gemini -> HuggingFace -> None
    """
    try:
        cols = list(df.columns)
        sample = df.head(5).to_dict(orient="records")
        dtypes = {k: str(v) for k, v in df.dtypes.to_dict().items()}

        prompt = f"Identify the target column from these names: {cols}. Types: {dtypes}. Sample: {sample}. Return ONLY the column name."

        # 1. Try Local Ollama (Completely Free & No 429)
        if os.getenv("USE_OLLAMA", "false").lower() == "true":
            try:
                import ollama
                response = ollama.chat(model="gemma2:9b", messages=[{"role": "user", "content": prompt}])
                suggested = response['message']['content'].strip().replace("`", "")
                if suggested in cols: return suggested
            except Exception: pass

        # 2. Try Groq (Llama 3.1 8B - Fast & Free Cloud)
        groq_key = os.getenv("GROQ_API_KEY")
        if groq_key:
            try:
                print("[AI Target Detection] Trying Groq...")
                headers = {"Authorization": f"Bearer {groq_key}", "Content-Type": "application/json"}
                payload = {"model": "llama-3.1-8b-instant", "messages": [{"role": "user", "content": prompt}], "temperature": 0.1}
                resp = requests.post("https://api.groq.com/openai/v1/chat/completions", headers=headers, json=payload, timeout=5)
                if resp.status_code == 200:
                    suggested = resp.json()['choices'][0]['message']['content'].strip().replace("`", "")
                    if suggested in cols: return suggested
            except Exception: pass


        # 4. Try Hugging Face (Mistral 7B Fallback)
        hf_token = os.getenv("HF_API_TOKEN")
        if hf_token:
            try:
                print("[AI Target Detection] Trying HuggingFace...")
                headers = {"Authorization": f"Bearer {hf_token}"}
                payload = {"inputs": prompt, "parameters": {"max_new_tokens": 20}}
                resp = requests.post("https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3", headers=headers, json=payload, timeout=5)
                if resp.status_code == 200:
                    data = resp.json()
                    if isinstance(data, list):
                        suggested = data[0].get("generated_text", "").strip().replace("`", "")
                    else:
                        suggested = data.get("generated_text", "").strip().replace("`", "")
                    if suggested in cols: return suggested
            except Exception: pass

    except Exception: pass

    return None
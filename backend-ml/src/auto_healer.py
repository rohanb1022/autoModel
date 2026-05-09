import os
import re
import pandas as pd
import traceback
import requests
import json

def call_gemma_llm(prompt: str) -> str:
    """
    Tries to call an LLM via a 4-layer cascade: 
    Ollama -> Groq -> Gemini -> HuggingFace -> Error.
    """
    # 1. Try local Ollama (Gemma 2) - FREE & NO 429
    if os.getenv("USE_OLLAMA", "false").lower() == "true":
        try:
            import ollama
            print("[Auto-Healer] Trying local Ollama (Gemma)...")
            response = ollama.chat(
                model="gemma2:9b",
                messages=[
                    {"role": "system", "content": "You are a senior Python Data Engineer. Return ONLY clean code."},
                    {"role": "user", "content": prompt}
                ]
            )
            return response['message']['content'].strip()
        except Exception as e:
            print(f"[Auto-Healer] Ollama failed: {e}")

    # 2. Try Groq (Llama 3.1 8B) 
    groq_key = os.getenv("GROQ_API_KEY")
    if groq_key:
        try:
            print("[Auto-Healer] Trying Groq (Llama 3.1 8B)...")
            headers = {"Authorization": f"Bearer {groq_key}", "Content-Type": "application/json"}
            payload = {
                "model": "llama-3.1-8b-instant",
                "messages": [
                    {"role": "system", "content": "You are a senior Python Data Engineer. Return ONLY clean code."},
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.1
            }
            resp = requests.post("https://api.groq.com/openai/v1/chat/completions", headers=headers, json=payload, timeout=20)
            if resp.status_code == 200:
                return resp.json()['choices'][0]['message']['content'].strip()
            print(f"[Auto-Healer] Groq 429 or Error: {resp.status_code}")
        except Exception: pass


    # 4. Try HuggingFace (Final Fallback)
    hf_token = os.getenv("HF_API_TOKEN")
    if hf_token:
        try:
            print("[Auto-Healer] Trying HuggingFace (Mistral 7B)...")
            headers = {"Authorization": f"Bearer {hf_token}"}
            payload = {"inputs": prompt, "parameters": {"max_new_tokens": 500}}
            resp = requests.post("https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3", headers=headers, json=payload, timeout=30)
            if resp.status_code == 200:
                data = resp.json()
                if isinstance(data, list):
                    return data[0].get("generated_text", "").strip()
                return data.get("generated_text", "").strip()
        except Exception: pass

    raise RuntimeError("All AI providers (Ollama, Groq, Gemini, HF) failed or rate-limited.")

def auto_heal_dataset(df: pd.DataFrame, error_traceback: str) -> pd.DataFrame:
    """
    Attempts to fix a dataframe using an LLM cascade.
    """
    df_info = df.dtypes.to_string()
    sample_data = df.head(3).to_dict()
    
    prompt = f"""
Write a python function `clean_df(df)` that fixes this specific error.
ERROR: {error_traceback}
DATASET: {df_info}
SAMPLE: {sample_data}
RETURN ONLY THE CODE, NO MARKDOWN.
"""

    generated_code = call_gemma_llm(prompt)
    
    # Strip markdown
    if generated_code.startswith("```"):
        generated_code = re.sub(r"```python\n", "", generated_code)
        generated_code = re.sub(r"```\n?", "", generated_code)

    import numpy as np
    safe_globals = {
        "__builtins__": {
            "len": len, "range": range, "enumerate": enumerate,
            "zip": zip, "list": list, "dict": dict, "set": set,
            "tuple": tuple, "str": str, "int": int, "float": float,
            "bool": bool, "print": print, "isinstance": isinstance,
            "hasattr": hasattr, "getattr": getattr, "min": min,
            "max": max, "sum": sum, "abs": abs, "round": round,
        },
        "pd": pd,
        "np": np,
    }
    local_env = {"df_copy": df.copy()}

    try:
        exec(generated_code, safe_globals, local_env)
        if "clean_df" in local_env:
            cleaned_df = local_env["clean_df"](local_env["df_copy"])
            return cleaned_df, generated_code
        else:
            raise ValueError("clean_df function missing.")
    except Exception as e:
        raise RuntimeError(f"Healer failed execution: {str(e)}")

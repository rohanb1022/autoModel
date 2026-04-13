import os
import re
import pandas as pd
import traceback

def auto_heal_dataset(df: pd.DataFrame, error_traceback: str) -> pd.DataFrame:
    """
    Attempts to fix a dataframe using Google Gemini to generate pandas resolution code.
    Reads GEMINI_API_KEY from environment or defaults to the node server's proxy (to be safe).
    """
    api_key = os.getenv("GEMINI_API_KEY")
    api_key_2 = os.getenv("GEMINI_API_KEY_2")
    if not api_key:
        raise ValueError("GEMINI_API_KEY is not set in backend-ml/.env")

    import google.generativeai as genai
    genai.configure(api_key=api_key)

    df_info = df.dtypes.to_string()
    
    prompt = f"""
You are an expert Python data engineer. The ML pipeline just crashed with the following error traceback:

{error_traceback}

The dataframe has the following columns and dtypes:
{df_info}

Here are the first 3 rows as a dictionary:
{df.head(3).to_dict()}

Write a python function named `clean_df(df)` that takes the dataframe, fixes this specific error using pandas, and returns the cleaned dataframe.
Return ONLY valid python code. No explanations, no markdown formatting (no ```python).
"""

    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        response = model.generate_content(prompt)
    except Exception as e:
        print(f"Gemini API key 1 failed: {e}. Falling back to key 2...")
        if api_key_2:
            genai.configure(api_key=api_key_2)
            model = genai.GenerativeModel('gemini-2.5-flash')
            response = model.generate_content(prompt)
        else:
            raise

    generated_code = response.text.strip()
    
    # Strip markdown if Gemini ignores instructions
    if generated_code.startswith("```"):
        generated_code = re.sub(r"```python\n", "", generated_code)
        generated_code = re.sub(r"```\n?", "", generated_code)

    # ── SECURITY: Sandboxed exec ───────────────────────────────────────────
    # Only expose pandas (pd) and the dataframe copy.
    # No builtins means no open(), no __import__(), no os, no sys, no exec().
    # An LLM generating `import os; os.system("rm -rf /")` will fail silently.
    # ──────────────────────────────────────────────────────────────────────
    import numpy as np
    safe_globals = {
        "__builtins__": {
            # Minimal safe builtins only — no open, no exec, no eval, no import
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
            raise ValueError("clean_df function was not defined by the LLM.")
    except Exception as e:
        exec_err = traceback.format_exc()
        raise RuntimeError(f"Auto-healer failed to execute code.\nException: {exec_err}\nCode generated:\n{generated_code}")

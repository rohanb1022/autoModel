import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import os

import pandas as pd
import numpy as np
import re

import json
import traceback

def analyze_target_column(df: pd.DataFrame):
    print("\nAnalyzing dataset for target column using Gemini...\n")
    df = df.copy()

    # STEP 1: Remove constant columns
    df = df.loc[:, df.nunique() > 1]
    
    api_key = os.getenv("GEMINI_API_KEY")
    api_key_2 = os.getenv("GEMINI_API_KEY_2")

    if not api_key:
        print("GEMINI_API_KEY not found. Fallback to basic heuristics.")
        # Super basic fallback if Gemini isn't configured
        best_col = df.columns[-1]
        problem_type = "classification" if df[best_col].nunique() < 10 else "regression"
        return best_col, problem_type, [(best_col, 10)]

    try:
        import google.generativeai as genai
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-1.5-flash')

        df_info = df.dtypes.to_string()
        sample = df.head(5).to_dict(orient="records")

        prompt = f"""
        You are an expert Data Scientist. Determine the best dependent variable (target column) to predict from this dataset. 
        Determine if it is a "classification" or "regression" problem.

        Columns and Types:
        {df_info}

        Sample Data (first 5 rows):
        {json.dumps(sample, indent=2)}

        Provide your response in raw JSON format strictly adhering to this schema:
        {{
            "target_column": "Exact Column Name",
            "problem_type": "classification or regression",
            "ranked": [["Col1", 10], ["Col2", 8]] // Provide top 3 candidates and their confidence score out of 10
        }}
        Do NOT wrap the JSON in markdown code blocks. Just return the JSON object.
        """

        try:
            response = model.generate_content(prompt)
        except Exception as api_err:
            print(f"Gemini API key 1 failed: {api_err}. Falling back to key 2...")
            if api_key_2:
                genai.configure(api_key=api_key_2)
                model = genai.GenerativeModel('gemini-1.5-flash')
                response = model.generate_content(prompt)
            else:
                raise api_err

        text = response.text.strip()
        if text.startswith("```json"):
            text = text[7:]
        if text.endswith("```"):
            text = text[:-3]
        if text.startswith("```"):
            text = text[3:]

        result = json.loads(text.strip())

        best_column = result.get("target_column", df.columns[-1])
        problem_type = result.get("problem_type", "classification")
        ranked = result.get("ranked", [(best_column, 10)])

        print(f"\nDetected target column via Gemini: {best_column}")
        print(f"Detected problem type via Gemini: {problem_type}")

        # Ensure target is valid, else fallback
        if best_column not in df.columns:
            raise ValueError(f"Gemini suggested an invalid column: {best_column}")

        return best_column, problem_type.lower(), ranked

    except Exception as e:
        print("Gemini Analysis Failed. Applying Fallback due to:", e)
        traceback.print_exc()
        best_col = df.columns[-1]
        problem_type = "classification" if df[best_col].nunique() < 10 else "regression"
        return best_col, problem_type, [(best_col, 10)]


def plot_target_distribution(df, target_column, problem_type):

    print("\nGenerating target distribution plot...\n")

    # create outputs folder if not exists
    os.makedirs("outputs", exist_ok=True)

    plt.figure(figsize=(8,5), facecolor='none')

    if problem_type == "classification":
        ax = sns.countplot(x=df[target_column])
        plt.title(f"Target Distribution: {target_column}", color='white')
    else:  # regression
        ax = sns.histplot(df[target_column], kde=True)
        plt.title(f"Target Distribution: {target_column}", color='white')

    ax.tick_params(colors='white')
    plt.setp(ax.get_xticklabels(), color='white')
    plt.tight_layout()
    plt.savefig("outputs/target_distribution.png", transparent=True)
    plt.close()

    print("Target distribution plot saved in outputs folder")

def plot_correlation_heatmap(df):

    print("\nGenerating correlation heatmap...\n")

    # create outputs folder if not exists
    os.makedirs("outputs", exist_ok=True)

    # select only numeric columns
    numeric_df = df.select_dtypes(include='number')

    if numeric_df.shape[1] < 2:
        print("Not enough numeric columns for correlation heatmap")
        return

    # correlation matrix
    corr_matrix = numeric_df.corr()

    plt.figure(figsize=(10, 7), facecolor='none')
    ax = sns.heatmap(corr_matrix, annot=True, cmap="coolwarm", fmt=".2f")
    plt.title("Correlation Heatmap", color='white')
    
    # Customize tick colors
    ax.tick_params(colors='white')
    plt.setp(plt.getp(ax, 'xticklabels'), color='white')
    plt.setp(plt.getp(ax, 'yticklabels'), color='white')

    plt.tight_layout()
    plt.savefig("outputs/correlation_heatmap.png", transparent=True)
    plt.close()

    print("Correlation heatmap saved in outputs folder")

def plot_feature_distributions(df):

    print("\nGenerating feature distribution plots...\n")

    import matplotlib.pyplot as plt
    import seaborn as sns
    import os

    os.makedirs("outputs", exist_ok=True)

    numeric_df = df.select_dtypes(include='number')

    if numeric_df.shape[1] == 0:
        print("No numeric columns found")
        return

    num_cols = numeric_df.columns
    total = len(num_cols)

    # grid size
    cols = 3
    rows = (total // cols) + 1

    plt.figure(figsize=(15, 5 * rows), facecolor='none')

    for i, column in enumerate(num_cols, 1):
        ax = plt.subplot(rows, cols, i)
        sns.histplot(numeric_df[column], kde=True)
        plt.title(column, color='white')
        ax.tick_params(colors='white')
        plt.setp(ax.get_xticklabels(), color='white')
        plt.setp(ax.get_yticklabels(), color='white')

    plt.tight_layout()
    plt.savefig("outputs/feature_distributions.png", transparent=True)
    plt.close()

    print("Feature distribution plots saved")

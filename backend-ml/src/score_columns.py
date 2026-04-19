import pandas as pd
import numpy as np

def score_columns(df: pd.DataFrame):
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
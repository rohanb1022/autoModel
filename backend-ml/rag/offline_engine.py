"""
Offline Smart Response Engine — Zero-Failure Fallback
=====================================================
This module generates intelligent, context-aware responses using ONLY
local data from ChromaDB. It makes ZERO external API calls, so it can
NEVER throw 429 errors or any network-related errors.

How it works:
1. Parses structured training memory from the RAG context
2. Classifies the user's question intent via keyword matching
3. Generates a data-driven response using templates + actual user data

This is the guaranteed-always-works tier in the LLM cascade.
"""

import re
from typing import Optional


# ---------------------------------------------------------------------------
# Intent Classification (keyword-based, no API needed)
# ---------------------------------------------------------------------------

_INTENT_KEYWORDS = {
    "greeting": [
        "hello", "hi", "hey", "howdy", "greetings", "good morning",
        "good afternoon", "good evening", "what's up", "sup",
    ],
    "accuracy": [
        "accuracy", "score", "performance", "how well", "how good",
        "how bad", "result", "metric", "r2", "f1", "precision", "recall",
        "low accuracy", "high accuracy", "improve accuracy",
    ],
    "model_info": [
        "which model", "what model", "best model", "algorithm",
        "random forest", "xgboost", "logistic", "linear", "svm",
        "decision tree", "gradient", "neural",
    ],
    "columns": [
        "list columns", "all columns", "column names", "what columns",
        "which columns", "show columns", "list all", "useless columns",
        "dropped columns", "removed columns", "irrelevant columns",
        "useless features", "important columns", "feature list",
        "what features", "list features",
    ],
    "dataset_info": [
        "dataset", "data", "rows", "features", "shape",
        "how many", "size", "uploaded", "csv", "file",
    ],
    "improvement": [
        "improve", "better", "increase", "boost", "optimize",
        "enhancement", "suggestion", "recommend", "next step",
        "what should", "how can i", "how to", "tips",
    ],
    "problem_type": [
        "classification", "regression", "problem type", "type of problem",
        "predict", "prediction", "target",
    ],
    "explain": [
        "why", "explain", "reason", "because", "how does", "what does",
        "meaning", "interpret", "understand",
    ],
    "compare": [
        "compare", "difference", "vs", "versus", "better than",
        "which is better", "comparison",
    ],
}


def _classify_intent(question: str) -> str:
    """Classify the user's question into an intent category."""
    q_lower = question.lower().strip()

    # Score each intent by how many keywords match
    scores = {}
    for intent, keywords in _INTENT_KEYWORDS.items():
        score = sum(1 for kw in keywords if kw in q_lower)
        if score > 0:
            scores[intent] = score

    if not scores:
        return "general"

    return max(scores, key=scores.get)


# ---------------------------------------------------------------------------
# Context Parser — extracts structured data from RAG memory text
# ---------------------------------------------------------------------------

def _parse_training_context(context: str) -> list[dict]:
    """
    Parses the structured training memory stored by store_training_memory.py.
    Returns a list of parsed training records.
    """
    if not context or not context.strip():
        return []

    records = []
    # Split by the separator used in rag_chat.py
    chunks = re.split(r"---+", context)

    for chunk in chunks:
        if not chunk.strip():
            continue

        record = {}
        # Extract key-value pairs from the structured text
        patterns = {
            "dataset_name": r"Dataset\s*Name:\s*(.+)",
            "rows": r"Rows:\s*(\S+)",
            "columns": r"Columns:\s*(\S+)",
            "target": r"Target\s*Column:\s*(.+)",
            "problem_type": r"Problem\s*Type:\s*(.+)",
            "best_model": r"Best\s*Model:\s*(.+)",
            "accuracy": r"Accuracy:\s*(\S+)",
            "f1_score": r"F1\s*Score:\s*(\S+)",
            "notes": r"Notes?\s*[:\n]\s*(.+)",
        }

        for key, pattern in patterns.items():
            match = re.search(pattern, chunk, re.IGNORECASE)
            if match:
                val = match.group(1).strip()
                if val and val.lower() != "n/a":
                    record[key] = val

        # Extract list fields that are comma-separated
        all_cols_match = re.search(r"All\s*Columns:\s*(.+)", chunk, re.IGNORECASE)
        if all_cols_match:
            raw = all_cols_match.group(1).strip()
            record["all_columns"] = [c.strip() for c in raw.split(",") if c.strip()]

        dropped_match = re.search(r"Useless/Dropped\s*Columns:\s*(.+)", chunk, re.IGNORECASE)
        if dropped_match:
            raw = dropped_match.group(1).strip()
            if raw.lower() not in ("none", "n/a", ""):
                record["dropped_columns"] = [c.strip() for c in raw.split(",") if c.strip()]
            else:
                record["dropped_columns"] = []

        if record:
            records.append(record)

    return records


def _format_accuracy(acc_str: str) -> str:
    """Convert accuracy string to a readable percentage."""
    try:
        val = float(acc_str)
        if val <= 1.0:
            return f"{val * 100:.1f}%"
        return f"{val:.1f}%"
    except (ValueError, TypeError):
        return acc_str


def _assess_performance(acc_str: str, problem_type: str = "") -> str:
    """Give a qualitative assessment of accuracy."""
    try:
        val = float(acc_str)
        if val <= 1.0:
            val = val * 100

        ptype = problem_type.lower() if problem_type else ""

        if "regression" in ptype:
            # For R2 scores (can be negative, typically 0-100%)
            if val >= 85:
                return "excellent"
            elif val >= 70:
                return "good"
            elif val >= 50:
                return "moderate"
            elif val >= 20:
                return "below average"
            else:
                return "poor (the model may need significant improvements)"
        else:
            # Classification accuracy
            if val >= 95:
                return "excellent"
            elif val >= 85:
                return "very good"
            elif val >= 75:
                return "good"
            elif val >= 60:
                return "moderate"
            elif val >= 40:
                return "below average"
            else:
                return "poor (the model may need significant improvements)"
    except (ValueError, TypeError):
        return "not clearly assessable from the available data"


# ---------------------------------------------------------------------------
# Response Generators — one per intent
# ---------------------------------------------------------------------------

def _respond_greeting(records: list[dict]) -> str:
    if records:
        r = records[-1]  # most recent
        name = r.get("dataset_name", "your dataset")
        return (
            f"Hello! I'm your AutoModel data assistant. "
            f"I can see you've been working with **{name}**. "
            f"Feel free to ask me about your model's performance, "
            f"dataset details, or suggestions for improvement!"
        )
    return (
        "Hello! I'm your AutoModel data assistant. "
        "I don't see any training history yet - upload a dataset and "
        "train a model, then I can help you analyze the results!"
    )


def _respond_accuracy(records: list[dict]) -> str:
    if not records:
        return (
            "I don't have any training results in memory yet. "
            "Please upload a dataset and train a model first, "
            "then I can tell you all about the accuracy!"
        )

    r = records[-1]
    acc = r.get("accuracy", "unknown")
    model = r.get("best_model", "the selected model")
    dataset = r.get("dataset_name", "your dataset")
    ptype = r.get("problem_type", "")
    assessment = _assess_performance(acc, ptype)
    formatted_acc = _format_accuracy(acc)

    lines = [
        f"Here's what I know about your model's performance:\n",
        f"- **Dataset**: {dataset}",
        f"- **Best Model**: {model}",
        f"- **Accuracy/Score**: {formatted_acc}",
        f"- **Assessment**: The performance is **{assessment}** for a {ptype} task.",
    ]

    # Add improvement suggestions for lower accuracy
    try:
        val = float(acc)
        if val <= 1.0:
            val *= 100
        if val < 70:
            lines.append(
                f"\n**Suggestions to improve**:\n"
                f"1. Try feature engineering - create new features from existing ones\n"
                f"2. Handle class imbalance if present (SMOTE, class weights)\n"
                f"3. Try hyperparameter tuning with GridSearchCV\n"
                f"4. Consider collecting more training data"
            )
    except (ValueError, TypeError):
        pass

    return "\n".join(lines)


def _respond_model_info(records: list[dict]) -> str:
    if not records:
        return (
            "No models have been trained yet. Upload a dataset and "
            "run training to see which algorithm performs best!"
        )

    r = records[-1]
    model = r.get("best_model", "Unknown")
    acc = _format_accuracy(r.get("accuracy", "N/A"))
    ptype = r.get("problem_type", "unknown")
    dataset = r.get("dataset_name", "your dataset")

    return (
        f"For your dataset **{dataset}**, AutoModel evaluated multiple algorithms "
        f"and selected **{model}** as the best performer.\n\n"
        f"- **Problem Type**: {ptype}\n"
        f"- **Score**: {acc}\n\n"
        f"This model was chosen because it achieved the highest score "
        f"among all candidates tested during the automated training pipeline."
    )


def _respond_dataset_info(records: list[dict]) -> str:
    if not records:
        return (
            "I don't have any dataset information in memory. "
            "Please upload a CSV file and I'll be able to tell you all about it!"
        )

    r = records[-1]
    dataset = r.get("dataset_name", "Unknown")
    rows = r.get("rows", "unknown")
    cols = r.get("columns", "unknown")
    target = r.get("target", "unknown")
    ptype = r.get("problem_type", "unknown")
    all_cols = r.get("all_columns", [])

    col_line = ""
    if all_cols:
        col_line = f"- **All Columns ({len(all_cols)})**: {', '.join(all_cols)}\n"

    return (
        f"Here's what I know about your dataset:\n\n"
        f"- **Name**: {dataset}\n"
        f"- **Rows**: {rows}\n"
        f"- **Total Columns**: {cols}\n"
        + col_line +
        f"- **Target Column**: {target}\n"
        f"- **Problem Type**: {ptype}\n\n"
        f"This information was recorded during your last training run."
    )


def _respond_columns(records: list[dict], question: str) -> str:
    """Handles all column-listing questions: all columns, useless/dropped columns."""
    if not records:
        return (
            "I don't have any column information yet. "
            "Please upload a dataset and train a model first!"
        )

    r = records[-1]
    all_cols = r.get("all_columns", [])
    dropped_cols = r.get("dropped_columns", [])
    dataset = r.get("dataset_name", "your dataset")
    target = r.get("target", "unknown")
    q_lower = question.lower()

    is_dropped_question = any(kw in q_lower for kw in [
        "useless", "dropped", "removed", "irrelevant", "not important",
        "useless features",
    ])

    if is_dropped_question:
        if not dropped_cols:
            return (
                f"For **{dataset}**, **no columns were dropped** during preprocessing! "
                f"All {len(all_cols)} columns had sufficient variance and were kept.\n\n"
                f"The model trained on all feature columns (excluding the target `{target}`)."
            )
        lines = [
            f"For **{dataset}**, **{len(dropped_cols)} column(s) were dropped** as useless:\n"
        ]
        for i, col in enumerate(dropped_cols, 1):
            lines.append(f"{i}. `{col}`")
        lines.append(
            f"\n**Why were they dropped?**\n"
            f"- **Constant columns** – same value in every row (zero variance)\n"
            f"- **High-cardinality IDs** – nearly every row had a unique value (e.g. name/ID fields)\n\n"
            f"The remaining {len(all_cols) - len(dropped_cols)} columns were used for training."
        )
        return "\n".join(lines)

    if not all_cols:
        return (
            f"I know **{dataset}** has columns but the full list wasn't saved in this session. "
            f"Please retrain the model to capture detailed column info."
        )

    feature_cols = [c for c in all_cols if c != target]
    lines = [
        f"**{dataset}** has **{len(all_cols)} total columns**:\n",
        f"🎯 **Target Column**: `{target}`\n",
        f"📊 **Feature Columns ({len(feature_cols)})**:",
    ]
    for i, col in enumerate(feature_cols, 1):
        lines.append(f"  {i}. `{col}`")

    if dropped_cols:
        lines.append(
            f"\n🗑️ **Dropped/Useless Columns ({len(dropped_cols)})**: "
            + ", ".join(f"`{c}`" for c in dropped_cols)
        )
    else:
        lines.append(f"\n✅ **No columns were dropped** — all features were used for training.")

    return "\n".join(lines)


def _respond_improvement(records: list[dict]) -> str:
    if not records:
        return (
            "Upload a dataset and train a model first, "
            "then I can give you specific improvement suggestions!"
        )

    r = records[-1]
    acc = r.get("accuracy", "0")
    ptype = r.get("problem_type", "")
    model = r.get("best_model", "your model")

    suggestions = [
        f"Here are actionable steps to improve **{model}**'s performance:\n",
    ]

    try:
        val = float(acc)
        if val <= 1.0:
            val *= 100

        if val < 30:
            suggestions.append(
                "1. **Check your target column** - a very low score often means "
                "the target was incorrectly selected or the data needs heavy preprocessing\n"
                "2. **Feature engineering** - create meaningful derived features\n"
                "3. **Data quality** - check for data leakage, incorrect labels, or "
                "columns that shouldn't be features (like IDs)"
            )
        elif val < 60:
            suggestions.append(
                "1. **Feature engineering** - create interaction features, polynomial features, "
                "or domain-specific transformations\n"
                "2. **Handle missing values** more carefully (imputation strategies)\n"
                "3. **Try ensemble methods** - combine multiple models for better predictions\n"
                "4. **Hyperparameter tuning** - use GridSearchCV or RandomizedSearchCV"
            )
        elif val < 85:
            suggestions.append(
                "1. **Hyperparameter tuning** - fine-tune the model parameters with cross-validation\n"
                "2. **Feature selection** - remove noisy or irrelevant features\n"
                "3. **Try advanced models** - XGBoost, LightGBM, or stacking ensembles\n"
                "4. **Cross-validation** - ensure your score is stable across different data splits"
            )
        else:
            suggestions.append(
                "1. Your model is already performing well! Focus on:\n"
                "   - **Preventing overfitting** - check train vs test performance gap\n"
                "   - **Robustness** - test on completely unseen data\n"
                "   - **Deployment readiness** - model serialization and API integration"
            )
    except (ValueError, TypeError):
        suggestions.append(
            "1. Try feature engineering and data preprocessing\n"
            "2. Experiment with different algorithms\n"
            "3. Use cross-validation for more reliable evaluation"
        )

    return "\n".join(suggestions)


def _respond_problem_type(records: list[dict]) -> str:
    if not records:
        return (
            "I need training data to tell you about the problem type. "
            "Upload a dataset and train a model first!"
        )

    r = records[-1]
    ptype = r.get("problem_type", "unknown")
    target = r.get("target", "the target column")
    dataset = r.get("dataset_name", "your dataset")

    explanations = {
        "classification": (
            f"Your dataset **{dataset}** is a **classification** problem. "
            f"This means the target column '{target}' contains discrete categories/classes, "
            f"and the model learns to predict which category a new data point belongs to.\n\n"
            f"Common metrics: Accuracy, F1-Score, Precision, Recall"
        ),
        "regression": (
            f"Your dataset **{dataset}** is a **regression** problem. "
            f"This means the target column '{target}' contains continuous numerical values, "
            f"and the model learns to predict a specific number.\n\n"
            f"Common metrics: R-squared (R2), RMSE, MAE"
        ),
    }

    return explanations.get(
        ptype.lower(),
        f"The problem type for **{dataset}** was detected as **{ptype}** "
        f"with target column '{target}'."
    )


def _respond_explain(records: list[dict], question: str) -> str:
    if not records:
        return (
            "I'd love to explain, but I need some training data first. "
            "Upload a dataset and train a model, then ask me again!"
        )

    r = records[-1]
    acc = r.get("accuracy", "unknown")
    model = r.get("best_model", "the model")
    ptype = r.get("problem_type", "")
    formatted_acc = _format_accuracy(acc)

    q_lower = question.lower()

    if "low" in q_lower or "bad" in q_lower or "poor" in q_lower:
        return (
            f"Your **{model}** achieved {formatted_acc}, which may seem low. "
            f"Here are common reasons:\n\n"
            f"1. **Insufficient features** - the dataset may not contain enough "
            f"predictive signals for the target\n"
            f"2. **Noisy data** - outliers or incorrect values reduce model accuracy\n"
            f"3. **Feature scaling** - some models are sensitive to feature ranges\n"
            f"4. **Data imbalance** - if some classes are rare, the model may struggle\n"
            f"5. **Wrong problem framing** - the {ptype} approach may not be optimal"
        )

    return (
        f"Based on your latest training run:\n\n"
        f"- **{model}** was selected as the best algorithm after comparing "
        f"multiple candidates\n"
        f"- It achieved a score of **{formatted_acc}** on the test set\n"
        f"- The problem was treated as **{ptype}**\n\n"
        f"The score represents how well the model generalizes to unseen data. "
        f"A higher score means better predictive performance."
    )


def _respond_general(records: list[dict], question: str) -> str:
    if records:
        r = records[-1]
        dataset = r.get("dataset_name", "your dataset")
        model = r.get("best_model", "your model")
        acc = _format_accuracy(r.get("accuracy", "N/A"))

        return (
            f"I'm your AutoModel assistant. Here's a quick summary of your latest work:\n\n"
            f"- **Dataset**: {dataset}\n"
            f"- **Best Model**: {model}\n"
            f"- **Score**: {acc}\n\n"
            f"You can ask me about your model's performance, dataset details, "
            f"or how to improve your results. What would you like to know?"
        )

    return (
        "I'm your AutoModel data assistant! I can help you with:\n\n"
        "- Understanding your model's performance\n"
        "- Dataset information and statistics\n"
        "- Suggestions to improve accuracy\n"
        "- Explaining ML concepts\n\n"
        "Upload a dataset and train a model to get started, "
        "then I can give you specific, data-driven insights!"
    )


# ---------------------------------------------------------------------------
# Main Entry Point — called by rag_chat.py as final fallback
# ---------------------------------------------------------------------------

_INTENT_HANDLERS = {
    "greeting": _respond_greeting,
    "accuracy": _respond_accuracy,
    "model_info": _respond_model_info,
    "columns": _respond_columns,
    "dataset_info": _respond_dataset_info,
    "improvement": _respond_improvement,
    "problem_type": _respond_problem_type,
    "explain": _respond_explain,
    "compare": _respond_general,
    "general": _respond_general,
}


def generate_offline_response(question: str, context: str) -> str:
    """
    Generate a smart, context-aware response without any API calls.
    This function can NEVER fail — it always returns a useful response.

    Args:
        question: The user's question
        context: Raw RAG context string from ChromaDB

    Returns:
        A helpful response string — guaranteed, no exceptions.
    """
    try:
        intent = _classify_intent(question)
        records = _parse_training_context(context)

        handler = _INTENT_HANDLERS.get(intent, _respond_general)

        # Handlers that also need the raw question for context
        if intent in ("explain", "compare", "general", "columns"):
            return handler(records, question)
        else:
            return handler(records)

    except Exception as e:
        # This should never happen, but even if it does, we return something
        print(f"[OFFLINE-ENGINE] Unexpected error (recovering): {e}")
        return (
            "I'm your AutoModel assistant. I can help you understand your "
            "training results, dataset details, and suggest improvements. "
            "Try asking about your model's accuracy or how to improve it!"
        )

<p align="center">
  <h1 align="center">🤖 AutoModel</h1>
  <p align="center">
    <strong>An end-to-end Automated Machine Learning Platform</strong><br/>
    Upload a CSV → Get a trained, optimized model with full explainability & AI insights — zero ML expertise required.
  </p>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18-61DAFB?logo=react" />
  <img src="https://img.shields.io/badge/Express-5-000000?logo=express" />
  <img src="https://img.shields.io/badge/FastAPI-0.110+-009688?logo=fastapi" />
  <img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb" />
  <img src="https://img.shields.io/badge/Python-3.10+-3776AB?logo=python" />
  <img src="https://img.shields.io/badge/Optuna-HPO-blue" />
  <img src="https://img.shields.io/badge/Gemini-AI_Insights-8E75B2" />
</p>

---

## Table of Contents

- [Overview](#overview)
- [System Architecture](#system-architecture)
- [End-to-End Data Flow](#end-to-end-data-flow)
- [Feature Breakdown](#feature-breakdown)
  - [1. Dataset Upload & Storage](#1-dataset-upload--storage)
  - [2. Dataset Profiling Engine](#2-dataset-profiling-engine)
  - [3. Automated Data Cleaning](#3-automated-data-cleaning)
  - [4. AI-Powered Target Column Detection](#4-ai-powered-target-column-detection)
  - [5. Exploratory Data Analysis (EDA)](#5-exploratory-data-analysis-eda)
  - [6. AutoML Model Competition](#6-automl-model-competition)
  - [7. Hyperparameter Optimization (Optuna)](#7-hyperparameter-optimization-optuna)
  - [8. Model Explainability](#8-model-explainability)
  - [9. AI Insights Generation](#9-ai-insights-generation)
  - [10. Auto-Healer (Self-Repairing Pipeline)](#10-auto-healer-self-repairing-pipeline)
  - [11. RAG Chatbot](#11-rag-chatbot)
  - [12. Visualization Dashboard](#12-visualization-dashboard)
  - [13. Authentication & Payments](#13-authentication--payments)
  - [14. System Messages & Audit Log](#14-system-messages--audit-log)
- [ML Models Used & Purpose](#ml-models-used--purpose)
- [LLM Architecture & Cascade Strategy](#llm-architecture--cascade-strategy)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)
- [Security & Production Hardening](#security--production-hardening)
- [Local Development Setup](#local-development-setup)
- [Deployment Guide](#deployment-guide)
- [Environment Variables](#environment-variables)

---

## Overview

**AutoModel** is a production-grade, full-stack AutoML platform that automates the entire machine learning lifecycle. A user simply uploads a CSV file, and the system:

1. **Profiles** the dataset for quality issues (missing values, duplicates, ID columns, class imbalance, data leakage risks)
2. **Cleans** the data automatically (imputation, deduplication, formatted number parsing)
3. **Detects** the best target column using an AI-assisted scoring algorithm
4. **Trains** 5 competing ML models simultaneously (Logistic Regression, Random Forest, Gradient Boosting, XGBoost, LightGBM)
5. **Optimizes** the best model's hyperparameters using Optuna (10-trial Bayesian search with 3-fold CV)
6. **Explains** which features drive predictions via normalized feature importance
7. **Generates** natural-language AI insights using Gemini 3.5 Flash
8. **Self-heals** if any pipeline crash occurs — an LLM cascade generates Python repair code automatically
9. **Presents** everything through a professional React dashboard with EDA charts, leaderboards, and a RAG chatbot

The entire system is designed to be explainable end-to-end in a technical interview.

---

## System Architecture

```
┌──────────────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                                │
│   React 18 + TypeScript + Vite + TailwindCSS + Shadcn/UI + Recharts    │
│   Three.js (3D Hero) • Framer Motion • React Router v6                 │
│   Deployed on: Vercel                                                   │
└──────────────────────┬───────────────────────────────────────────────────┘
                       │  REST API (JSON + JWT Bearer Token)
                       ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                    NODE.JS BACKEND (Express 5)                          │
│   • Authentication (bcrypt + JWT)         Port: 5000                    │
│   • File upload (Multer → MongoDB GridFS)                               │
│   • Rate limiting (express-rate-limit)                                  │
│   • Razorpay payment integration                                        │
│   • Proxies ML requests to Python backend                               │
│   • Stores ModelRun + SystemMessage in MongoDB                          │
│   • Background AI insight generation                                    │
│   Deployed on: Render                                                   │
└──────────────────────┬───────────────────────────────────────────────────┘
                       │  Internal HTTP (Authorization header forwarded)
                       ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                  PYTHON ML BACKEND (FastAPI)                            │
│   • Dataset profiling & EDA             Port: 8000                      │
│   • Data cleaning & preprocessing                                       │
│   • AutoML model competition (scikit-learn, XGBoost, LightGBM)          │
│   • Optuna hyperparameter optimization                                  │
│   • Feature importance explainability                                   │
│   • AI insights (Gemini 3.5 Flash)                                      │
│   • Auto-healer (LLM-powered self-repair)                               │
│   • RAG chatbot (ChromaDB + sentence-transformers + LLM cascade)        │
│   Deployed on: HuggingFace Spaces (Docker)                              │
└──────────────────────┬───────────────────────────────────────────────────┘
                       │
          ┌────────────┼────────────────┐
          ▼            ▼                ▼
┌──────────────┐ ┌──────────────┐ ┌───────────────────┐
│ MongoDB Atlas│ │  ChromaDB    │ │ LLM Cascade       │
│ (GridFS +    │ │ (Vector DB)  │ │ Gemini → Groq →   │
│  Collections)│ │ Per-user     │ │ HuggingFace →     │
│              │ │ RAG memory   │ │ Ollama → Offline   │
└──────────────┘ └──────────────┘ └───────────────────┘
```

### Why Three Services?

| Service | Responsibility | Why Separate? |
|---|---|---|
| **Frontend** (React) | UI rendering, routing, user interactions | Deployed on Vercel CDN for global edge performance |
| **Node Backend** (Express) | Auth, file storage, DB persistence, payment processing | Handles business logic, user sessions, and serves as the API gateway |
| **ML Backend** (FastAPI) | All ML computation, model training, AI features | Requires Python ML ecosystem (scikit-learn, XGBoost, Optuna, etc.) and benefits from Docker isolation on HuggingFace Spaces |

---

## End-to-End Data Flow

Below is the complete lifecycle of a dataset from upload to dashboard visualization:

```
                                     USER
                                       │
                                  ① Upload CSV
                                       │
                                       ▼
                              ┌─────────────────┐
                              │   React Upload   │
                              │   Page (Multer)  │
                              └────────┬─────────┘
                                       │ POST /api/upload (multipart/form-data)
                                       ▼
                              ┌─────────────────┐
                              │  Node Backend   │
                              │  uploadController│
                              └────────┬─────────┘
                                       │
                        ② Store CSV in MongoDB GridFS
                                       │
                                       ▼
                              ┌─────────────────┐
                              │   MongoDB Atlas  │  ← datasets.files + datasets.chunks
                              └────────┬─────────┘
                                       │
                        ③ POST /analyze (dataset_id)
                                       │
                                       ▼
                              ┌─────────────────┐
                              │  FastAPI /analyze │
                              │                  │
                              │  a) Download CSV │ ← fetches from GridFS via Node API
                              │     from GridFS  │
                              │  b) basic_cleaning│ ← impute, dedup, parse numbers
                              │  c) score_columns│ ← AI + heuristic target detection
                              │  d) DatasetProfiler│ ← quality report
                              │  e) Generate EDA │ ← 5 plot types saved as PNGs
                              └────────┬─────────┘
                                       │
                              Return: suggested_target, problem_type,
                                      profile_report, ranked_suggestions
                                       │
                              ┌────────▼─────────┐
                              │  User Confirms   │ ← user picks/overrides target column
                              │  Target Column   │
                              └────────┬─────────┘
                                       │ POST /api/upload/confirm-target
                                       ▼
                              ┌─────────────────┐
                              │  Node Backend   │
                              │ confirmController│
                              └────────┬─────────┘
                                       │ POST /confirm-target (to FastAPI)
                                       ▼
                              ┌─────────────────────────────────┐
                              │  FastAPI /confirm-target         │
                              │                                  │
                              │  a) Download CSV from GridFS     │
                              │  b) basic_cleaning               │
                              │  c) DatasetProfiler              │
                              │  d) prepare_data()               │
                              │     • Subsample to 10K rows      │
                              │     • Drop constant/ID/high-card │
                              │     • One-hot encode             │
                              │     • 80/20 train/test split     │
                              │     • StandardScaler             │
                              │  e) train_models()               │
                              │     • 5 models compete           │
                              │     • Full metrics computed      │
                              │     • Best model selected        │
                              │     • Optuna HPO (10 trials)     │
                              │     • Best model saved to .pkl   │
                              │  f) ModelExplainer               │
                              │     • Feature importance         │
                              │  g) store_training_memory()      │
                              │     • Embed → ChromaDB (RAG)     │
                              └────────┬────────────────────────┘
                                       │
                     ④ Return: best_model, score, leaderboard,
                        optuna_results, explain_report, profile_report,
                        system_messages (auto-heal events)
                                       │
                              ┌────────▼──────────┐
                              │  Node Backend     │
                              │  • Save ModelRun  │ ← MongoDB (all results persisted)
                              │  • Save SystemMsgs│
                              │  • Background:    │
                              │    POST /generate- │
                              │    insights        │ ← Gemini generates natural-language AI insights
                              │  • Update ModelRun│
                              │    with insights   │
                              └────────┬──────────┘
                                       │
                     ⑤ Response sent to frontend immediately
                        (insights generated async in background)
                                       │
                              ┌────────▼──────────┐
                              │  React Dashboard  │
                              │                   │
                              │  • Results Page   │ ← model, score, leaderboard
                              │  • Visualizations │ ← EDA plots with AI commentary
                              │  • Insights Page  │ ← Gemini-generated markdown
                              │  • Chatbot        │ ← RAG-powered Q&A about results
                              │  • System Messages│ ← auto-heal audit trail
                              └───────────────────┘
```

---

## Feature Breakdown

### 1. Dataset Upload & Storage

**Files:** `backend/controller/uploadController.js`, `backend/routes/uploadRoutes.js`

- Users upload CSV files via a drag-and-drop interface
- **Multer** handles multipart file parsing with validation:
  - Only `.csv` files accepted
  - File size limits enforced
- Files are stored in **MongoDB GridFS** (not filesystem) for:
  - Scalability (no local disk dependency)
  - Per-user isolation via `metadata.userId`
  - Secure downloads via authenticated API endpoints
- After upload, the ML backend is called automatically to begin analysis

---

### 2. Dataset Profiling Engine

**File:** `backend-ml/src/profiler.py` → `DatasetProfiler` class

Generates a structured Dataset Quality Report detecting:

| Check | What It Detects |
|---|---|
| **Missing Values** | Per-column count of null/NaN values |
| **Duplicate Rows** | Exact row duplicates in the dataset |
| **ID Columns** | Columns where every value is unique + name matches patterns like `id`, `key`, `index`, `pk`, `unnamed` |
| **Constant Columns** | Columns with ≤1 unique value (zero variance) |
| **High-Cardinality Categoricals** | Categorical columns with >50 unique values |
| **Class Imbalance** | For classification: minority class < 10% of total |
| **Data Leakage** | Features with >0.95 correlation with the target column |

**Output format:**
```json
{
  "rows": 15000,
  "columns": 24,
  "missing_values": { "salary": 18 },
  "duplicates": 4,
  "class_imbalance": true,
  "warnings": [
    "Column 'Customer_ID' appears to be an identifier",
    "Target distribution is highly imbalanced (minority class < 10%)",
    "Column 'exact_price' has extremely high correlation (0.99) with the target, indicating a data leakage risk"
  ]
}
```

---

### 3. Automated Data Cleaning

**File:** `backend-ml/src/data_cleaning.py`

Three-step pipeline run on every dataset before analysis or training:

| Step | Function | Logic |
|---|---|---|
| **Parse Formatted Numbers** | `clean_formatted_numbers()` | Strips `$`, `%`, `,` from string columns and converts to numeric if >80% of values are parseable |
| **Impute Missing Values** | `handle_missing_values()` | Numeric → fill with **median**; Categorical → fill with **mode**; Unknown fallback |
| **Remove Duplicates** | `remove_duplicates()` | Exact-match deduplication with row count logging |

---

### 4. AI-Powered Target Column Detection

**File:** `backend-ml/src/score_columns.py`

A hybrid scoring system that combines:

1. **AI Detection** — Queries LLM providers (Ollama → Groq → HuggingFace) with column names, data types, and a 5-row sample to identify the most likely target
2. **Statistical Heuristics** — Each column is scored on:
   - Uniqueness ratio (2–20 unique → good for classification, 20–80% → good for regression)
   - Numeric type bonus
   - Penalties for ID-like columns (all unique values) and high missing ratios (>50%)
   - +15 bonus if the AI recommended that column
3. Returns a ranked list of target candidates for user confirmation

**Problem Type Detection** (`detect_problem_type()`):
- Non-numeric target → **classification**
- Numeric target with ≤15 unique values → **classification**
- Numeric target with >15 unique values → **regression**
- Special `__clustering__` keyword → **clustering** (unsupervised)

---

### 5. Exploratory Data Analysis (EDA)

**File:** `backend-ml/src/eda.py`

Generates 5 publication-quality PNG charts (saved to `outputs/`):

| Chart | File | Description |
|---|---|---|
| **Target Distribution** | `target_distribution.png` | Count plot (classification) or histogram+KDE (regression) |
| **Correlation Heatmap** | `correlation_heatmap.png` | Top 12 numeric features by std, annotated heatmap with coolwarm colormap |
| **Feature Distributions** | `feature_distributions.png` | Top 9 numeric features, histogram+KDE grid |
| **Missing Values** | `missing_values.png` | Horizontal bar chart of missing percentages; or "100% Complete" success state |
| **Outlier Box Plots** | `outliers_boxplot.png` | Top 6 features by std, with red diamond outlier markers |

All plots use a consistent professional style with Seaborn's whitegrid theme, custom color palette (`#4b41e1`), and precise typography.

---

### 6. AutoML Model Competition

**Files:** `backend-ml/src/automl/models.py`, `backend-ml/src/train.py`

Automatically trains **5 competing models** based on problem type:

| # | Classification | Regression |
|---|---|---|
| 1 | Logistic Regression | Linear Regression |
| 2 | Random Forest Classifier | Random Forest Regressor |
| 3 | Gradient Boosting Classifier | Gradient Boosting Regressor |
| 4 | XGBoost Classifier | XGBoost Regressor |
| 5 | LightGBM Classifier | LightGBM Regressor |

**For Clustering (unsupervised):**
- K-Means (k=3), K-Means (k=5), Mini Batch K-Means, Gaussian Mixture

**Data Preparation** (`prepare_data()`):
1. Subsample to 10,000 rows if dataset is larger (training speed)
2. Drop constant columns, ID-like columns, and high-cardinality categoricals (>50 unique)
3. One-hot encode remaining categorical features
4. 80/20 train/test split
5. `StandardScaler` fit on training set, transform both sets
6. Save scaler to `outputs/scaler.pkl` for prediction time

**Evaluation Metrics:**

| Classification | Regression | Clustering |
|---|---|---|
| Accuracy | R² Score | Silhouette Score |
| Precision (weighted) | MAE | — |
| Recall (weighted) | RMSE | — |
| F1 Score (weighted) | — | — |

**Output:** A sorted leaderboard with full metrics per model:
```json
[
  { "model": "XGBoost", "score": 0.9234, "metrics": { "accuracy": 0.9234, "precision": 0.9201, "recall": 0.9234, "f1": 0.9215 } },
  { "model": "Random Forest", "score": 0.8910, "metrics": { "accuracy": 0.8910, "precision": 0.8880, "recall": 0.8910, "f1": 0.8890 } }
]
```

---

### 7. Hyperparameter Optimization (Optuna)

**File:** `backend-ml/src/automl/optimizer.py` → `AutoMLOptimizer` class

After the model competition, the **winning model** undergoes Bayesian hyperparameter optimization:

| Model | Tuned Hyperparameters | Search Space |
|---|---|---|
| **Random Forest** | `n_estimators`, `max_depth`, `min_samples_split` | 50–200, 3–20, 2–10 |
| **XGBoost** | `learning_rate`, `max_depth`, `n_estimators` | 0.001–0.3 (log), 3–15, 50–200 |
| **LightGBM** | `learning_rate`, `max_depth`, `num_leaves`, `n_estimators` | 0.001–0.3 (log), 3–15, 15–63, 50–200 |

**Configuration:**
- **10 trials** per optimization run
- **3-fold cross-validation** for each trial (speed vs. reliability)
- **600-second timeout** safety net
- **Maximize** scoring metric (accuracy for classification, R² for regression)

**Adoption Logic:** The optimized model **replaces** the base model only if its CV score exceeds the base model's test score. Otherwise, the original model is kept.

**Output:**
```json
{
  "run": true,
  "best_params": { "max_depth": 12, "learning_rate": 0.045, "n_estimators": 150 },
  "best_score": 0.9312,
  "n_trials": 10
}
```

---

### 8. Model Explainability

**File:** `backend-ml/src/explainability.py` → `ModelExplainer` class

Generates normalized feature importance scores (summing to 1.0) for the best model:

| Model Type | Extraction Method |
|---|---|
| Tree-based (RF, XGB, LGBM, GB) | `model.feature_importances_` |
| Linear (Logistic, Linear Regression) | `abs(model.coef_)` (mean across classes for multi-class) |
| K-Means | Variance of features across `cluster_centers_` |
| Gaussian Mixture | Variance of features across `means_` |

**Output (top 10 features):**
```json
{
  "status": "success",
  "top_features": [
    { "feature": "Age", "importance": 0.35 },
    { "feature": "Income", "importance": 0.22 },
    { "feature": "Education_Graduate", "importance": 0.15 }
  ]
}
```

> **Design Decision:** SHAP is intentionally avoided. Feature importance provides sufficient interpretability without the computational overhead and complexity of SHAP values, keeping the system interview-explainable and fast.

---

### 9. AI Insights Generation

**File:** `backend-ml/ml_services/app.py` → `/generate-insights` endpoint

After training, the system generates natural-language insights using **Gemini 3.5 Flash**:

**Inputs fed to the LLM prompt:**
- Dataset Quality Report (from profiler)
- Model Leaderboard (all models + scores)
- Best Model name & accuracy
- Best Hyperparameters (from Optuna)
- Feature Importance (top features)

**Insights cover:**
1. Most influential features and their impact
2. Data quality issues detected
3. Best model performance assessment & leaderboard context
4. Concrete next steps to improve
5. Dataset observations

**Fallback:** If Gemini is unavailable (429/quota), a dynamic rule-based fallback generates equivalent insights using the same data, ensuring users always receive analysis.

**Background Generation:** Insights are generated **asynchronously** after the training response is sent back to the user. The `ModelRun` document is updated in MongoDB once insights are ready. This prevents blocking the user while waiting for the LLM.

---

### 10. Auto-Healer (Self-Repairing Pipeline)

**File:** `backend-ml/src/auto_healer.py`

When the training pipeline crashes (e.g., unexpected data types, encoding errors), the Auto-Healer activates:

```
Training Attempt ① → CRASH → Capture Traceback
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │   LLM Cascade Call   │
                         │   Prompt: error +    │
                         │   dtypes + 3-row     │
                         │   sample             │
                         └──────────┬───────────┘
                                    │
                        Generate clean_df(df) code
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │  Sandboxed exec()   │
                         │  Safe builtins only  │
                         │  Only pd, np exposed │
                         └──────────┬───────────┘
                                    │
                         Apply fix → Training Attempt ②
                                    │
                         ┌──────────┴──────────┐
                         │                      │
                    ✅ Success              ❌ Fatal Error
                    (continue pipeline)    (return error + audit trail)
```

**LLM Cascade for Auto-Healer:**
1. **Ollama** (Gemma 2 9B — local, dev only)
2. **Groq** (Llama 3.1 8B — free cloud)
3. **HuggingFace** (Mistral 7B — free fallback)

**Safety:** The generated code runs in a **sandboxed `exec()`** with restricted builtins — only `pd`, `np`, and basic Python builtins are exposed. No `os`, `sys`, `subprocess`, or `import` access.

**Audit Trail:** Every auto-heal event is persisted as a `SystemMessage` in MongoDB with the original traceback, the LLM-generated code, and the outcome (success/failure).

---

### 11. RAG Chatbot

**Files:** `backend-ml/rag/rag_chat.py`, `backend-ml/rag/offline_engine.py`, `backend-ml/rag/store_training_memory.py`, `backend-ml/rag/embedder.py`, `backend-ml/rag/vectordb.py`

A context-aware AI chatbot that understands the user's specific datasets and training results:

**Architecture:**

```
User Question
      │
      ▼
┌─────────────────────────────────────┐
│ 1. ChromaDB Vector Search           │
│    • Embed question via             │
│      all-MiniLM-L6-v2              │
│    • Retrieve top-5 relevant docs   │
│    • Filter by user_id              │
└──────────────┬──────────────────────┘
               │
      ┌────────▼──────────┐
      │ 2. Intent Check   │  Is this a simple factual lookup?
      │    (keyword-based) │  (columns, accuracy, model_info...)
      └────────┬──────────┘
               │
      ┌────YES─┴─NO──────┐
      │                   │
      ▼                   ▼
┌────────────┐  ┌──────────────────┐
│ Short-     │  │ 3. LLM Cascade   │
│ Circuit    │  │  Gemini → Groq → │
│ (Offline   │  │  HuggingFace →   │
│ Engine)    │  │  Ollama           │
│ ZERO API   │  └────────┬─────────┘
│ calls      │           │
└────────────┘   ┌───────▼────────┐
                 │ 4. Guaranteed  │
                 │ Offline Engine │  ← if ALL LLMs fail
                 │ (Zero API)     │
                 └────────────────┘
```

**Training Memory Storage:**
- After each training run, a structured text document is created containing:
  - Dataset name, shape, all columns, dropped columns
  - Target column, problem type
  - Best model, accuracy/score, top features
- This text is embedded using `all-MiniLM-L6-v2` (384-dim sentence embeddings)
- Stored in **ChromaDB** (persistent, per-user filtered)
- Previous memory is cleared on new training to keep the chatbot current

**Offline Engine** (`offline_engine.py`):
- Handles 10 intent categories: `greeting`, `accuracy`, `model_info`, `columns`, `importance`, `dataset_info`, `improvement`, `problem_type`, `explain`, `compare`
- Generates intelligent, context-aware responses using templates + actual user data
- Makes **ZERO API calls** — can never fail or throw 429 errors
- Acts as the guaranteed-always-works tier in the cascade

---

### 12. Visualization Dashboard

**Frontend Pages:**

| Page | Route | Features |
|---|---|---|
| **Landing** | `/` | 3D Three.js hero, feature showcase, testimonials, CTA |
| **Login / Signup** | `/login`, `/signup` | JWT auth, bcrypt password hashing |
| **Upload** | `/upload` | Drag-and-drop CSV upload, target column selection with AI suggestions |
| **Dashboard** | `/dashboard` | Dataset health card, model leaderboard, Optuna results, feature importance chart, profiler warnings |
| **Results** | `/results` | Best model display, full metric breakdown, leaderboard table |
| **Visualizations** | `/visualizations` | EDA plot gallery with per-chart AI commentary |
| **Insights** | `/insights` | Gemini-generated markdown insights |
| **Chatbot** | `/chatbot` | RAG-powered conversational assistant |
| **System Messages** | `/messages` | Auto-heal audit trail, pipeline event log |
| **Settings** | `/settings` | Account management |
| **Pricing** | `/pricing` | Subscription tiers with Razorpay checkout |

**Frontend Technologies:**
- React 18 + TypeScript + Vite (dev server on port 8080)
- TailwindCSS + Shadcn/UI (Radix-based component library)
- Recharts (data visualization)
- Three.js + React Three Fiber (3D hero animation)
- Framer Motion + GSAP (micro-animations)
- React Router v6 (SPA routing)
- TanStack React Query (server state management)
- React Markdown (rendering AI insights)

---

### 13. Authentication & Payments

**Authentication:**
- **Register:** Name + email + bcrypt-hashed password → JWT token
- **Login:** Email + password → JWT verification → token
- **JWT Middleware:** Both backends validate the same `JWT_SECRET`
- Node backend: `authMiddleware.js` extracts user from DB
- Python backend: `jwt_handler.py` decodes and validates
- All protected routes require `Authorization: Bearer <token>` header

**Payments (Razorpay):**
- Order creation with amount in INR
- HMAC-SHA256 signature verification
- `User.isSubscribed` flag update on successful payment
- User ID always taken from JWT (never from client body — prevents IDOR)

---

### 14. System Messages & Audit Log

**File:** `backend/models/SystemMessage.js`

Every Auto-Healer event is persisted with:
- `type`: `error` | `success` | `info`
- `title`: Human-readable event name
- `content`: Description of what happened
- `llmCode`: The Python code generated by the LLM (if applicable)
- `traceback`: The original stack trace that triggered healing
- `aiAdvice`: Specialized model advice (optional)

Users can view these on the `/messages` page to understand exactly what happened behind the scenes.

---

## ML Models Used & Purpose

| Model | Library | Used For | Why This Model? |
|---|---|---|---|
| **Logistic Regression** | scikit-learn | Classification baseline | Fast, interpretable, good linear baseline |
| **Linear Regression** | scikit-learn | Regression baseline | Simplest regression, interpretable coefficients |
| **Random Forest** | scikit-learn | Classification & Regression | Handles non-linear patterns, robust to overfitting |
| **Gradient Boosting** | scikit-learn | Classification & Regression | Sequential error correction, strong performance |
| **XGBoost** | xgboost | Classification & Regression | Regularized gradient boosting, industry standard |
| **LightGBM** | lightgbm | Classification & Regression | Fastest gradient boosting, handles large datasets |
| **K-Means** | scikit-learn | Clustering | Standard partitional clustering |
| **Mini Batch K-Means** | scikit-learn | Clustering | Scalable K-Means for larger datasets |
| **Gaussian Mixture** | scikit-learn | Clustering | Soft clustering with probabilistic assignment |
| **StandardScaler** | scikit-learn | Preprocessing | Z-score normalization for all features |
| **all-MiniLM-L6-v2** | sentence-transformers | RAG Embeddings | 384-dim embeddings, fast & lightweight (22M params) |
| **Optuna** | optuna | Hyperparameter Optimization | Bayesian (TPE) search, efficient with few trials |

---

## LLM Architecture & Cascade Strategy

AutoModel uses LLMs for multiple purposes, with a **multi-tier cascade** to ensure zero-downtime:

| Use Case | Tier 1 (Primary) | Tier 2 | Tier 3 | Tier 4 | Tier 5 (Guaranteed) |
|---|---|---|---|---|---|
| **RAG Chatbot** | Gemini 3.5 Flash | Groq (Llama 3.1 8B) | HuggingFace (Mistral 7B) | Ollama (phi3:mini, local) | Offline Engine (zero API) |
| **AI Insights** | Gemini 3.5 Flash | — | — | — | Dynamic rule-based fallback |
| **Auto-Healer** | Ollama (Gemma 2 9B, local) | Groq (Llama 3.1 8B) | HuggingFace (Mistral 7B) | — | RuntimeError |
| **Target Detection** | Ollama (Gemma 2 9B, local) | Groq (Llama 3.1 8B) | HuggingFace (Mistral 7B) | — | Statistical heuristics only |
| **Viz Insights** | — | — | — | — | Static rule-based text |
| **Model Advice** | Gemini 3.5 Flash (dual-key) | — | — | — | Graceful error message |
| **Embeddings** | sentence-transformers (local) | — | — | — | — |

> **All LLM providers used are free-tier.** No paid API keys required. The cascade silently switches to the next provider on any failure (429, timeout, quota). Users never see an error.

---

## Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 18.3 | UI framework |
| TypeScript | 5.8 | Type safety |
| Vite | 5.4 | Build tool & dev server |
| TailwindCSS | 3.4 | Utility-first CSS |
| Shadcn/UI | Latest | Radix-based component library |
| Recharts | 2.15 | Data visualization charts |
| Three.js | 0.160 | 3D hero animation |
| Framer Motion | 11.18 | Page transitions & animations |
| React Router | 6.30 | Client-side routing |
| TanStack Query | 5.83 | Server state management |
| Axios | 1.13 | HTTP client |
| Zod | 3.25 | Schema validation |

### Node Backend
| Technology | Version | Purpose |
|---|---|---|
| Express | 5.2 | HTTP framework |
| Mongoose | 9.2 | MongoDB ODM |
| bcryptjs | 3.0 | Password hashing |
| jsonwebtoken | 9.0 | JWT auth tokens |
| Multer | 2.0 | File upload parsing |
| express-rate-limit | 8.3 | API rate limiting |
| Razorpay | 2.9 | Payment gateway |
| @google/generative-ai | 0.24 | Gemini API client |

### Python ML Backend
| Technology | Version | Purpose |
|---|---|---|
| FastAPI | 0.110+ | API framework |
| scikit-learn | 1.5+ | ML algorithms & preprocessing |
| XGBoost | Latest | Gradient boosting |
| LightGBM | Latest | Fast gradient boosting |
| Optuna | Latest | Hyperparameter optimization |
| Pandas | 2.2+ | Data manipulation |
| Matplotlib + Seaborn | Latest | Chart generation |
| ChromaDB | 0.5+ | Vector database for RAG |
| sentence-transformers | Latest | Text embeddings |
| google-generativeai | Latest | Gemini API |
| PyJWT | Latest | JWT verification |

### Infrastructure
| Service | Purpose |
|---|---|
| **MongoDB Atlas** | Database (Users, ModelRuns, SystemMessages, GridFS file storage) |
| **Vercel** | Frontend hosting (CDN, SPA routing) |
| **Render** | Node backend hosting |
| **HuggingFace Spaces** | ML backend hosting (Docker) |

---

## Project Structure

```
autoModel/
├── frontend/                          # React + TypeScript SPA
│   ├── src/
│   │   ├── pages/                     # Route-level components
│   │   │   ├── Landing.tsx            # Marketing landing page with 3D hero
│   │   │   ├── Login.tsx              # JWT login form
│   │   │   ├── Signup.tsx             # Registration form
│   │   │   ├── Dashboard.tsx          # Main analytics dashboard
│   │   │   ├── Upload.tsx             # CSV upload + target selection
│   │   │   ├── Results.tsx            # Model results & leaderboard
│   │   │   ├── Visualizations.tsx     # EDA chart gallery
│   │   │   ├── Insights.tsx           # AI-generated insights display
│   │   │   ├── Chatbot.tsx            # RAG chatbot interface
│   │   │   ├── SystemMessages.tsx     # Auto-heal audit log
│   │   │   ├── Settings.tsx           # User account settings
│   │   │   └── Pricing.tsx            # Subscription with Razorpay
│   │   ├── components/
│   │   │   ├── DashboardLayout.tsx    # Sidebar + navigation layout
│   │   │   ├── Hero3DModel.tsx        # Three.js 3D animation
│   │   │   ├── NavLink.tsx            # Navigation component
│   │   │   ├── ProtectedRoute.jsx     # JWT route guard
│   │   │   ├── CTA.tsx               # Call-to-action section
│   │   │   ├── Footer.tsx            # Site footer
│   │   │   ├── testimonials.tsx      # Social proof section
│   │   │   ├── steps.jsx            # How-it-works section
│   │   │   └── ui/                   # Shadcn/UI components
│   │   ├── api/                       # Axios API client functions
│   │   ├── config/                    # URL configuration (auto-detect env)
│   │   ├── hooks/                     # Custom React hooks
│   │   ├── lib/                       # Utility library
│   │   └── utils/                     # Helper functions
│   ├── index.html                     # Entry HTML
│   ├── tailwind.config.ts             # Tailwind theme
│   ├── vite.config.ts                 # Vite build config
│   └── vercel.json                    # Vercel SPA routing config
│
├── backend/                           # Node.js API Gateway
│   ├── server.js                      # Express app entry point
│   ├── config/
│   │   └── db.js                      # MongoDB Atlas connection
│   ├── controller/
│   │   ├── authController.js          # Register + Login
│   │   ├── uploadController.js        # CSV upload → GridFS → ML analyze
│   │   ├── confirmController.js       # Target confirmation → Training → Save results
│   │   ├── chatController.js          # Proxy chat to ML backend
│   │   ├── modelController.js         # Fetch saved model runs
│   │   ├── datasetController.js       # GridFS dataset download
│   │   ├── visualizationController.js # Proxy EDA plot requests
│   │   ├── messageController.js       # System message CRUD
│   │   └── paymentController.js       # Razorpay order + verification
│   ├── models/
│   │   ├── User.js                    # User schema (name, email, password, isSubscribed)
│   │   ├── ModelRun.js                # Training results schema
│   │   └── SystemMessage.js           # Auto-heal event log schema
│   ├── middleware/
│   │   └── authMiddleware.js          # JWT verification middleware
│   ├── routes/
│   │   ├── authRoutes.js              # POST /register, /login
│   │   ├── uploadRoutes.js            # POST /upload, /confirm-target
│   │   ├── modelRoutes.js             # GET /models
│   │   ├── chatRoutes.js              # POST /chat
│   │   ├── datasetRoutes.js           # GET /dataset/:id/download
│   │   ├── messageRoutes.js           # GET/POST /messages
│   │   └── paymentRoutes.js           # POST /create-order, /verify
│   ├── services/
│   │   ├── geminiServices.js          # Gemini API for model advice
│   │   └── codeGenerator.js           # Code generation service
│   └── utils/
│       ├── generateToken.js           # JWT token factory
│       └── errorLogger.js             # Error persistence utility
│
├── backend-ml/                        # Python ML Engine
│   ├── ml_services/
│   │   └── app.py                     # FastAPI main application
│   ├── src/
│   │   ├── profiler.py                # DatasetProfiler class
│   │   ├── data_cleaning.py           # Imputation, dedup, number parsing
│   │   ├── data_loader.py             # CSV loading utility
│   │   ├── score_columns.py           # AI + heuristic target detection
│   │   ├── eda.py                     # 5 EDA chart generators
│   │   ├── train.py                   # Data prep + model competition
│   │   ├── predict.py                 # Inference pipeline
│   │   ├── explainability.py          # ModelExplainer class
│   │   ├── auto_healer.py             # LLM-powered dataset repair
│   │   ├── utils.py                   # Shared utilities
│   │   └── automl/
│   │       ├── models.py              # Model registry (5 per task type)
│   │       └── optimizer.py           # Optuna HPO wrapper
│   ├── rag/
│   │   ├── rag_chat.py                # RAG pipeline + LLM cascade
│   │   ├── offline_engine.py          # Zero-API fallback (guaranteed)
│   │   ├── store_training_memory.py   # Embed + store in ChromaDB
│   │   ├── embedder.py                # sentence-transformers wrapper
│   │   ├── vectordb.py                # ChromaDB client
│   │   └── prompt_builder.py          # Prompt construction
│   ├── auth/
│   │   └── jwt_handler.py             # FastAPI JWT dependency
│   ├── config.py                      # Environment detection
│   ├── main.py                        # CLI entry point (local testing)
│   ├── Dockerfile                     # HuggingFace Spaces deployment
│   └── requirements.txt               # Python dependencies
│
├── hf_app.py                          # HuggingFace Spaces entry point
├── render.yaml                        # Render deployment config
├── planning.md                        # Development roadmap
└── .gitignore
```

---

## Database Schema

### `users` Collection
```javascript
{
  _id: ObjectId,
  name: String (required),
  email: String (required, unique, lowercase),
  password: String (required, bcrypt hash, min 6 chars),
  isSubscribed: Boolean (default: false),
  createdAt: Date,
  updatedAt: Date
}
```

### `modelruns` Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User, required),
  datasetName: String,
  targetColumn: String,
  problemType: String,        // "classification" | "regression" | "clustering"
  bestModel: String,           // e.g., "XGBoost", "Random Forest"
  accuracy: Number,            // 0.0–1.0 for classification, R² for regression
  rows: Number,
  columns: Number,
  topFeatures: Array,          // [{ feature, importance }]
  explainReport: Object,       // Full ModelExplainer output
  leaderboard: Array,          // [{ model, score, metrics }]
  profileReport: Object,       // DatasetProfiler output
  optunaResults: Object,       // { run, best_params, best_score, n_trials }
  insights: String,            // Gemini-generated markdown (default: "Pending")
  createdAt: Date
}
```

### `systemmessages` Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User, required),
  datasetName: String (required),
  datasetId: String,
  type: String (enum: ["error", "success", "info"]),
  title: String (required),
  content: String (required),
  llmCode: String,             // Auto-healer generated code
  traceback: String,           // Original error stack trace
  aiAdvice: String,            // ML-specific advice from Gemini
  createdAt: Date,
  updatedAt: Date
}
```

### `datasets.files` + `datasets.chunks` (GridFS)
```javascript
// files
{
  _id: ObjectId,
  filename: String,            // Original CSV filename
  length: Number,              // File size in bytes
  chunkSize: Number,
  uploadDate: Date,
  metadata: { userId: ObjectId }
}
```

---

## API Reference

### Node Backend (port 5000)

| Method | Route | Auth | Rate Limit | Description |
|---|---|---|---|---|
| `POST` | `/api/auth/register` | ❌ | 20/15min | Register new user |
| `POST` | `/api/auth/login` | ❌ | 20/15min | Login, returns JWT |
| `POST` | `/api/upload` | ✅ | 20/15min | Upload CSV → GridFS → ML analyze |
| `POST` | `/api/upload/confirm-target` | ✅ | 20/15min | Confirm target → train → save |
| `GET` | `/api/models` | ✅ | 300/min | List user's ModelRuns |
| `GET` | `/api/dataset/:id/download` | ✅ | 300/min | Download CSV from GridFS |
| `POST` | `/api/chat` | ✅ | 30/min | Proxy to ML chatbot |
| `GET` | `/api/messages` | ✅ | 300/min | Get system messages |
| `POST` | `/api/payment/create-order` | ✅ | 300/min | Create Razorpay order |
| `POST` | `/api/payment/verify` | ✅ | 300/min | Verify payment signature |
| `GET` | `/api/visualizations/plot/:filename` | ❌ | 300/min | Serve EDA plot images |
| `GET` | `/api/visualizations/insight/:chartName` | ✅ | 300/min | Get chart-specific AI insight |

### ML Backend (port 8000)

| Method | Route | Auth | Description |
|---|---|---|---|
| `POST` | `/analyze` | ✅ JWT | Analyze dataset: clean → profile → EDA → suggest target |
| `POST` | `/confirm-target` | ✅ JWT | Train models: prepare → compete → optimize → explain |
| `POST` | `/generate-insights` | ✅ JWT | Generate AI insights via Gemini |
| `POST` | `/chat` | ✅ JWT | RAG chatbot query |
| `GET` | `/visualization-insights/:chart_name` | ✅ JWT | Per-chart AI analysis |
| `GET` | `/sample-data?dataset_id=` | ✅ JWT | Get first 10 rows for auto-healer |
| `GET` | `/outputs/:filename` | ❌ | Static file server for EDA plots |

---

## Security & Production Hardening

| Feature | Implementation |
|---|---|
| **Password Hashing** | bcrypt with 10 salt rounds |
| **JWT Authentication** | Shared secret between Node and Python backends |
| **CORS** | Explicit origin allowlist (no wildcard in production) |
| **Rate Limiting** | Tiered: Auth (20/15min), Upload (20/15min), Chat (30/min), General (300/min) |
| **File Validation** | Multer: CSV-only, size-capped |
| **Input Validation** | Pydantic models with min/max constraints on all ML endpoints |
| **Error Isolation** | Production: generic 500 messages, no stack traces leaked to client |
| **Error Logging** | All errors persisted to `last_server_error.txt` + `SystemMessage` collection |
| **Payment Security** | HMAC-SHA256 signature verification; userId from JWT, never from client body |
| **Auto-Healer Sandbox** | Restricted `exec()` with allowlisted builtins only |
| **Proxy Trust** | `trust proxy` enabled for Render's reverse proxy |

---

## Local Development Setup

### Prerequisites
- Node.js 18+
- Python 3.10+
- MongoDB Atlas account (free tier works)
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/rohanb1022/autoModel.git
cd autoModel
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
# → http://localhost:8080
```

### 3. Node Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI, JWT secret, API keys
node server.js
# → http://localhost:5000
```

### 4. Python ML Backend Setup
```bash
cd backend-ml
python -m venv venv

# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt

cp .env.example .env
# Edit .env: set USE_OLLAMA=true for local LLMs, false for cloud APIs

uvicorn ml_services.app:app --reload --port 8000
# → http://localhost:8000
```

### 5. (Optional) Local LLM with Ollama
```bash
# Install Ollama from https://ollama.ai
ollama pull phi3:mini       # For chatbot
ollama pull gemma2:9b       # For auto-healer & target detection
# Set USE_OLLAMA=true in backend-ml/.env
```

---

## Deployment Guide

### Frontend → Vercel

1. Push repo to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import from GitHub
3. Set **Root Directory**: `frontend`
4. Set **Build Command**: `npm run build`
5. Set **Output Directory**: `dist`
6. No environment variables needed (URLs auto-detect via `src/config/urls.ts`)
7. Deploy — SPA routing is pre-configured in `frontend/vercel.json`

### Node Backend → Render

1. Go to [render.com](https://render.com) → New → Web Service
2. Connect GitHub repo, set **Root Directory**: `backend`
3. Set **Build Command**: `npm install`
4. Set **Start Command**: `node server.js`
5. Add environment variables (see below)

> The `render.yaml` at the project root is pre-configured for one-click deployment.

### ML Backend → HuggingFace Spaces

1. Create a Space at [huggingface.co/spaces](https://huggingface.co/spaces)
2. Choose **Docker** as the SDK
3. Connect GitHub repo, set **Root Directory**: `backend-ml`
4. Add repository secrets (see below)

> HuggingFace Spaces is ideal because it provides a free Docker container designed for ML workloads with persistent filesystem.

---

## Environment Variables

### Node Backend (`backend/.env`)

| Variable | Required | Description |
|---|---|---|
| `MONGO_URI` | ✅ | MongoDB Atlas connection string |
| `JWT_SECRET` | ✅ | Shared secret for JWT signing (same in both backends) |
| `GEMINI_API_KEY` | ✅ | Google Gemini API key (primary) |
| `GEMINI_API_KEY_2` | ❌ | Backup Gemini key (failover) |
| `RAZORPAY_KEY_ID` | ❌ | Razorpay payment key |
| `RAZORPAY_KEY_SECRET` | ❌ | Razorpay payment secret |
| `FRONTEND_URL` | ❌ | Deployed frontend URL (for CORS) |
| `NODE_ENV` | ❌ | `production` to enable rate limiting + CORS enforcement |
| `PORT` | ❌ | Default: `5000` |

### ML Backend (`backend-ml/.env`)

| Variable | Required | Description |
|---|---|---|
| `JWT_SECRET` | ✅ | Must match Node backend's JWT_SECRET |
| `GEMINI_API_KEY` | ❌ | For AI insights generation |
| `GROQ_API_KEY` | ❌ | Free cloud LLM (Llama 3.1 8B) |
| `HF_API_TOKEN` | ❌ | HuggingFace Inference API token |
| `USE_OLLAMA` | ❌ | `true` for local LLM, `false` for cloud (default: `false`) |
| `NODE_BACKEND_URL` | ❌ | URL of the Node backend (for GridFS downloads) |
| `FRONTEND_URL` | ❌ | Deployed frontend URL (for CORS) |

---

<p align="center">
  <sub>Built for placement interview readiness — every component is designed to be explainable end-to-end.</sub>
</p>

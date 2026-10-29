<p align="center">
  <h1 align="center">🤖 AutoModel</h1>
  <p align="center">
    <strong>An End-to-End Automated Machine Learning & Self-Healing Platform</strong><br/>
    Upload a CSV → Profile & Clean → AI Target Detection → AutoML Competition → Hyperparameter Optimization → Sandbox Verified Code Generation & Google Colab Export — zero ML expertise required.
  </p>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18.3-61DAFB?logo=react" />
  <img src="https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript" />
  <img src="https://img.shields.io/badge/Express-5.0-000000?logo=express" />
  <img src="https://img.shields.io/badge/FastAPI-0.110+-009688?logo=fastapi" />
  <img src="https://img.shields.io/badge/Python-3.11+-3776AB?logo=python" />
  <img src="https://img.shields.io/badge/MongoDB-Atlas_GridFS-47A248?logo=mongodb" />
  <img src="https://img.shields.io/badge/Optuna-Bayesian_HPO-blue" />
  <img src="https://img.shields.io/badge/Groq-Llama_3.3_70B-f55036" />
  <img src="https://img.shields.io/badge/Gemini-AI_Insights-8E75B2" />
  <img src="https://img.shields.io/badge/ChromaDB-Vector_RAG-orange" />
  <img src="https://img.shields.io/badge/Sandbox-Self_Healing_Code-green" />
</p>

---

## Table of Contents

- [Overview](#overview)
- [System Architecture](#system-architecture)
- [End-to-End Workflow](#end-to-end-workflow)
- [Comprehensive Feature Breakdown](#comprehensive-feature-breakdown)
  - [1. Dataset Upload & GridFS Storage](#1-dataset-upload--gridfs-storage)
  - [2. Dataset Profiling & Data Quality Audit](#2-dataset-profiling--data-quality-audit)
  - [3. Automated Data Cleaning & Type Inference](#3-automated-data-cleaning--type-inference)
  - [4. AI + Heuristic Target Column Detection](#4-ai--heuristic-target-column-detection)
  - [5. Exploratory Data Analysis (EDA) Charts](#5-exploratory-data-analysis-eda-charts)
  - [6. AutoML Model Competition](#6-automl-model-competition)
  - [7. Hyperparameter Optimization with Optuna](#7-hyperparameter-optimization-with-optuna)
  - [8. Model Explainability & Feature Importance](#8-model-explainability--feature-importance)
  - [9. AI Insights Generation](#9-ai-insights-generation)
  - [10. Auto-Healer (Self-Repairing Pipeline)](#10-auto-healer-self-repairing-pipeline)
  - [11. In-App Sandbox Execution & Self-Healing Code Generator](#11-in-app-sandbox-execution--self-healing-code-generator)
  - [12. Google Colab Integration & .ipynb Notebook Export](#12-google-colab-integration--ipynb-notebook-export)
  - [13. RAG Chatbot with ChromaDB Memory](#13-rag-chatbot-with-chromadb-memory)
  - [14. Visualization Gallery & Chart Insights](#14-visualization-gallery--chart-insights)
  - [15. Authentication & Razorpay Payments](#15-authentication--razorpay-payments)
  - [16. System Audit Log & Message History](#16-system-audit-log--message-history)
- [Machine Learning Algorithms & Libraries](#machine-learning-algorithms--libraries)
- [LLM Multi-Tier Cascade & Token Preservation Strategy](#llm-multi-tier-cascade--token-preservation-strategy)
- [Core Functions & Technical Working](#core-functions--technical-working)
  - [ML Backend Functions (`backend-ml/src/`)](#ml-backend-functions-backend-mlsrc)
  - [RAG & Vector Memory Functions (`backend-ml/rag/`)](#rag--vector-memory-functions-backend-mlrag)
  - [Node.js Backend Controllers & Services (`backend/`)](#nodejs-backend-controllers--services-backend)
  - [Frontend Hooks & Page Handlers (`frontend/src/`)](#frontend-hooks--page-handlers-frontendsrc)
- [Complete API Reference](#complete-api-reference)
  - [Node.js Gateway Endpoints (Port 5000)](#nodejs-gateway-endpoints-port-5000)
  - [Python ML Engine Endpoints (Port 8000)](#python-ml-engine-endpoints-port-8000)
- [Database Schemas & Data Models](#database-schemas--data-models)
- [Tech Stack](#tech-stack)
- [Repository Structure](#repository-structure)
- [Local Development Setup](#local-development-setup)
- [Deployment Guide](#deployment-guide)
- [Environment Variables](#environment-variables)
- [Security & Production Hardening](#security--production-hardening)

---

## Overview

**AutoModel** is a production-grade, enterprise-ready Automated Machine Learning (AutoML) platform. It allows anyone — from students to data scientists — to upload raw CSV files and automatically obtain:

1. **In-depth profiling** of data quality, null values, cardinality, and data leakage risks.
2. **Automated cleaning** with intelligent imputation, deduplication, and numerical currency/unit parsing.
3. **AI target detection** identifying whether the dataset represents classification, regression, or clustering.
4. **Multi-model benchmark competition** evaluating up to 5 competitive machine learning algorithms simultaneously.
5. **Bayesian hyperparameter optimization (HPO)** via Optuna to tune the champion model.
6. **Feature importance & explainability** detailing which drivers dictate predictions.
7. **Production code generation with in-app sandbox verification**: Generates Python scripts, runs them in an isolated test environment against real dataset slices, catches tracebacks, and automatically self-heals using open-source models (Groq Llama 3.3 70B / Ollama) without burning Gemini API tokens.
8. **1-Click Google Colab Notebook Export (`.ipynb`)** for instant cloud execution.
9. **Interactive RAG chatbot** that answers queries about your models, metrics, and dataset memory.

---

## System Architecture

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                   CLIENT (Browser)                                     │
│  React 18.3 + TypeScript + Vite + TailwindCSS + Shadcn/UI + Recharts + Framer Motion   │
│  Interactive 3D Hero (Three.js) • Markdown Rendering • Jupyter Notebook (.ipynb) Export│
│  Deployed on: Vercel                                                                   │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │ REST API (JSON + JWT Bearer Token)
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                           NODE.JS API GATEWAY (Express 5)                              │
│  • Port: 5000                                                                          │
│  • User Authentication (bcrypt password hashing, JWT signed sessions)                 │
│  • File Upload & Storage (Multer stream → MongoDB Atlas GridFS chunks)                 │
│  • Rate Limiting (Tiered express-rate-limit)                                           │
│  • Payment Processing (Razorpay order creation & HMAC-SHA256 signature verification)   │
│  • Reverse Proxy to Python ML Backend with auth header forwarding                      │
│  • Persistent Metadata (ModelRun & SystemMessage MongoDB collections)                  │
│  • Fallback Code Generation Service with Groq & Gemini Cascades                        │
│  Deployed on: Render                                                                   │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │ Internal HTTP / Forwarded Bearer Token
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                            PYTHON ML ENGINE (FastAPI)                                  │
│  • Port: 8000 (Python 3.11 + Uvicorn)                                                  │
│  • Profiling & EDA Engine (Pandas, Matplotlib, Seaborn)                                │
│  • Data Cleaner & Pipeline Preprocessor (Scikit-Learn ColumnTransformer)               │
│  • AutoML Benchmark Competition (Scikit-Learn, XGBoost, LightGBM, PyTorch)             │
│  • Bayesian Hyperparameter Tuner (Optuna TPESampler)                                   │
│  • Model Explainer & Normalized Feature Importance                                     │
│  • Sandboxed Execution Engine (Subprocess verification & auto-healer)                  │
│  • RAG Chatbot Vector Database (ChromaDB + sentence-transformers/all-MiniLM-L6-v2)     │
│  • Open-Source LLM Integration (Groq LPU, Ollama, HuggingFace, Gemini Flash)           │
│  Deployed on: HuggingFace Spaces (Docker) / Local Environment                          │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## End-to-End Workflow

```
1. User Uploads CSV ───► Multer streams file to MongoDB GridFS
                                │
2. Initial Analysis ────► Python FastAPI downloads dataset from GridFS
                                │
                          ┌─────┴────────────────────────────────┐
                          │ • Basic Cleaning (whitespace, NaNs)  │
                          │ • DatasetProfiler (schema & risks)   │
                          │ • Generates 5 EDA charts             │
                          │ • AI Target Detection (Groq/Ollama)  │
                          └─────┬────────────────────────────────┘
                                │
3. User Confirms Target ◄───────┘
                                │
4. Model Training ──────► 5 Models Compete Simultaneously:
   & Optimization         ├── Logistic / Linear Regression
                          ├── Random Forest
                          ├── Gradient Boosting
                          ├── XGBoost / LightGBM
                          └── KMeans / GMM (if Clustering)
                                │
                          Optuna tunes best model (10 trials, 3-fold CV)
                                │
                          Generates Explainer Report & Feature Importance
                                │
                          Embeds dataset summary into ChromaDB for RAG
                                │
5. Code Generation ─────► Groq Llama 3.3 70B writes complete Python code
   & Sandbox Verifier           │
                          Subprocess runs code against sample CSV slice
                                │
                          ┌─────┴────────────────────────────────┐
                          │ Success? ──► Returns verified code   │
                          │ Failed?  ──► Captures stderr trace   │
                          │              Feeds back to Groq      │
                          │              Self-heals (max 2 tries)│
                          └─────┬────────────────────────────────┘
                                │
6. Results & Deployment ◄───────┴── Display metrics, code & Download .ipynb
```

---

## Comprehensive Feature Breakdown

### 1. Dataset Upload & GridFS Storage
* **Large File Handling**: Files are uploaded through Express using Multer memory storage and written directly to MongoDB Atlas **GridFS** (`datasets.files` and `datasets.chunks`). This prevents memory leaks and ensures dataset availability across distributed backend instances.
* **Security Checks**: Strict MIME type checking (`text/csv`, `application/vnd.ms-excel`), 50MB file size limits, and sanitization of filenames.

### 2. Dataset Profiling & Data Quality Audit
* **Class:** `DatasetProfiler` in [`backend-ml/src/profiler.py`](file:///c:/Users/ROHAN%20BHANGALE/programming/projects/Automodel/autoModel/backend-ml/src/profiler.py)
* Audits every uploaded file across 6 critical quality metrics:
  1. **Null/Missing Rates**: Per-column percentages and missing distribution.
  2. **Duplicate Rows**: Counts and percentages of identical records.
  3. **High-Cardinality Detection**: Flags ID columns, serial keys, and unique hashes.
  4. **Class Imbalance Risk**: Evaluates categorical targets for minority class skew (< 15%).
  5. **Data Leakage Warnings**: Checks for column names containing `id`, `target`, `leak`, or identical distributions.
  6. **Zero-Variance / Constant Columns**: Flags features offering no predictive value.

### 3. Automated Data Cleaning & Type Inference
* **File:** [`backend-ml/src/data_cleaning.py`](file:///c:/Users/ROHAN%20BHANGALE/programming/projects/Automodel/autoModel/backend-ml/src/data_cleaning.py)
* **Intelligent Type Casting**: Strips currency symbols (`$`, `€`, `₹`), comma thousand-separators, and percentages (`%`) from numbers, automatically casting them to numeric floats.
* **Column Name Normalization**: Converts headers to clean `snake_case`, removing non-alphanumeric punctuation and whitespaces.
* **Deduplication**: Automatically drops exact duplicate records.
* **Safe Imputation**: Replaces numerical NaNs with column medians and categorical NaNs with the most frequent value.

### 4. AI + Heuristic Target Column Detection
* **File:** [`backend-ml/src/score_columns.py`](file:///c:/Users/ROHAN%20BHANGALE/programming/projects/Automodel/autoModel/backend-ml/src/score_columns.py)
* **Hybrid Scoring Algorithm**: Combines linguistic pattern matching with statistical entropy:
  * Column name semantic checks (`target`, `label`, `churn`, `status`, `price`, `outcome`).
  * Position heuristic (penultimate and ultimate columns receive higher prior weights).
  * Unique value distribution and cardinality constraints.
  * LLM reasoning (via Groq / Ollama / Gemini) to disambiguate complex datasets.
* Automatically classifies problem type into **Binary Classification**, **Multi-Class Classification**, **Regression**, or **Clustering** (unsupervised).

### 5. Exploratory Data Analysis (EDA) Charts
* **File:** [`backend-ml/src/eda.py`](file:///c:/Users/ROHAN%20BHANGALE/programming/projects/Automodel/autoModel/backend-ml/src/eda.py)
* Automatically renders and saves 5 publication-ready visualization charts:
  1. `target_distribution.png`: Bar chart or KDE distribution of the target.
  2. `correlation_heatmap.png`: Pearson correlation matrix of numerical features.
  3. `feature_distributions.png`: Multi-panel histograms of high-variance features.
  4. `missing_values.png`: Matrix plot displaying missingness patterns.
  5. `outliers_boxplot.png`: Box-and-whisker plots identifying Tukey interquartile range (IQR) anomalies.

### 6. AutoML Model Competition
* **File:** [`backend-ml/src/train.py`](file:///c:/Users/ROHAN%20BHANGALE/programming/projects/Automodel/autoModel/backend-ml/src/train.py)
* Simultaneously initializes, trains, and evaluates 5 competing architectures:
  * **Classification**: Logistic Regression, Random Forest Classifier, Gradient Boosting Classifier, XGBoost, LightGBM.
  * **Regression**: Linear Regression, Ridge, Random Forest Regressor, Gradient Boosting Regressor, Decision Tree.
  * **Clustering**: K-Means, Mini-Batch K-Means, Gaussian Mixture Models (evaluated via Silhouette Score).
* Constructs an exhaustive **Leaderboard** ranking models by accuracy, precision, recall, F1-score, or R²/RMSE.

### 7. Hyperparameter Optimization with Optuna
* **File:** [`backend-ml/src/automl/optimizer.py`](file:///c:/Users/ROHAN%20BHANGALE/programming/projects/Automodel/autoModel/backend-ml/src/automl/optimizer.py)
* Automatically wraps the champion model from the competition in an **Optuna study**.
* Employs the **Tree-structured Parzen Estimator (TPE)** algorithm across 10 Bayesian trials with 3-fold Stratified Cross-Validation:
  * Tunes `n_estimators`, `max_depth`, `learning_rate`, `subsample`, `reg_alpha`, and `reg_lambda`.
  * Logs optimization history and displays score improvement over baseline defaults.

### 8. Model Explainability & Feature Importance
* **File:** [`backend-ml/src/explainability.py`](file:///c:/Users/ROHAN%20BHANGALE/programming/projects/Automodel/autoModel/backend-ml/src/explainability.py)
* Extracts tree-based Gini importances or regression absolute coefficients.
* Normalizes scores into percentages and delivers a clean JSON payload mapping the top 10 most influential features driving predictions.

### 9. AI Insights Generation
* **Endpoint:** `POST /generate-insights` in [`backend-ml/ml_services/app.py`](file:///c:/Users/ROHAN%20BHANGALE/programming/projects/Automodel/autoModel/backend-ml/ml_services/app.py)
* Synthesizes the profiler report, leaderboard rankings, Optuna tuning delta, and feature importance into natural-language business takeaways using **Gemini 1.5 Flash** (with rule-based fallbacks).

### 10. Auto-Healer (Self-Repairing Pipeline)
* **File:** [`backend-ml/src/auto_healer.py`](file:///c:/Users/ROHAN%20BHANGALE/programming/projects/Automodel/autoModel/backend-ml/src/auto_healer.py)
* If an unexpected data artifact causes training to fail:
  1. Captures the full Python traceback.
  2. Sends the schema, sample data, and traceback to the LLM cascade.
  3. The LLM generates a custom `clean_df(df)` function.
  4. Executes the fix in a restricted sandbox (`exec()` with safe builtins).
  5. Retries training automatically and logs the incident in MongoDB `SystemMessages`.

### 11. In-App Sandbox Execution & Self-Healing Code Generator
* **File:** [`backend-ml/src/code_verifier.py`](file:///c:/Users/ROHAN%20BHANGALE/programming/projects/Automodel/autoModel/backend-ml/src/code_verifier.py)
* **Problem Solved**: Generative AI models frequently generate code with slight syntax errors, incompatible column shapes, or missing imports that crash when users run them locally.
* **How It Works**:
  1. **Open-Source LLM Generation**: Uses **Groq (`llama-3.3-70b-versatile`)** or local **Ollama** (`qwen2.5-coder:7b`) to draft complete Python scikit-learn code without eating paid Gemini tokens.
  2. **Isolated Test Sandbox**: Creates a temporary directory, writes a 30-row slice of the actual dataset, and executes the generated script using `subprocess.run(..., timeout=15)`.
  3. **Verification**: Checks if all imports resolve, data loads, `ColumnTransformer` executes, model fits, and metrics print without errors.
  4. **Self-Healing Loop**: If `returncode != 0`, captures `stderr`, feeds the traceback back to Groq/Ollama (*"Fix this specific error: {stderr}"*), and re-tests up to 2 times.
  5. **Guaranteed Fallback**: If the LLM repeatedly fails, injects a pre-tested, bulletproof scikit-learn script with `SimpleImputer` and `StandardScaler` that works on any tabular dataset.

### 12. Google Colab Integration & .ipynb Notebook Export
* **File:** [`frontend/src/pages/Results.tsx`](file:///c:/Users/ROHAN%20BHANGALE/programming/projects/Automodel/autoModel/frontend/src/pages/Results.tsx)
* Provides a **1-Click "Download .ipynb (Colab)"** button.
* Automatically bundles the verified Python code into a valid Jupyter Notebook JSON schema (v4.2) containing:
  * Markdown header with dataset, model, and target metadata.
  * Dependency installation cell (`!pip install -q pandas numpy scikit-learn xgboost`).
  * Colab file upload helper snippet (`files.upload()`).
  * Clean, verified training & evaluation code cells ready to run immediately in Google Colab.

### 13. RAG Chatbot with ChromaDB Memory
* **Files:** `backend-ml/rag/`
* Context-aware conversational AI backed by **ChromaDB**:
  * Vectorizes dataset profile summaries and model performance using `sentence-transformers/all-MiniLM-L6-v2`.
  * Answers specific user questions: *"Why did Random Forest beat Logistic Regression?"*, *"Which feature should I drop?"*, *"What was my model's accuracy?"*.
  * Features a **Zero-API Offline Engine** fallback that parses questions and replies factually even if all cloud LLMs are disconnected.

### 14. Visualization Gallery & Chart Insights
* **Files:** `backend/controller/visualizationController.js`, `frontend/src/pages/Visualizations.tsx`
* Presents all generated EDA plots in a responsive dashboard with individual AI insight interpretation modals for each plot.

### 15. Authentication & Razorpay Payments
* **Authentication**: JWT-based stateless authentication with password hashing using `bcryptjs` (10 rounds). Protected routes across both Express and FastAPI enforce Bearer token validation.
* **Payments**: Integrated with **Razorpay SDK** for subscription upgrades, featuring cryptographic HMAC-SHA256 signature verification.

### 16. System Audit Log & Message History
* **File:** `backend/models/SystemMessage.js`, `frontend/src/pages/SystemMessages.tsx`
* Transparent audit trail showing every automated healing event, prompt trace, error recovery action, and pipeline notification.

---

## Machine Learning Algorithms & Libraries

| Algorithm | Category | Library | Primary Use Case |
|---|---|---|---|
| **Logistic Regression** | Linear Model | `scikit-learn` | Fast linear classification baseline |
| **Linear Regression / Ridge** | Linear Model | `scikit-learn` | Interpretable regression baseline |
| **Random Forest Classifier / Regressor** | Ensemble Bagging | `scikit-learn` | Non-linear relationships, robust to outliers |
| **Gradient Boosting Classifier / Regressor** | Ensemble Boosting | `scikit-learn` | High-accuracy sequential residual reduction |
| **XGBoost (XGBClassifier / XGBRegressor)** | Extreme Boosting | `xgboost` | Regularized tree boosting for tabular data |
| **LightGBM (LGBMClassifier / LGBMRegressor)** | Leaf-wise Boosting | `lightgbm` | Extremely fast boosting for large datasets |
| **Decision Trees** | Tree Model | `scikit-learn` | Transparent decision rule benchmarks |
| **Support Vector Machines (SVC / SVR)** | Kernel Methods | `scikit-learn` | Non-linear decision boundaries |
| **K-Nearest Neighbors (KNN)** | Instance-based | `scikit-learn` | Distance-based classification & regression |
| **K-Means / Mini-Batch K-Means** | Clustering | `scikit-learn` | Unsupervised centroid-based partitioning |
| **Gaussian Mixture Models (GMM)** | Probabilistic | `scikit-learn` | Soft clustering with probabilistic densities |
| **StandardScaler & OneHotEncoder** | Preprocessing | `scikit-learn` | Z-score scaling and categorical transformation |
| **SimpleImputer** | Preprocessing | `scikit-learn` | Median/mode replacement of missing values |
| **Optuna (TPESampler)** | Optimization | `optuna` | Bayesian hyperparameter search |
| **all-MiniLM-L6-v2** | Deep Learning | `sentence-transformers` | 384-dimensional vector embeddings for RAG |

---

## LLM Multi-Tier Cascade & Token Preservation Strategy

AutoModel implements a multi-tier fallback cascade to ensure **zero downtime** and **minimal token costs**:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              TIER 1: FREE OPEN-SOURCE                                  │
│  • Groq LPU: Meta Llama 3.3 70B Versatile & Llama 3.1 8B Instant (Free tier, fast)     │
│  • Local Ollama: qwen2.5-coder:7b / gemma2:9b (100% Offline, 0 tokens, free)           │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │ Rate-limit (429) or Network Failure
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              TIER 2: EMERGENCY CLOUD AI                                │
│  • Google Gemini 1.5 Flash (Dual-key failover)                                         │
│  • HuggingFace Inference API (Mistral 7B)                                              │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │ Quota Exhausted or Disconnected
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              TIER 3: ZERO-AI DETERMINISTIC                             │
│  • Pre-tested Scikit-Learn Pipelines (SimpleImputer + ColumnTransformer)               │
│  • Offline RAG Rule Engine (Pattern-matched factual lookup)                            │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### LLM Task Routing

| Use Case | Tier 1 (Free / Local) | Tier 2 (Cloud Fallback) | Tier 3 (Zero-AI Fallback) |
|---|---|---|---|
| **Code Generation & Self-Healing** | **Groq (Llama 3.3 70B)** / **Ollama** | Gemini 1.5 Flash | Bulletproof Deterministic Template |
| **Auto-Healer Dataset Repair** | **Ollama (Gemma 2)** / **Groq (Llama 3.1)** | HuggingFace (Mistral 7B) | Rule-based imputer |
| **AI Insights Generation** | Gemini 1.5 Flash | Groq (Llama 3.3 70B) | Dynamic Rule Engine |
| **RAG Chatbot** | Gemini 1.5 Flash | Groq (Llama 3.1 8B) | Offline RAG Engine (Zero API) |
| **Target Column Detection** | Groq (Llama 3.1 8B) | Gemini 1.5 Flash | Statistical Heuristic Scorer |

---

## Core Functions & Technical Working

### ML Backend Functions (`backend-ml/src/`)

#### 1. `src/code_verifier.py`
* **`generate_and_verify_model_code(...)`**:
  * Orchestrates the code generation, sandbox execution, and self-healing loop.
  * Takes dataset metadata (`dataset_name`, `target_column`, `problem_type`, `best_model`, `accuracy`, and optional `sample_df`).
  * Calls `call_open_source_llm` to draft the initial script.
  * Runs the script through `test_run_code`. If execution fails, initiates a self-healing retry loop (up to 2 iterations) feeding error tracebacks back to Groq/Ollama.
* **`test_run_code(code, sample_df, dataset_name, timeout_sec=15)`**:
  * Writes a sample CSV and Python script into an isolated `tempfile.TemporaryDirectory()`.
  * Runs `subprocess.run([sys.executable, "train_model.py"], timeout=15, capture_output=True)`.
  * Returns `(True, stdout)` on success, or `(False, stderr)` on error/timeout.
* **`call_open_source_llm(prompt)`**:
  * Checks for local Ollama (`USE_OLLAMA=true`).
  * Posts to Groq OpenAI-compatible completions API using `llama-3.3-70b-versatile` or `llama-3.1-8b-instant`.
  * Falls back to Gemini REST if Groq is unavailable.
* **`generate_bulletproof_deterministic_code(...)`**:
  * Generates an error-proof, production-grade scikit-learn script configured with `ColumnTransformer`, `SimpleImputer(strategy='median')`, `SimpleImputer(strategy='most_frequent')`, `OneHotEncoder(handle_unknown='ignore')`, and the exact model architecture.

#### 2. `src/profiler.py`
* **`DatasetProfiler.__init__(df, target_column, problem_type)`**:
  * Initializes dataset state, separates features and target, and records base dimensions.
* **`DatasetProfiler.profile()`**:
  * Evaluates missing rates, duplicate counts, memory usage, high-cardinality features, class imbalance ratios, and data leakage flags. Returns a structured JSON quality audit report.

#### 3. `src/data_cleaning.py`
* **`basic_cleaning(df)`**:
  * Strips leading/trailing whitespace from string columns.
  * Normalizes column names into lowercase alphanumeric strings with underscores.
  * Parses currency and formatted percentage numbers into numeric floats.
  * Drops fully empty rows and duplicate rows.

#### 4. `src/score_columns.py`
* **`score_columns(df)`**:
  * Scores every column as a candidate target using keyword matching, position heuristics, unique ratio analysis, and entropy.
* **`detect_problem_type(y_series)`**:
  * Determines whether the target column represents `classification` (discrete/low unique values) or `regression` (continuous numeric).

#### 5. `src/train.py`
* **`prepare_data(df, target_column, max_rows=10000)`**:
  * Subsamples datasets exceeding `max_rows` to prevent server latency.
  * Isolates target column `y` and feature matrix `X`.
  * Drops constant columns and high-cardinality ID/index columns.
  * Encodes categorical columns and handles remaining NaNs.
* **`train_models(X_train, X_test, y_train, y_test, problem_type)`**:
  * Runs the 5 competing algorithms through training and evaluation loops.
  * Calculates accuracy, precision, recall, F1-score, or R²/RMSE.
  * Automatically invokes `run_optuna_hpo` on the highest-scoring model.

#### 6. `src/auto_healer.py`
* **`auto_heal_dataset(df, error_traceback)`**:
  * Prompts the LLM cascade with the traceback and sample rows to synthesize a `clean_df(df)` function.
  * Executes the fix in a sandbox using `exec()` with restricted builtins (`pd`, `np` only).

---

### RAG & Vector Memory Functions (`backend-ml/rag/`)

* **`rag_chat.py → ask_ai(question, user_id)`**:
  * Queries ChromaDB for top-5 relevant documents filtered by `user_id`.
  * Uses keyword intent checks for rapid lookup (e.g., column names, accuracy).
  * Prompts the LLM cascade with retrieved context.
* **`store_training_memory.py → store_training_memory(user_id, dataset_name, ...)`**:
  * Assembles dataset metrics, leaderboard rankings, and Optuna parameters into semantic text chunks.
  * Generates 384-dimensional embeddings via `all-MiniLM-L6-v2` and persists them into ChromaDB.
* **`offline_engine.py → generate_offline_response(question, context)`**:
  * Zero-API fallback that uses regular expressions and text parsing to answer questions directly from context when cloud APIs are offline.

---

### Node.js Backend Controllers & Services (`backend/`)

* **`services/codeGenerator.js → generateModelCode(data, authToken)`**:
  * **Tier 1:** Proxies to `backend-ml` `/generate-verified-code` endpoint with user JWT.
  * **Tier 2:** Calls Groq directly using `process.env.GROQ_API_KEY` (`llama-3.3-70b-versatile`).
  * **Tier 3:** Calls Gemini REST API (`gemini-1.5-flash`).
  * **Tier 4:** Employs `generateDeterministicPythonCode` (safe deterministic template).
* **`controller/confirmController.js → confirmTarget(req, res)`**:
  * Receives target confirmation, proxies request to Python backend `/confirm-target` with a 120-second timeout.
  * Automatically handles auto-heal audit logging and records `ModelRun` in MongoDB.
* **`controller/uploadController.js → uploadDataset(req, res)`**:
  * Streams CSV file to MongoDB GridFS.
  * Forwards dataset to Python `/analyze` endpoint to trigger profiling, EDA generation, and target detection.

---

### Frontend Hooks & Page Handlers (`frontend/src/`)

* **`pages/Results.tsx → handleGenerateCode()`**:
  * Dispatches `POST /models/generate-code` passing `datasetName`, `targetColumn`, `problemType`, `bestModel`, `accuracy`, and `datasetId`.
  * Displays the "Sandbox Verified" status badge upon completion.
* **`pages/Results.tsx → handleDownloadNotebook()`**:
  * Converts the verified Python script into a standard Jupyter Notebook (`.ipynb`) and triggers a browser download.

---

## Complete API Reference

### Node.js Gateway Endpoints (Port 5000)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | None | Register new user account |
| `POST` | `/api/auth/login` | None | Authenticate user & return signed JWT |
| `POST` | `/api/upload` | Bearer JWT | Stream CSV to GridFS & trigger dataset analysis |
| `POST` | `/api/upload/confirm-target` | Bearer JWT | Confirm target column & initiate model training |
| `POST` | `/api/models/generate-code` | Bearer JWT | Generate and verify Python inference code |
| `GET` | `/api/models/my-models` | Bearer JWT | Retrieve all historical ModelRuns for logged-in user |
| `GET` | `/api/dataset/:id/download` | Bearer JWT | Stream CSV file from MongoDB GridFS |
| `POST` | `/api/chat` | Bearer JWT | Send question to context-aware RAG chatbot |
| `GET` | `/api/messages` | Bearer JWT | Retrieve auto-healer audit logs & system messages |
| `POST` | `/api/payment/create-order` | Bearer JWT | Create Razorpay order ID |
| `POST` | `/api/payment/verify` | Bearer JWT | Verify Razorpay payment signature & upgrade user |
| `GET` | `/api/visualizations/plot/:filename` | None | Serve generated EDA image files |

---

### Python ML Engine Endpoints (Port 8000)

| Method | Endpoint | Auth | Request Body / Params | Description |
|---|---|---|---|---|
| `POST` | `/analyze` | Bearer JWT | `file` (UploadFile) | Cleans data, profiles quality, generates 5 EDA charts, detects target |
| `POST` | `/confirm-target` | Bearer JWT | `{ dataset_id, target_column, dataset_name }` | Runs 5-model competition, Optuna HPO, explainability & vector storage |
| `POST` | `/generate-verified-code`| Optional JWT| `{ dataset_name, target_column, problem_type, best_model, accuracy, dataset_id }` | Generates Python code, executes in subprocess sandbox, auto-heals tracebacks |
| `POST` | `/generate-insights` | Bearer JWT | `{ report, leaderboard, best_model, top_features }` | Generates AI summary & recommendations via Gemini |
| `POST` | `/chat` | Bearer JWT | `{ question }` | Vector search in ChromaDB + RAG response |
| `GET` | `/sample-data` | Bearer JWT | `dataset_id` (query param) | Returns first 10 rows for auto-healer analysis |
| `GET` | `/outputs/:filename` | None | None | Serves static EDA chart image plots |

---

## Database Schemas & Data Models

### `users` Collection
```json
{
  "_id": "ObjectId",
  "name": "Rohan Bhangale",
  "email": "rohan@example.com",
  "password": "$2a$10$hashed_password_string...",
  "isSubscribed": false,
  "createdAt": "2026-10-29T00:00:00.000Z",
  "updatedAt": "2026-10-29T00:00:00.000Z"
}
```

### `modelruns` Collection
```json
{
  "_id": "ObjectId",
  "userId": "ObjectId (ref: User)",
  "datasetName": "heart_disease.csv",
  "targetColumn": "target",
  "problemType": "classification",
  "bestModel": "Random Forest",
  "accuracy": 0.945,
  "rows": 1025,
  "columns": 14,
  "topFeatures": [
    { "feature": "cp", "importance": 0.284 },
    { "feature": "thalach", "importance": 0.192 }
  ],
  "explainReport": { "status": "success", "feature_importance": { ... } },
  "leaderboard": [
    { "model": "Random Forest", "score": 0.945, "metrics": { "f1": 0.944 } },
    { "model": "XGBoost", "score": 0.938, "metrics": { "f1": 0.936 } }
  ],
  "profileReport": { "null_percentage": 0.0, "duplicate_rows": 0, "risks": [] },
  "optunaResults": { "best_score": 0.952, "best_params": { "n_estimators": 140 } },
  "insights": "### Model Assessment\nRandom Forest achieved 94.5% accuracy...",
  "createdAt": "2026-10-29T00:00:00.000Z"
}
```

### `systemmessages` Collection (Audit Trail)
```json
{
  "_id": "ObjectId",
  "userId": "ObjectId (ref: User)",
  "datasetName": "student_scores.csv",
  "datasetId": "66a7b...",
  "type": "success",
  "title": "Healing Successful!",
  "content": "Handled missing categorical values using LLM auto-healer.",
  "llmCode": "def clean_df(df):\n    df['grade'].fillna(df['grade'].median(), inplace=True)\n    return df",
  "traceback": "ValueError: Input contains NaN...",
  "createdAt": "2026-10-29T00:00:00.000Z"
}
```

---

## Tech Stack

| Layer | Technologies & Tools |
|---|---|
| **Frontend** | React 18.3, TypeScript 5.8, Vite 5.4, TailwindCSS 3.4, Shadcn/UI, Lucide React, Framer Motion, Three.js, Recharts, Axios, React Router v6 |
| **API Gateway** | Node.js 20, Express 5, Mongoose, Multer, MongoDB GridFS, JWT, bcryptjs, Razorpay SDK, Axios |
| **ML Engine** | Python 3.11, FastAPI, Uvicorn, Pandas, NumPy, Scikit-Learn, XGBoost, LightGBM, Optuna, Joblib, Matplotlib, Seaborn |
| **RAG & Vectors**| ChromaDB, Sentence-Transformers (`all-MiniLM-L6-v2`), LangChain-style retrieval |
| **LLM Providers**| Groq API (`llama-3.3-70b-versatile`, `llama-3.1-8b-instant`), Google Gemini 1.5 Flash, Ollama, HuggingFace Inference API |
| **Database** | MongoDB Atlas (M0 Free Tier / Production Cluster) |
| **Deployment** | Vercel (Frontend SPA), Render (Node.js Gateway), HuggingFace Spaces / Docker (ML Backend) |

---

## Repository Structure

```
Automodel/
├── autoModel/
│   ├── backend/                           # Node.js API Gateway (Express 5)
│   │   ├── config/
│   │   │   ├── db.js                      # MongoDB Atlas connection
│   │   │   └── urls.js                    # ML backend URL resolver
│   │   ├── controller/
│   │   │   ├── authController.js          # Authentication (register, login)
│   │   │   ├── uploadController.js        # CSV upload → GridFS → ML analyze
│   │   │   ├── confirmController.js       # Target confirmation & training pipeline
│   │   │   ├── modelController.js         # Model run retrieval
│   │   │   ├── datasetController.js       # GridFS file streaming
│   │   │   ├── chatController.js          # RAG chat proxy
│   │   │   ├── visualizationController.js # Plot proxy & chart insights
│   │   │   ├── messageController.js       # System audit logs
│   │   │   └── paymentController.js       # Razorpay orders & verification
│   │   ├── middleware/
│   │   │   └── authMiddleware.js          # JWT bearer token verification
│   │   ├── models/
│   │   │   ├── User.js                    # User schema
│   │   │   ├── ModelRun.js                # Training run schema
│   │   │   └── SystemMessage.js           # Auto-heal audit log schema
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── uploadRoutes.js
│   │   │   ├── modelRoutes.js
│   │   │   ├── chatRoutes.js
│   │   │   ├── datasetRoutes.js
│   │   │   ├── messageRoutes.js
│   │   │   └── paymentRoutes.js
│   │   ├── services/
│   │   │   ├── codeGenerator.js           # Multi-tier code generator with Groq/Gemini
│   │   │   └── geminiServices.js          # Gemini service for insights
│   │   └── server.js                      # Express server entry point
│   │
│   ├── backend-ml/                        # Python ML Backend (FastAPI)
│   │   ├── ml_services/
│   │   │   └── app.py                     # FastAPI application & API routes
│   │   ├── src/
│   │   │   ├── code_verifier.py           # In-app sandbox executor & self-healing generator
│   │   │   ├── profiler.py                # DatasetProfiler engine
│   │   │   ├── data_cleaning.py           # Automated cleaner & type caster
│   │   │   ├── score_columns.py           # AI + heuristic target detection
│   │   │   ├── eda.py                     # 5 EDA visualization generators
│   │   │   ├── train.py                   # 5-model competition & preprocessing
│   │   │   ├── auto_healer.py             # LLM error recovery engine
│   │   │   ├── explainability.py          # ModelExplainer feature importance
│   │   │   └── automl/
│   │   │       ├── models.py              # Scikit-learn, XGBoost, LightGBM models
│   │   │       └── optimizer.py           # Optuna Bayesian HPO wrapper
│   │   ├── rag/
│   │   │   ├── rag_chat.py                # RAG retrieval & LLM pipeline
│   │   │   ├── store_training_memory.py   # Vectorizes training runs into ChromaDB
│   │   │   ├── offline_engine.py          # Zero-API offline factual engine
│   │   │   └── embedder.py                # sentence-transformers wrapper
│   │   ├── auth/
│   │   │   └── jwt_handler.py             # FastAPI JWT validation dependency
│   │   ├── data/                          # Sample datasets
│   │   ├── outputs/                       # Generated plots (.png) & best_model.pkl
│   │   ├── requirements.txt               # Python package dependencies
│   │   └── Dockerfile                     # Container deployment specification
│   │
│   ├── frontend/                          # Client Web Application (React 18 + Vite)
│   │   ├── src/
│   │   │   ├── pages/
│   │   │   │   ├── Upload.tsx             # Drag-and-drop CSV upload & profiler display
│   │   │   │   ├── Dashboard.tsx          # Main dashboard & active runs
│   │   │   │   ├── Results.tsx            # Model leaderboard, code viewer & Colab export
│   │   │   │   ├── Visualizations.tsx     # EDA chart gallery & modal viewer
│   │   │   │   ├── Insights.tsx           # AI insights display
│   │   │   │   ├── Chatbot.tsx            # Context-aware RAG chat interface
│   │   │   │   ├── SystemMessages.tsx     # Self-healing audit logs
│   │   │   │   ├── Pricing.tsx            # Razorpay subscription upgrade
│   │   │   │   └── Auth.tsx               # Login & Registration forms
│   │   │   ├── components/
│   │   │   │   ├── DashboardLayout.tsx    # Sidebar & navigation frame
│   │   │   │   ├── Hero3DModel.tsx        # Interactive Three.js 3D visualizer
│   │   │   │   └── ui/                    # Shadcn/UI component primitives
│   │   │   └── api/
│   │   │       └── axios.ts               # Axios client with JWT interceptor
│   │   ├── tailwind.config.ts             # Tailwind CSS theme
│   │   └── vite.config.ts                 # Vite bundler configuration
│   └── README.md                          # Comprehensive project documentation
```

---

## Local Development Setup

### Prerequisites
* **Node.js**: v18.0.0 or higher
* **Python**: v3.10 or v3.11
* **MongoDB**: Local MongoDB instance or free MongoDB Atlas cluster connection string
* **Git**: Installed and configured

### 1. Clone & Navigate
```bash
git clone https://github.com/rohanb1022/autoModel.git
cd autoModel
```

### 2. Python ML Backend Setup
```bash
cd backend-ml
python -m venv venv

# Activate Virtual Environment:
# On Windows PowerShell:
.\venv\Scripts\Activate.ps1
# On macOS / Linux:
source venv/bin/activate

# Install dependencies:
pip install -r requirements.txt

# Configure Environment Variables:
cp .env.example .env
# Open .env and add your GROQ_API_KEY, JWT_SECRET, etc.

# Start FastAPI server using python module syntax:
python -m uvicorn ml_services.app:app --reload --port 8000
# ML Backend will run on http://localhost:8000
```
> **Note for Windows Users**: If running `uvicorn` directly causes an `Application Control policy has blocked this file` error, always execute via Python module syntax: `python -m uvicorn ml_services.app:app --reload --port 8000`.

### 3. Node.js Backend Gateway Setup
```bash
cd ../backend
npm install

# Configure Environment Variables:
cp .env.example .env
# Ensure MONGO_URI and JWT_SECRET are defined (must match backend-ml JWT_SECRET)

# Start development server:
npm run dev
# Node Backend will run on http://localhost:5000
```

### 4. Frontend Application Setup
```bash
cd ../frontend
npm install

# Start Vite development server:
npm run dev
# Frontend will run on http://localhost:5173 (or http://localhost:8080)
```

---

## Deployment Guide

### Frontend Deployment (Vercel)
1. Push your repository to GitHub.
2. Link repository in [Vercel](https://vercel.com).
3. Set **Root Directory** to `frontend`.
4. Build command: `npm run build` | Output directory: `dist`.
5. Deploy. SPA client-side routing is handled via `frontend/vercel.json`.

### Node.js Backend Deployment (Render)
1. In [Render](https://render.com), create a new **Web Service**.
2. Set **Root Directory** to `backend`.
3. Build command: `npm install` | Start command: `node server.js`.
4. Configure environment variables (`MONGO_URI`, `JWT_SECRET`, `ML_BACKEND_URL`, etc.).

### Python ML Backend Deployment (HuggingFace Spaces)
1. Create a new Space at [HuggingFace Spaces](https://huggingface.co/spaces).
2. Select **Docker** SDK.
3. Configure repository secrets: `GROQ_API_KEY`, `JWT_SECRET`, `NODE_BACKEND_URL`.
4. Connect repository with root set to `backend-ml`.

---

## Environment Variables

### Node.js Gateway (`backend/.env`)
| Variable | Required | Description |
|---|---|---|
| `MONGO_URI` | ✅ Yes | MongoDB Atlas connection string |
| `JWT_SECRET` | ✅ Yes | Secret key used to sign and verify JSON Web Tokens |
| `ML_BACKEND_URL` | ❌ No | URL of Python ML service (default: `http://localhost:8000`) |
| `GROQ_API_KEY` | ❌ No | Groq API key for open-source Llama 3.3 fallback code generation |
| `GEMINI_API_KEY` | ❌ No | Primary Google Gemini API key |
| `GEMINI_API_KEY_2` | ❌ No | Secondary failover Gemini API key |
| `RAZORPAY_KEY_ID` | ❌ No | Razorpay test/production key ID |
| `RAZORPAY_KEY_SECRET` | ❌ No | Razorpay secret key |
| `PORT` | ❌ No | Server port (default: `5000`) |
| `NODE_ENV` | ❌ No | `development` or `production` |

### Python ML Engine (`backend-ml/.env`)
| Variable | Required | Description |
|---|---|---|
| `JWT_SECRET` | ✅ Yes | Must match the Node.js backend's `JWT_SECRET` |
| `GROQ_API_KEY` | ✅ Yes | Primary free cloud LLM (Groq LPU running Llama 3.3 70B & Llama 3.1 8B) |
| `GEMINI_API_KEY` | ❌ No | Gemini API key for insights generation |
| `GEMINI_API_KEY_2` | ❌ No | Secondary Gemini API key for image analysis |
| `HF_API_TOKEN` | ❌ No | HuggingFace Inference API token fallback |
| `USE_OLLAMA` | ❌ No | `true` for 100% offline local LLMs, `false` for cloud APIs (default: `false`) |
| `NODE_BACKEND_URL` | ❌ No | Node.js backend endpoint for GridFS downloads (default: `http://localhost:5000`) |
| `PORT` | ❌ No | FastAPI port (default: `8000`) |

---

## Security & Production Hardening

* **Isolated Subprocess Sandboxing**: In-app generated code is tested with strict timeouts (15s) in ephemeral temporary directories, preventing runaway execution loops.
* **Authentication Integrity**: Password hashing via `bcryptjs` with 10 salt rounds. Shared cryptographic secrets between Node and Python backends validate identity on every protected route.
* **Payment Tamper Resistance**: All Razorpay transactions verify HMAC-SHA256 signatures server-side. User identity is derived strictly from the verified JWT payload, preventing Insecure Direct Object References (IDOR).
* **GridFS Stream Security**: Uploaded datasets are verified for MIME integrity and stored directly in MongoDB GridFS, preventing unauthorized filesystem read/writes on host servers.
* **Strict CORS Governance**: Configured origin allowlists prevent unauthorized cross-origin requests in production.

---

<p align="center">
  <sub>AutoModel — Built for end-to-end automated machine learning, self-healing pipeline reliability, and interview-ready architectural excellence.</sub>
</p>

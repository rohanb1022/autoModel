---
title: AutoModel ML Backend
emoji: 🤖
colorFrom: indigo
colorTo: purple
sdk: docker
pinned: false
license: mit
app_port: 7860
---

# AutoModel ML Backend

FastAPI-powered ML pipeline backend and execution sandbox for the AutoModel platform.

## Features

- 📊 **Automated Dataset Analysis & EDA**: Statistical profiling, data quality auditing, and 5 automated visualization plots.
- 🤖 **Multi-Model Benchmark Competition**: Simultaneously trains and evaluates scikit-learn, XGBoost, and LightGBM models.
- 🎯 **Optuna Hyperparameter Optimization**: Bayesian HPO with 3-fold cross-validation.
- 🧪 **In-App Sandbox Execution**: Isolated test execution of generated Python code against sample datasets.
- 🔄 **Self-Healing Code Generator**: Auto-detects runtime execution errors and re-prompts open-source LLMs to fix tracebacks.
- 🧠 **AI Insights**: Natural-language business summaries and dataset diagnostics.
- 💬 **RAG Chatbot**: Vector memory in ChromaDB with `sentence-transformers` embeddings and zero-API offline fallback.
- 🔧 **Auto-Healer**: LLM-driven dataset repair for unexpected training pipeline crashes.

## LLM Architecture & Cascade

| Route | Provider Cascade | Model(s) | Notes |
|---|---|---|---|
| **Code Generation & Verification** | **Groq** → **Ollama** → Gemini Flash → Static | `llama-3.3-70b-versatile` / `llama-3.1-8b-instant` / `qwen2.5-coder:7b` | Open-source, 100% free tier, zero Gemini token burn |
| **Auto-Healer (Data Errors)** | **Ollama** → **Groq** → HuggingFace → Static | `gemma2:9b` / `llama-3.1-8b-instant` / `mistral-7b` | Sandbox `exec()` with safe builtins |
| **RAG Chatbot** | **Gemini Flash** → **Groq** → HuggingFace → Offline | `gemini-1.5-flash` / `llama-3.1-8b` / Offline Rule Engine | ChromaDB vector search + memory |
| **AI Insights** | **Gemini Flash** → **Groq** → Static | `gemini-1.5-flash` / `llama-3.3-70b` | Post-training assessment |
| **Target Detection** | **Groq** → **Ollama** → Heuristics | `llama-3.1-8b-instant` | Disambiguates complex columns |

## API Routes

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/analyze` | Cleans data, profiles quality, creates EDA plots, suggests target |
| `POST` | `/confirm-target` | Competes 5 ML models, runs Optuna HPO, calculates feature importance |
| `POST` | `/generate-verified-code` | Runs Python script in subprocess sandbox, auto-heals errors with Groq |
| `POST` | `/generate-insights` | Generates summary takeaways and model assessments |
| `POST` | `/chat` | Queries RAG vector memory with conversational response |
| `GET` | `/sample-data` | Returns first 10 rows for auto-healer and code generation |
| `GET` | `/outputs/:filename` | Serves static EDA plot image files |

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `JWT_SECRET` | ✅ Yes | Shared secret matching Node.js backend JWT secret |
| `GROQ_API_KEY` | ✅ Yes | Groq API key — powers open-source Llama 3.3 code generator & auto-healer |
| `GEMINI_API_KEY` | ❌ Optional | Google Gemini key for insights generation |
| `GEMINI_API_KEY_2` | ❌ Optional | Secondary Gemini key for visual image analysis |
| `HF_API_TOKEN` | ❌ Optional | HuggingFace token — fallback if Groq rate-limits |
| `USE_OLLAMA` | ❌ Optional | `true` for 100% offline local LLMs, `false` for cloud APIs |
| `NODE_BACKEND_URL` | ❌ Optional | Node.js backend URL (default: `http://localhost:5000`) |

## Local Development

```bash
cd backend-ml
python -m venv venv

# Windows:
.\venv\Scripts\Activate.ps1
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
# Edit .env with your GROQ_API_KEY and JWT_SECRET

# Run FastAPI server:
python -m uvicorn ml_services.app:app --reload --port 8000
```

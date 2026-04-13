# AutoModel — Deployment Guide

A full-stack AutoML platform with intelligent data analysis, automated training, and AI-powered insights.

## Architecture

```
┌────────────────────────────────────────────────────────┐
│  Frontend (React + Vite)   → Vercel                   │
│  Node Backend (Express)    → Render (Web Service)     │
│  ML Backend (FastAPI)      → HuggingFace Spaces       │
└────────────────────────────────────────────────────────┘
```

## 🚀 Deployment Steps

### 1. Frontend → Vercel

1. Push the repo to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import from GitHub
3. Set **Root Directory** to `frontend`
4. Set **Build Command**: `npm run build`
5. Set **Output Directory**: `dist`
6. No environment variables needed (URLs auto-detect via `src/config/urls.ts`)
7. Deploy!

> The `frontend/vercel.json` is already configured for SPA routing.

---

### 2. Node Backend → Render

1. Go to [render.com](https://render.com) → New → Web Service
2. Connect GitHub repo, set **Root Directory** to `backend`
3. Set **Build Command**: `npm install`
4. Set **Start Command**: `node server.js`
5. Add these **Environment Variables** in the Render dashboard:

| Variable | Value |
|---|---|
| `MONGO_URI` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | A strong random secret |
| `GEMINI_API_KEY` | Your Gemini API key |
| `GEMINI_API_KEY_2` | Your secondary Gemini key |
| `RAZORPAY_KEY_ID` | Razorpay key |
| `RAZORPAY_KEY_SECRET` | Razorpay secret |
| `FRONTEND_URL` | Your Vercel frontend URL (e.g. `https://automodel.vercel.app`) |
| `NODE_ENV` | `production` |

---

### 3. ML Backend → HuggingFace Spaces

> The `backend-ml/Dockerfile` is pre-configured for HuggingFace Spaces (port 7860).

1. Create a new Space at [huggingface.co/spaces](https://huggingface.co/spaces)
2. Choose **Docker** as the SDK
3. Set Space name to `automodel-ml` (or update URLs in the code)
4. Connect your GitHub repo and set **Root Directory** to `backend-ml`
5. Add these **Repository Secrets** in Space Settings:

| Variable | Value |
|---|---|
| `GEMINI_API_KEY_2` | Your Gemini API key |
| `HF_API_TOKEN` | Your HuggingFace API token |
| `JWT_SECRET` | Same secret as Node backend |
| `USE_OLLAMA` | `false` |

---

## ⚠️ Why Not Vercel/Render for the ML Backend?

The ML backend uses:
- **Ollama** (local GPU runtime) → Replaced with **Gemini 1.5 Flash API**
- **Gemma 2 / phi3** (large local models) → Replaced with **Gemini multimodal API**
- **sentence-transformers** (90MB model download) → Kept, but loaded lazily at startup

HuggingFace Spaces is ideal because:
- Free Docker container with persistent filesystem
- Designed for ML workloads
- Compatible with our existing `Dockerfile` (already uses port 7860)

---

## 🔧 Local Development

```bash
# Terminal 1: Frontend
cd frontend
npm install
npm run dev

# Terminal 2: Node Backend
cd backend
npm install
node server.js

# Terminal 3: ML Backend (with Ollama for local LLMs)
cd backend-ml
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
pip install ollama  # For local LLM support
cp .env.example .env
# Edit .env: set USE_OLLAMA=true for local, false for cloud APIs
uvicorn ml_services.app:app --reload --port 8000
```

## LLM Architecture

| Use Case | Local (USE_OLLAMA=true) | Cloud — Primary | Cloud — Fallback |
|---|---|---|---|
| RAG Chatbot | phi3:mini via Ollama | **Groq: gemma2-9b-it** (open-source) | HuggingFace Phi-3-mini |
| AI Insights | phi3:mini via Ollama | **Groq: gemma2-9b-it** (open-source) | HuggingFace Phi-3-mini |
| Viz Analysis (image) | gemma2:2b via Ollama | **Gemini 1.5 Flash** (only multimodal option) | Static message |
| Auto-healer | Gemini API (always) | **Gemini API** (always) | — |
| Embeddings | sentence-transformers | sentence-transformers | — |

> **Why Groq?** Free tier gives 30 RPM + **15,000 Tokens Per Minute** for `gemma2-9b-it` — 2× Gemini's limit.
> If Groq hits a 429, the cascade silently switches to HuggingFace. Users never see an error.


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

FastAPI-powered ML pipeline backend for the AutoModel platform.

## Features

- 📊 Automated dataset analysis & EDA
- 🤖 Multi-model training (scikit-learn)
- 🧠 Gemini-powered AI insights
- 🖼️ Gemini multimodal visualization analysis
- 💬 RAG chatbot with ChromaDB memory
- 🔧 Gemini auto-healer for data errors

## LLM Architecture (Cloud Mode)

| Route | Provider | Model | Notes |
|---|---|---|---|
| RAG Chatbot | **Groq** → HuggingFace → Static | `gemma2-9b-it` | Open-source, 15k TPM free |
| AI Insights | **Groq** → HuggingFace → Static | `gemma2-9b-it` | Same cascade |
| Viz Analysis | **Gemini Flash** | `gemini-1.5-flash` | Only option for image input |
| Auto-Healer | **Gemini Flash** | `gemini-1.5-flash` | Error recovery only |

## Environment Variables

Set these in your HuggingFace Space Settings → Repository secrets:

| Variable | Required | Description |
|---|---|---|
| `GROQ_API_KEY` | ✅ Yes | Groq API key — primary LLM (RAG chat + insights) |
| `GEMINI_API_KEY_2` | ✅ Yes | Gemini key — vision route + auto-healer only |
| `HF_API_TOKEN` | ✅ Yes | HuggingFace token — fallback if Groq rate-limits |
| `JWT_SECRET` | ✅ Yes | Must match Node.js backend JWT secret |
| `USE_OLLAMA` | ❌ Always `false` | Never true on cloud |

## Local Development

```bash
cd backend-ml
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
pip install ollama  # Optional: only if you want local Ollama
cp .env.example .env
# Edit .env with your values
uvicorn ml_services.app:app --reload --port 8000
```

"""
RAG Chat Module -- Production-Ready LLM Cascade
================================================
Uses: Groq (free) -> HuggingFace (free) -> Ollama (local) -> Offline Engine (guaranteed)

All providers are FREE. No payment required for any tier.
The final fallback (Offline Engine) makes ZERO API calls and can NEVER fail.
"""

import os
import requests
from dotenv import load_dotenv

from rag.embedder import get_embedding
from rag.vectordb import collection
from rag.offline_engine import generate_offline_response, _classify_intent, _parse_training_context

load_dotenv()


import random

# ---------------------------------------------------------------------------
# LLM Cascade -- all free providers, multi-key rotation to prevent 429 errors
# ---------------------------------------------------------------------------

def _call_gemini(system_prompt: str, user_prompt: str) -> str:
    """
    Primary: Gemini 2.0 Flash / 1.5 Flash via REST API.
    Supports multi-key rotation (GEMINI_API_KEY, GEMINI_API_KEY_2, GEMINI_API_KEY_3, etc.)
    to handle 20+ concurrent users on 100% free tier without 429 rate limit errors.
    """
    api_keys = [
        os.getenv(k) for k in [
            "GEMINI_API_KEY", "GEMINI_API_KEY_2", "GEMINI_API_KEY_3", "GEMINI_API_KEY_4", "GEMINI_API_KEY_5"
        ] if os.getenv(k)
    ]
    if not api_keys:
        raise RuntimeError("GEMINI_API_KEY not set")

    # Rotate keys randomly per request to distribute traffic across 20+ users
    random.shuffle(api_keys)

    models = ["gemini-2.0-flash", "gemini-1.5-flash"]
    last_err = None

    for api_key in api_keys:
        for model_name in models:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key}"
            headers = {"Content-Type": "application/json"}
            payload = {
                "contents": [
                    {
                        "parts": [
                            {"text": f"{system_prompt}\n\n{user_prompt}"}
                        ]
                    }
                ],
                "generationConfig": {
                    "temperature": 0.3,
                    "maxOutputTokens": 1024
                }
            }
            try:
                resp = requests.post(url, headers=headers, json=payload, timeout=15)
                if resp.status_code == 200:
                    res_json = resp.json()
                    return res_json["candidates"][0]["content"]["parts"][0]["text"].strip()
                elif resp.status_code == 429:
                    print(f"[CHAT] Gemini 429 hit for key on model {model_name}. Retrying next key/model...")
                    last_err = f"HTTP 429 Rate Limit on {model_name}"
                else:
                    last_err = f"HTTP {resp.status_code}: {resp.text[:100]}"
            except Exception as e:
                last_err = str(e)

    raise RuntimeError(f"All Gemini keys/models failed. Last error: {last_err}")


def _call_groq(system_prompt: str, user_prompt: str) -> str:
    """
    Fallback 1: Groq Cloud -- 30 req/min free tier.
    Supports key rotation (GROQ_API_KEY, GROQ_API_KEY_2, GROQ_API_KEY_3).
    """
    api_keys = [
        os.getenv(k) for k in ["GROQ_API_KEY", "GROQ_API_KEY_2", "GROQ_API_KEY_3"] if os.getenv(k)
    ]
    if not api_keys:
        raise RuntimeError("GROQ_API_KEY not set")

    random.shuffle(api_keys)
    models = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant"]

    for api_key in api_keys:
        for model in models:
            try:
                resp = requests.post(
                    "https://api.groq.com/openai/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {api_key}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "model": model,
                        "messages": [
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": user_prompt},
                        ],
                        "temperature": 0.3,
                        "max_tokens": 1024,
                    },
                    timeout=20,
                )
                if resp.status_code == 200:
                    return resp.json()["choices"][0]["message"]["content"].strip()
            except Exception:
                continue

    raise RuntimeError("Groq failed on all keys/models")


def _call_huggingface(system_prompt: str, user_prompt: str) -> str:
    """
    Fallback 2: Hugging Face Router API -- free tier.
    """
    hf_token = os.getenv("HF_API_TOKEN") or os.getenv("HF_TOKEN") or os.getenv("HUGGINGFACE_TOKEN")
    if not hf_token:
        raise RuntimeError("HF_API_TOKEN / HF_TOKEN not set")

    models = [
        "Qwen/Qwen2.5-72B-Instruct",
        "meta-llama/Llama-3.2-3B-Instruct",
        "mistralai/Mistral-7B-Instruct-v0.3"
    ]

    for model in models:
        try:
            resp = requests.post(
                f"https://api-inference.huggingface.co/models/{model}",
                headers={"Authorization": f"Bearer {hf_token}"},
                json={
                    "inputs": f"[INST] {system_prompt}\n\n{user_prompt} [/INST]",
                    "parameters": {"max_new_tokens": 512, "temperature": 0.3},
                },
                timeout=25,
            )
            if resp.status_code == 200:
                data = resp.json()
                if isinstance(data, list) and data:
                    text = data[0].get("generated_text", "")
                    if "[/INST]" in text:
                        text = text.split("[/INST]")[-1]
                    return text.strip()
        except Exception:
            continue

    raise RuntimeError("HuggingFace failed on all models")


def _call_ollama(system_prompt: str, user_prompt: str) -> str:
    """
    Fallback 3: Local Ollama -- only when USE_OLLAMA=true (dev machines).
    """
    if os.getenv("USE_OLLAMA", "false").lower() != "true":
        raise RuntimeError("Ollama disabled (USE_OLLAMA != true)")

    import ollama
    response = ollama.chat(
        model="phi3:mini",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
    )
    return response["message"]["content"].strip()


def _call_llm(system_prompt: str, user_prompt: str) -> str:
    """
    Cascading LLM caller: tries Gemini (with key rotation) -> Groq -> HuggingFace -> Ollama.
    All tiers are completely free. Zero cost required.
    """
    providers = [
        ("Gemini", _call_gemini),
        ("Groq", _call_groq),
        ("HuggingFace", _call_huggingface),
        ("Ollama", _call_ollama),
    ]

    last_error = None
    for name, fn in providers:
        try:
            print(f"[CHAT] Trying {name}...")
            result = fn(system_prompt, user_prompt)
            print(f"[CHAT] OK - {name} responded successfully.")
            return result
        except Exception as e:
            print(f"[CHAT] FAIL - {name} failed: {e}")
            last_error = e

    raise RuntimeError(f"All LLM providers failed. Last error: {last_error}")


# ---------------------------------------------------------------------------
# RAG Pipeline
# ---------------------------------------------------------------------------

SYSTEM_PROMPT = """You are an expert Machine Learning Data Assistant in the AutoModel platform.
You help users understand their uploaded datasets, trained models, and ML results.

RULES:
- If the user's question relates to their specific datasets or models, use the provided Context to answer accurately.
- If the question is a general greeting or general ML concept NOT specific to their data, answer helpfully using your general knowledge.
- Be concise, analytical, and actionable.
- Format responses with bullet points or numbered lists where appropriate.
- Never fabricate specific numbers -- only reference data from the Context."""


def ask_ai(user_id: str, question: str) -> str:
    """
    Main RAG entry-point called by the /chat endpoint.

    LLM Cascade (all FREE):
      1. Direct Offline Lookup  -- zero API, for simple factual questions
      2. Groq         -- fast cloud LLM, free tier
      3. HuggingFace  -- free inference API
      4. Ollama       -- local dev only
      5. Offline Engine -- ZERO API calls, can NEVER fail (guaranteed)

    This function is guaranteed to always return a useful response.
    """
    # ------------------------------------------------------------------
    # Step 1: Retrieve context from ChromaDB
    # ------------------------------------------------------------------
    context = ""
    try:
        query_embedding = get_embedding(question)
        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=5,
            where={"user_id": user_id},
        )
        if results and results.get("documents"):
            docs = results["documents"][0]
            if docs:
                context = "\n---\n".join(docs)
    except Exception as e:
        print(f"[VectorDB] Query error (non-fatal, continuing without context): {e}")

    # ------------------------------------------------------------------
    # Step 1.5: SHORT-CIRCUIT for direct factual questions
    # If the intent is a simple data lookup (columns, accuracy, model info),
    # answer directly from the stored context WITHOUT any API call.
    # This eliminates 429 risk for the most common questions.
    # ------------------------------------------------------------------
    DIRECT_ANSWER_INTENTS = {"columns", "accuracy", "model_info", "dataset_info", "problem_type"}
    try:
        intent = _classify_intent(question)
        if intent in DIRECT_ANSWER_INTENTS and context:
            records = _parse_training_context(context)
            if records:
                print(f"[CHAT] Short-circuiting LLM for direct factual intent: '{intent}'")
                return generate_offline_response(question, context)
    except Exception as e:
        print(f"[CHAT] Short-circuit check failed (non-fatal): {e}")

    # ------------------------------------------------------------------
    # Step 2: Try the LLM cascade (Groq -> HuggingFace -> Ollama)
    # ------------------------------------------------------------------
    try:
        if context:
            user_prompt = (
                f"=== TRAINING MEMORY (Context) ===\n{context}\n\n"
                f"=== USER QUESTION ===\n{question}"
            )
        else:
            user_prompt = (
                f"(No training memory available for this user yet.)\n\n"
                f"=== USER QUESTION ===\n{question}"
            )

        response = _call_llm(SYSTEM_PROMPT, user_prompt)
        return response

    except Exception as llm_error:
        print(f"[CHAT] All LLM providers failed: {llm_error}")
        print("[CHAT] Falling back to Offline Smart Engine (guaranteed response)...")

    # ------------------------------------------------------------------
    # Step 3: GUARANTEED FALLBACK -- Offline Smart Engine
    # No API calls. No network. No 429. Cannot fail.
    # ------------------------------------------------------------------
    return generate_offline_response(question, context)
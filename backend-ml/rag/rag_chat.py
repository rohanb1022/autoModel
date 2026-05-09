import os
import time
import requests

from rag.embedder import get_embedding
from rag.vectordb import collection
from rag.prompt_builder import build_prompt

# ============================================================
# CONFIG
# ============================================================

# Local development: set USE_OLLAMA=true in .env with Ollama installed
USE_OLLAMA = os.getenv("USE_OLLAMA", "false").lower() == "true"

GROQ_API_KEY    = os.getenv("GROQ_API_KEY")
HF_API_TOKEN    = os.getenv("HF_API_TOKEN")

# Groq: gemma2-9b-it — Fast, open-weights, and high performance
GROQ_MODEL      = "gemma2-9b-it"
GROQ_API_URL    = "https://api.groq.com/openai/v1/chat/completions"

# HuggingFace fallback — using high-availability Mistral model
HF_MODEL        = "mistralai/Mistral-7B-Instruct-v0.3"
HF_API_URL      = f"https://api-inference.huggingface.co/models/{HF_MODEL}"

print("USE_OLLAMA    =", USE_OLLAMA)
print("GROQ KEY      =", "✓ present" if GROQ_API_KEY else "✗ missing")
print("HF TOKEN      =", "✓ present" if HF_API_TOKEN else "✗ missing")


# ============================================================
# PROVIDER 1 — GROQ  (Primary cloud LLM)
# Model: llama-3.1-8b-instant  |  Free tier: 30 RPM, 131k token context
# Best for RAG: fast inference + strong instruction following
# ============================================================

def call_groq(prompt: str, system_msg: str = None) -> str | None:
    """
    Returns the response string on success, or None on any failure.
    Returning None signals the caller to cascade to the next provider.
    """
    if not GROQ_API_KEY:
        print("[GROQ] API key missing — skipping")
        return None

    if system_msg is None:
        system_msg = (
            "You are an expert Machine Learning Data Analyst inside the AutoModel platform. "
            "Use the provided training memory context to answer questions accurately and analytically. "
            "Be concise, precise, and only use the context given."
        )

    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": GROQ_MODEL,
        "messages": [
            {"role": "system", "content": system_msg},
            {"role": "user",   "content": prompt},
        ],
        "temperature": 0.3,
        "max_tokens": 512,
    }

    try:
        resp = requests.post(GROQ_API_URL, headers=headers, json=payload, timeout=30)

        if resp.status_code == 429:
            # Rate limited — tell caller to fall through to next provider
            retry_after = resp.headers.get("retry-after", "unknown")
            print(f"[GROQ] 429 rate-limited (retry-after: {retry_after}s) — cascading to HuggingFace")
            return None

        if resp.status_code != 200:
            print(f"[GROQ] Error {resp.status_code}: {resp.text[:200]}")
            return None

        data = resp.json()
        text = data["choices"][0]["message"]["content"].strip()
        print("[GROQ] ✓ Response received")
        return text

    except requests.Timeout:
        print("[GROQ] Timeout — cascading to HuggingFace")
        return None
    except Exception as e:
        print(f"[GROQ] Unexpected error: {e}")
        return None


# ============================================================
# PROVIDER 2 — HUGGINGFACE  (Secondary fallback)
# Model: Phi-3-mini-4k-instruct  |  No hard RPM limit (queued)
# Slower (~5-15s) but effectively unlimited for small apps
# ============================================================

def call_huggingface(prompt: str) -> str | None:
    """
    Returns the response string on success, or None on failure.
    """
    if not HF_API_TOKEN:
        print("[HF] API token missing — skipping")
        return None

    headers = {
        "Authorization": f"Bearer {HF_API_TOKEN}",
        "Content-Type": "application/json",
    }
    payload = {
        "inputs": prompt,
        "parameters": {
            "temperature": 0.3,
            "max_new_tokens": 400,
            "return_full_text": False,
        },
    }

    try:
        resp = requests.post(HF_API_URL, headers=headers, json=payload, timeout=90)

        if resp.status_code == 429:
            print("[HF] 429 — also rate limited, using static fallback")
            return None

        if resp.status_code != 200:
            print(f"[HF] Error {resp.status_code}: {resp.text[:200]}")
            return None

        data = resp.json()
        if isinstance(data, list) and data:
            text = data[0].get("generated_text", "").strip()
            print("[HF] ✓ Response received")
            return text if text else None
        if isinstance(data, dict):
            text = data.get("generated_text", "").strip()
            return text if text else None

        return None

    except requests.Timeout:
        print("[HF] Timeout")
        return None
    except Exception as e:
        print(f"[HF] Unexpected error: {e}")
        return None


# ============================================================
# CASCADE ROUTER  (Groq → HuggingFace → Static)
# Used by RAG chat
# ============================================================

def call_llm_cascade(prompt: str, static_fallback: str = None) -> str:
    """
    Try providers in order. The first one that returns a non-None value wins.
    If all fail, return the static_fallback string.
    """
    # 1️⃣  Groq (fast, open-source Gemma, 15k TPM)
    result = call_groq(prompt)
    if result:
        return result

    # 2️⃣  HuggingFace (slower but no hard cap)
    result = call_huggingface(prompt)
    if result:
        return result

    # 3️⃣  Static fallback — never break the UI
    print("[CASCADE] All providers failed — returning static fallback")
    return static_fallback or (
        "I'm having trouble connecting to the AI service right now. "
        "Please try again in a moment."
    )


# ============================================================
# MAIN RAG CHAT FUNCTION
# ============================================================

def ask_ai(user_id: str, question: str) -> str:
    try:
        # Step 1: embed the question
        query_embedding = get_embedding(question)

        # Step 2: retrieve relevant training memory from ChromaDB
        context = ""
        try:
            results = collection.query(
                query_embeddings=[query_embedding],
                n_results=5,
                where={"user_id": user_id},
            )
            if results and results.get("documents"):
                docs = results["documents"][0]
                if docs:
                    context = "\n".join(docs)
        except Exception as e:
            print(f"[VectorDB] Query error: {e}")

        # Step 3: build the RAG prompt
        prompt = build_prompt(question, context)

        # Step 4: local dev with Ollama, else cloud cascade
        if USE_OLLAMA:
            print("[CHAT] Using Ollama (local dev mode)")
            try:
                import ollama  # Only imported when USE_OLLAMA=true
                response = ollama.chat(
                    model="phi3:mini",
                    messages=[
                        {
                            "role": "system",
                            "content": (
                                "You are an expert Machine Learning Data Assistant in AutoModel. "
                                "Use the provided training memory to answer accurately."
                            ),
                        },
                        {"role": "user", "content": prompt},
                    ],
                )
                return response["message"]["content"]
            except ImportError:
                print("[Ollama] Package not installed — falling back to cloud")
            except Exception as ollama_err:
                print(f"[Ollama] Error: {ollama_err} — falling back to cloud")

            # Ollama failed even in local mode → use cloud cascade as recovery
            return call_llm_cascade(prompt)

        else:
            # Production: Groq → HuggingFace → Static
            print("[CHAT] Cloud mode — running cascade")
            return call_llm_cascade(prompt)

    except Exception as e:
        print(f"[CHAT] Outer error: {e}")
        return "I'm having trouble accessing the dataset information right now. Please try again."
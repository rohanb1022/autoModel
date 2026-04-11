import os
import requests
import ollama

from rag.embedder import get_embedding
from rag.vectordb import collection
from rag.prompt_builder import build_prompt

# ----------------------------------------
# Config
# ----------------------------------------

# default FALSE → cloud uses HuggingFace
USE_OLLAMA = os.getenv("USE_OLLAMA", "false").lower() == "true"

HF_API_TOKEN = os.getenv("HF_API_TOKEN")
HF_MODEL = "microsoft/Phi-3-mini-4k-instruct"

print("USE_OLLAMA =", USE_OLLAMA)
print("HF TOKEN PRESENT =", bool(HF_API_TOKEN))


# ----------------------------------------
# HuggingFace API call (NEW ROUTER ENDPOINT)
# ----------------------------------------

def call_huggingface(prompt: str):
    try:
        if not HF_API_TOKEN:
            print("HF token missing")
            return "LLM token missing in server configuration."

        headers = {
            "Authorization": f"Bearer {HF_API_TOKEN}",
            "Content-Type": "application/json"
        }

        payload = {
            "inputs": prompt,
            "parameters": {
                "temperature": 0.3,
                "max_new_tokens": 300,
                "return_full_text": False
            }
        }

        response = requests.post(
            f"https://router.huggingface.co/hf-inference/models/{HF_MODEL}",
            headers=headers,
            json=payload,
            timeout=90
        )

        if response.status_code != 200:
            print("HF API error:", response.text)
            return "AI model failed to respond."

        data = response.json()

        if isinstance(data, list) and len(data) > 0:
            return data[0].get("generated_text", "").strip()

        if isinstance(data, dict) and "generated_text" in data:
            return data["generated_text"].strip()

        return "No data available."

    except Exception as e:
        print("HF CALL ERROR:", str(e))
        return "LLM service temporarily unavailable."


# ----------------------------------------
# Main RAG Chat Function
# ----------------------------------------

def ask_ai(user_id: str, question: str):
    try:
        # 1️⃣ embedding
        query_embedding = get_embedding(question)

        # 2️⃣ retrieve memory
        try:
            results = collection.query(
                query_embeddings=[query_embedding],
                n_results=5,
                where={"user_id": user_id}
            )
        except Exception as e:
            print("Vector DB error:", e)
            results = None

        context = ""
        if results and results.get("documents"):
            docs = results["documents"][0]
            if docs:
                context = "\n".join(docs)

        # 3️⃣ prompt
        prompt = build_prompt(question, context)

        # 4️⃣ choose backend
        if USE_OLLAMA:
            print("Using OLLAMA (local) with phi3 model")
            try:
                response = ollama.chat(
                    model="phi3:mini",
                    messages=[
                        {
                            "role": "system",
                            "content": "You are an expert Machine Learning Data Assistant. Use the provided training memory to answer the question accurately. Provide deep analytical insight."
                        },
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ]
                )
                return response["message"]["content"]
            except Exception as ollama_err:
                print("Ollama Error:", ollama_err)
                return "Failed to connect to Local Ollama. Please ensure Ollama is running and 'phi3:mini' is installed (run `ollama pull phi3:mini`)."

        else:
            print("Using HuggingFace cloud model")
            return call_huggingface(prompt)

    except Exception as e:
        print("CHAT ERROR:", str(e))
        return "I'm having trouble accessing the dataset information right now."
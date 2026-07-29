import sys
import os

# Align path resolving to allow importing from backend-ml directory
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_ml_dir = os.path.join(current_dir, "backend-ml")
if backend_ml_dir not in sys.path:
    sys.path.append(backend_ml_dir)
if current_dir not in sys.path:
    sys.path.append(current_dir)

import uvicorn
from ml_services.app import app

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("hf_app:app", host="0.0.0.0", port=port)
import os

# Flag to detect if running on Render/HuggingFace vs Local
IS_PRODUCTION = os.getenv("RENDER", "False") == "True" or os.getenv("SPACE_ID") is not None

class Config:
    # URL of the main Node backend (used for CORS or callback logic if needed)
    NODE_BACKEND_URL = "https://automodel-backend.onrender.com" if IS_PRODUCTION else "http://localhost:5000"
    
    # Port configuration
    PORT = int(os.getenv("PORT", 8000))
    
    # Storage settings
    UPLOAD_PATH = "temp.csv"

config = Config()

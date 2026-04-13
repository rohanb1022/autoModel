# Production Dockerfile for AutoModel ML Backend
# Compatible with: HuggingFace Spaces (port 7860) and Render (PORT env var)

FROM python:3.10-slim

# Prevent Python from writing .pyc files and buffer stdout/stderr
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install system dependencies (needed for some ML packages)
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies first (layer caching optimization)
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy the application code
COPY . /app

# Create required directories
RUN mkdir -p outputs vector_db uploads data

# Environment defaults
# HuggingFace Spaces uses port 7860 by default
# Render uses the PORT env variable
ENV PORT=7860
ENV USE_OLLAMA=false
ENV ANONYMIZED_TELEMETRY=False
ENV CHROMA_TELEMETRY=False

EXPOSE 7860

# Start the FastAPI server
# The PORT env var is read here — works on both HF Spaces and Render
CMD uvicorn ml_services.app:app --host 0.0.0.0 --port ${PORT}
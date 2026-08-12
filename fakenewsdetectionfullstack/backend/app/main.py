import sys
from pathlib import Path

# Add backend directory and project root path to sys.path
current_file = Path(__file__).resolve()
backend_dir = current_file.parents[1] # backend/app/main.py -> backend/app -> backend
project_root = current_file.parents[2] # backend/app/main.py -> backend/app -> backend -> project_root

if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))
if str(project_root) not in sys.path:
    sys.path.insert(0, str(project_root))

import logging
import sys
logging.basicConfig(level=logging.INFO, stream=sys.stdout)

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import predict, batch, analytics, history
from ai.inference.model_loader import model_loader

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load all transformer models once during FastAPI startup.
    model_loader.load_all_models()
    yield

app = FastAPI(
    title="TruthLens AI Backend",
    description="FastAPI Backend for Fake News Detection using Machine Learning & Transformer Models",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configurations for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://truth-lens-ai-delta.vercel.app",
    ],
    allow_origin_regex=r"https://truth-lens-.*-yugsaxena2006-3210s-projects\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(predict.router, prefix="/api", tags=["Prediction"])
app.include_router(batch.router, prefix="/api", tags=["Batch Prediction"])
app.include_router(analytics.router, prefix="/api", tags=["Analytics"])
app.include_router(history.router, prefix="/api", tags=["History"])

@app.get("/")
async def root():
    return {
        "app": "TruthLens AI API Gateway",
        "status": "online",
        "version": "1.0.0",
        "docs_url": "/docs"
    }

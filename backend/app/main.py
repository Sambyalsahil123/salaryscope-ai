"""
FastAPI Application Entry Point — Salary Predictor API

Architecture:
    app/
    ├── main.py              ← this file (app factory + lifespan)
    ├── models/
    │   └── schemas.py       ← Pydantic request/response types
    └── routers/
        ├── predict.py       ← POST /predict
        └── health.py        ← GET /health

    ml/
    ├── train.py             ← trains and saves model.pkl
    ├── model.pkl            ← saved pipeline (auto-generated)
    └── metrics.json         ← training metrics (auto-generated)

Run:
    # Step 1: train the model (once)
    python ml/train.py

    # Step 2: start the API
    uvicorn app.main:app --reload
"""

import json
import joblib
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import predict, health

BASE_DIR  = Path(__file__).parent.parent
MODEL_PATH   = BASE_DIR / "ml" / "model.pkl"
METRICS_PATH = BASE_DIR / "ml" / "metrics.json"


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load model once at startup, clean up on shutdown."""
    if not MODEL_PATH.exists():
        raise RuntimeError(
            "model.pkl not found. Run `python ml/train.py` first."
        )

    app.state.pipeline = joblib.load(MODEL_PATH)
    app.state.metrics  = (
        json.loads(METRICS_PATH.read_text())
        if METRICS_PATH.exists() else {}
    )
    print(f"Model loaded. Metrics: {app.state.metrics}")
    yield
    # cleanup (close DB connections etc. would go here)
    print("API shutting down.")


app = FastAPI(
    title="Salary Predictor API",
    description="Production-ready ML inference API for salary prediction.",
    version="1.0.0",
    lifespan=lifespan,
)

# Allow Next.js frontend on any localhost port (dev) and your prod domain
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://your-saas-domain.com"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(predict.router)

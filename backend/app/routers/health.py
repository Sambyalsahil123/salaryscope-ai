"""
/health and /model-info — health check + proof that this is a real ML API.
"""

from fastapi import APIRouter, Request
from app.models.schemas import HealthResponse, ModelInfoResponse

router = APIRouter(tags=["Health"])


@router.get("/health", response_model=HealthResponse)
def health_check(request: Request):
    metrics = request.app.state.metrics or {}
    return HealthResponse(
        status="ok",
        model_loaded=request.app.state.pipeline is not None,
        model_r2=metrics.get("r2"),
        model_mae=metrics.get("mae"),
    )


@router.get("/model-info", response_model=ModelInfoResponse)
def model_info(request: Request):
    """
    Returns model type and metrics so the frontend can prove this is ML, not rule-based.
    Client can also open api_docs_url to see the real API (Swagger).
    """
    pipeline = request.app.state.pipeline
    metrics = request.app.state.metrics or {}
    model_type = "Unknown"
    if pipeline is not None and hasattr(pipeline, "named_steps") and "model" in pipeline.named_steps:
        model_type = type(pipeline.named_steps["model"]).__name__
    base = request.base_url
    return ModelInfoResponse(
        model_type=model_type,
        library="scikit-learn",
        metrics={"r2": metrics.get("r2"), "mae": metrics.get("mae"), "cv_r2": metrics.get("cv_r2")},
        api_docs_url=str(base).rstrip("/") + "/docs",
    )

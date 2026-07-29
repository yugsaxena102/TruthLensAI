from fastapi import APIRouter, HTTPException
from app.schemas.response import AnalyticsResponse
from app.services.prediction_service import get_analytics_metrics

router = APIRouter()

@router.get("/analytics", response_model=AnalyticsResponse)
async def get_analytics():
    try:
        return get_analytics_metrics()
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=f"Failed to load analytics: {str(exc)}") from exc

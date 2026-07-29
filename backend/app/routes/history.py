from fastapi import APIRouter, HTTPException
from typing import List
from app.schemas.response import HistoryItem
from app.services.prediction_service import get_history_items

router = APIRouter()

@router.get("/history", response_model=List[HistoryItem])
async def get_history():
    try:
        return get_history_items()
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=f"Failed to fetch history: {str(exc)}") from exc

import logging
import traceback

from fastapi import APIRouter, HTTPException

from app.schemas.request import PredictRequest
from app.schemas.response import ProductionResponse, ResearchResponse
from app.services.prediction_service import predict_production, predict_research

from typing import Union

logger = logging.getLogger("truthlens")


router = APIRouter()

@router.post("/predict", response_model=Union[ProductionResponse, ResearchResponse])
async def predict_news(request: PredictRequest):
    try:
        logger.info("[API] /predict request received: mode=%s text_chars=%d", request.mode, len(request.text or ""))

        if request.mode == "research":
            logger.info("[API] Dispatching to predict_research")
            return predict_research(request.text)

        logger.info("[API] Dispatching to predict_production")
        return predict_production(request.text)

    except ValueError as exc:
        logger.warning("[API] Validation error: %s", str(exc), exc_info=True)
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except FileNotFoundError as exc:
        logger.error("[API] Model file not found: %s", str(exc), exc_info=True)
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except RuntimeError as exc:
        logger.error("[API] Runtime error: %s\n%s", str(exc), traceback.format_exc())
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:
        logger.error("[API] Unexpected error: %s\n%s", str(exc), traceback.format_exc())
        raise HTTPException(status_code=500, detail="Unexpected server error") from exc


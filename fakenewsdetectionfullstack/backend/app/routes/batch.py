from fastapi import APIRouter, HTTPException
from app.schemas.request import BatchPredictRequest
from app.schemas.response import BatchPredictResponse
from app.services.prediction_service import predict_production, predict_research

router = APIRouter()

@router.post("/batchPredict", response_model=BatchPredictResponse)
async def batch_predict_news(request: BatchPredictRequest):
    if not request.texts:
        raise HTTPException(status_code=400, detail="Text list cannot be empty.")

    predictions = []
    for text in request.texts:
        if not text or not text.strip():
            continue
        try:
            if request.mode == "research":
                predictions.append(predict_research(text))
            else:
                predictions.append(predict_production(text))
        except Exception as exc:
            from app.schemas.response import ProductionResponse, ResearchResponse, VerificationResponse, ModelPrediction
            error_msg = str(exc)
            
            mock_verification = VerificationResponse(
                verdict="Error",
                confidence=0.0,
                summary=error_msg,
                reasoning=error_msg,
                sources=[]
            )
            
            if request.mode == "research":
                mock_model = ModelPrediction(prediction="Error", confidence=0.0)
                fallback = ResearchResponse(
                    mode="research",
                    bert=mock_model,
                    distilbert=mock_model,
                    roberta=mock_model,
                    xgboost=mock_model,
                    majority_voting="Error",
                    final_prediction="Error",
                    comparison={
                        "bert_prediction": "Error",
                        "distilbert_prediction": "Error",
                        "roberta_prediction": "Error",
                        "xgboost_prediction": "Error",
                        "bert_confidence": 0.0,
                        "distilbert_confidence": 0.0,
                        "roberta_confidence": 0.0,
                        "xgboost_confidence": 0.0,
                        "majority_confidence": 0.0,
                        "inference_time_ms": 0,
                    },
                    verification=mock_verification,
                    status="error"
                )
                predictions.append(fallback)
            else:
                fallback = ProductionResponse(
                    mode="production",
                    model="Error",
                    prediction="Error",
                    confidence=0.0,
                    inference_time="0ms",
                    keywords=[],
                    reason=error_msg,
                    verification=mock_verification,
                    status="error"
                )
                predictions.append(fallback)

    if not predictions:
        raise HTTPException(status_code=400, detail="No valid text rows were provided.")

    return BatchPredictResponse(predictions=predictions)

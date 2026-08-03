import asyncio
import sys
import types
from pathlib import Path

import httpx
import pytest
from fastapi import FastAPI


PROJECT_ROOT = Path(__file__).resolve().parents[2]
BACKEND_ROOT = PROJECT_ROOT / "backend"
for path in (str(PROJECT_ROOT), str(BACKEND_ROOT)):
    if path not in sys.path:
        sys.path.insert(0, path)


# Prevent route imports from reaching the real inference module during smoke tests.
fake_predictor = types.ModuleType("ai.inference.predictor")
fake_predictor.predict_bert = lambda text: None
fake_predictor.predict_distilbert = lambda text: None
fake_predictor.predict_roberta = lambda text: None
sys.modules.setdefault("ai.inference.predictor", fake_predictor)

from app.routes import analytics, batch, history, predict


def _production_response(text: str):
    if not text.strip():
        raise ValueError("Text cannot be empty.")
    return {
        "mode": "production",
        "model": "RoBERTa",
        "prediction": "Real",
        "confidence": 91.5,
        "inference_time": "4.2 ms",
        "keywords": ["reported"],
        "reason": "Smoke-test response.",
        "status": "success",
    }


def _research_response(text: str):
    if not text.strip():
        raise ValueError("Text cannot be empty.")
    return {
        "mode": "research",
        "bert": {"prediction": "Real", "confidence": 90.0},
        "distilbert": {"prediction": "Real", "confidence": 91.0},
        "roberta": {"prediction": "Fake", "confidence": 80.0},
        "majority_voting": "Real",
        "final_prediction": "Real",
        "comparison": {
            "bert_prediction": "Real",
            "distilbert_prediction": "Real",
            "roberta_prediction": "Fake",
            "bert_confidence": 90.0,
            "distilbert_confidence": 91.0,
            "roberta_confidence": 80.0,
            "majority_confidence": 90.5,
            "inference_time_ms": 12.3,
        },
        "status": "success",
    }


@pytest.fixture()
def app(monkeypatch):
    monkeypatch.setattr(predict, "predict_production", _production_response)
    monkeypatch.setattr(predict, "predict_research", _research_response)
    monkeypatch.setattr(batch, "predict_production", _production_response)
    monkeypatch.setattr(batch, "predict_research", _research_response)
    monkeypatch.setattr(
        analytics,
        "get_analytics_metrics",
        lambda: {
            "total_predictions": 2,
            "fake_percentage": 50.0,
            "real_percentage": 50.0,
            "average_confidence": 90.0,
            "average_inference_time": 8.2,
            "distribution_pie": {"Fake": 1, "Real": 1},
            "model_performance_bar": {"RoBERTa": 90.0},
            "timeline_line": [],
            "current_mode": "production",
        },
    )
    monkeypatch.setattr(
        history,
        "get_history_items",
        lambda: [
            {
                "id": "pred_smoke",
                "date": "2026-07-19",
                "time": "12:00",
                "input_text": "Smoke test article",
                "text_snippet": "Smoke test article",
                "prediction": "Real",
                "confidence": 91.5,
                "mode": "production",
                "model_used": "RoBERTa",
                "inference_time": 4.2,
            }
        ],
    )
    test_app = FastAPI()
    test_app.include_router(predict.router, prefix="/api")
    test_app.include_router(batch.router, prefix="/api")
    test_app.include_router(analytics.router, prefix="/api")
    test_app.include_router(history.router, prefix="/api")

    return test_app


def _request(app, method: str, path: str, **kwargs):
    async def send_request():
        transport = httpx.ASGITransport(app=app)
        async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as client:
            return await client.request(method, path, **kwargs)

    return asyncio.run(send_request())


def test_predict_production_contract(app):
    response = _request(app, "POST", "/api/predict", json={"text": "A verified report.", "mode": "production"})

    assert response.status_code == 200
    body = response.json()
    assert body["mode"] == "production"
    assert body["model"] == "RoBERTa"
    assert body["confidence"] == 91.5


def test_predict_research_contract(app):
    response = _request(app, "POST", "/api/predict", json={"text": "A verified report.", "mode": "research"})

    assert response.status_code == 200
    body = response.json()
    assert body["mode"] == "research"
    assert body["final_prediction"] == "Real"
    assert body["comparison"]["majority_confidence"] == 90.5


@pytest.mark.parametrize("mode", ["production", "research"])
def test_batch_predict_contract(app, mode):
    response = _request(
        app,
        "POST",
        "/api/batchPredict",
        json={"texts": ["First report.", "Second report."], "mode": mode},
    )

    assert response.status_code == 200
    body = response.json()
    assert len(body["predictions"]) == 2
    assert body["predictions"][0]["mode"] == mode


def test_analytics_contract(app):
    response = _request(app, "GET", "/api/analytics")

    assert response.status_code == 200
    assert response.json()["average_inference_time"] == 8.2


def test_history_contract(app):
    response = _request(app, "GET", "/api/history")

    assert response.status_code == 200
    assert response.json()[0]["input_text"] == "Smoke test article"


def test_predict_rejects_empty_text(app):
    response = _request(app, "POST", "/api/predict", json={"text": "", "mode": "production"})

    assert response.status_code == 400
    assert response.json()["detail"] == "Text cannot be empty."


def test_batch_rejects_empty_list(app):
    response = _request(app, "POST", "/api/batchPredict", json={"texts": [], "mode": "production"})

    assert response.status_code == 400
    assert response.json()["detail"] == "Text list cannot be empty."

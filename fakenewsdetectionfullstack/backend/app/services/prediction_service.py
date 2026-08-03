from __future__ import annotations

import hashlib
import time
from statistics import mean
from threading import Lock
from concurrent.futures import ThreadPoolExecutor
from typing import Any, Dict, List

from app.schemas.response import (
    AnalyticsResponse,
    HistoryItem,
    ModelPrediction,
    ProductionResponse,
    ResearchResponse,
    VerificationResponse,
    VerificationSource,
)

from ai.inference.predictor import predict_bert, predict_distilbert, predict_roberta
from ai.retrieval.search import run_search
from ai.retrieval.retriever import run_retriever
from ai.verification.verifier import run_verification


_history_lock = Lock()
_prediction_history: List[Dict[str, Any]] = []


def _generate_record_id(text: str, timestamp: float) -> str:
    digest = hashlib.sha1(f"{text}:{timestamp}".encode("utf-8")).hexdigest()[:10]
    return f"pred_{digest}"


def _build_history_entry(
    *,
    text: str,
    prediction: str,
    confidence: float,
    mode: str,
    model_used: str,
    inference_time_ms: float,
) -> Dict[str, Any]:
    now = time.localtime()
    snippet = text[:100] + "..." if len(text) > 100 else text
    timestamp = time.time()
    return {
        "id": _generate_record_id(text, timestamp),
        "date": time.strftime("%Y-%m-%d", now),
        "time": time.strftime("%H:%M", now),
        "input_text": text,
        "text_snippet": snippet,
        "prediction": prediction,
        "confidence": confidence,
        "mode": mode,
        "model_used": model_used,
        "inference_time": inference_time_ms,
    }


def _majority_vote(bert_pred: Dict[str, Any], distilbert_pred: Dict[str, Any], roberta_pred: Dict[str, Any], xgboost_pred: Dict[str, Any]) -> Dict[str, Any]:
    votes = [bert_pred["prediction"], distilbert_pred["prediction"], roberta_pred["prediction"], xgboost_pred["prediction"]]
    fake_count = sum(1 for vote in votes if vote == "Fake")
    final_prediction = "Fake" if fake_count >= 3 else "Real"

    agreeing_confidences = [
        result["confidence"]
        for result in (bert_pred, distilbert_pred, roberta_pred, xgboost_pred)
        if result["prediction"] == final_prediction
    ]

    majority_confidence = round(mean(agreeing_confidences), 1) if agreeing_confidences else 50.0
    return {
        "majority_voting": final_prediction,
        "final_prediction": final_prediction,
        "confidence": majority_confidence,
    }


def _store_history(entry: Dict[str, Any]) -> None:
    with _history_lock:
        _prediction_history.insert(0, entry)


import logging
logger = logging.getLogger("truthlens")
from ai.inference.preprocess import clean_text
import ai.inference.predictor
print(f"DEBUG: ai.inference.predictor location: {ai.inference.predictor.__file__}")
from ai.inference.predictor import predict_bert, predict_distilbert, predict_xgboost

# ... existing code ...

def predict_production(text: str) -> ProductionResponse:

    if not text or not text.strip():
        raise ValueError("Text cannot be empty.")

    logger.info(
        "\n=====================================\n"
        "Prediction Started\n"
        "=====================================\n"
        "Raw Input: %s\n",
        text,
    )

    t_clean_0 = time.perf_counter()
    cleaned = clean_text(text)
    t_clean_1 = time.perf_counter()
    time_cleaning_ms = round((t_clean_1 - t_clean_0) * 1000.0, 1)

    logger.info("Cleaned Text: %s\n", cleaned)

    start_time = time.perf_counter()

    def _run_ml():
        t0 = time.perf_counter()
        res = predict_roberta(text)
        t1 = time.perf_counter()
        return res, round((t1 - t0) * 1000.0, 1)

    def _run_rag():
        t0 = time.perf_counter()
        search_results = run_search(text)
        t1 = time.perf_counter()
        retriever_results = run_retriever(text, search_results)
        t2 = time.perf_counter()
        return retriever_results, round((t1 - t0) * 1000.0, 1), round((t2 - t1) * 1000.0, 1)

    with ThreadPoolExecutor(max_workers=2) as executor:
        f_ml = executor.submit(_run_ml)
        f_rag = executor.submit(_run_rag)
        roberta_res, time_ml_ms = f_ml.result()
        retriever_res, time_search_ms, time_retrieval_ms = f_rag.result()

    verification_res = run_verification(
        text,
        roberta_res["prediction"],
        roberta_res["confidence"],
        retriever_res,
    )

    elapsed_ms = round(
        (time.perf_counter() - start_time) * 1000.0,
        1,
    )

    logger.info(
        "Running RoBERTa\n"
        "Prediction: %s | Confidence: %.1f%%\n",
        roberta_res["prediction"],
        roberta_res["confidence"],
    )

    logger.info(
        "Inference Time: %.1f ms\n"
        "=====================================\n"
        "Prediction Completed\n"
        "=====================================",
        elapsed_ms,
    )

    prediction = roberta_res["prediction"]
    confidence = roberta_res["confidence"]
    keywords = roberta_res["keywords"]
    reason = roberta_res["reason"]

    verification = VerificationResponse(

        verdict=verification_res.verdict,

        confidence=verification_res.confidence,

        summary=verification_res.summary,

        reasoning=verification_res.reasoning,

        sources=[

            VerificationSource(

                name=source.name,

                url=source.url,

            )

            for source in verification_res.sources

        ],

    )

    response = ProductionResponse(

        mode="production",

        model="RoBERTa",

        prediction=prediction,

        confidence=confidence,

        inference_time=f"{elapsed_ms} ms",

        keywords=keywords,

        reason=reason,

        verification=verification,

        status="success",

    )

    t_hist_0 = time.perf_counter()
    _store_history(

        _build_history_entry(

            text=text,

            prediction=prediction,

            confidence=confidence,

            mode="production",

            model_used="RoBERTa",

            inference_time_ms=elapsed_ms,

        )

    )
    t_hist_1 = time.perf_counter()
    time_history_ms = round((t_hist_1 - t_hist_0) * 1000.0, 1)

    time_prompt_ms = verification_res.timings.get("prompt_building_ms", 0.0)
    time_gemini_ms = verification_res.timings.get("gemini_api_ms", 0.0)
    time_analytics_ms = 0.0

    total_time_ms = round((time.perf_counter() - t_clean_0) * 1000.0, 1)

    logger.info(
        "\n=====================================\n"
        "Timing Summary (Production)\n"
        "=====================================\n"
        f"Text Cleaning ............ {time_cleaning_ms:5.1f} ms\n"
        f"Transformer Models ....... {time_ml_ms:5.1f} ms\n"
        f"Search ................... {time_search_ms:5.1f} ms\n"
        f"Evidence Retrieval ....... {time_retrieval_ms:5.1f} ms\n"
        f"Prompt Building .......... {time_prompt_ms:5.1f} ms\n"
        f"Gemini API ............... {time_gemini_ms:5.1f} ms\n"
        f"History Save ............. {time_history_ms:5.1f} ms\n"
        f"Analytics Update ......... {time_analytics_ms:5.1f} ms\n"
        f"Total .................... {total_time_ms:5.1f} ms\n"
        "====================================="
    )

    return response

def predict_research(text: str) -> ResearchResponse:

    if not text or not text.strip():
        raise ValueError("Text cannot be empty.")

    logger.info(
        "\n" + "=" * 50 +
        "\nPrediction Started (Research Mode)\n" +
        "=" * 50 +
        "\nRaw Input: %s\n",
        text,
    )

    t_clean_0 = time.perf_counter()
    cleaned = clean_text(text)
    t_clean_1 = time.perf_counter()
    time_cleaning_ms = round((t_clean_1 - t_clean_0) * 1000.0, 1)

    logger.info("Cleaned Text: %s\n", cleaned)

    start_time = time.perf_counter()

    def _run_ml_models():
        t0 = time.perf_counter()
        with ThreadPoolExecutor(max_workers=4) as ml_executor:
            f_bert = ml_executor.submit(predict_bert, text)
            f_distilbert = ml_executor.submit(predict_distilbert, text)
            f_roberta = ml_executor.submit(predict_roberta, text)
            f_xgboost = ml_executor.submit(predict_xgboost, text)

            b_res = f_bert.result()
            d_res = f_distilbert.result()
            r_res = f_roberta.result()
            x_res = f_xgboost.result()
        t1 = time.perf_counter()
        return (b_res, d_res, r_res, x_res), round((t1 - t0) * 1000.0, 1)

    def _run_rag():
        t0 = time.perf_counter()
        search_results = run_search(text)
        t1 = time.perf_counter()
        retriever_results = run_retriever(text, search_results)
        t2 = time.perf_counter()
        return retriever_results, round((t1 - t0) * 1000.0, 1), round((t2 - t1) * 1000.0, 1)

    with ThreadPoolExecutor(max_workers=2) as executor:
        f_ml = executor.submit(_run_ml_models)
        f_rag = executor.submit(_run_rag)

        (bert_res, distilbert_res, roberta_res, xgboost_res), time_ml_ms = f_ml.result()
        retriever_res, time_search_ms, time_retrieval_ms = f_rag.result()

    logger.info(
        "  > BERT       | Prediction: %-4s | Confidence: %5.1f%%",
        bert_res["prediction"],
        bert_res["confidence"],
    )
    logger.info(
        "  > DistilBERT | Prediction: %-4s | Confidence: %5.1f%%",
        distilbert_res["prediction"],
        distilbert_res["confidence"],
    )
    logger.info(
        "  > RoBERTa    | Prediction: %-4s | Confidence: %5.1f%%",
        roberta_res["prediction"],
        roberta_res["confidence"],
    )
    logger.info(
        "  > XGBoost    | Prediction: %-4s | Confidence: %5.1f%%",
        xgboost_res["prediction"],
        xgboost_res["confidence"],
    )

    voting_res = _majority_vote(
        bert_res,
        distilbert_res,
        roberta_res,
        xgboost_res,
    )

    verification_res = run_verification(
        text,
        voting_res["final_prediction"],
        voting_res["confidence"],
        retriever_res,
    )

    elapsed_ms = round(
        (time.perf_counter() - start_time) * 1000.0,
        1,
    )

    logger.info(
        "\n  > Majority Voting | Final Prediction: %s | Confidence: %.1f%%",
        voting_res["final_prediction"],
        voting_res["confidence"],
    )

    logger.info(
        "\nInference Time: %.1f ms\n"
        + "=" * 50 +
        "\nPrediction Completed\n"
        + "=" * 50,
        elapsed_ms,
    )

    comparison = {
        "bert_prediction": bert_res["prediction"],
        "distilbert_prediction": distilbert_res["prediction"],
        "roberta_prediction": roberta_res["prediction"],
        "xgboost_prediction": xgboost_res["prediction"],
        "bert_confidence": bert_res["confidence"],
        "distilbert_confidence": distilbert_res["confidence"],
        "roberta_confidence": roberta_res["confidence"],
        "xgboost_confidence": xgboost_res["confidence"],
        "majority_confidence": voting_res["confidence"],
        "inference_time_ms": elapsed_ms,
    }

    verification = VerificationResponse(
        verdict=verification_res.verdict,
        confidence=verification_res.confidence,
        summary=verification_res.summary,
        reasoning=verification_res.reasoning,
        sources=[
            VerificationSource(
                name=source.name,
                url=source.url,
            )
            for source in verification_res.sources
        ],
    )

    response = ResearchResponse(
        mode="research",
        bert=ModelPrediction(
            prediction=bert_res["prediction"],
            confidence=bert_res["confidence"],
        ),
        distilbert=ModelPrediction(
            prediction=distilbert_res["prediction"],
            confidence=distilbert_res["confidence"],
        ),
        roberta=ModelPrediction(
            prediction=roberta_res["prediction"],
            confidence=roberta_res["confidence"],
        ),
        xgboost=ModelPrediction(
            prediction=xgboost_res["prediction"],
            confidence=xgboost_res["confidence"],
        ),
        majority_voting=voting_res["majority_voting"],
        final_prediction=voting_res["final_prediction"],
        comparison=comparison,
        verification=verification,
        status="success",
    )

    t_hist_0 = time.perf_counter()
    _store_history(
        _build_history_entry(
            text=text,
            prediction=voting_res["final_prediction"],
            confidence=voting_res["confidence"],
            mode="research",
            model_used="BERT + DistilBERT + RoBERTa + XGBoost",
            inference_time_ms=elapsed_ms,
        )
    )
    t_hist_1 = time.perf_counter()
    time_history_ms = round((t_hist_1 - t_hist_0) * 1000.0, 1)

    time_prompt_ms = verification_res.timings.get("prompt_building_ms", 0.0)
    time_gemini_ms = verification_res.timings.get("gemini_api_ms", 0.0)
    time_analytics_ms = 0.0

    total_time_ms = round((time.perf_counter() - t_clean_0) * 1000.0, 1)

    logger.info(
        "\n=====================================\n"
        "Timing Summary (Research)\n"
        "=====================================\n"
        f"Text Cleaning ............ {time_cleaning_ms:5.1f} ms\n"
        f"Transformer Models ....... {time_ml_ms:5.1f} ms\n"
        f"Search ................... {time_search_ms:5.1f} ms\n"
        f"Evidence Retrieval ....... {time_retrieval_ms:5.1f} ms\n"
        f"Prompt Building .......... {time_prompt_ms:5.1f} ms\n"
        f"Gemini API ............... {time_gemini_ms:5.1f} ms\n"
        f"History Save ............. {time_history_ms:5.1f} ms\n"
        f"Analytics Update ......... {time_analytics_ms:5.1f} ms\n"
        f"Total .................... {total_time_ms:5.1f} ms\n"
        "====================================="
    )

    return response



def get_history_items() -> List[HistoryItem]:
    with _history_lock:
        history_snapshot = list(_prediction_history)

    return [HistoryItem(**item) for item in history_snapshot]


def get_analytics_metrics() -> AnalyticsResponse:
    with _history_lock:
        history_snapshot = list(_prediction_history)

    total = len(history_snapshot)
    fake_count = sum(1 for item in history_snapshot if item["prediction"] == "Fake")
    real_count = total - fake_count
    average_confidence = round(mean(item["confidence"] for item in history_snapshot), 1) if history_snapshot else 0.0
    average_inference_time = round(mean(item["inference_time"] for item in history_snapshot), 1) if history_snapshot else 0.0

    model_confidence_totals: Dict[str, List[float]] = {}
    for item in history_snapshot:
        model_confidence_totals.setdefault(item["model_used"], []).append(item["confidence"])

    model_performance_bar = {
        model_name: round(mean(values), 1)
        for model_name, values in model_confidence_totals.items()
    }

    timeline_line: List[Dict[str, Any]] = []
    grouped_by_date: Dict[str, List[Dict[str, Any]]] = {}
    for item in history_snapshot:
        grouped_by_date.setdefault(item["date"], []).append(item)

    for date_key in sorted(grouped_by_date.keys()):
        day_records = grouped_by_date[date_key]
        day_total = len(day_records)
        day_fake = sum(1 for item in day_records if item["prediction"] == "Fake")
        day_real = day_total - day_fake
        day_avg_conf = round(mean(item["confidence"] for item in day_records), 1)
        timeline_line.append(
            {
                "date": date_key,
                "total": day_total,
                "fake": day_fake,
                "real": day_real,
                "avgConfidence": day_avg_conf,
            }
        )

    return AnalyticsResponse(
        total_predictions=total,
        fake_percentage=round((fake_count / total) * 100.0, 1) if total else 0.0,
        real_percentage=round((real_count / total) * 100.0, 1) if total else 0.0,
        average_confidence=average_confidence,
        average_inference_time=average_inference_time,
        distribution_pie={"Fake": fake_count, "Real": real_count},
        model_performance_bar=model_performance_bar,
        timeline_line=timeline_line,
        current_mode=history_snapshot[0]["mode"] if history_snapshot else "production",
    )

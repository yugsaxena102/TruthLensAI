from __future__ import annotations

import re
import time
import logging
logger = logging.getLogger("truthlens")
from collections import Counter
from typing import Any, Dict, List

from ai.inference.config import CLASSES, MAX_TEXT_CHARACTERS
from ai.inference.model_loader import model_loader
from ai.inference.preprocess import clean_text
from ai.inference.tokenizer import tokenize_text


SUSPICIOUS_KEYWORDS = [
    "breaking",
    "exclusive",
    "shocking",
    "viral",
    "conspiracy",
    "secret",
    "unbelievable",
    "exposed",
    "insider",
    "hoax",
    "rumor",
]

TRUSTED_KEYWORDS = [
    "study",
    "research",
    "published",
    "scientific",
    "reuters",
    "official",
    "announced",
    "reported",
    "journal",
    "data",
    "according",
]


def _normalize_prediction_label(label: Any, predicted_index: int) -> str:
    if isinstance(label, str):
        normalized = label.strip().lower()
        if "fake" in normalized:
            return "Fake"
        if "real" in normalized:
            return "Real"
        if normalized.endswith("1"):
            return "Fake"
        if normalized.endswith("0"):
            return "Real"

    return CLASSES[predicted_index] if predicted_index < len(CLASSES) else "Real"


def extract_keywords(text: str, limit: int = 4) -> List[str]:
    cleaned_text = clean_text(text)
    found = [keyword for keyword in SUSPICIOUS_KEYWORDS + TRUSTED_KEYWORDS if keyword in cleaned_text]
    if found:
        return found[:limit]

    tokens = re.findall(r"\b\w{4,}\b", cleaned_text)
    if not tokens:
        return ["neutral", "balanced", "structured"][:limit]

    return [word for word, _ in Counter(tokens).most_common(limit)]


def _predict_transformer(model_name: str, text: str) -> Dict[str, Any]:
    if not text or not text.strip():
        raise ValueError("Text cannot be empty.")

    if len(text) > MAX_TEXT_CHARACTERS:
        text = text[:MAX_TEXT_CHARACTERS]

    bundle = model_loader.get_transformer_bundle(model_name)
    cleaned_text = clean_text(text)

    try:
        import torch
    except ImportError as exc:
        raise RuntimeError("torch is required for prediction") from exc

    encoded_inputs = tokenize_text(cleaned_text, bundle.tokenizer)
    encoded_inputs = {key: value.to(bundle.device) for key, value in encoded_inputs.items()}

    start_time = time.perf_counter()
    with torch.no_grad():
        outputs = bundle.model(**encoded_inputs)
        logits = outputs.logits if hasattr(outputs, "logits") else outputs[0]
        probabilities = torch.softmax(logits, dim=-1)[0]
        confidence_tensor, predicted_index_tensor = torch.max(probabilities, dim=-1)

    inference_time_ms = round((time.perf_counter() - start_time) * 1000.0, 1)
    predicted_index = int(predicted_index_tensor.item())
    confidence = round(float(confidence_tensor.item()) * 100.0, 1)

    config_labels = getattr(getattr(bundle.model, "config", None), "id2label", {}) or {}
    predicted_label = _normalize_prediction_label(config_labels.get(predicted_index), predicted_index)
    keywords = extract_keywords(text)

    if predicted_label == "Fake":
        reason = (
            f"The {bundle.name.upper()} model flagged the article as Fake with {confidence}% confidence "
            f"after detecting language patterns associated with {', '.join(keywords)}."
        )
    else:
        reason = (
            f"The {bundle.name.upper()} model classified the article as Real with {confidence}% confidence "
            f"based on a comparatively structured and factual writing pattern."
        )

    return {
        "prediction": predicted_label,
        "confidence": confidence,
        "inference_time_ms": inference_time_ms,
        "keywords": keywords,
        "reason": reason,
    }


def predict_bert(text: str) -> Dict[str, Any]:
    return _predict_transformer("bert", text)


def predict_distilbert(text: str) -> Dict[str, Any]:
    return _predict_transformer("distilbert", text)


def predict_roberta(text: str) -> Dict[str, Any]:
    return _predict_transformer("roberta", text)


def predict_xgboost(text: str) -> Dict[str, Any]:
    if not text or not text.strip():
        raise ValueError("Text cannot be empty.")
    
    start_time = time.perf_counter()
    
    # Load ML components
    ml_bundle = model_loader.load_ml_model()
    model = ml_bundle["model"]
    vectorizer = ml_bundle["vectorizer"]
    
    # Log model metadata for proof of saved model usage
    import os
    import datetime
    model_path = ml_bundle["path"]
    file_stat = os.stat(model_path)
    logger.info("--- XGBoost Model Loading Evidence ---")
    logger.info("Model File Path: %s", model_path)
    logger.info("Model File Name: %s", os.path.basename(model_path))
    logger.info("Modification Timestamp: %s", datetime.datetime.fromtimestamp(file_stat.st_mtime))
    logger.info("Model Type: %s", type(model))
    logger.info("---------------------------------------")
    
    # Preprocess
    cleaned_text = clean_text(text)
    
    # Vectorize and Predict
    features = vectorizer.transform([cleaned_text])
    
    # Verify predict() is called on the existing instance
    prediction_prob = model.predict_proba(features)[0]
    predicted_index = int(model.predict(features)[0])
    
    confidence = round(float(prediction_prob[predicted_index]) * 100.0, 1)
    
    inference_time_ms = round((time.perf_counter() - start_time) * 1000.0, 1)
    
    predicted_label = "Fake" if predicted_index == 1 else "Real"
    
    return {
        "prediction": predicted_label,
        "confidence": confidence,
        "inference_time_ms": inference_time_ms,
        "model_name": "XGBoost",
    }


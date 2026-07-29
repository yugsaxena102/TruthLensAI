from typing import Any, Dict, List, Union, Optional

from pydantic import BaseModel, Field


# ----------------------------------------------------------------------
# Common Models
# ----------------------------------------------------------------------

class ModelPrediction(BaseModel):
    prediction: str = Field(
        ...,
        description="Predicted label (Fake or Real)."
    )
    confidence: float = Field(
        ...,
        description="Model confidence score in percentage (0-100)."
    )


# ----------------------------------------------------------------------
# Verification Models
# ----------------------------------------------------------------------

class VerificationSource(BaseModel):
    name: str = Field(
        ...,
        description="Trusted source name."
    )
    url: str = Field(
        ...,
        description="Source article URL."
    )


class VerificationResponse(BaseModel):
    verdict: str = Field(
        ...,
        description="Final evidence-based verdict."
    )
    confidence: float = Field(
        ...,
        description="Verification confidence score."
    )
    summary: str = Field(
        ...,
        description="Short summary of the verification."
    )
    reasoning: str = Field(
        ...,
        description="Detailed reasoning based on retrieved evidence."
    )
    sources: List[VerificationSource] = Field(
        default_factory=list,
        description="Trusted evidence sources used for verification."
    )


# ----------------------------------------------------------------------
# Production Response
# ----------------------------------------------------------------------

class ProductionResponse(BaseModel):
    mode: str = Field(
        "production",
        description="Workflow prediction mode."
    )
    model: str = Field(
        "RoBERTa",
        description="The deployed model used."
    )
    prediction: str = Field(
        ...,
        description="Prediction label (Fake or Real)."
    )
    confidence: float = Field(
        ...,
        description="RoBERTa confidence score."
    )
    inference_time: str = Field(
        ...,
        description="Calculation speed metric."
    )
    keywords: List[str] = Field(
        ...,
        description="Explainable AI extracted keywords."
    )
    reason: str = Field(
        ...,
        description="Reasoning statement from the ML model."
    )

    verification: VerificationResponse = Field(
        ...,
        description="Evidence-based verification generated using retrieved trusted sources and Gemini."
    )

    status: str = Field(
        "success",
        description="Calculation status."
    )


# ----------------------------------------------------------------------
# Research Response
# ----------------------------------------------------------------------

class ResearchResponse(BaseModel):
    mode: str = Field(
        "research",
        description="Workflow prediction mode."
    )

    bert: ModelPrediction = Field(
        ...,
        description="BERT prediction details."
    )

    distilbert: ModelPrediction = Field(
        ...,
        description="DistilBERT prediction details."
    )

    roberta: ModelPrediction = Field(
        ...,
        description="RoBERTa prediction details."
    )

    xgboost: Optional[ModelPrediction] = Field(
        None,
        description="XGBoost prediction details."
    )

    majority_voting: str = Field(
        ...,
        description="Ensemble majority voting label."
    )

    final_prediction: str = Field(
        ...,
        description="Consensus prediction outcome."
    )

    comparison: Dict[str, Any] = Field(
        ...,
        description="Comparison details of model confidences."
    )

    verification: VerificationResponse = Field(
        ...,
        description="Evidence-based verification."
    )

    status: str = Field(
        "success",
        description="Calculation status."
    )


# ----------------------------------------------------------------------
# Batch Response
# ----------------------------------------------------------------------

class BatchPredictResponse(BaseModel):
    predictions: List[Union[ProductionResponse, ResearchResponse]]


# ----------------------------------------------------------------------
# Analytics Response
# ----------------------------------------------------------------------

class AnalyticsResponse(BaseModel):
    total_predictions: int = Field(
        ...,
        description="Total prediction queries processed."
    )
    fake_percentage: float = Field(
        ...,
        description="Fake news percentage."
    )
    real_percentage: float = Field(
        ...,
        description="Real news percentage."
    )
    average_confidence: float = Field(
        ...,
        description="Average confidence score."
    )
    average_inference_time: float = Field(
        ...,
        description="Average inference time in milliseconds."
    )
    distribution_pie: Dict[str, int] = Field(
        ...,
        description="Fake vs Real label quantities."
    )
    model_performance_bar: Dict[str, float] = Field(
        ...,
        description="Average confidence margins per model."
    )
    timeline_line: List[Dict[str, Any]] = Field(
        ...,
        description="Timeline tracking datasets."
    )
    current_mode: str = Field(
        "production",
        description="The current active mode badge."
    )


# ----------------------------------------------------------------------
# History
# ----------------------------------------------------------------------

class HistoryItem(BaseModel):
    id: str = Field(
        ...,
        description="Unique code identifier."
    )
    date: str = Field(
        ...,
        description="Date of calculation."
    )
    time: str = Field(
        ...,
        description="Time of calculation."
    )
    input_text: str = Field(
        ...,
        description="Full prediction input text."
    )
    text_snippet: str = Field(
        ...,
        description="Snippet of scanned text."
    )
    prediction: str = Field(
        ...,
        description="Final prediction outcome."
    )
    confidence: float = Field(
        ...,
        description="Average confidence rating."
    )
    mode: str = Field(
        ...,
        description="Prediction mode used."
    )
    model_used: str = Field(
        ...,
        description="Machine Learning models applied."
    )
    inference_time: float = Field(
        ...,
        description="Inference time in milliseconds."
    )
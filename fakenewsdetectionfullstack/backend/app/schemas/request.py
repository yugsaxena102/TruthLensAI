from typing import List, Literal

from pydantic import BaseModel, Field

class PredictRequest(BaseModel):
    text: str = Field(..., description="The news article content text to analyze.")
    mode: Literal["production", "research"] = Field("production", description="Prediction workflow mode (production or research).")

class BatchPredictRequest(BaseModel):
    texts: List[str] = Field(..., description="List of news article content texts to analyze.")
    mode: Literal["production", "research"] = Field("production", description="Prediction workflow mode (production or research).")

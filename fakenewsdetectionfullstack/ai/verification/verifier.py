"""
verifier.py

Final evidence verification module.

Responsibilities
----------------
- Send evidence to Gemini
- Parse JSON response
- Return structured verification result

This module never performs search or retrieval.
"""

from __future__ import annotations

import json
import logging
import os
from dataclasses import dataclass, asdict, field
from typing import Any, Dict, List, Optional
import time

from dotenv import load_dotenv
from google import genai

from ai.retrieval.retriever import Evidence
from ai.verification.prompts import build_verification_prompt

# ----------------------------------------------------------------------
# Environment
# ----------------------------------------------------------------------

load_dotenv()

# ----------------------------------------------------------------------
# CONSTANTS
# ----------------------------------------------------------------------

GEMINI_MODEL = "gemini-3.5-flash-lite"

MAX_RETRIES = 3

ALLOWED_VERDICTS = {"Verified", "False", "Misleading", "Insufficient Evidence"}

# ----------------------------------------------------------------------
# Logger
# ----------------------------------------------------------------------

logger = logging.getLogger("truthlens.verifier")


# ----------------------------------------------------------------------
# Helper Parsing Functions
# ----------------------------------------------------------------------

def _clean_json_string(text: str) -> str:
    """
    Strip markdown code fences and extract valid JSON string.
    """
    if not text:
        return ""

    cleaned = text.strip()

    # Strip code block wrappers
    if cleaned.startswith("```json"):
        cleaned = cleaned[7:]
    elif cleaned.startswith("```"):
        cleaned = cleaned[3:]

    if cleaned.endswith("```"):
        cleaned = cleaned[:-3]

    cleaned = cleaned.strip()

    # If direct load works, return immediately
    try:
        json.loads(cleaned)
        return cleaned
    except Exception:
        # Locate outer braces if extra text surrounds JSON
        first_brace = cleaned.find("{")
        last_brace = cleaned.rfind("}")
        if first_brace != -1 and last_brace > first_brace:
            return cleaned[first_brace: last_brace + 1]

    return cleaned


def _normalize_verdict(raw_verdict: Any) -> str:
    """
    Normalize raw verdict string into one of the 4 allowed verdicts.
    Defaults to 'Insufficient Evidence' if unrecognized.
    """
    if not raw_verdict or not isinstance(raw_verdict, str):
        return "Insufficient Evidence"

    v = raw_verdict.strip().lower()

    if v in ("verified", "true", "real", "supported", "yes"):
        return "Verified"
    elif v in ("false", "fake", "untrue", "debunked", "no"):
        return "False"
    elif v in ("misleading", "partially true", "half true", "exaggerated", "partial"):
        return "Misleading"
    elif v in ("insufficient evidence", "insufficient", "unknown", "unclear", "unverified"):
        return "Insufficient Evidence"

    return "Insufficient Evidence"


def _parse_confidence(raw_conf: Any) -> float:
    """
    Parse raw confidence into a float safely clamped between 0.0 and 100.0.
    """
    if raw_conf is None:
        return 0.0

    try:
        if isinstance(raw_conf, (int, float)):
            val = float(raw_conf)
        else:
            conf_str = str(raw_conf).strip().rstrip("%").strip()
            val = float(conf_str)

        return max(0.0, min(val, 100.0))
    except Exception:
        return 0.0


def _process_sources(raw_sources: Any) -> List[SourceReference]:
    """
    Deduplicate, clean, and limit sources to a maximum of 5 entries.
    """
    sources: List[SourceReference] = []
    seen_urls = set()

    if not isinstance(raw_sources, list):
        return sources

    for item in raw_sources:
        if not isinstance(item, dict):
            continue

        raw_url = item.get("url", "")
        if not isinstance(raw_url, str):
            continue

        url = raw_url.strip()
        if not url:
            continue

        norm_url = url.lower().rstrip("/")
        if norm_url in seen_urls:
            continue

        seen_urls.add(norm_url)

        name = item.get("name", "Unknown")
        if not isinstance(name, str) or not name.strip():
            name = "Unknown"
        else:
            name = name.strip()

        sources.append(
            SourceReference(
                name=name,
                url=url,
            )
        )

        if len(sources) >= 5:
            break

    return sources


# ----------------------------------------------------------------------
# Dataclasses
# ----------------------------------------------------------------------

@dataclass
class SourceReference:

    name: str

    url: str

    def to_dict(self):

        return asdict(self)


@dataclass
class VerificationResult:

    verdict: str

    confidence: float

    summary: str

    reasoning: str

    sources: List[SourceReference]

    timings: Dict[str, float] = field(default_factory=dict)

    def to_dict(self):

        return {

            "verdict": self.verdict,

            "confidence": self.confidence,

            "summary": self.summary,

            "reasoning": self.reasoning,

            "sources": [

                source.to_dict()

                for source in self.sources

            ],

        }


# ----------------------------------------------------------------------
# Verification Service
# ----------------------------------------------------------------------

class VerificationService:

    def __init__(self):

        api_key = os.getenv("GEMINI_API_KEY")

        if not api_key:

            raise RuntimeError(

                "GEMINI_API_KEY not found in environment."

            )

        self.client = genai.Client(

            api_key=api_key

        )

        logger.info(

            "VerificationService initialized successfully."

        )

    # ----------------------------------------------------------------------
    # Gemini API
    # ----------------------------------------------------------------------

    def _call_gemini(
        self,
        prompt: str,
        retries: int = MAX_RETRIES,
    ) -> str:
        """
        Call Gemini and return raw text response with retries.
        """
        logger.info("Sending prompt to Gemini (length: %d chars)...", len(prompt))

        last_error = None

        for attempt in range(1, retries + 1):

            try:

                response = self.client.models.generate_content(

                    model=GEMINI_MODEL,

                    contents=prompt,

                    config={

                        "temperature": 0,

                        "response_mime_type": "application/json",

                        "automatic_function_calling": {"disable": True},

                    },

                )

                if not response or not response.text:

                    raise RuntimeError(
                        "Gemini returned an empty response."
                    )

                logger.info(
                    "Gemini verification API call completed."
                )

                return response.text

            except Exception as e:

                last_error = e

                logger.warning(

                    "Gemini attempt %d/%d failed: %s",

                    attempt,

                    retries,

                    e,

                )

        raise RuntimeError(f"Gemini verification failed after {retries} attempts: {last_error}")

    # ----------------------------------------------------------------------
    # JSON Parser
    # ----------------------------------------------------------------------

    def _parse_response(
        self,
        response_text: str,
    ) -> VerificationResult:
        """
        Parse Gemini JSON response into VerificationResult safely.
        """
        if not response_text:
            logger.error("Empty response text passed to _parse_response.")
            return VerificationResult(
                verdict="Insufficient Evidence",
                confidence=0.0,
                summary="Empty response received from verification service.",
                reasoning="Verification failed due to empty response text.",
                sources=[],
            )

        cleaned_text = _clean_json_string(response_text)

        try:

            data = json.loads(cleaned_text)

            if not isinstance(data, dict):
                raise ValueError("Parsed JSON root is not a dictionary.")

            logger.info("JSON parsing succeeded.")

        except Exception as e:

            logger.error("Invalid JSON from Gemini: %s", e)

            return VerificationResult(
                verdict="Insufficient Evidence",
                confidence=0.0,
                summary="Failed to parse verification response.",
                reasoning=f"The verification response could not be processed.",
                sources=[],
            )

        raw_verdict = data.get("verdict", "Insufficient Evidence")
        verdict = _normalize_verdict(raw_verdict)

        raw_confidence = data.get("confidence", 0.0)
        confidence = _parse_confidence(raw_confidence)

        summary = str(data.get("summary", "")).strip()
        reasoning = str(data.get("reasoning", "")).strip()

        sources = _process_sources(data.get("sources", []))

        logger.info("Verification result parsing summary:")
        logger.info("  Final Verdict   : %s", verdict)
        logger.info("  Final Confidence: %.1f%%", confidence)
        logger.info("  Sources Count   : %d", len(sources))

        return VerificationResult(

            verdict=verdict,

            confidence=confidence,

            summary=summary,

            reasoning=reasoning,

            sources=sources,

        )

    # ----------------------------------------------------------------------
    # Verification Pipeline
    # ----------------------------------------------------------------------

    def verify(
        self,
        claim: str,
        prediction: str,
        confidence: float,
        evidence: List[Evidence],
    ) -> VerificationResult:
        """
        Complete verification pipeline.
        """
        num_evidence = len(evidence) if evidence else 0
        logger.info("Verifying claim with %d evidence articles.", num_evidence)

        if not evidence:

            logger.warning(
                "No evidence available for claim verification."
            )

            return VerificationResult(

                verdict="Insufficient Evidence",

                confidence=0.0,

                summary="No trusted evidence was retrieved.",

                reasoning=(
                    "The search and retrieval pipeline "
                    "could not find reliable evidence."
                ),

                sources=[],

            )

        t0 = time.perf_counter()
        prompt = build_verification_prompt(

            claim=claim,

            prediction=prediction,

            confidence=confidence,

            evidence=evidence,

        )
        t1 = time.perf_counter()

        raw_response = self._call_gemini(prompt)
        t2 = time.perf_counter()

        result = self._parse_response(raw_response)

        result.timings = {
            "prompt_building_ms": round((t1 - t0) * 1000.0, 1),
            "gemini_api_ms": round((t2 - t1) * 1000.0, 1)
        }

        logger.info(
            "Verification completed."
        )

        return result


# ----------------------------------------------------------------------
# Singleton
# ----------------------------------------------------------------------

_verification_service: Optional[VerificationService] = None


# ----------------------------------------------------------------------
# Public API
# ----------------------------------------------------------------------

def run_verification(
    claim: str,
    prediction: str,
    confidence: float,
    evidence: List[Evidence],
) -> VerificationResult:

    global _verification_service

    if _verification_service is None:

        _verification_service = VerificationService()

    return _verification_service.verify(

        claim,

        prediction,

        confidence,

        evidence,

    )


# ----------------------------------------------------------------------
# Local Test
# ----------------------------------------------------------------------

if __name__ == "__main__":

    from ai.retrieval.search import run_search
    from ai.retrieval.retriever import run_retriever

    claim = "NASA confirms water on Mars"

    search_results = run_search(claim)

    evidence = run_retriever(

        claim,

        search_results,

    )

    result = run_verification(

        claim,

        "Real",

        96.2,

        evidence,

    )

    print()

    print("=" * 80)

    print(result.to_dict())

    print("=" * 80)
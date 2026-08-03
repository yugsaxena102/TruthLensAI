"""
retriever.py

Evidence retrieval module for TruthLens AI.

Responsibilities
----------------
- Download news articles
- Extract readable article text
- Clean extracted content
- Build evidence objects for verification

This module DOES NOT:
- Search the web
- Predict fake news
- Call LLMs
"""

from __future__ import annotations

from concurrent.futures import ThreadPoolExecutor, as_completed
import logging
import re
from dataclasses import dataclass, asdict
from typing import List, Dict, Any, Optional

import requests
import trafilatura
from bs4 import BeautifulSoup

from ai.retrieval.search import SearchResult

# ----------------------------------------------------------------------
# Logger
# ----------------------------------------------------------------------

logger = logging.getLogger("truthlens.retriever")

# ----------------------------------------------------------------------
# Constants
# ----------------------------------------------------------------------

REQUEST_TIMEOUT = 30

MIN_CONTENT_LENGTH = 300

USER_AGENT = (
    "Mozilla/5.0 "
    "(Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 "
    "(KHTML, like Gecko) "
    "Chrome/138.0 Safari/537.36"
)

MAX_WORKERS = 10

MAX_CONTENT_LENGTH = 500

BLOCKED_PATTERNS = (
    "access denied",
    "403 forbidden",
    "404 page not found",
    "page not found",
    "enable javascript",
    "please enable javascript",
    "subscribe to continue",
    "sign in to continue",
    "login to continue",
    "robot check",
    "checking your browser",
    "cloudflare",
    "please wait...",
    "too many requests",
    "attention required! | cloudflare",
    "cookie policy",
    "privacy policy",
    "accept cookies",
    "consent",
    "javascript required",
    "verify you are human",
    "captcha",
    "please verify",
    "human verification",
    "browser is unsupported",
    "service unavailable",
    "temporarily unavailable",
    "bad gateway",
    "gateway timeout",
    "internal server error",
)

NOISE_PATTERNS = re.compile(
    r"^\s*(?:advertisement|advertisements|sponsored|read more|continue reading|related articles|related stories|share|share this article|follow us|sign up|newsletter)\s*$",
    re.IGNORECASE,
)


# ----------------------------------------------------------------------
# Helper Functions
# ----------------------------------------------------------------------

def _clean_content(text: str) -> str:
    """
    Clean and normalize extracted article text.
    Collapses spaces, removes excessive newlines, trims whitespace,
    and strips obvious non-article noise labels.
    """
    if not text:
        return ""

    # Replace carriage returns and tabs
    cleaned = text.replace("\r", "\n").replace("\t", " ")

    # Remove standalone boilerplate noise lines
    lines = cleaned.split("\n")
    filtered_lines = []
    for line in lines:
        stripped_line = line.strip()
        if stripped_line and not NOISE_PATTERNS.match(stripped_line):
            filtered_lines.append(stripped_line)

    cleaned_text = " ".join(filtered_lines)
    cleaned_text = " ".join(cleaned_text.split())

    return cleaned_text.strip()


def _truncate_content(text: str, max_length: int = MAX_CONTENT_LENGTH) -> str:
    """
    Truncate content near a sentence or word boundary up to max_length.
    """
    text = text.strip()
    if len(text) <= max_length:
        return text

    truncated = text[:max_length]

    # Try finding last sentence boundary (. ! ?) within the last 300 characters
    last_punct = max(
        truncated.rfind(". "),
        truncated.rfind("! "),
        truncated.rfind("? "),
    )

    if last_punct > max_length - 300:
        return truncated[: last_punct + 1].strip()

    # Fallback to last word boundary (space)
    last_space = truncated.rfind(" ")
    if last_space > 0:
        return truncated[:last_space].strip()

    return truncated.strip()


# ----------------------------------------------------------------------
# Evidence Dataclass
# ----------------------------------------------------------------------

@dataclass
class Evidence:
    """
    Clean evidence passed to verifier.py
    """

    title: str

    url: str

    source: str

    content: str

    score: float

    published_date: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


# ----------------------------------------------------------------------
# Retrieval Service
# ----------------------------------------------------------------------

class RetrievalService:
    """
    Downloads articles and extracts evidence.
    """

    def __init__(self):

        self.session = requests.Session()

        self.session.headers.update({
            "User-Agent": USER_AGENT
        })

        logger.info("RetrievalService initialized.")

    def _normalize_url(
        self,
        url: str,
    ) -> str:

        url = url.lower()

        if "?" in url:
            url = url.split("?")[0]

        if "#" in url:
            url = url.split("#")[0]

        if url.endswith("/"):
            url = url[:-1]

        return url

    # ------------------------------------------------------------------
    # Download Article
    # ------------------------------------------------------------------

    def _download_article(self, url: str) -> Optional[str]:
        """
        Download article HTML with a single retry on failure.
        """
        max_attempts = 2

        for attempt in range(1, max_attempts + 1):
            try:
                if attempt > 1:
                    logger.warning("Retry performed for: %s", url)
                else:
                    logger.info("Downloading article: %s", url)

                response = self.session.get(
                    url,
                    timeout=REQUEST_TIMEOUT,
                    allow_redirects=True,
                )

                response.raise_for_status()

                return response.text

            except requests.RequestException as e:
                if attempt < max_attempts:
                    logger.warning(
                        "Download attempt %d failed for %s: %s. Retrying...",
                        attempt,
                        url,
                        e,
                    )
                else:
                    logger.warning(
                        "Failed to download %s after %d attempts: %s",
                        url,
                        max_attempts,
                        e,
                    )

        return None

    # ------------------------------------------------------------------
    # Trafilatura Extraction
    # ------------------------------------------------------------------

    def _extract_with_trafilatura(
        self,
        html: str,
    ) -> Optional[str]:
        """
        Extract main article using Trafilatura.
        """

        try:

            text = trafilatura.extract(

                html,

                include_comments=False,

                include_tables=False,

                favor_precision=True,

            )

            if text:

                text = text.strip()

            return text

        except Exception as e:

            logger.warning(

                "Trafilatura extraction failed: %s",

                e,

            )

            return None

    # ------------------------------------------------------------------
    # BeautifulSoup Fallback
    # ------------------------------------------------------------------

    def _extract_with_bs4(
        self,
        html: str,
    ) -> Optional[str]:
        """
        Fallback extraction if Trafilatura fails.
        """

        try:

            soup = BeautifulSoup(

                html,

                "html.parser",

            )

            for tag in soup(

                [

                    "script",

                    "style",

                    "noscript",

                    "header",

                    "footer",

                    "nav",

                    "aside",

                ]

            ):

                tag.decompose()

            text = soup.get_text(

                separator=" ",

                strip=True,

            )

            return text

        except Exception as e:

            logger.warning(

                "BeautifulSoup extraction failed: %s",

                e,

            )

            return None

    # ------------------------------------------------------------------
    # Extract Article
    # ------------------------------------------------------------------

    def _extract_article(
        self,
        html: str,
    ) -> Optional[str]:
        """
        Extract article text using Trafilatura with BS4 fallback.
        """

        article = self._extract_with_trafilatura(html)

        if article:
            logger.info("Extraction method used: Trafilatura")
            return article

        logger.info("Falling back to BeautifulSoup extraction.")

        bs4_article = self._extract_with_bs4(html)
        if bs4_article:
            logger.info("Extraction method used: BeautifulSoup")

        return bs4_article

    # ------------------------------------------------------------------
    # Validate Content
    # ------------------------------------------------------------------

    def _is_valid_content(
        self,
        text: Optional[str],
    ) -> bool:
        """
        Validate extracted article text for length and quality.
        Rejects low-quality error pages, paywalls, and Cloudflare blocks.
        """
        if not text:
            return False

        if len(text) < MIN_CONTENT_LENGTH:
            return False

        text_lower = text.lower()
        first_chunk = text_lower[:600]

        for pattern in BLOCKED_PATTERNS:
            if pattern in first_chunk:
                logger.warning("Content rejected (blocked pattern '%s')", pattern)
                return False

        return True

    # ------------------------------------------------------------------
    # Build Evidence
    # ------------------------------------------------------------------

    def _build_evidence(
        self,
        result: SearchResult,
    ) -> Optional[Evidence]:
        """
        Download, extract and convert a SearchResult into Evidence.
        Uses raw_content if available and valid to avoid downloading.
        """
        logger.info("Processing URL: %s", result.url)

        # 1. Try raw_content from SearchResult safely
        raw_content = getattr(result, "raw_content", None) or getattr(result, "content", None)

        if isinstance(raw_content, str) and raw_content.strip():
            cleaned_raw = _clean_content(raw_content)
            if self._is_valid_content(cleaned_raw):
                logger.info("raw_content accepted for: %s", result.url)
                logger.info("Using raw_content for: %s", result.url)
                final_content = _truncate_content(cleaned_raw, MAX_CONTENT_LENGTH)
                logger.info("Content length: %d chars", len(final_content))
                logger.info("Final evidence size: %d chars for %s", len(final_content), result.url)
                logger.info("Evidence accepted for: %s", result.url)
                return Evidence(
                    title=result.title,
                    url=result.url,
                    source=result.source,
                    content=final_content,
                    score=result.score,
                    published_date=result.published_date,
                )
            else:
                logger.info("raw_content rejected for: %s (falling back to download)", result.url)

        # 2. Download article HTML if raw_content is unavailable or invalid
        html = self._download_article(result.url)

        if html is None:
            logger.warning("Content rejected (download failed): %s", result.url)
            return None

        article = self._extract_article(html)

        del html

        cleaned_article = _clean_content(article) if article else ""

        if not self._is_valid_content(cleaned_article):
            logger.warning("Content rejected (invalid content): %s", result.url)
            return None

        final_content = _truncate_content(cleaned_article, MAX_CONTENT_LENGTH)

        logger.info("Content length: %d chars", len(final_content))
        logger.info("Final evidence size: %d chars for %s", len(final_content), result.url)
        logger.info("Evidence accepted for: %s", result.url)

        return Evidence(
            title=result.title,
            url=result.url,
            source=result.source,
            content=final_content,
            score=result.score,
            published_date=result.published_date,
        )

    # ------------------------------------------------------------------
    # Retrieve Evidence
    # ------------------------------------------------------------------

    def retrieve(
        self,
        claim: str,
        search_results: List[SearchResult],
    ) -> List[Evidence]:

        evidence_list: List[Evidence] = []

        seen_urls = set()

        with ThreadPoolExecutor(
            max_workers=MAX_WORKERS
        ) as executor:

            futures = {
                executor.submit(
                    self._build_evidence,
                    result,
                ): result
                for result in search_results
            }

            for future in as_completed(futures):
                try:
                    evidence = future.result()

                    if evidence is None:
                        continue

                    normalized = self._normalize_url(
                        evidence.url
                    )

                    if normalized in seen_urls:
                        continue

                    seen_urls.add(normalized)

                    evidence_list.append(evidence)

                except Exception as e:
                    logger.warning(
                        "Evidence retrieval failed: %s",
                        e,
                    )

        evidence_list.sort(
            key=lambda x: x.score,
            reverse=True,
        )

        logger.info(
            "Retrieved %d evidence articles.",
            len(evidence_list),
        )

        return evidence_list


# ----------------------------------------------------------------------
# Backward Compatible API
# ----------------------------------------------------------------------

_retrieval_service: Optional[RetrievalService] = None


def run_retriever(
    claim: str,
    search_results: List[SearchResult],
) -> List[Evidence]:

    global _retrieval_service

    if _retrieval_service is None:
        _retrieval_service = RetrievalService()

    return _retrieval_service.retrieve(
        claim,
        search_results,
    )


# ----------------------------------------------------------------------
# Local Testing
# ----------------------------------------------------------------------

if __name__ == "__main__":

    from ai.retrieval.search import run_search

    claim = "NASA confirms water on Mars"

    results = run_search(claim)

    evidence = run_retriever(
        claim,
        results,
    )
    print()

    print("=" * 80)

    print(f"Evidence Found: {len(evidence)}")

    print("=" * 80)

    for item in evidence:

        print()

        print(item.source)

        print(item.title)

        print(item.url)

        print(item.content[:300])

        print("-" * 80)
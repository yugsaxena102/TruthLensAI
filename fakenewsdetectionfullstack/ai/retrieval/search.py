"""
search.py

Internet search module for TruthLens AI.

Responsibilities
----------------
- Generate optimized search queries.
- Search trusted news sources using Tavily.
- Filter trusted domains.
- Remove duplicate results.
- Return normalized search results.

This module DOES NOT perform:
- Embedding generation
- LLM reasoning
- Prediction

Those are handled by:
    retriever.py
    verifier.py
"""

from __future__ import annotations

import logging
import os
import re
from dataclasses import dataclass, asdict
from typing import List, Dict, Any, Optional

import spacy
import yake
from dotenv import load_dotenv
from tavily import TavilyClient

from ai.retrieval.trusted_sources import (
    is_trusted_source,
    get_source_metadata,
    get_priority,
)

# ----------------------------------------------------------------------
# Load Environment Variables
# ----------------------------------------------------------------------

load_dotenv()

# ----------------------------------------------------------------------
# Logger
# ----------------------------------------------------------------------

logger = logging.getLogger("truthlens.search")

# ----------------------------------------------------------------------
# spaCy Model Initialization (Loaded ONCE at module import time)
# ----------------------------------------------------------------------

try:
    NLP = spacy.load("en_core_web_sm")
except OSError:
    raise RuntimeError(
        "spaCy model not found.\n"
        "Run:\n"
        "python -m spacy download en_core_web_sm"
    )

KEYWORD_EXTRACTOR = yake.KeywordExtractor(
    lan="en",
    n=2,
    dedupLim=0.9,
    top=10,
    features=None,
)

# ----------------------------------------------------------------------
# Constants
# ----------------------------------------------------------------------

MAX_RESULTS = 5

SEARCH_DEPTH = "advanced"

INCLUDE_RAW_CONTENT = True

TIMEOUT_SECONDS = 30

MAX_QUERY_LENGTH = 350

BASE_QUERY_MAX_LENGTH = 300

LONG_ARTICLE_THRESHOLD = 500

ALLOWED_ENTITIES = {"ORG", "PERSON", "GPE", "LOC", "EVENT", "PRODUCT", "NORP"}

TINY_STOP_WORDS = {
    "a", "an", "the", "in", "on", "at", "to", "for", "of", "and", "or", "is", "are",
    "was", "were", "be", "been", "by", "with", "about", "against", "between", "into",
    "through", "during", "before", "after", "above", "below", "from", "up", "down",
    "out", "off", "over", "under", "again", "further", "then", "once", "here",
    "there", "when", "where", "why", "how", "all", "any", "both", "each", "few",
    "more", "most", "other", "some", "such", "no", "nor", "not", "only", "own",
    "same", "so", "than", "too", "very", "s", "t", "can", "will", "just", "don",
    "should", "now", "it", "its", "this", "that", "these", "those"
}


# ----------------------------------------------------------------------
# Text Helper Functions
# ----------------------------------------------------------------------

def _clean_text(text: str) -> str:
    """
    Clean text by replacing newlines and excess whitespace.
    """
    return re.sub(r"\s+", " ", text).strip()


def _truncate_query(query: str, max_length: int = MAX_QUERY_LENGTH) -> str:
    """
    Truncate query safely without cutting words in half if it exceeds max_length.
    """
    query = query.strip()
    if len(query) <= max_length:
        return query

    truncated = query[:max_length]
    last_space = truncated.rfind(" ")
    if last_space > 0:
        truncated = truncated[:last_space]

    return truncated.strip()


# ----------------------------------------------------------------------
# Dataclass
# ----------------------------------------------------------------------

@dataclass
class SearchResult:
    """
    Standard search result returned by the search module.
    """

    title: str

    url: str

    content: str

    source: str

    score: float

    published_date: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


# ----------------------------------------------------------------------
# Search Service
# ----------------------------------------------------------------------

class SearchService:
    """
    Wrapper around Tavily Search API.

    Responsibilities

    - Generate search queries
    - Search Internet
    - Filter trusted sources
    - Normalize response
    """

    def __init__(self):

        api_key = os.getenv("TAVILY_API_KEY")

        if not api_key:
            raise RuntimeError(
                "TAVILY_API_KEY not found in environment."
            )

        self.client = TavilyClient(api_key=api_key)

        logger.info("SearchService initialized successfully.")

    def _extract_compact_query(self, text: str) -> str:
        """
        Extract entities, noun phrases, and YAKE keywords from a long article,
        remove tiny words and duplicates, and build a compact search phrase.
        """
        cleaned_text = _clean_text(text)

        # 1. Extract spaCy Entities and Noun Phrases
        entities: List[str] = []
        noun_phrases: List[str] = []
        try:
            doc = NLP(cleaned_text)
            for ent in doc.ents:
                if ent.label_ in ALLOWED_ENTITIES:
                    val = ent.text.strip()
                    if val:
                        entities.append(val)

            for chunk in doc.noun_chunks:
                val = chunk.text.strip()
                if val:
                    noun_phrases.append(val)
        except Exception as e:
            logger.warning("spaCy extraction error: %s", e)

        # 2. Extract YAKE Keywords
        yake_keywords: List[str] = []
        try:
            extracted = KEYWORD_EXTRACTOR.extract_keywords(cleaned_text)
            yake_keywords = [
                kw.strip() for kw, _ in extracted if kw and kw.strip()
            ]
        except Exception as e:
            logger.warning("YAKE keyword extraction error: %s", e)

        # 3. Merge all extracted terms
        merged_terms = entities +  yake_keywords+ noun_phrases

        # 4. Remove tiny words and duplicates while preserving order
        seen_words = set()
        compact_words: List[str] = []

        for term in merged_terms:
            words = term.split()
            for w in words:
                w_clean = re.sub(r"[^a-zA-Z0-9\-]", "", w)
                if len(w_clean) > 1 and w_clean.lower() not in TINY_STOP_WORDS:
                    key = w_clean.lower()
                    if key not in seen_words:
                        seen_words.add(key)
                        compact_words.append(w_clean)

        compact_phrase = " ".join(compact_words).strip()
        return compact_phrase

    def _generate_queries(self, claim: str) -> List[str]:
        """
        Generate multiple search queries for better evidence retrieval.
        Classifies input length into short claim or long article.
        """
        raw_claim = claim.strip()
        input_length = len(raw_claim)

        if input_length < LONG_ARTICLE_THRESHOLD:
            detected_type = "short claim"
            base_query = _truncate_query(raw_claim, max_length=BASE_QUERY_MAX_LENGTH)
        else:
            detected_type = "long article"
            base_query = self._extract_compact_query(raw_claim)
            if not base_query.strip():
                base_query = _truncate_query(raw_claim, max_length=BASE_QUERY_MAX_LENGTH)
            else:
                base_query = _truncate_query(base_query, max_length=BASE_QUERY_MAX_LENGTH)

        # Build candidate queries
        candidates = [
            base_query,
            f"{base_query} fact check",
            f"{base_query} official statement",
            f"{base_query} government",
            f"{base_query} Reuters",
        ]

        # Truncate each query safely to MAX_QUERY_LENGTH and remove duplicates
        seen = set()
        final_queries = []

        for q in candidates:
            truncated_q = _truncate_query(q, max_length=MAX_QUERY_LENGTH)
            key = truncated_q.lower()
            if key not in seen:
                seen.add(key)
                final_queries.append(truncated_q)

        # Logging details
        logger.info("Search Query Generation Analysis:")
        logger.info("  Original input length : %d", input_length)
        logger.info("  Detected type         : %s", detected_type)
        logger.info("  Generated base query  : %s", base_query)
        logger.info("  Generated search queries:")
        for query in final_queries:
            logger.info("    - [%d chars] %s", len(query), query)

        return final_queries

    # ------------------------------------------------------------------
    # Tavily Search
    # ------------------------------------------------------------------

    def _call_tavily(
        self,
        query: str,
        max_results: int = MAX_RESULTS,
    ) -> List[Dict[str, Any]]:
        """
        Call Tavily API and return raw search results.
        """

        logger.info("Searching Tavily...")
        logger.info("Query: %s", query)

        try:

            response = self.client.search(

                query=query,

                search_depth=SEARCH_DEPTH,

                max_results=max_results,

                include_raw_content=INCLUDE_RAW_CONTENT,

                timeout=TIMEOUT_SECONDS,

            )

        except Exception as e:

            logger.exception("Tavily Search Failed")

            raise RuntimeError(
                f"Tavily Search Error: {e}"
            )

        results = response.get("results", [])

        logger.info(
            "Received %d search results.",
            len(results)
        )

        return results

    # ------------------------------------------------------------------
    # Response Parsing
    # ------------------------------------------------------------------

    def _parse_results(
        self,
        raw_results: List[Dict[str, Any]],
    ) -> List[SearchResult]:
        """
        Convert Tavily response into SearchResult objects.
        """

        parsed_results: List[SearchResult] = []

        for item in raw_results:

            url = item.get("url", "")

            metadata = get_source_metadata(url)

            source_name = (
                metadata["name"]
                if metadata
                else "Unknown"
            )

            parsed_results.append(

                SearchResult(

                    title=item.get("title", ""),

                    url=url,

                    content=item.get(
                        "raw_content"
                    )
                    or item.get(
                        "content",
                        "",
                    ),

                    source=source_name,

                    score=float(
                        item.get(
                            "score",
                            0.0,
                        )
                    ),

                    published_date=item.get(
                        "published_date"
                    ),

                )

            )

        logger.info(
            "Parsed %d search results.",
            len(parsed_results)
        )

        return parsed_results

    # ------------------------------------------------------------------
    # Retry Wrapper
    # ------------------------------------------------------------------

    def _search_with_retry(
        self,
        query: str,
        retries: int = 3,
    ) -> List[SearchResult]:
        """
        Retry Tavily search before failing.
        """

        last_error = None

        for attempt in range(1, retries + 1):

            try:

                raw = self._call_tavily(query)

                return self._parse_results(raw)

            except Exception as e:

                last_error = e

                logger.warning(

                    "Attempt %d/%d failed.",

                    attempt,

                    retries,

                )

        raise RuntimeError(last_error)

    # ------------------------------------------------------------------
    # Trusted Source Filtering
    # ------------------------------------------------------------------

    def _filter_trusted_sources(
        self,
        results: List[SearchResult],
    ) -> List[SearchResult]:
        """
        Keep only results from trusted domains.
        """

        trusted_results: List[SearchResult] = []

        for result in results:

            if is_trusted_source(result.url):
                trusted_results.append(result)

            else:
                logger.debug(
                    "Ignoring untrusted source: %s",
                    result.url,
                )

        logger.info(
            "Trusted results: %d/%d",
            len(trusted_results),
            len(results),
        )

        return trusted_results

    # ------------------------------------------------------------------
    # Duplicate Removal
    # ------------------------------------------------------------------

    def _remove_duplicates(
        self,
        results: List[SearchResult],
    ) -> List[SearchResult]:
        """
        Remove duplicate URLs.
        """

        unique_results: List[SearchResult] = []

        seen_urls = set()

        for result in results:

            url = result.url.strip().lower()

            if url in seen_urls:
                continue

            seen_urls.add(url)

            unique_results.append(result)

        logger.info(
            "Unique results: %d",
            len(unique_results),
        )

        return unique_results

    # ------------------------------------------------------------------
    # Ranking
    # ------------------------------------------------------------------

    def _rank_results(
        self,
        results: List[SearchResult],
    ) -> List[SearchResult]:
        """
        Rank search results using Tavily score and
        trusted-source priority.
        """

        def ranking_score(result: SearchResult):

            priority = get_priority(result.url)

            return (
                priority,
                -result.score,
            )

        ranked = sorted(
            results,
            key=ranking_score,
        )

        logger.info(
            "Ranking completed."
        )

        return ranked

    # ------------------------------------------------------------------
    # Public Search API
    # ------------------------------------------------------------------

    def search(
        self,
        claim: str,
        max_results: int = MAX_RESULTS,
    ) -> List[SearchResult]:

        logger.info("=" * 60)
        logger.info("Starting Search Pipeline")
        logger.info("=" * 60)

        all_results: List[SearchResult] = []

        queries = self._generate_queries(claim)

        logger.info("Generated %d search queries.", len(queries))

        for query in queries:

            logger.info("Searching: %s", query)

            try:

                results = self._search_with_retry(query)

                all_results.extend(results)

            except Exception as e:

                logger.warning(
                    "Search failed for '%s': %s",
                    query,
                    e,
                )

        all_results = self._filter_trusted_sources(
            all_results
        )

        all_results = self._remove_duplicates(
            all_results
        )

        all_results = self._rank_results(
            all_results
        )

        return all_results[:max_results]


# ----------------------------------------------------------------------
# Backward Compatible API
# ----------------------------------------------------------------------

_search_service: Optional[SearchService] = None


def run_search(
    claim: str,
    max_results: int = MAX_RESULTS,
) -> List[SearchResult]:
    """
    Entry point used by prediction_service.py
    """

    global _search_service

    if _search_service is None:
        _search_service = SearchService()

    return _search_service.search(
        claim=claim,
        max_results=max_results,
    )


# ----------------------------------------------------------------------
# Local Testing
# ----------------------------------------------------------------------

if __name__ == "__main__":

    claim = "NASA confirms water on Mars"

    results = run_search(claim)

    print()

    print("=" * 80)

    print(f"Found {len(results)} results")

    print("=" * 80)

    for i, result in enumerate(results, start=1):

        print(f"\n[{i}]")

        print("Title :", result.title)

        print("Source:", result.source)

        print("Score :", result.score)

        print("URL   :", result.url)
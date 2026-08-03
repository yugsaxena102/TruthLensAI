from functools import lru_cache
from typing import Any

from ai.inference.config import MAX_TOKEN_LENGTH, TRANSFORMER_MODEL_PATHS


@lru_cache(maxsize=None)
def load_tokenizer(model_name: str) -> Any:
    model_key = model_name.lower()
    model_path = TRANSFORMER_MODEL_PATHS.get(model_key)
    if model_path is None:
        raise ValueError(f"Unsupported tokenizer model: {model_name}")
        
    from ai.utils.hf_downloader import HFDownloader

    HFDownloader.ensure_transformer(
        model_key,
        model_path,
    )

    try:
        from transformers import AutoTokenizer
    except ImportError as exc:
        raise RuntimeError("transformers is required for tokenizer loading") from exc

    return AutoTokenizer.from_pretrained(str(model_path), local_files_only=True)


def tokenize_text(text: str, tokenizer: Any) -> Any:
    return tokenizer(
        text,
        truncation=True,
        padding="max_length",
        max_length=MAX_TOKEN_LENGTH,
        return_tensors="pt",
    )

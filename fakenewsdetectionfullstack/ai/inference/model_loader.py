from __future__ import annotations

from ai.utils.hf_downloader import HFDownloader

from dataclasses import dataclass
from pathlib import Path
from threading import Lock
from typing import Any, Dict, Iterable, Optional

from ai.inference.config import (
    DL_MODEL_PATHS,
    ML_MODEL_PATH,
    ML_PARAMETERS_PATH,
    TFIDF_VECTORIZER_PATH,
    TRANSFORMER_MODEL_PATHS,
)
from ai.inference.tokenizer import load_tokenizer


@dataclass(frozen=True)
class TransformerBundle:
    name: str
    model: Any
    tokenizer: Any
    device: str
    path: Path


class ModelLoader:
    _instance: Optional["ModelLoader"] = None
    _instance_lock = Lock()

    def __new__(cls) -> "ModelLoader":
        with cls._instance_lock:
            if cls._instance is None:
                cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self) -> None:
        if getattr(self, "_initialized", False):
            return

        self._initialized = True
        self._lock = Lock()
        self._transformer_models: Dict[str, TransformerBundle] = {}
        self._ml_model: Optional[Dict[str, Any]] = None
        self._dl_models: Dict[str, Dict[str, Any]] = {}
        self._device = self._resolve_device()

    def _resolve_device(self) -> str:
        try:
            import torch
        except ImportError:
            return "cpu"

        return "cuda" if torch.cuda.is_available() else "cpu"

    def _ensure_transformers_available(self) -> None:
        try:
            import transformers  # noqa: F401
        except ImportError as exc:
            raise RuntimeError("transformers is required for transformer inference") from exc

    def load_transformer_model(self, model_name: str) -> TransformerBundle:
        model_key = model_name.lower()
        with self._lock:
            if model_key in self._transformer_models:
                return self._transformer_models[model_key]

            model_path = TRANSFORMER_MODEL_PATHS.get(model_key)
            if model_path is None:
                raise ValueError(f"Unsupported transformer model: {model_name}")
            HFDownloader.ensure_transformer(
                model_key,
                model_path,
            )

            self._ensure_transformers_available()
            tokenizer = load_tokenizer(model_key)

            from transformers import AutoModelForSequenceClassification

            model = AutoModelForSequenceClassification.from_pretrained(
                str(model_path),
                local_files_only=True,
            )

            try:
                import torch

                model = model.to(self._device)
                model.eval()
                if self._device == "cuda":
                    torch.cuda.empty_cache()
            except ImportError as exc:
                raise RuntimeError("torch is required for transformer inference") from exc

            bundle = TransformerBundle(
                name=model_key,
                model=model,
                tokenizer=tokenizer,
                device=self._device,
                path=model_path,
            )
            self._transformer_models[model_key] = bundle
            return bundle

    def load_models(self, model_names: Optional[Iterable[str]] = None) -> Dict[str, TransformerBundle]:
        requested = list(model_names) if model_names is not None else ["roberta"]
        loaded: Dict[str, TransformerBundle] = {}
        for name in requested:
            loaded[name.lower()] = self.load_transformer_model(name)
        return loaded

    def load_all_models(self) -> Dict[str, TransformerBundle]:
        return self.load_models(["bert", "distilbert", "roberta"])

    def load_default_models(self) -> Dict[str, TransformerBundle]:
        return self.load_models(["roberta"])

    def get_transformer_bundle(self, model_name: str) -> TransformerBundle:
        return self.load_transformer_model(model_name)

    def load_ml_model(self) -> Dict[str, Any]:
        with self._lock:
            if self._ml_model is not None:
                return self._ml_model

            HFDownloader.ensure_ml_file(
                "best_ml_model.pkl",
                ML_MODEL_PATH,
            )
            
            HFDownloader.ensure_ml_file(
                "tfidf_vectorizer.pkl",
                TFIDF_VECTORIZER_PATH,
            )
            
            HFDownloader.ensure_ml_file(
                "best_model_parameters.json",
                ML_PARAMETERS_PATH,
            )
            if not TFIDF_VECTORIZER_PATH.exists():
                raise FileNotFoundError(f"TF-IDF vectorizer path not found: {TFIDF_VECTORIZER_PATH}")

            try:
                import joblib
            except ImportError as exc:
                raise RuntimeError("joblib is required for ML model loading") from exc

            model = joblib.load(ML_MODEL_PATH)
            vectorizer = joblib.load(TFIDF_VECTORIZER_PATH)

            parameters: Dict[str, Any] = {}
            if ML_PARAMETERS_PATH.exists():
                import json

                parameters = json.loads(ML_PARAMETERS_PATH.read_text(encoding="utf-8"))

            self._ml_model = {
                "model": model,
                "vectorizer": vectorizer,
                "parameters": parameters,
                "path": str(ML_MODEL_PATH),
                "vectorizer_path": str(TFIDF_VECTORIZER_PATH),
            }
            return self._ml_model

    def load_dl_model(self, model_name: str) -> Dict[str, Any]:
        model_key = model_name.lower()
        with self._lock:
            if model_key in self._dl_models:
                return self._dl_models[model_key]

            model_path = DL_MODEL_PATHS.get(model_key)
            if model_path is None:
                raise ValueError(f"Unsupported DL model: {model_name}")
            HFDownloader.ensure_dl_file(
                model_path.name,
                model_path,
            )

            try:
                import torch
            except ImportError as exc:
                raise RuntimeError("torch is required for DL model loading") from exc

            payload = torch.load(model_path, map_location=self._device, weights_only=False)
            bundle = {
                "name": model_key,
                "state": payload,
                "device": self._device,
                "path": str(model_path),
            }
            self._dl_models[model_key] = bundle
            return bundle


model_loader = ModelLoader()

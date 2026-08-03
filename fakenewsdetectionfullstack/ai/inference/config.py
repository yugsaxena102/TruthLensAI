from pathlib import Path


AI_ROOT = Path(__file__).resolve().parents[1]
MODELS_ROOT = AI_ROOT / "models"
TRANSFORMER_MODELS_ROOT = MODELS_ROOT / "transformers"
DL_MODELS_ROOT = MODELS_ROOT / "dl"
ML_MODELS_ROOT = MODELS_ROOT / "ml"

TRANSFORMER_MODEL_PATHS = {
	"bert": TRANSFORMER_MODELS_ROOT / "bert",
	"distilbert": TRANSFORMER_MODELS_ROOT / "distilbert",
	"roberta": TRANSFORMER_MODELS_ROOT / "roberta",
}

DL_MODEL_PATHS = {
	"cnn": DL_MODELS_ROOT / "cnn_best.pth",
	"lstm": DL_MODELS_ROOT / "lstm_best.pth",
	"gru": DL_MODELS_ROOT / "gru_best.pth",
	"bilstm": DL_MODELS_ROOT / "bilstm_best.pth",
}

ML_MODEL_PATH = ML_MODELS_ROOT / "best_ml_model.pkl"
TFIDF_VECTORIZER_PATH = ML_MODELS_ROOT / "tfidf_vectorizer.pkl"
ML_PARAMETERS_PATH = ML_MODELS_ROOT / "best_model_parameters.json"

# Maximum sequence token length for tokenization.
MAX_TOKEN_LENGTH = 512

# Practical input guardrail for request validation.
MAX_TEXT_CHARACTERS = 50000

# Binary classification labels used by the trained models.
CLASSES = ["Real", "Fake"]

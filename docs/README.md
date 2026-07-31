<div align="center">

# 🛡️ TruthLens AI
### Fake News Detection using Machine Learning, Deep Learning & Transformer Models

![Python](https://img.shields.io/badge/Python-3.11-blue?logo=python)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?logo=fastapi)
![PyTorch](https://img.shields.io/badge/PyTorch-EE4C2C?logo=pytorch)
![TensorFlow](https://img.shields.io/badge/TensorFlow-FF6F00?logo=tensorflow)
![Transformers](https://img.shields.io/badge/HuggingFace-Transformers-yellow)
![Scikit-Learn](https://img.shields.io/badge/Scikit--Learn-F7931E?logo=scikitlearn)
![License](https://img.shields.io/badge/License-MIT-green)

**A comparative NLP study of 10 ML/DL/Transformer models for fake news detection, deployed as a full-stack app with explainable, evidence-backed predictions.**

🌐 **Live Demo:** https://truth-lens-ai-ten.vercel.app

</div>

---

## 📖 Overview

TruthLens AI evaluates and compares **10 Machine Learning, Deep Learning, and Transformer models** for fake news classification, trained on the **WELFake dataset**. The best-performing model (**RoBERTa, 97.61% accuracy**) is deployed via a React + FastAPI app, enhanced with **Retrieval-Augmented Generation (RAG)** and **Google Gemini** for evidence-supported, explainable predictions rather than a plain binary output.

## 🔄 Project Flow

```text
Problem
   ↓
Dataset
   ↓
EDA
   ↓
Preprocessing
   ↓
Feature Engineering
   ↓
Model Training
   ↓
Hyperparameter Tuning
   ↓
Model Evaluation
   ↓
Model Comparison
   ↓
Best Model Selection
   ↓
Deployment
   ↓
Explainability (RAG)
```

## 🎯 Objectives

- Build an end-to-end fake news detection pipeline
- Benchmark ML, DL, and Transformer architectures on a common preprocessing pipeline
- Select and deploy the best-performing model
- Add explainability via evidence retrieval and reasoning

## ✨ Key Features

- Comparative evaluation of 10 NLP models
- Fine-tuned RoBERTa for production inference
- Research mode (full pipeline/model comparison) & Production mode (fast inference)
- Confidence score visualization + verification history
- RAG-based evidence retrieval with Gemini reasoning
- React + TypeScript frontend, FastAPI backend

---

## 📊 Dataset — WELFake

| Property | Value |
|---|---|
| Total Articles | 72,134 |
| Real News | 35,028 |
| Fake News | 37,106 |
| Task | Binary Classification |
| Features | Title, Content, Label |

## 📈 EDA & Preprocessing

**EDA:** class distribution, missing/duplicate value checks, article length & word-frequency analysis, token statistics.

**Preprocessing pipeline:** dedup → title/content merge → HTML/URL/special-char removal → lowercasing → whitespace normalization → tokenization → lemmatization. Applied identically across all models for fair comparison.

---

## 🤖 Models Evaluated

**Machine Learning** (TF-IDF features): Logistic Regression, Linear SVM, XGBoost

**Deep Learning** (learned embeddings): CNN, LSTM, BiLSTM, GRU

**Transformers** (HuggingFace, fine-tuned): BERT, DistilBERT, **RoBERTa** ✅ *(selected)*

**Evaluation metrics:** Accuracy, Precision, Recall, F1, ROC-AUC, Confusion Matrix, ROC Curve, Train/Val Loss

### Why RoBERTa?
Highest accuracy and ROC-AUC, strongest contextual/semantic understanding, lowest false positive/negative rates, best generalization — selected as the production inference engine.

## 🔑 Key Findings

- **RoBERTa was the clear winner**, reaching **97.61% accuracy** and **99.72% ROC-AUC** — the best across all 10 models tested.
- **XGBoost was the strongest classical baseline** (~96.7% accuracy on TF-IDF features), proving competitive with early deep learning models despite far lower compute cost.
- **Transformers > Deep Learning > Classical ML**, in that order, on this dataset — contextual embeddings captured nuances (sarcasm, phrasing, source style) that recurrent architectures and bag-of-words-style features missed.
- **Diminishing but real gains from DL to Transformers**: RNN-based models (LSTM/BiLSTM/GRU) improved over TF-IDF baselines, but the jump to transformer architectures was the biggest single accuracy gain in the whole comparison.
- **Confidence-gated RAG fallback** was the key architectural differentiator over a plain classifier: low-confidence predictions are automatically routed through evidence retrieval + Gemini reasoning instead of being returned as an unqualified label, directly addressing the black-box trust problem.

## 🧠 Explainability & RAG

Rather than a bare label, predictions are paired with retrieved supporting evidence and a Gemini-generated natural-language explanation:

`Article → Preprocess → Semantic query → Evidence retrieval & ranking → Context construction → Gemini reasoning → Evidence-backed verdict`

This reduces hallucination risk and improves user trust in the prediction.

---

## 🏗️ System Architecture

The application follows a modular client-server architecture consisting of independent frontend, backend, AI inference, and reasoning components.

```text
User
 │
 ▼
React Frontend
 │
 ▼
FastAPI Backend
 │
 ├──────── Prediction Service
 │
 ├──────── RoBERTa Model
 │
 ├──────── Retrieval Service
 │
 ├──────── Agentic AI Controller
 │
 └──────── Google Gemini
          │
          ▼
 Evidence-supported Verification
          │
          ▼
 Interactive Dashboard
```

## ⚙️ Tech Stack

**Data Science / ML:** Python, Pandas, NumPy, Scikit-learn, TF-IDF
**Deep Learning:** TensorFlow, Keras, PyTorch
**NLP:** HuggingFace Transformers, Tokenizers
**Backend:** FastAPI, Uvicorn, Pydantic
**Frontend:** React 19, TypeScript, Vite, Tailwind CSS, shadcn/ui, Recharts
**AI Services:** Google Gemini, RAG
**Tooling:** Git, Docker, Jupyter, VS Code

---

## 📂 Project Structure

- **TruthLensAI/**
  - **ai/** — AI models, datasets & notebooks
    - **datasets/**
      - `raw/`
        - `welfake.csv`
      - `processed/`
        - `train.csv`, `val.csv`, `test.csv`
    - **notebooks/**
      - `01_eda.ipynb`
      - `02_preprocessing.ipynb`
      - `03_feature_engineering.ipynb`
      - `04_ml_models.ipynb`
      - `05_dl_models.ipynb`
      - `06_transformer_models.ipynb`
      - `07_model_comparison.ipynb`
    - **models/**
      - `ml/` — `logistic_regression.pkl`, `linear_svm.pkl`, `xgboost.pkl`
      - `dl/` — `cnn.h5`, `lstm.h5`, `bilstm.h5`, `gru.h5`
      - `transformers/` — `bert/`, `distilbert/`, `roberta/` *(production model)*
    - **preprocessing/**
      - `clean_text.py`, `tokenizer.py`, `feature_engineering.py`
    - **evaluation/**
      - `metrics.py`, `confusion_matrix.py`, `roc_curve.py`, `model_comparison_report.py`
    - `predictor.py`
    - `model_loader.py`
    - `requirements.txt`
  - **backend/** — FastAPI Backend
    - **app/**
      - **api/**
        - `routes/` — `predict.py`, `history.py`
        - `deps.py`
      - **services/**
        - `prediction_service.py`, `retrieval_service.py`, `rag_controller.py`, `gemini_service.py`
      - **models/**
        - `db_models.py`
      - **schemas/**
        - `request_schema.py`, `response_schema.py`
      - **utils/**
        - `preprocessing.py`, `logger.py`, `config.py`
      - `main.py`
    - **tests/**
      - `test_predict.py`, `test_services.py`
    - `requirements.txt`
    - `Dockerfile`
  - **frontend/** — React Frontend
    - **public/**
      - `favicon.svg`
    - **src/**
      - `assets/`
      - **components/**
        - `Dashboard/`, `PredictionForm/`, `ConfidenceChart/`, `EvidencePanel/`, `HistoryTable/`
      - **pages/**
        - `Home.tsx`, `Dashboard.tsx`, `Analytics.tsx`, `History.tsx`
      - **services/**
        - `api.ts`
      - **hooks/**
        - `usePrediction.ts`
      - **utils/**
        - `formatters.ts`
      - `App.tsx`
      - `main.tsx`
    - `package.json`
    - `Dockerfile`
  - **docs/**
    - `architecture.md`, `api_reference.md`
  - **screenshots/**
    - `landing.png`, `dashboard.png`, `prediction.png`, `analytics.png`, `history.png`
  - `docker-compose.yml`
  - `README.md`
  - `LICENSE`

---

## 🚀 Quick Start

**Prerequisites:** Python 3.10+, Node.js 18+, npm, Git, Docker *(optional)*

```bash
git clone https://github.com/<your-username>/TruthLensAI.git
cd TruthLensAI

# Backend
cd backend
python -m venv venv && source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload        # → http://localhost:8000

# Frontend
cd ../frontend
npm install && npm run dev           # → http://localhost:5173

# Or, run everything via Docker
docker compose up --build
```

**.env (backend):**
```env
GOOGLE_API_KEY=your_gemini_api_key
MODEL_PATH=./ai/models/roberta
MODE=production
```

## 📡 API — `POST /api/predict`

```json
// Request
{ "text": "News article...", "mode": "production" }

// Response
{ "prediction": "Fake", "confidence": 97.61, "model": "RoBERTa",
  "reasoning": "Generated using Google Gemini", "sources": [] }
```

`production` mode → fast inference with confidence + explanation. `research` mode → full pipeline, intermediate outputs, model comparison.

---

## 📈 Highlights

- Benchmarked **10 NLP models** across ML, DL, and Transformer paradigms
- **97.61% accuracy** with fine-tuned RoBERTa
- RAG + Gemini for evidence-supported, explainable verdicts
- Full-stack deployment: React + FastAPI, Dockerized

## 🔮 Future Improvements

Multilingual & multimodal (text + image) detection · real-time monitoring · browser extension · knowledge graph integration · model quantization · cloud deployment (AWS)

## 🤝 Contributing

Fork → branch → commit → PR. Contributions welcome!

---

## 👨‍💻 Author

**Yug Saxena** — B.Tech Information Technology, JSS Academy of Technical Education, Noida
GitHub: https://github.com/yugsaxena102

## 📄 License

MIT License — see `LICENSE` for details.

<div align="center">

⭐ If you found this project useful, consider giving it a star!

</div>

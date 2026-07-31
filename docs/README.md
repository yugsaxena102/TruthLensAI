<div align="center">

# 🛡️ TruthLens AI

### AI-Powered Fake News Detection using Transformers, Agentic AI & Retrieval-Augmented Generation (RAG)

[![React](https://img.shields.io/badge/React-19-blue.svg)]()
[![FastAPI](https://img.shields.io/badge/FastAPI-Backend-green.svg)]()
[![Python](https://img.shields.io/badge/Python-3.11-yellow.svg)]()
[![RoBERTa](https://img.shields.io/badge/Model-RoBERTa-red.svg)]()
[![License](https://img.shields.io/badge/License-Academic-orange.svg)]()

**An end-to-end AI platform that detects fake news, retrieves supporting evidence, and generates explainable verification using Agentic AI and Google Gemini.**

🌐 **Live Demo:** https://truth-lens-ai-ten.vercel.app

</div>

---

# 📖 Overview

TruthLens AI is an intelligent fake news verification platform designed to go beyond binary text classification.

Instead of simply predicting whether a news article is **Real** or **Fake**, TruthLens AI combines:

- Transformer-based fake news detection
- Agentic AI orchestration
- Retrieval-Augmented Generation (RAG)
- Trusted evidence retrieval
- Explainable AI reasoning

to produce an **evidence-supported verification report**.

---

# ✨ Features

- 🤖 Fine-tuned RoBERTa Fake News Detector
- 🧠 Agentic AI Verification Pipeline
- 🔍 Retrieval-Augmented Generation (RAG)
- 📚 Trusted Evidence Retrieval
- 💬 Google Gemini Reasoning
- 📈 Confidence Score Analysis
- 📊 Interactive Dashboard
- 📜 Verification History
- 🌐 REST API
- ⚡ Modern Responsive UI

---

# 🏗️ Architecture

```
User
   │
   ▼
React Frontend
   │
   ▼
FastAPI Backend
   │
   ├───────────── Prediction Service
   │
   ├───────────── Retrieval Service
   │
   ├───────────── Agentic AI Controller
   │
   └───────────── Google Gemini
                    │
                    ▼
Evidence-supported Verification
                    │
                    ▼
Dashboard
```

---

# 🧠 AI Models Evaluated

| Category | Models |
|----------|---------|
| Machine Learning | Logistic Regression, Linear SVM, XGBoost |
| Deep Learning | CNN, LSTM, BiLSTM, GRU |
| Transformers | BERT, DistilBERT, **RoBERTa** |

---

# 📊 Best Results

| Model | Accuracy |
|--------|----------|
| Logistic Regression | 96.04% |
| Linear SVM | 96.33% |
| XGBoost | 96.77% |
| CNN | 96.83% |
| LSTM | 96.42% |
| BiLSTM | 96.09% |
| GRU | 96.91% |
| BERT | 96.89% |
| DistilBERT | 96.95% |
| **RoBERTa** | **97.61%** |

---

# 🔄 Verification Workflow

```
News Article
      │
      ▼
Text Preprocessing
      │
      ▼
RoBERTa Prediction
      │
      ▼
Query Generation
      │
      ▼
Evidence Retrieval
      │
      ▼
Evidence Ranking
      │
      ▼
Google Gemini
      │
      ▼
Explainable Verification
      │
      ▼
Dashboard
```

---

# 💻 Tech Stack

### Frontend

- React 19
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui

### Backend

- FastAPI
- Python
- REST API

### AI

- Scikit-learn
- TensorFlow
- PyTorch
- HuggingFace Transformers
- XGBoost

### LLM

- Google Gemini

---

# 📂 Project Structure

```
TruthLensAI
│
├── ai/
├── backend/
├── frontend/
├── docs/
│
├── docker-compose.yml
├── README.md
└── package.json
```

---

# 🚀 Getting Started

## Clone Repository

```bash
git clone https://github.com/yugsaxena102/TruthLensAI.git

cd TruthLensAI
```

---

## Backend

```bash
cd backend

pip install -r requirements.txt

uvicorn app.main:app --reload
```

---

## Frontend

```bash
cd frontend

npm install

npm run dev
```

---

# 📡 API

## POST

```
/api/predict
```

Example

```json
{
  "text": "News article...",
  "mode": "production"
}
```

---

# 📚 Dataset

- **WELFake Dataset**
- 72,134 News Articles
- Binary Classification (Real / Fake)

---

# 📄 Research

This repository accompanies our research on:

**Comparative Evaluation of Machine Learning, Deep Learning, and Transformer Models for Fake News Detection with an Agentic AI-Assisted Verification Framework**

The proposed framework combines:

- Transformer-based Classification
- Agentic AI
- Retrieval-Augmented Generation (RAG)
- Explainable AI
- Evidence-supported Verification

---

# 🔮 Future Improvements

- Multilingual Verification
- Image + Text Fake News Detection
- Knowledge Graph Integration
- Multi-Agent Collaboration
- Live News Monitoring
- Real-time Fact Checking APIs

---

# 👨‍💻 Authors

**Yug Saxena**

B.Tech Information Technology

JSS Academy of Technical Education, Noida

---

# ⭐ Support

If you found this project useful, consider giving it a ⭐ on GitHub.






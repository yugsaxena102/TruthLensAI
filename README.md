# TruthLens AI - Fake News Detection System

TruthLens AI is an advanced, full-stack misinformation detection platform. It leverages state-of-the-art Machine Learning (XGBoost), Deep Learning (Bi-LSTM, CNN), and Transformer models (BERT, RoBERTa, DistilBERT) to identify and analyze fake news with high precision.

---

## 🚀 Features

- **Single Analysis:** Real-time detection for individual news articles with confidence scores and reasoning.
- **Batch Analysis:** Upload datasets for bulk processing and classification.
- **Analytics Dashboard:** Visual representation of model performance, data distributions, and detection trends.
- **History Logs:** Maintain a record of previous analyses for audit and review.
- **Dual Inference Modes:**
  - **Production Mode:** Optimized for speed, utilizing the best-performing RoBERTa model.
  - **Research Mode:** Detailed ensemble analysis using BERT, DistilBERT, RoBERTa, and XGBoost with majority voting.

---

## 🛠 Tech Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Lucide React, Recharts.
- **Backend:** FastAPI (Python), Uvicorn, Pydantic.
- **AI/ML:** PyTorch, Hugging Face Transformers, Scikit-learn, XGBoost, Pandas, NumPy.
- **DevOps:** Docker, Docker Compose.

---

## 📂 Folder Structure

```text
├── ai/                      # AI/ML Core
│   ├── data/                # Datasets (WELFake)
│   ├── inference/           # Preprocessing & Predictor logic
│   ├── models/              # Trained weights & configs (Gitignored)
│   ├── notebooks/           # EDA & Training experiments
│   └── results/             # Performance metrics & plots
├── backend/                 # FastAPI Application
│   ├── app/                 # Routes, Schemas, and Services
│   └── tests/               # API Testing
├── frontend/                # React Application
│   ├── src/                 # Components, Pages, and Services
│   └── public/              # Static assets
└── docker-compose.yml       # Orchestration for Production
```

---

## ⚙️ Installation

### Prerequisites
- Python 3.10+
- Node.js 18+
- Docker (Optional for Production)

### 1. Backend Setup
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Frontend Setup
```bash
cd frontend
npm install
```

---

## 🏃 How to Run

### Local Development

**Start Backend:**
```bash
# From project root
backend/.venv/bin/uvicorn backend.app.main:app --reload
```

**Start Frontend:**
```bash
cd frontend
npm run dev
```

---

## 🏭 Production Mode
The application is ready for containerized deployment.
```bash
docker-compose up --build
```
In production mode, the system defaults to the **RoBERTa** model for optimal performance and throughput.

---

## 🔬 Research Mode
Research mode allows for deep technical audits. It executes multiple models in parallel and uses a **Majority Voting Protocol** to reach a final verdict.
- **Models involved:** BERT, RoBERTa, DistilBERT, XGBoost.
- **Metrics:** Provides per-model confidence and comparative analysis.

---

## ⚠️ Model Notice
**Important:** Trained model files, weights, and large datasets are **not** included in this repository to keep the footprint small.
- Excluded files: `*.pth`, `*.safetensors`, `*.pkl`, `*.bin`.
- Users must either train the models using the provided notebooks in `ai/notebooks/` or download the pre-trained artifacts into the `ai/models/` directory before running the inference engine.

---

## 🖼 Screenshots (Optional)
*(Add screenshots here after deployment)*

---

## 🔮 Future Scope
- **Real-time URL Scraping:** Automatically fetch and analyze content from live news links.
- **Multi-modal Detection:** Extend analysis to include images and videos using Computer Vision.
- **Browser Extension:** A Chrome/Firefox extension for on-the-fly verification while browsing.
- **API for Developers:** Publicly accessible API for third-party integrations.

---
*Developed as part of the TruthLens AI Research Project.*

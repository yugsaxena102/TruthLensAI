# TruthLens AI - Backend Service

This FastAPI service exposes TruthLens AI's live prediction, batch prediction, analytics, and history APIs. It calls the existing local production artifacts through `ai/inference/`; it does not train, fine-tune, download, or replace models at runtime.

Production mode uses RoBERTa. Research mode evaluates BERT, DistilBERT, and RoBERTa, then returns a majority-vote result. Prediction history is currently retained in process memory for the active backend session.

## Directory Structure

```text
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                     # App initialization and middleware config
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── predict.py              # Route for POST /predict
│   │   ├── batch.py                # Route for POST /batchPredict
│   │   ├── analytics.py            # Route for /analytics
│   │   └── history.py              # Route for /history
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── request.py              # Pydantic request schemas
│   │   └── response.py             # Pydantic response schemas
│   └── services/
│       ├── __init__.py
│       └── prediction_service.py   # Live inference orchestration, history, and analytics
├── requirements.txt                # Runtime and test dependencies
└── README.md                       # This file
```

## Running the Backend

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Run the development server:
   ```bash
   uvicorn app.main:app --reload
   ```
   The backend will be available at `http://127.0.0.1:8000`. Documentation (Swagger UI) is available at `http://127.0.0.1:8000/docs`.

---

## API Routes

- `POST /api/predict` accepts `{ "text": string, "mode": "production" | "research" }`.
- `POST /api/batchPredict` accepts `{ "texts": string[], "mode": "production" | "research" }`.
- `GET /api/analytics` returns aggregates from the current in-memory history.
- `GET /api/history` returns the current in-memory history records.

## Testing

Run the contract smoke tests from the project root:

```bash
python -m pytest backend/tests
```

The smoke tests mount the existing route modules on a test-only app and monkeypatch inference, so they validate API contracts without loading local model artifacts.

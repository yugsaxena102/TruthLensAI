# TruthLens AI Project Handover

## 1. Project Overview

**Project name:** TruthLens AI

**Goal:**
TruthLens AI is a fake news detection application with an existing React frontend, FastAPI backend, and a local AI artifact directory that contains trained production models. The product provides single-article verification, batch upload analysis, analytics, and history views. The current engineering goal is to wire the backend and frontend to the real saved AI artifacts without changing the UI or the existing route structure.

**Tech stack:**
- Frontend: React, TypeScript, Vite, Axios, Recharts, Lucide React
- Backend: FastAPI, Pydantic, Uvicorn
- AI runtime: Python, PyTorch, Hugging Face Transformers, joblib, scikit-learn, numpy, pandas
- Packaging/runtime: local saved artifacts in `ai/models/`

**Top-level workspace structure:**
- `frontend/` contains the existing UI and page components.
- `backend/` contains the FastAPI app and service layer.
- `ai/` contains the trained model artifacts, inference helpers, notebooks, and results.
- `docs/` contains project documentation.

The UI already exists and should not be redesigned. The backend routes already exist and should not be renamed. The work is about replacing placeholder or mock behavior with real inference wired to the saved production artifacts.

---

## 2. Current Architecture

### Frontend
The frontend is a React + TypeScript application in `frontend/`. It already includes the pages and components for:
- Dashboard
- Verify News / Single Analysis
- Batch Analysis
- Analytics
- History Logs
- About
- Navigation and page layout
- Production / Research mode toggles

Important frontend files:
- `frontend/src/services/api.ts` is the Axios API client and is the live backend integration layer.
- `frontend/src/services/mockApi.ts` is the mock data source and should be retired from runtime usage.
- `frontend/src/pages/Home.tsx` is the legacy single-analysis demo page and now calls the live API client.
- `frontend/src/pages/Dashboard.tsx` currently still uses mock analytics.
- `frontend/src/pages/SingleAnalysis.tsx`, `frontend/src/pages/BatchAnalysis.tsx`, `frontend/src/pages/Analytics.tsx`, and `frontend/src/pages/HistoryLogs.tsx` already target the `truthLensApi` service in many places.

The frontend UI structure should remain unchanged. Only the data source should change.

### Backend
The backend is a FastAPI application in `backend/`.

Important backend files:
- `backend/app/main.py` initializes the FastAPI app, sets middleware, and registers routes.
- `backend/app/routes/predict.py` serves `POST /api/predict`.
- `backend/app/routes/batch.py` serves `POST /api/batchPredict`.
- `backend/app/routes/analytics.py` serves `GET /api/analytics`.
- `backend/app/routes/history.py` serves `GET /api/history`.
- `backend/app/services/prediction_service.py` contains the main prediction workflow and history/analytics aggregation.
- `backend/app/schemas/request.py` and `backend/app/schemas/response.py` define request and response contracts.
- `backend/requirements.txt` defines runtime Python dependencies.

The backend was previously placeholder-driven. It has been refactored toward local artifact loading and real inference, but the runtime remains a thin wrapper around the AI folder. The backend should never become a training layer.

### AI folder
The AI folder is the production source of truth for trained artifacts and inference helpers.

Important AI files:
- `ai/models/` contains all saved trained artifacts.
- `ai/inference/config.py` centralizes artifact paths and constants.
- `ai/inference/model_loader.py` is the singleton-style artifact loader.
- `ai/inference/predictor.py` is the inference entrypoint for transformer models.
- `ai/inference/tokenizer.py` loads local tokenizers from the saved transformer folders.
- `ai/inference/preprocess.py` is the text-cleaning utility used during inference.
- `ai/notebooks/` is reference material from development and training.
- `ai/results/` contains evaluation outputs and reports from training.

The AI folder must remain the source of truth for the production artifacts. The backend should adapt to this folder, not the other way around.

---

## 3. AI Folder Structure

### `ai/models/`
This directory contains the trained production artifacts.

#### `ai/models/ml/`
Expected contents:
- `best_ml_model.pkl`
- `tfidf_vectorizer.pkl`
- `best_model_parameters.json`

Purpose:
- `best_ml_model.pkl` is the saved machine learning classifier.
- `tfidf_vectorizer.pkl` is the fitted vectorizer that must be reused as-is.
- `best_model_parameters.json` stores the training-selected parameters or metadata for the best ML artifact.

Rules:
- Do not fit TF-IDF again.
- Do not retrain.
- Do not recreate the vectorizer.
- Do not regenerate label encoders.
- Load these artifacts directly if ML inference is implemented.

#### `ai/models/dl/`
Expected contents:
- `cnn_best.pth`
- `lstm_best.pth`
- `bilstm_best.pth`
- `gru_best.pth`

Purpose:
- These are the saved deep learning model weights.
- They must only be loaded and used for inference.

Rules:
- Do not retrain.
- Do not fine-tune.
- Do not replace model files.
- If the serialized format includes architecture state, load it directly; otherwise the architecture must be reconstructed only if the saved artifact format truly requires it.

#### `ai/models/transformers/`
Expected contents:
- `bert/`
- `distilbert/`
- `roberta/`

Each model folder contains local production artifacts such as:
- `config.json`
- `model.safetensors`
- `tokenizer.json`
- `tokenizer_config.json`

Purpose:
- These are local transformer checkpoints and tokenizers.
- They must be loaded from disk only.
- No Hugging Face downloads should occur at runtime.

Rules:
- Never call remote model names.
- Never download tokenizers.
- Never download models.
- Always load using local folder paths.

### `ai/inference/`
This directory contains the runtime inference support code.

#### `config.py`
Purpose:
- Stores local artifact path constants.
- Stores shared inference constants such as max sequence length and label order.

#### `model_loader.py`
Purpose:
- Provides cached, reusable loading of local saved artifacts.
- Uses a singleton-style loader.
- Should load each model once and reuse it for subsequent requests.
- Determines device placement for GPU or CPU.

Current responsibility:
- Load transformer models from local folders.
- Cache loaded instances.
- Optionally load ML/DL artifacts if and when the backend needs them.

#### `predictor.py`
Purpose:
- Performs inference-time prediction logic.
- Calls the loaded model and tokenizer objects.
- Converts logits or outputs into prediction labels and confidence values.
- Produces the final JSON-ready prediction payload.

Important constraint:
- This file must remain inference-only. It should not contain training code or evaluation code.

#### `tokenizer.py`
Purpose:
- Loads local tokenizer objects from saved transformer folders.
- Provides tokenization utilities that operate on already saved artifacts.

Important constraint:
- Do not create tokenizers.
- Do not download tokenizers.
- Do not rebuild tokenizer vocabularies.

#### `preprocess.py`
Purpose:
- Provides the text preprocessing helper used at inference time.

Important constraint:
- The production backend must not invent a new preprocessing pipeline.
- If the preprocessing behavior is required for inference and no serialized preprocessing artifact exists, the runtime should reuse the existing `clean_text()` implementation from `ai/inference/`.
- Do not hardcode new stopword lists or recreate notebook-only helper logic inside the backend service layer.

### `ai/notebooks/`
This directory contains training and analysis notebooks.

Important notebooks:
- `01_EDA_Preprocessing.ipynb`
- `03_Deep_Learning_PyTorch.ipynb`
- `04_Transformers.ipynb`
- `fake_news_detection.ipynb`

Purpose:
- Historical reference for how the models were trained.
- Reference for training-time preprocessing, tokenizer behavior, model settings, and evaluation workflows.

Rules:
- Do not execute notebooks in production.
- Do not mirror notebook training code into backend runtime code.
- Use notebooks only when a required production artifact is missing and no saved inference artifact exists.

### `ai/results/`
This directory contains saved outputs from training and evaluation.

Expected contents:
- `deep_learning_results.csv`
- `ml_results.csv`
- `transformer_results.csv`
- `xgboost_feature_importance.csv`
- `plots/`

Purpose:
- Offline evaluation reference.
- Not part of live inference.

Rules:
- Do not treat results as runtime inputs.
- Do not compute analytics from results files in production unless explicitly required and no live history source exists.

---

## 4. Source of Truth (VERY IMPORTANT)

This section is the core project rule set.

- The notebooks are only for reference.
- The models are already trained.
- Training is finished.
- Production must never retrain models.
- Production must never fine-tune models.
- Production must never recreate TF-IDF.
- Production must never recreate tokenizers.
- Production must never recreate preprocessing if a production artifact exists.
- Production must never download Hugging Face models.
- Production must never overwrite saved model files.

The production source of truth is:
- `ai/models/`
- `ai/inference/`

Not the notebooks.

If a runtime artifact is missing from `ai/models/` or `ai/inference/`, stop and ask the developer instead of inventing a replacement.

If preprocessing is not serialized, reuse the existing `clean_text()` in `ai/inference/` only if it is already the project’s production inference helper. Do not create a new notebook-derived pipeline in the backend service.

---

## 5. Completed Work

This section lists the files that have been modified in the current development pass and what each change was for.

### `backend/app/main.py`
Why it was changed:
- To adjust startup loading behavior for the AI artifact loader.

What was implemented:
- FastAPI lifespan startup now triggers model loading through the AI loader.
- Route registration remains unchanged.

What still needs improvement:
- The loader strategy should be finalized after all model families are wired.
- Confirm startup load behavior is optimal for deployment size and cold start constraints.

### `backend/app/routes/predict.py`
Why it was changed:
- To remove placeholder-style error handling and align the endpoint with the real inference service.

What was implemented:
- The endpoint now routes production and research requests to the prediction service.
- Error mapping is more specific for validation and model-loading issues.

What still needs improvement:
- Confirm response payload parity with the frontend type expectations for all edge cases.

### `backend/app/routes/batch.py`
Why it was changed:
- To make batch prediction call the real inference workflow.

What was implemented:
- Batch requests now iterate over rows and call the prediction service directly.
- Validation errors and missing-artifact errors are surfaced properly.

What still needs improvement:
- CSV upload handling on the frontend still needs to be fully connected to the backend batch endpoint.

### `backend/app/routes/analytics.py`
Why it was changed:
- To connect analytics to the real backend aggregation path.

What was implemented:
- The endpoint returns live aggregated metrics from prediction history.

What still needs improvement:
- History persistence backend should be upgraded if cross-session durability is required.

### `backend/app/routes/history.py`
Why it was changed:
- To expose the real history store rather than mock data.

What was implemented:
- The endpoint returns the current in-memory history snapshot.

What still needs improvement:
- Persistence layer is still in-memory and may need a database or file-backed store for durable history.

### `backend/app/schemas/request.py`
Why it was changed:
- To tighten request validation for mode values.

What was implemented:
- Mode fields now constrain requests to production or research.

What still needs improvement:
- Consider stronger validation for long-text limits and batch item structure if frontend needs explicit constraints.

### `backend/app/schemas/response.py`
Why it was changed:
- To reflect the live analytics and history data returned by the backend.

What was implemented:
- Added inference-time and input-text fields for history.
- Added average inference time to analytics response shape.

What still needs improvement:
- Verify frontend components consume all new fields safely.

### `backend/app/services/prediction_service.py`
Why it was changed:
- To replace placeholder prediction logic with real history-backed inference flow.

What was implemented:
- Production and research predictions now call the inference layer.
- History entries are stored in-memory.
- Analytics are computed from real prediction history.
- Majority voting is implemented for research mode.

What still needs improvement:
- Add durable storage for history if required by the product.
- Add batch-specific export/download handling if the frontend expects server-generated CSVs.
- Integrate ML and DL model families if those are part of the final production workflow.

### `backend/requirements.txt`
Why it was changed:
- To add the ML runtime dependencies needed for local inference.

What was implemented:
- Added numpy, pandas, scikit-learn, joblib, torch, transformers, and safetensors.
- Switched to a CPU-compatible PyTorch install path to support this environment.

What still needs improvement:
- Lock versions after the deployment target is confirmed.
- Review whether all dependencies are necessary for the final production slice.

### `frontend/src/services/api.ts`
Why it was changed:
- To make the frontend use the real FastAPI backend without falling back to mock responses.

What was implemented:
- The shared Axios client now calls the backend directly.
- The `truthLensApi` wrapper no longer routes through `mockApi.ts`.
- Frontend-facing request/response interfaces were defined locally so the client no longer depends on mock-service types.

What still needs improvement:
- Remaining pages that still import `mockApi.ts` directly must be migrated in later phases.

### `frontend/src/pages/Home.tsx`
Why it was changed:
- To remove the remaining single-analysis mock call path from the legacy Home page.

What was implemented:
- The page now uses `truthLensApi.predict(...)` instead of `mockApi.predict(...)`.
- The visible UI and layout were left unchanged.

What still needs improvement:
- This page is legacy and not routed in the main app shell, so it can be removed later if the project no longer needs it.

### `ai/inference/config.py`
Why it was changed:
- To centralize artifact paths and inference constants.

What was implemented:
- Local paths for transformer, ML, and DL artifacts were added.
- Shared constants for token length and labels were added.

What still needs improvement:
- Add additional artifact metadata only if a real production artifact requires it.

### `ai/inference/tokenizer.py`
Why it was changed:
- To load tokenizers from local saved transformer folders.

What was implemented:
- Tokenizers are now loaded locally from the transformer model directories.
- Tokenization returns tensors suitable for model inference.

What still needs improvement:
- If a serialized tokenizer exists for ML or DL preprocessing, wire it in here only if it is a real saved production artifact.

### `ai/inference/model_loader.py`
Why it was changed:
- To implement cached loading of saved model artifacts.

What was implemented:
- Singleton-style loader.
- Cached transformer model loading.
- Device selection for CPU/GPU.
- Optional loading hooks for ML and DL artifacts.

What still needs improvement:
- Add explicit loading paths for ML and DL families when the production workflow requires them.
- Confirm the serialized format of the DL `.pth` files before exposing them through the backend.

### `ai/inference/predictor.py`
Why it was changed:
- To implement production inference logic for the transformer path.

What was implemented:
- Real transformer inference with local artifacts.
- Confidence extraction from logits.
- Keyword extraction for explainability.
- Production and research prediction entrypoints.

What still needs improvement:
- Add production-grade support for ML and DL model inference if those are required by the final product contract.
- Verify exact label order and output semantics for every saved model family.

### `ai/inference/preprocess.py`
Why it was changed:
- To align inference preprocessing with the project’s current runtime helper.

What was implemented:
- The shared `clean_text()` helper exists in runtime code.

What still needs improvement:
- Confirm exact production preprocessing expectations against the saved artifacts before changing anything else.

---

## 6. Remaining Tasks

This is the current checklist of work still left.

### Backend
- [ ] Confirm the final inference contract for ML models in `ai/models/ml/`.
- [ ] Confirm the final inference contract for deep learning `.pth` files in `ai/models/dl/`.
- [ ] Wire ML inference only if those artifacts are part of the required production path.
- [ ] Wire DL inference only if those artifacts are part of the required production path.
- [ ] Decide whether history needs persistent storage beyond in-memory runtime state.
- [ ] Add robust CSV parsing and server-side batch export if batch download must be produced by the backend.
- [ ] Add explicit response validation for corrupted or partial model outputs.

### Frontend
- [ ] Remove remaining mock data usage from `frontend/src/pages/Dashboard.tsx`.
- [ ] Ensure all pages use `frontend/src/services/api.ts` only.
- [ ] Retire `frontend/src/services/mockApi.ts` from runtime usage.
- [ ] Verify `SingleAnalysis`, `BatchAnalysis`, `Analytics`, and `HistoryLogs` all consume backend payloads correctly.

### Testing
- [ ] Add backend smoke tests for `POST /api/predict`.
- [ ] Add backend smoke tests for `POST /api/batchPredict`.
- [ ] Add backend smoke tests for `GET /api/analytics`.
- [ ] Add backend smoke tests for `GET /api/history`.
- [ ] Validate error handling for empty text, long text, invalid CSV, missing artifacts, and corrupted artifacts.

### Deployment
- [ ] Confirm production dependency pinning.
- [ ] Confirm backend memory usage when loading all models at startup.
- [ ] Confirm whether GPU availability changes loading policy.
- [ ] Verify that local artifact paths are correct in the deployed filesystem.

---

## 7. Decisions Made

- Production Mode uses only RoBERTa.
- Research Mode uses BERT, DistilBERT, and RoBERTa.
- Models are loaded once on startup and reused.
- The loader should be singleton-style and cache all loaded objects.
- The backend should be a thin inference layer, not a training layer.
- The backend must load artifacts from local folders only.
- No external downloads are allowed at runtime for production inference.
- The UI must remain unchanged.
- The route names must remain unchanged.
- The AI folder is the production source of truth.
- The backend should adapt to the AI folder, not the reverse.

---

## 8. Rules for Future AI

These rules are strict.

- Never retrain models.
- Never fine-tune models.
- Never regenerate TF-IDF.
- Never recreate tokenizers.
- Never invent a new preprocessing pipeline.
- Never hardcode stopword lists.
- Never copy notebook training code into backend runtime code.
- Never download Hugging Face models.
- Always load models from local folders.
- Always prefer saved production artifacts over notebook logic.
- Never overwrite existing model files.
- Never modify the UI design.
- Never rename existing routes.
- Never duplicate code that already exists in `ai/inference/`.
- If a required artifact is missing, stop and ask instead of recreating it.
- Use notebooks only as a last-resort reference for missing production details.
- Keep the backend thin: request in, artifact load, prediction out.
- Keep the AI folder authoritative.

---

## 9. Known Issues

### Issue 1: In-memory history is not durable
**Cause:** Prediction history currently lives in process memory.

**Current status:** Functional for a running session, but not durable across restarts.

**Recommended solution:** Add a persistent store only if the product requires long-term history. A small SQLite or JSON-backed persistence layer would be the simplest next step.

### Issue 2: Frontend still has mock usage in some pages
**Cause:** `frontend/src/services/mockApi.ts` is still imported by some pages, most notably the dashboard.

**Current status:** The live API client is now used by the single-analysis path, but not every page has been fully switched over.

**Recommended solution:** Replace the remaining mock calls with `truthLensApi` and then remove runtime dependency on the mock service.

### Issue 3: Model-family completeness is not yet fully confirmed for ML and DL
**Cause:** The production artifact set includes ML and DL saved models, but the current backend inference path is transformer-first and does not yet fully prove the serialized contract for every `.pkl` and `.pth` artifact.

**Current status:** Transformer inference is wired. ML and DL integration still needs artifact-contract confirmation before final wiring.

**Recommended solution:** Inspect the saved artifact structure only if needed to confirm inference usage, then implement thin loaders that use the saved objects as-is.

### Issue 4: Batch CSV export is currently client-generated
**Cause:** The frontend already has an export function, but the backend does not yet generate downloadable CSV output.

**Current status:** Batch prediction works conceptually, but server-side CSV export is not finalized.

**Recommended solution:** Add a backend CSV response or downloadable file endpoint only if the product needs server-side generation.

### Issue 5: Startup memory footprint may be high when all transformer models load together
**Cause:** Preloading all transformer checkpoints increases cold-start memory use.

**Current status:** Functional, but may need tuning for production deployment size.

**Recommended solution:** Keep the singleton cache, but consider lazy loading for non-production models if deployment constraints require it. Any such optimization must preserve artifact-only loading.

---

## 10. Next Immediate Step

The next AI should do this first:

1. Inspect the actual saved artifact contracts in `ai/models/ml/` and `ai/models/dl/` only if those families are required for the current production behavior.
2. Confirm the exact runtime inference shape of the saved `.pkl` and `.pth` files without retraining or recreating anything.
3. Wire the backend thinly to those artifacts only if the required production contract depends on them.
4. Continue with batch analysis, then analytics, then history, and finally remove any remaining mock usage so every page points to `frontend/src/services/api.ts`.

If any artifact contract is unclear or missing, stop and ask instead of inventing a fallback.

---

## 11. Final Project State

TruthLens AI is an existing full-stack application with a completed React UI, FastAPI backend, and a production AI artifact directory. The project is not being rebuilt; it is being converted from mock-backed behavior to real inference backed by the saved artifacts in `ai/models/` and runtime helpers in `ai/inference/`.

The correct long-term architecture is:
- Frontend stays visually unchanged.
- Backend stays route-compatible.
- AI artifacts remain local and fixed.
- Inference remains thin and deterministic.
- No retraining, no downloads, no duplicate preprocessing logic, and no artifact recreation.

The project is ready for the next AI to continue by finishing the remaining model-family integration, removing any remaining mock runtime usage, and validating end-to-end behavior against the saved production artifacts.

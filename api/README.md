# WarmiMIND API

FastAPI service skeleton for WarmiMIND v2 document processing, retrieval, tutoring, learning state, and evaluation.

## Run Locally

```bash
cd api
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Health Endpoints

- `GET /health`
- `GET /api/v1/health`

## v1 Endpoints

- `POST /api/v1/documents`
- `GET /api/v1/documents/{document_id}`
- `POST /api/v1/learning-sessions`
- `GET /api/v1/learning-sessions/{session_id}`
- `POST /api/v1/learning-sessions/{session_id}/retrieve`
- `POST /api/v1/learning-sessions/{session_id}/summary`
- `POST /api/v1/learning-sessions/{session_id}/concepts`
- `POST /api/v1/learning-sessions/{session_id}/questions`
- `POST /api/v1/learning-sessions/{session_id}/chat`
- `POST /api/v1/learning-sessions/{session_id}/misconception-checks`
- `POST /api/v1/evals/runs`
- `GET /api/v1/evals/runs`
- `GET /api/v1/evals/runs/{run_id}`

## Upload Limits

`POST /api/v1/documents` accepts PDF uploads up to 12 MB. The endpoint validates PDF metadata before reading content and stops reading once the configured limit is exceeded.

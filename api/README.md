# WarmiMIND API

FastAPI service skeleton for WarmiMIND v2 document processing, retrieval, tutoring, learning state, and evaluation.

## Run Locally

```bash
cd api
python -m venv .venv
.venv\Scripts\activate
python -m pip install -r requirements.txt
uvicorn app.main:app --reload
```

The local Next.js app calls this API through `NEXT_PUBLIC_API_BASE_URL`, which defaults to `http://localhost:8000`. Local CORS allows `http://localhost:3000` and `http://127.0.0.1:3000`.

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

## PDF Text Extraction

The API extracts text server-side with `pypdf`. Text-based PDFs are supported. Scanned/image-only PDFs or PDFs with fewer than 200 meaningful extracted characters return a stable 400 response asking for a text-based or OCR version.

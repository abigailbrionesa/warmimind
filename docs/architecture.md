# WarmiMIND v2 Architecture

WarmiMIND v2 is a source-grounded AI STEM learning workspace over uploaded PDFs.

## Current MVP State

The current public Next.js app remains at the repository root:

```text
app/
components/
lib/
```

The recommended local demo routes visible PDF upload, source chunks, learning outputs, misconception checks, progress state, evals, and tutor chat through the FastAPI v2 API. Legacy Next.js AI routes remain for prototype reference only and should not be treated as the product path.

## Target Boundaries

```text
web/         Next.js learning workspace frontend
api/         FastAPI backend for PDF ingestion, retrieval, tutoring, state, and evals
migrations/ Supabase Postgres, Storage, and pgvector schema changes
evals/       Evaluation fixtures, expected answers, and metric runners
docs/        Architecture, methodology, limitations, and ADRs
```

## Target Request Flow

```text
Student uploads PDF
  -> app/landing sends file to api
  -> api validates and stores upload
  -> api extracts text and creates chunks
  -> api prepares chunks for retrieval
  -> api creates a learning session
  -> web displays summary, concepts, questions, chat, checks, and next action
```

## v2 API Boundary

Backend routes should be versioned under `/api/v1`. The current v2 service exposes:

- `GET /health`
- `GET /api/v1/health`
- `POST /api/v1/documents`
- `GET /api/v1/documents/{document_id}`
- `GET /api/v1/documents/{document_id}/signed-url`
- `POST /api/v1/learning-sessions`
- retrieval, learning output, chat, misconception-check, progress, and eval routes

The backend defaults to in-memory repositories for local validation. Supabase repository mode can persist document metadata, extracted text, chunks, sessions, outputs, misconception checks, eval runs, and raw PDF bytes. Signed URL issuance is available only when explicitly enabled after access-control review.

## Preservation Rule

Until the v2 workspace replaces it, the root Next.js demo should remain buildable. New v2 backend, data, docs, and evaluation work should be additive unless an issue explicitly migrates the old demo.

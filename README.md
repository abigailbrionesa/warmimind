# WarmiMIND

WarmiMIND is a source-grounded AI STEM learning workspace. The visible v2 flow turns one text-based STEM PDF into inspectable source chunks, cited summaries, key concepts, guided questions, tutor chat, misconception feedback, learning state, next recommended actions, and evaluation metrics.

The current implementation is an MVP-grade local/demo system, not a public production tutoring service. It uses deterministic retrieval and generation logic for repeatable validation, supports optional Supabase persistence and raw PDF storage, and keeps signed PDF URLs disabled by default until ownership and retention policies are complete.

## Current v2 MVP

The current app includes:

- PDF upload through the FastAPI v2 boundary
- Text extraction and page-aware source chunk inspection
- Source-grounded summaries, key concepts, and guided questions
- Native PDF preview for the uploaded document
- Session-based tutor chat that cites the uploaded PDF or refuses unsupported questions
- Misconception checks, weak-concept tracking, and next recommended actions
- Live seeded evaluation dashboard for retrieval, citation, refusal, quality, and latency metrics
- Optional Supabase repository mode for app data and raw PDF storage
- Experimental legacy translation support, including Quechua (`qu`) where provider support is available

The core user flows have been smoke-tested with Playwright in development and production builds.

## Important Limitations

- Quechua output is experimental and has not been formally validated for language quality, dialect fit, or educational suitability.
- Cultural examples are prompt-guided only; this project does not claim cultural authority or community validation.
- The visible v2 demo uses deterministic retrieval and refusal behavior, so it is not yet a production AI tutoring system.
- The default `memory` repository is for development and is not durable across server restarts.
- Supabase repository mode can persist app data and raw uploaded PDFs, but authenticated ownership, retention, and privacy policies are not final.
- Signed PDF URLs are disabled by default and should stay disabled until production access controls are complete.

## Tech Stack

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui-style components
- Lucide React icons

### AI and Document Processing

- Google Gemini through the AI SDK
- Google Cloud Translation utilities
- FastAPI deterministic document processing for the visible v2 demo
- Native browser PDF preview
- In-memory repository by default, with optional Supabase Postgres and Storage persistence

## Project Structure

```text
app/
  page.tsx              Recommended entry point
  landing/              Visible v2 upload and learning flow
  workspace/            v2 workspace map and review surface
  api/
    process/            Legacy text-processing route, not the recommended path
    chat/               Legacy chat route with no-evidence refusal guard
    translate/          Legacy translation helper endpoint
components/             UI panels, PDF viewer, chat, and shared controls
lib/                    AI model setup, translation, retrieval, session helpers
api/                    FastAPI v2 backend for the visible demo
public/                 Static assets
```

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- Python 3.11+ for the FastAPI backend
- Google AI and Google Cloud credentials only for legacy AI and translation features

### Install

```bash
pnpm install
```

### Environment

Create `.env.local` and provide the keys needed by the AI and translation integrations:

```env
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_GENERATIVE_AI_API_KEY=your-google-ai-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
REPOSITORY_BACKEND=memory
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_PDF_BUCKET=warmimind-pdfs
SIGNED_URL_TTL_SECONDS=300
ENABLE_PDF_SIGNED_URLS=false
```

Set `REPOSITORY_BACKEND=supabase` with `SUPABASE_URL` and a server-only
`SUPABASE_SERVICE_ROLE_KEY` to persist v2 app data in Supabase. The default
`memory` backend is intended for local validation and tests. In Supabase mode,
uploaded PDF bytes are written to `SUPABASE_PDF_BUCKET`, and signed URL
responses use `SIGNED_URL_TTL_SECONDS` only when `ENABLE_PDF_SIGNED_URLS=true`.

### Develop

```bash
cd api
python -m pip install -r requirements.txt
uvicorn app.main:app --reload
```

In another shell:

```bash
pnpm dev
```

Open `http://localhost:3000`.

## API Overview

### Recommended v2 API

The visible demo uses the FastAPI endpoints under `/api/v1`, including:

- `POST /api/v1/documents`
- `POST /api/v1/learning-sessions`
- `POST /api/v1/learning-sessions/{session_id}/summary`
- `POST /api/v1/learning-sessions/{session_id}/concepts`
- `POST /api/v1/learning-sessions/{session_id}/questions`
- `POST /api/v1/learning-sessions/{session_id}/chat`

### Legacy `POST /api/process`

Processes extracted PDF text, creates an in-memory session, and returns generated learning content.

Request:

```json
{ "text": "PDF extracted text" }
```

Response:

```json
{
  "sessionId": "session-id",
  "summaryQu": "Generated summary text",
  "questionsQu": ["Question 1", "Question 2"]
}
```

### Legacy `POST /api/chat`

Streams a chat response for an existing in-memory session. The recommended demo path uses the v2 FastAPI chat endpoint instead.

### `POST /api/translate`

Translates supplied text through the configured Google Cloud Translation project.

## Product Direction

WarmiMIND v2 is a source-grounded AI STEM learning workspace rather than a generic PDF summarizer. The target architecture is:

- Next.js learning workspace frontend
- FastAPI backend for ingestion, retrieval, tutoring, learning state, and evals
- Supabase Postgres and Storage
- pgvector semantic retrieval over PDF chunks
- Source-grounded summaries, concepts, questions, and tutor responses with citations
- Misconception checks and next recommended actions
- Evaluation runner and dashboard for retrieval, citations, refusal behavior, and learning quality

See the GitHub issues for the ordered implementation plan.

## v2 Review Routes

- `/` - recommended entry point
- `/landing` - visible v2 upload and learning demo
- `/workspace` - v2 learning workspace overview
- `/evals` - evaluation dashboard
- `/about` - methodology and limitations

## v2 Backend Endpoints

The FastAPI v2 service lives in `api/` and exposes:

- `GET /health`
- `GET /api/v1/health`
- `POST /api/v1/documents`
- `GET /api/v1/documents/{document_id}`
- `GET /api/v1/documents/{document_id}/signed-url`
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

## v2 Persistence

The FastAPI backend uses a repository layer. By default it stores app data in
memory for local validation. When configured with Supabase credentials, it
persists document metadata, extracted text, source chunks, learning sessions,
learning outputs, misconception checks, and eval runs to the Supabase tables in
`migrations/`.

In Supabase repository mode, raw uploaded PDF bytes are stored in the configured
Supabase Storage bucket and document metadata keeps the storage path. The API can
return a short-lived signed URL from
`GET /api/v1/documents/{document_id}/signed-url` only when
`ENABLE_PDF_SIGNED_URLS=true`. In local memory mode, raw PDF bytes are not
retained and the signed URL endpoint returns `available: false`.
Rich PDF viewer highlighting remains future storage work.

## Validation

```bash
pnpm lint
pnpm exec tsc --noEmit
pnpm test
pnpm build
pnpm audit --audit-level low
```

The current visible upload, workspace, tutor chat, misconception, progress, eval, and default-disabled signed URL flows have also been validated with Playwright smoke tests.

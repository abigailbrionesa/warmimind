# WarmiMIND

WarmiMIND is an experimental Next.js and FastAPI prototype for turning a STEM PDF into a source-grounded study experience. The recommended local demo uploads a PDF through the v2 API, creates a learning session, generates cited learning outputs, and refuses questions when source evidence is weak.

This repository is being stabilized before a v2 rebuild. The v2 direction is a source-grounded AI STEM learning workspace with persistent learning sessions, PDF chunk retrieval, citations, misconception checks, learning state, and evaluation metrics.

## Current Prototype

The current app includes:

- PDF upload through the v2 FastAPI boundary
- Source-grounded summary and questions
- A PDF viewer
- Session-based chat that cites the uploaded PDF or refuses unsupported questions
- Experimental legacy translation support, including Quechua (`qu`) where provider support is available

The current prototype is useful for demonstrating the idea, but persistence, robust PDF parsing, and production access controls are still under active rebuild.

## Important Limitations

- Quechua output is experimental and has not been formally validated for language quality, dialect fit, or educational suitability.
- Cultural examples are prompt-guided only; this project does not claim cultural authority or community validation.
- The visible v2 demo uses deterministic retrieval and refusal behavior, but it is not yet a production AI tutoring system.
- Sessions are stored in memory for development and are not durable across server restarts.
- Uploaded PDF retention, privacy, and storage controls are not final.

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
- PDF viewer libraries
- In-memory session storage for the current prototype and v2 skeleton

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
```

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

## v2 Rebuild Direction

WarmiMIND v2 is planned as a source-grounded AI STEM learning workspace rather than a generic PDF summarizer. The target architecture is:

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

The FastAPI skeleton lives in `api/` and exposes:

- `GET /health`
- `GET /api/v1/health`
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

## Validation

```bash
pnpm lint
pnpm exec tsc --noEmit
pnpm test
pnpm build
pnpm audit --audit-level low
```

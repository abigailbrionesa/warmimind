# WarmiMIND

WarmiMIND is an experimental Next.js prototype for turning a STEM PDF into a simple AI-assisted study experience. The current public app can extract PDF text, generate a short learning summary, create questions, and provide a chat interface that tries to stay grounded in the uploaded document.

This repository is being stabilized before a v2 rebuild. The v2 direction is a source-grounded AI STEM learning workspace with persistent learning sessions, PDF chunk retrieval, citations, misconception checks, learning state, and evaluation metrics.

## Current Prototype

The current app includes:

- PDF upload and text extraction
- AI-generated summary and questions
- A PDF viewer
- Session-based chat over extracted PDF text
- Experimental translation support, including Quechua (`qu`) where provider support is available

The current prototype is useful for demonstrating the idea, but it is not yet the full v2 learning system described in the project issues.

## Important Limitations

- Quechua output is experimental and has not been formally validated for language quality, dialect fit, or educational suitability.
- Cultural examples are prompt-guided only; this project does not claim cultural authority or community validation.
- The current chat attempts to use PDF context, but it does not yet provide robust semantic retrieval, durable citations, or measured hallucination resistance.
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
- `react-pdftotext` and PDF viewer libraries
- In-memory session storage for the current prototype

## Project Structure

```text
app/
  landing/              Current upload and learning flow
  viewer/               Viewer route using the current learning flow
  api/
    process/            PDF text processing, summary, questions, session creation
    chat/               Chat over the current in-memory session
    translate/          Translation helper endpoint
components/             UI panels, PDF viewer, chat, and shared controls
lib/                    AI model setup, translation, retrieval, session helpers
public/                 Static assets
```

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- Google AI and Google Cloud credentials for AI and translation features

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
```

### Develop

```bash
pnpm dev
```

Open `http://localhost:3000`.

## API Overview

### `POST /api/process`

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

### `POST /api/chat`

Streams a chat response for an existing in-memory session.

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
pnpm build
```

Tests will be added as the v2 modules are introduced.

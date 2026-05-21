# WarmiMIND v2 Architecture

WarmiMIND v2 is planned as a source-grounded AI STEM learning workspace over uploaded PDFs.

## Current Transition State

The current public Next.js prototype remains at the repository root:

```text
app/
components/
lib/
```

This preserves the working demo while v2 architecture is introduced incrementally.

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
  -> web sends file to api
  -> api validates and stores upload
  -> api extracts text and creates chunks
  -> api embeds chunks into pgvector
  -> api creates a learning session
  -> web displays summary, concepts, questions, chat, checks, and next action
```

## v2 API Boundary

Backend routes should be versioned under `/api/v1`. The initial skeleton exposes:

- `GET /health`
- `GET /api/v1/health`

Planned routes are tracked in the GitHub issues and will be introduced as each module lands.

## Preservation Rule

Until the v2 workspace replaces it, the root Next.js demo should remain buildable. New v2 backend, data, docs, and evaluation work should be additive unless an issue explicitly migrates the old demo.

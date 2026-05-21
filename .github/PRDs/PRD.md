# Product Requirements Document: WarmiMIND v2

## 1. Executive Summary

WarmiMIND v2 is a source-grounded AI STEM learning workspace that turns one uploaded STEM PDF into a structured study session. The product helps students move from passive reading to active learning through document overview, source chunks, cited summary, key concepts, guided questions, tutor chat, misconception checks, learning state, next recommended action, and evaluation metrics.

The MVP goal is to prove a credible end-to-end learning system, not a generic PDF chatbot. The system must build cleanly, avoid unsupported language or cultural claims, and measure retrieval/citation/refusal behavior before public demo positioning.

## 2. Mission

WarmiMIND helps students study dense STEM material with AI that stays connected to the uploaded source.

Core principles:

- Structure learning, not just answers.
- Cite the PDF whenever making claims about the document.
- Refuse or clarify when evidence is weak.
- Support Spanish and English first.
- Label Quechua support as experimental until reviewed.
- Avoid fake mastery scores, grades, cultural authority, or hallucination guarantees.

## 3. Target Users

### Student Learner

Pain points:

- Dense STEM PDFs are difficult to break into studyable pieces.
- It is hard to know what to focus on first.
- Generic AI answers may drift away from the actual document.

Needs:

- A clear study path.
- Simple explanations.
- Evidence-backed answers.
- Practice questions and feedback.

### Technical Reviewer

Pain points:

- AI learning demos often overclaim and under-measure.
- Frontend/backend boundaries can be unclear.
- Retrieval and grounding claims are hard to inspect.

Needs:

- Clean architecture.
- Typed API contracts.
- Persistent data model.
- Tests and eval metrics.
- Documented limitations.

## 4. MVP Scope

### In Scope

- [ ] Upload one STEM PDF.
- [ ] Validate PDF type and size before unsafe processing.
- [ ] Store document metadata and extracted text.
- [ ] Chunk document text with stable chunk IDs.
- [ ] Generate embeddings and retrieve relevant chunks.
- [ ] Create a persistent learning session.
- [ ] Generate cited source-grounded summary.
- [ ] Extract key concepts with citations.
- [ ] Generate guided questions with difficulty and evidence.
- [ ] Provide tutor chat with citations.
- [ ] Refuse unsupported questions when retrieval confidence is low.
- [ ] Run misconception checks and update learning state.
- [ ] Show weak concepts and next recommended action.
- [ ] Provide eval runner and dashboard.
- [ ] Document methodology, architecture, setup, limitations, and demo flow.

### Out Of Scope

- [ ] Teacher dashboard.
- [ ] Classroom management.
- [ ] User accounts.
- [ ] Multi-document knowledge base.
- [ ] Social features.
- [ ] Flashcards and spaced repetition.
- [ ] Grades, mastery percentages, streaks, or leaderboards.
- [ ] Production Quechua quality claims.
- [ ] Cultural validation claims.
- [ ] Mobile app.

## 5. User Stories

1. As a student, I want to upload a STEM PDF so that I can start a structured study session.
2. As a student, I want to see source chunks so that I can inspect what the system extracted.
3. As a student, I want a cited summary so that I can verify where key claims came from.
4. As a student, I want guided questions by difficulty so that I can practice actively.
5. As a student, I want tutor chat answers with citations so that I can trust the response.
6. As a student, I want unsupported questions to be refused so that the system does not invent answers.
7. As a student, I want misconception feedback so that I know what I got right and what to review.
8. As a reviewer, I want eval metrics so that grounding quality is measured rather than assumed.

## 6. Core Architecture

High-level architecture:

```text
web / Next.js
  -> upload and learning workspace UI
  -> calls FastAPI backend through configured API base URL

api / FastAPI
  -> validates uploads
  -> extracts and chunks PDF text
  -> creates embeddings
  -> retrieves chunks
  -> generates learning artifacts
  -> stores learning state
  -> runs evals

Supabase
  -> Postgres structured records
  -> Storage uploaded PDFs
  -> pgvector chunk retrieval

docs / evals
  -> architecture, ADRs, methodology, limitations
  -> seeded eval cases and metric definitions
```

Directory structure:

```text
web/         Future v2 frontend boundary
app/         Current Next.js demo and review routes
api/         FastAPI backend
migrations/ Supabase SQL migrations
evals/       Eval fixtures
docs/        PRD, ADRs, methodology, limitations, demo materials
```

## 7. Tools And Features

### PDF Upload

- Accept PDF only.
- Enforce size limits before reading entire body into memory.
- Reject empty files.
- Store document metadata.

### PDF Chunking

- Extract text server-side.
- Create stable chunk IDs.
- Preserve page or section references when available.
- Store char count and embedding.

### Retrieval

- Use semantic retrieval over document chunks.
- Return chunk ID, score, snippet, and page reference.
- Apply a minimum similarity threshold.
- Return no-evidence result when retrieval confidence is weak.

### Summary And Concepts

- Generate only from retrieved/source chunks.
- Include citation references.
- Avoid outside knowledge unless a future explicit mode allows it.

### Guided Questions

- Generate questions tied to concepts and evidence.
- Include difficulty labels: foundation, practice, challenge.
- Store attempted answers.

### Tutor Chat

- Retrieve before answering.
- Cite chunks in answers.
- Refuse or ask for clarification when evidence is weak.

### Misconception Checks

- Compare student answer against source evidence.
- Return correct points, missing points, and what to review next.
- Update weak concepts and next recommended action.

### Evaluation Dashboard

- Show retrieval hit rate.
- Show citation coverage.
- Show refusal pass rate.
- Show guided-question quality.
- Show latency and per-question results.

## 8. Technology Stack

Frontend:

- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn-style components

Backend:

- FastAPI
- Pydantic
- Python service modules
- Uvicorn

Data:

- Supabase Postgres
- Supabase Storage
- pgvector

AI:

- Provider wrapper for embeddings and generation.
- Deterministic local test doubles for validation.

Validation:

- ESLint
- TypeScript
- Python unittest
- `python -m compileall`
- Eval runner

## 9. Security And Configuration

Environment variables:

```env
GOOGLE_CLOUD_PROJECT_ID=
GOOGLE_GENERATIVE_AI_API_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_STORAGE_BUCKET=documents
```

Security requirements:

- No secrets in source code.
- `.env.local` and production secrets stay out of git.
- Validate file extension, MIME type, size, and empty content.
- Enforce request body limits before reading full uploads.
- Do not log full PDF text.
- Do not expose stack traces or provider errors to clients.
- Use signed URLs or scoped storage access for uploaded PDFs.
- Enable Supabase Row Level Security before production user data.
- Run dependency audits before release.

## 10. API Specification

### Health

`GET /health`

Response:

```json
{ "status": "ok", "service": "WarmiMIND API" }
```

`GET /api/v1/health`

Response:

```json
{ "status": "ok", "service": "WarmiMIND API", "version": "0.1.0" }
```

### Documents

`POST /api/v1/documents`

Request:

- multipart form field `file`: PDF

Response:

```json
{
  "document": {
    "document_id": "uuid",
    "title": "physics",
    "file_name": "physics.pdf",
    "content_type": "application/pdf",
    "size_bytes": 12345,
    "detected_language": "en",
    "status": "processed"
  },
  "chunks": []
}
```

`GET /api/v1/documents/{document_id}`

Response:

```json
{ "document": {}, "chunks": [] }
```

### Learning Sessions

`POST /api/v1/learning-sessions`

Request:

```json
{ "document_id": "uuid" }
```

`GET /api/v1/learning-sessions/{session_id}`

Response:

```json
{
  "session_id": "uuid",
  "document_id": "uuid",
  "status": "processed",
  "summary": "string",
  "concepts": [],
  "guided_questions": [],
  "weak_concepts": [],
  "next_recommended_action": "string"
}
```

### Retrieval

`POST /api/v1/learning-sessions/{session_id}/retrieve`

Request:

```json
{ "query": "What is energy?" }
```

Response:

```json
{
  "results": [
    {
      "chunk_id": "chunk-id",
      "score": 0.82,
      "snippet": "source text",
      "page": 1
    }
  ]
}
```

### Learning Outputs

`POST /api/v1/learning-sessions/{session_id}/summary`

`POST /api/v1/learning-sessions/{session_id}/concepts`

`POST /api/v1/learning-sessions/{session_id}/questions`

All generated outputs must include citations where applicable.

### Tutor Chat

`POST /api/v1/learning-sessions/{session_id}/chat`

Request:

```json
{ "message": "Can you explain velocity?" }
```

Response:

```json
{
  "message": {
    "role": "assistant",
    "content": "Based on the PDF...",
    "citations": []
  }
}
```

### Misconception Checks

`POST /api/v1/learning-sessions/{session_id}/misconception-checks`

Request:

```json
{
  "question": "What is energy?",
  "student_answer": "Energy is..."
}
```

Response:

```json
{
  "check": {
    "correct": [],
    "missing": [],
    "review_next": "string",
    "citations": []
  }
}
```

### Evals

`POST /api/v1/evals/runs`

`GET /api/v1/evals/runs`

`GET /api/v1/evals/runs/{run_id}`

## 11. Success Criteria

MVP success means:

- Public repo builds successfully.
- Upload size is enforced before reading entire files into memory.
- One PDF can create a document and learning session.
- Extracted chunks are inspectable.
- Retrieval returns ranked chunks with scores and references.
- Unsupported questions refuse when retrieval confidence is low.
- Summary, concepts, questions, chat, and checks include citations.
- Learning state updates after a misconception check.
- Eval dashboard reports retrieval, citation, refusal, question quality, and latency.
- README and docs avoid unsupported language/cultural/anti-hallucination claims.
- Dependency audit is reviewed and high/critical vulnerabilities are resolved or documented with mitigation.

## 12. Implementation Phases

### Phase 1: Stabilize Public Baseline

Deliverables:

- Resolve merge conflicts.
- Build and lint pass.
- Rewrite README claims.
- Sanitize public error responses.

### Phase 2: v2 Skeleton And Core Session

Deliverables:

- FastAPI service.
- Health endpoints.
- Document/session routes.
- Migrations for documents, chunks, and learning sessions.
- Frontend backend API config.

### Phase 3: Learning Outputs And Retrieval

Deliverables:

- Embeddings and retrieval.
- Summary/concepts/questions.
- Tutor chat with citations.
- Misconception checks and learning state.
- Progress/next action UI.

### Phase 4: Evaluation And Public Review

Deliverables:

- Eval runner.
- Eval dashboard.
- ADRs.
- Methodology and limitations.
- Screenshots and demo script.

## 13. Future Considerations

- Full production PDF parser.
- Real embedding and generation provider wrappers.
- Persistent Supabase repository layer.
- User accounts and private sessions.
- Signed PDF storage URLs.
- Rich PDF viewer citation highlighting.
- Larger eval corpus.
- Human-reviewed Spanish and Quechua learning outputs.
- Teacher-facing tools.

## 14. Risks And Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Upload endpoint reads large files before size enforcement | Memory exhaustion / denial of service | Stream upload with early cutoff and configure ASGI/proxy body limits |
| Weak retrieval threshold returns citations for unsupported questions | Hallucination-like false grounding | Add minimum similarity threshold and unsupported-question regression tests |
| Migration vector dimension differs from runtime embedding dimension | Persistence insert failures | Align SQL vector dimension with provider output or deterministic test vector size |
| Raw service errors escape from learning endpoints | Client sees 500s for expected validation errors | Wrap all service calls and map `UserFacingError` to stable HTTP errors |
| Dependency audit includes high/critical vulnerabilities | Unsafe public deployment posture | Upgrade vulnerable packages, remove unused risky dependencies, document remaining exceptions |

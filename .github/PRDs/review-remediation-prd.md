# Product Requirements Document: WarmiMIND Review Remediation

## 1. Executive Summary

WarmiMIND has a validated v2 backend skeleton and review surfaces, but the whole-project review found that the first user-facing route still points at legacy prototype behavior. The remediation goal is to make the public app path match the v2 product promise: safe PDF upload, source-grounded retrieval, refusal on weak evidence, clear limitations, and a migration-ready data/security posture.

The MVP goal for this remediation pass is not to add new learning features. It is to close the gap between the safe v2 backend and the visible demo so reviewers and users experience the system described in the PRD rather than the older in-browser PDF extraction flow.

## 2. Mission

Make WarmiMIND credible from the first click.

Core principles:

- The root route must show a useful product entry point.
- The visible upload path must use the v2 API boundary.
- Public answers must cite source evidence or refuse.
- Experimental Quechua and cultural language must be clearly labeled and must not be the default claim.
- Data storage and migrations must not imply production readiness without access controls.
- Review routes, docs, and implementation should tell the same story.

## 3. Target Users

### Student Learner

Pain points:

- A blank home page makes the app feel broken.
- Unsupported AI answers can be mistaken for document-backed learning.
- Uploading documents requires trust in privacy and retention behavior.

Needs:

- A clear first screen.
- Safe upload feedback.
- Source-backed summaries and tutor answers.
- Honest limitations when the system cannot answer.

### Technical Reviewer

Pain points:

- The repo has both a legacy Next.js demo and a v2 FastAPI skeleton.
- It is hard to know which path represents product intent.
- Security and data posture must be visible before production planning.

Needs:

- A single recommended review path.
- API calls that exercise the v2 backend.
- Tests covering refusal and upload behavior in the visible flow.
- Documented access-control requirements for Supabase.

## 4. MVP Scope

### In Scope

- [ ] Replace the blank root page with a useful entry point.
- [ ] Route the visible PDF upload flow through the FastAPI v2 document/session APIs.
- [ ] Remove or demote the legacy `/api/process` and `/api/chat` flow from the default user journey.
- [ ] Ensure tutor chat refuses unsupported questions when no source chunk clears confidence thresholds.
- [ ] Stop logging extracted PDF content or full AI processing payloads.
- [ ] Add frontend/API integration tests or focused route tests for the visible upload and refusal flow.
- [ ] Add Supabase RLS/access-control migration notes or policies before production positioning.
- [ ] Update docs so `/`, `/workspace`, `/landing`, and API status are consistent.

### Out Of Scope

- [ ] Full user account system.
- [ ] Teacher dashboard.
- [ ] Multi-document library.
- [ ] Production Quechua quality certification.
- [ ] Community validation claims.
- [ ] Full Supabase persistence implementation beyond access-control-ready schema work.
- [ ] Mobile app.

## 5. User Stories

1. As a student, I want the home page to show the learning workspace entry point so that I can start without guessing the route.
2. As a student, I want PDF uploads to use the same size and type checks as the backend so that unsafe files are rejected predictably.
3. As a student, I want tutor answers to cite the uploaded source or refuse so that I do not learn unsupported claims.
4. As a reviewer, I want the visible demo to exercise the v2 API so that validation reflects the product direction.
5. As a reviewer, I want legacy prototype routes labeled or removed from the default flow so that scope is not ambiguous.
6. As a maintainer, I want sensitive document text kept out of browser/server logs so that uploaded content is handled carefully.
7. As a deployer, I want Supabase access-control requirements captured in migrations or docs so that production planning does not miss RLS.

## 6. Core Architecture

Target remediation flow:

```text
Browser root route
  -> shows workspace/upload entry point
  -> posts PDF file to FastAPI `/api/v1/documents`
  -> creates session through `/api/v1/learning-sessions`
  -> calls summary/concepts/questions/chat endpoints
  -> renders citations, next action, and refusal states
```

Directory impact:

```text
app/             Root route and current demo routing decisions
components/      Upload, workspace, chat, summary, question UI
lib/             Backend API client helpers
api/             FastAPI v2 endpoints and service behavior
migrations/      Supabase schema and access-control posture
docs/            Updated review path and limitation language
tests/evals      Regression coverage for visible user flow
```

## 7. Tools And Features

### Root Route

- Replace the empty root screen with either the v2 workspace or a clear redirect/link surface.
- The root page must not appear blank after `pnpm dev`.

### V2 Upload Integration

- Send the actual PDF file to `POST /api/v1/documents`.
- Respect the 12 MB upload limit.
- Show stable error messages for invalid type, empty file, and oversized file.
- Avoid logging extracted document text.

### Session And Learning Output Flow

- Create a learning session from the uploaded document ID.
- Fetch or generate summary, concepts, and guided questions from v2 endpoints.
- Render citations where returned.
- Show next recommended action.

### Tutor Chat Refusal

- Use the v2 chat endpoint or apply equivalent confidence-threshold behavior.
- If no evidence clears the threshold, show a refusal/clarification message.
- Do not summarize closest chunks as an answer to unsupported questions.

### Legacy Route Handling

- Decide whether `/api/process`, `/api/chat`, and `/landing` remain as legacy demo routes.
- If they remain, label them in UI/docs as legacy and exclude them from the recommended review path.

### Supabase Security Posture

- Add RLS/access-control notes or starter policies for v2 tables.
- Include owner/user columns if production persistence is planned.
- Document that public deployment requires auth and storage policies before accepting real student PDFs.

## 8. Technology Stack

Frontend:

- Next.js
- React
- TypeScript
- Tailwind CSS
- Existing component primitives

Backend:

- FastAPI
- Pydantic
- Python service modules
- Uvicorn

Data:

- Supabase Postgres
- Supabase Storage
- pgvector
- RLS policies before production

AI:

- Deterministic local service logic for current validation
- Provider wrappers for later embeddings and generation
- Explicit refusal behavior when retrieval confidence is low

Validation:

- ESLint
- TypeScript
- Python unittest
- `python -m compileall`
- Next.js build
- pnpm audit
- Focused visible-flow tests

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

- No full PDF text in console logs.
- No production upload path without size/type validation.
- No public Supabase tables without RLS or equivalent access controls.
- No service role key exposed to browser code.
- No unsupported cultural or language-quality claims in default UI.
- Clear distinction between local deterministic validation and production AI behavior.

## 10. API Specification

### `POST /api/v1/documents`

Uploads one PDF.

Request:

```http
Content-Type: multipart/form-data
file=<PDF>
```

Success response:

```json
{
  "document": {
    "document_id": "uuid",
    "file_name": "lesson.pdf",
    "content_type": "application/pdf",
    "size_bytes": 12345,
    "detected_language": "en"
  },
  "chunks": [
    {
      "chunk_id": "uuid-chunk-1",
      "snippet": "..."
    }
  ]
}
```

Failure responses:

- `400` invalid file type or empty upload
- `413` upload exceeds configured limit

### `POST /api/v1/learning-sessions`

Creates a learning session from a document.

Request:

```json
{ "document_id": "uuid" }
```

### `POST /api/v1/learning-sessions/{session_id}/summary`

Generates a cited source-grounded summary.

### `POST /api/v1/learning-sessions/{session_id}/concepts`

Extracts cited concepts.

### `POST /api/v1/learning-sessions/{session_id}/questions`

Generates evidence-linked guided questions.

### `POST /api/v1/learning-sessions/{session_id}/chat`

Answers a question with citations or refuses when evidence is weak.

Request:

```json
{ "message": "What does the source say about energy?" }
```

Refusal response shape:

```json
{
  "message": {
    "content": "I could not find enough support in the uploaded PDF...",
    "citations": []
  }
}
```

## 11. Success Criteria

- Root route is no longer blank.
- The recommended user flow exercises FastAPI v2 endpoints.
- Oversized PDF upload is rejected before full unsafe processing.
- Unsupported tutor questions return zero citations and a refusal message.
- No full extracted PDF text appears in browser or server logs.
- Docs identify one recommended review/demo path.
- Supabase production-readiness gap is captured with RLS/access-control requirements.
- Validation passes:
  - `python -m compileall api`
  - `pnpm test`
  - `pnpm lint`
  - `pnpm exec tsc --noEmit --pretty false`
  - `pnpm build`
  - `pnpm audit --audit-level low`

## 12. Implementation Phases

### Phase 1: Public Entry Point And Routing

Deliverables:

- Replace blank root page.
- Clarify `/workspace` and `/landing` roles.
- Update README route guidance.

### Phase 2: V2 Frontend Integration

Deliverables:

- Upload component calls FastAPI documents endpoint.
- Session creation and learning output calls use v2 API helpers.
- UI renders citations, refusal states, and next action.

### Phase 3: Legacy Flow Containment

Deliverables:

- Remove full-text logs.
- Label or demote legacy Next API routes.
- Prevent unsupported-answer behavior in any route reachable from the recommended demo.

### Phase 4: Security And Validation Hardening

Deliverables:

- Add RLS/access-control migration notes or starter policies.
- Add visible-flow tests.
- Run full validation and audit.

## 13. Future Considerations

- Replace deterministic backend text extraction with a robust server-side PDF parser.
- Add authenticated user sessions and document ownership.
- Add persistent Supabase storage and query-backed service implementations.
- Add real eval fixtures with STEM PDFs and expected chunk IDs.
- Add human-reviewed Quechua language quality workflows.
- Add deployment checks for env vars, CORS, auth, and storage policies.

## 14. Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| The repo keeps two divergent demo paths. | Make one route the recommended path and label legacy routes clearly. |
| Frontend integration with FastAPI increases local setup friction. | Use `NEXT_PUBLIC_API_BASE_URL`, clear docs, and graceful offline error states. |
| Supabase schema looks production-ready before access controls exist. | Add RLS notes/policies and production-readiness warnings. |
| Quechua/cultural output overclaims quality. | Keep it opt-in/experimental and require human review before claims. |
| Tests pass but do not cover the visible user journey. | Add focused tests for root route, upload error handling, and unsupported chat refusal. |

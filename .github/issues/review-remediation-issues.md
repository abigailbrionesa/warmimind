# WarmiMIND Review Remediation Issue Specifications

Generated from `.github/PRDs/review-remediation-prd.md` using the local `/create-issues` workflow as the `/to-issues` fallback.

These issues capture the whole-project review findings that remain after the v2 backend skeleton work. They focus on making the visible product path match the safer v2 API and documented product promise.

## Issue 1: Replace blank root route with the recommended WarmiMIND entry point

**Type**: bug  
**Complexity**: Small  
**Labels**: `bug`, `area:frontend`, `area:docs`, `priority:p0`

### Description

The root route currently renders an empty page even though the README tells users to open `http://localhost:3000`. This makes a fresh local run look broken and hides the actual review/demo paths.

### Acceptance Criteria

- [ ] Replace the blank root route with a useful WarmiMIND entry point
- [ ] Link or route users to the recommended v2 workspace/demo path
- [ ] Update README route guidance to match the implemented entry point
- [ ] Ensure `pnpm build` includes a non-empty `/` page

### Dependencies

None.

## Issue 2: Route the visible PDF upload flow through the v2 FastAPI backend

**Type**: enhancement  
**Complexity**: Large  
**Labels**: `enhancement`, `area:frontend`, `area:backend`, `priority:p0`

### Description

The visible upload flow still extracts PDF text in the browser and posts full text to the legacy Next.js `/api/process` route. The recommended user journey should exercise the v2 FastAPI document/session endpoints so upload validation, chunking, citations, and refusal behavior are consistent with the PRD.

### Acceptance Criteria

- [ ] Upload the actual PDF file to `POST /api/v1/documents`
- [ ] Create a learning session through `POST /api/v1/learning-sessions`
- [ ] Generate or fetch summary, concepts, guided questions, and next action through v2 endpoints
- [ ] Render citations and stable upload errors in the frontend
- [ ] Do not log extracted PDF text or full processing payloads

### Dependencies

Depends on Issue 1.

## Issue 3: Contain legacy Next.js AI routes and enforce refusal behavior on reachable chat paths

**Type**: bug  
**Complexity**: Medium  
**Labels**: `bug`, `area:frontend`, `area:backend`, `area:ai`, `priority:p0`

### Description

The legacy `/api/chat` route still tells the model to summarize closest content when the exact answer is missing. Any chat path reachable from the recommended demo must cite source evidence or refuse when retrieval confidence is weak.

### Acceptance Criteria

- [ ] Ensure the recommended chat flow uses the v2 chat endpoint or equivalent threshold behavior
- [ ] Return a clear refusal or clarification response when no source evidence clears the threshold
- [ ] Remove or label legacy `/api/process`, `/api/chat`, and `/landing` routes outside the recommended journey
- [ ] Add regression coverage for unsupported questions in the visible flow

### Dependencies

Depends on Issue 2.

## Issue 4: Add Supabase access-control posture before production positioning

**Type**: technical  
**Complexity**: Medium  
**Labels**: `enhancement`, `area:data`, `area:architecture`, `priority:p1`

### Description

The Supabase migrations create document, chunk, session, chat, and eval tables without row-level security policies or ownership fields. Before real uploaded documents are accepted in production, the data model must document and/or implement access controls.

### Acceptance Criteria

- [ ] Decide whether MVP persistence requires authenticated ownership columns now
- [ ] Add RLS notes, starter policies, or a follow-up migration for v2 tables
- [ ] Document that service-role keys must remain server-only
- [ ] Update limitations/deployment docs with production storage and access-control requirements

### Dependencies

Can run in parallel with Issues 1-3.

## Issue 5: Add visible-flow validation coverage and update review documentation

**Type**: technical  
**Complexity**: Medium  
**Labels**: `enhancement`, `area:frontend`, `area:backend`, `area:docs`, `area:evals`, `priority:p1`

### Description

Current validation covers the deterministic backend and build, but not the visible user journey. Add focused tests or documented checks for the root route, v2 upload integration, unsupported-question refusal, and docs consistency.

### Acceptance Criteria

- [ ] Add tests or scripted checks proving `/` is non-empty
- [ ] Add focused coverage for visible upload error handling
- [ ] Add visible-flow coverage for unsupported chat refusal
- [ ] Update docs to identify one recommended review/demo path
- [ ] Run and document full validation: compile, tests, lint, typecheck, build, and audit

### Dependencies

Depends on Issues 1-3.

# WarmiMIND v2 PRD Issue Specifications

Generated from `.github/PRDs/PRD.md` using the local `/create-issues` workflow.

Existing issues #1-#14 already cover the core v2 roadmap. These issues capture the missing follow-up work identified by the PRD success criteria and review risks.

## Issue 1: Enforce upload size before reading full PDF body

**Type**: bug  
**Complexity**: Medium  
**Labels**: `bug`, `area:backend`, `priority:p0`

### Description

The v2 FastAPI upload endpoint currently reads the whole multipart body before file size enforcement runs. This violates the PRD security requirement to enforce request body limits before unsafe processing and can allow memory exhaustion with oversized uploads.

### Acceptance Criteria

- [ ] Enforce a request/body size limit before or during upload streaming
- [ ] Stream-read uploaded files with an early cutoff at the configured max size
- [ ] Return a stable 400/413 response for oversized files
- [ ] Add a regression test that proves oversized uploads are rejected without full processing
- [ ] Document the upload limit in API docs

### Dependencies

Depends on #4.

## Issue 2: Add retrieval confidence threshold and unsupported-question regression tests

**Type**: bug  
**Complexity**: Medium  
**Labels**: `bug`, `area:ai`, `area:backend`, `area:evals`, `priority:p0`

### Description

Unsupported tutor questions can still receive cited answers because the deterministic embedding space is small and any positive retrieval score creates a citation. WarmiMIND must refuse or ask for clarification when retrieval confidence is weak.

### Acceptance Criteria

- [ ] Add a minimum retrieval similarity threshold
- [ ] Return an explicit no-evidence result when all chunks are below threshold
- [ ] Make tutor chat refuse unsupported questions when no evidence clears the threshold
- [ ] Add a regression test for an unsupported question against a seeded STEM source
- [ ] Add eval coverage for unsupported-question refusal pass rate

### Dependencies

Depends on #6 and #9.

## Issue 3: Map all learning-service user errors to stable HTTP responses

**Type**: bug  
**Complexity**: Small  
**Labels**: `bug`, `area:backend`, `priority:p1`

### Description

Several v2 learning endpoints allow `UserFacingError` to escape as a 500 for expected cases like missing sessions or unavailable chunks. Public API routes should return stable 4xx responses for user-correctable errors.

### Acceptance Criteria

- [ ] Wrap retrieve, summary, concepts, questions, chat, and misconception-check service calls
- [ ] Convert `UserFacingError` into stable `HTTPException` responses
- [ ] Avoid exposing stack traces or provider/internal details
- [ ] Add tests for missing session behavior on at least two learning endpoints

### Dependencies

Depends on #3.

## Issue 4: Align embedding dimensions between runtime and pgvector migration

**Type**: bug  
**Complexity**: Small  
**Labels**: `bug`, `area:data`, `area:ai`, `priority:p1`

### Description

The deterministic runtime embedding wrapper currently produces 16-dimensional vectors, while the SQL migration declares `vector(1536)`. This will break persistence when chunk embeddings are inserted into pgvector.

### Acceptance Criteria

- [ ] Choose and document the MVP embedding dimension
- [ ] Align `EMBEDDING_DIMENSIONS` with the migration schema
- [ ] Add a test or migration check that detects dimension mismatch
- [ ] Update ADR/docs if the dimension is intentionally provider-specific

### Dependencies

Depends on #6.

## Issue 5: Resolve high and critical dependency audit findings

**Type**: bug  
**Complexity**: Large  
**Labels**: `bug`, `area:architecture`, `priority:p0`

### Description

`pnpm audit --audit-level moderate` reports high and critical vulnerabilities, including vulnerable `next`, `protobufjs`, and transitive packages through development tooling. Public review or deployment should not proceed without resolving or explicitly documenting mitigations.

### Acceptance Criteria

- [ ] Upgrade direct dependencies with available patched versions
- [ ] Remove unused high-risk dependencies where practical
- [ ] Re-run `pnpm audit --audit-level moderate`
- [ ] Document any remaining accepted risk with scope and mitigation
- [ ] Ensure `pnpm lint`, `pnpm test`, `pnpm exec tsc --noEmit`, and `pnpm build` still pass

### Dependencies

Depends on #2.

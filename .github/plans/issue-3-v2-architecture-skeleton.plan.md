# Plan: Issue 3 - Establish v2 Architecture Skeleton

## Summary

Create the first v2 architecture skeleton while preserving the current Next.js demo. The skeleton introduces top-level boundaries for the future web workspace, FastAPI backend, migrations, evals, and docs without moving the existing app yet. This keeps the public baseline buildable while making the v2 direction explicit.

## User Story

As a technical reviewer
I want clear frontend/backend/data/eval/documentation boundaries
So that the v2 learning workspace can be built incrementally from a credible architecture.

## Metadata

| Field | Value |
|---|---|
| GitHub Issue | #3 |
| Type | NEW_CAPABILITY / ARCHITECTURE |
| Complexity | MEDIUM |
| Systems Affected | Repo structure, FastAPI backend skeleton, frontend env config, docs |

## Patterns to Follow

### Existing Frontend Baseline

```text
app/
components/
lib/
```

The current demo remains in the root Next.js app during transition.

### Planned v2 Boundary

```text
web/         Future home for the Next.js learning workspace
api/         FastAPI document and AI backend
migrations/ Supabase SQL migrations
evals/       Evaluation fixtures and runner assets
docs/        Architecture, methodology, limitations, ADRs
```

## Files to Change

| File | Action | Purpose |
|---|---|---|
| `web/README.md` | CREATE | Define frontend transition boundary |
| `api/app/main.py` | CREATE | FastAPI app entrypoint |
| `api/app/api/v1/health.py` | CREATE | Health route |
| `api/app/api/v1/router.py` | CREATE | Versioned API router |
| `api/app/core/config.py` | CREATE | Backend settings skeleton |
| `api/requirements.txt` | CREATE | Backend runtime dependencies |
| `api/README.md` | CREATE | Backend setup and route notes |
| `migrations/README.md` | CREATE | Supabase migration boundary |
| `evals/README.md` | CREATE | Eval assets boundary |
| `docs/architecture.md` | CREATE | Initial architecture overview |
| `docs/adr/*.md` | CREATE | ADR placeholders |
| `.env.example` | CREATE | Frontend/backend environment variables |
| `lib/backend-api.ts` | CREATE | Frontend backend API URL helper |

## Tasks

### Task 1: Create v2 Branch

- **Target**: Git branch
- **Action**: CREATE
- **Implement**: Create and work on branch `v2-learning-workspace`.
- **Mirror**: Issue #3 acceptance criteria
- **Validate**: `git branch --show-current`
- **Status**: [x] Complete

### Task 2: Add v2 Repo Boundaries

- **Files**: `web/README.md`, `migrations/README.md`, `evals/README.md`
- **Action**: CREATE
- **Implement**: Add lightweight boundary docs so the repo structure exists without moving the stable demo yet.
- **Mirror**: Issue #1 architecture section
- **Validate**: `Test-Path web,api,migrations,evals,docs`
- **Status**: [x] Complete

### Task 3: Add FastAPI Health Skeleton

- **Files**: `api/app/main.py`, `api/app/api/v1/health.py`, `api/app/api/v1/router.py`, `api/app/core/config.py`, `api/requirements.txt`, `api/README.md`
- **Action**: CREATE
- **Implement**: Add a versioned FastAPI service with `GET /health` and `GET /api/v1/health`.
- **Mirror**: Issue #1 planned backend API contracts
- **Validate**: `python -m compileall api`
- **Status**: [x] Complete

### Task 4: Add Frontend Backend URL Config

- **Files**: `.env.example`, `lib/backend-api.ts`
- **Action**: CREATE
- **Implement**: Add `NEXT_PUBLIC_API_BASE_URL` and a typed helper for frontend calls to the future backend.
- **Mirror**: Existing frontend `lib/*` helper pattern
- **Validate**: `pnpm exec tsc --noEmit --pretty false`
- **Status**: [x] Complete

### Task 5: Add Architecture Docs And ADR Placeholders

- **Files**: `docs/architecture.md`, `docs/adr/*.md`
- **Action**: CREATE
- **Implement**: Document the transition, old demo preservation, and ADR placeholders for FastAPI, Supabase, pgvector, source-grounded generation, and learning state.
- **Mirror**: Issue #1 required documentation section
- **Validate**: `Test-Path docs/architecture.md`
- **Status**: [x] Complete

### Task 6: Run Validation

- **Target**: Repository
- **Action**: VALIDATE
- **Implement**: Run lint, typecheck, Python compile, and build. Record missing tests if still unavailable.
- **Mirror**: `/validate`
- **Validate**: `pnpm lint`, `pnpm exec tsc --noEmit --pretty false`, `python -m compileall api`, `pnpm build`
- **Status**: [x] Complete

## Validation

```powershell
git branch --show-current
Test-Path web,api,migrations,evals,docs
python -m compileall api
pnpm lint
pnpm exec tsc --noEmit --pretty false
pnpm build
```

## Validation Results

| Check | Result | Details |
|---|---|---|
| Branch | Passed | Current branch is `v2-learning-workspace` |
| Directory structure | Passed | `web`, `api`, `migrations`, `evals`, and `docs` exist |
| Python compile | Passed | `python -m compileall api` completed successfully |
| Lint | Passed | `pnpm lint` completed successfully |
| Type check | Passed | `pnpm exec tsc --noEmit --pretty false` completed successfully |
| Build | Passed | `pnpm build` completed successfully |

## Acceptance Criteria

- [x] Create a v2 branch named `v2-learning-workspace`
- [x] Add structure for `web`, `api`, `migrations`, `evals`, and `docs`
- [x] Add FastAPI service skeleton with health endpoint
- [x] Add frontend environment configuration for backend API URL
- [x] Add initial architecture doc and ADR placeholders
- [x] Confirm old demo code is preserved or clearly separated during the transition

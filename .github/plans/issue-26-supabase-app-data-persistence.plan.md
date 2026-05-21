# Plan: Supabase App Data Persistence

## Summary

Issue #26 adds a repository layer under the FastAPI learning service so WarmiMIND can persist document metadata, extracted text, chunks, learning sessions, learning outputs, misconception checks, and eval runs in Supabase when configured. The existing in-memory behavior remains the default fallback for local validation and tests.

## User Story

As a WarmiMIND operator
I want learning-session app data to persist outside process memory
So that processed documents and study sessions survive API restarts before raw PDF storage is added.

## Metadata

| Field | Value |
|-------|-------|
| Type | ENHANCEMENT |
| Complexity | HIGH |
| Systems Affected | FastAPI services, repository layer, migrations, tests, docs |
| GitHub Issue | #26 |

---

## Patterns to Follow

### Service State

```python
# SOURCE: api/app/services.py
store.documents[document_id] = document
store.document_text[document_id] = text
store.chunks[document_id] = chunks
```

Keep service functions deterministic, but move state access behind repository methods.

### API Error Handling

```python
# SOURCE: api/app/api/v1/learning.py
except services.UserFacingError as exc:
    raise user_error(exc, status_code=404) from exc
```

Keep user-facing service failures mapped to stable HTTP responses.

### Tests

```python
# SOURCE: api/tests/test_services.py
def setUp(self) -> None:
    services.store.documents.clear()
```

Preserve an in-memory repository with dictionary attributes so current tests stay simple, and add repository-specific tests for persistence behavior.

---

## Files to Change

| File | Action | Purpose |
|------|--------|---------|
| `api/app/repositories.py` | CREATE | Add repository protocol, in-memory repository, and optional Supabase repository |
| `api/app/core/config.py` | UPDATE | Add Supabase repository configuration |
| `api/app/services.py` | UPDATE | Replace direct store coupling with repository methods |
| `api/app/api/v1/learning.py` | UPDATE | Use service accessors for documents and eval runs |
| `migrations/0005_persist_extracted_text.sql` | CREATE | Persist extracted PDF text with document metadata |
| `api/requirements.txt` | UPDATE | Add optional Supabase client dependency |
| `api/tests/test_repositories.py` | CREATE | Cover in-memory repository persistence and reset behavior |
| `api/tests/test_services.py` | UPDATE | Reset repository via method while preserving coverage |
| `README.md` | UPDATE | Document Supabase app-data persistence env vars |
| `docs/limitations.md` | UPDATE | Clarify raw PDF storage remains deferred |
| `docs/deployment.md` | UPDATE | Document persistence setup and raw PDF storage deferral |

---

## Tasks

### Task 1: Add Repository Layer

- **File**: `api/app/repositories.py`
- **Action**: CREATE
- **Implement**: Define `LearningRepository`, `InMemoryLearningRepository`, `SupabaseLearningRepository`, and `build_repository`.
- **Mirror**: `api/app/models.py` pydantic model structure.
- **Validate**: `py -m unittest api.tests.test_repositories`

### Task 2: Wire Services to Repository

- **File**: `api/app/services.py`
- **Action**: UPDATE
- **Implement**: Replace direct dictionary writes/reads with repository methods while keeping `store` as the configured repository.
- **Mirror**: Current service function names and return types.
- **Validate**: `py -m unittest api.tests.test_services`

### Task 3: Update API Accessors

- **File**: `api/app/api/v1/learning.py`
- **Action**: UPDATE
- **Implement**: Replace direct `services.store.*` route access with service accessors.
- **Mirror**: Existing HTTPException mapping.
- **Validate**: `py -m unittest api.tests.test_services`

### Task 4: Add Migration and Config

- **Files**: `migrations/0005_persist_extracted_text.sql`, `api/app/core/config.py`, `api/requirements.txt`
- **Action**: CREATE / UPDATE
- **Implement**: Add `documents.extracted_text`, repository backend/env config, and Supabase dependency.
- **Mirror**: Existing migration naming and settings pattern.
- **Validate**: `py -m compileall api`

### Task 5: Update Tests and Docs

- **Files**: `api/tests/test_repositories.py`, `api/tests/test_services.py`, `README.md`, `docs/limitations.md`, `docs/deployment.md`
- **Action**: CREATE / UPDATE
- **Implement**: Add repository tests, update reset setup, and document persistence posture.
- **Mirror**: Existing unittest and docs style.
- **Validate**: `pnpm test`

---

## Validation

```bash
py -m compileall api
pnpm test
pnpm lint
pnpm exec tsc --noEmit --pretty false
pnpm build
pnpm audit --audit-level low
```

---

## Acceptance Criteria

- [x] Supabase repository can persist document metadata, extracted text, chunks, sessions, outputs, misconception checks, and eval runs.
- [x] Default local/test behavior works without Supabase credentials.
- [x] Runtime access no longer depends directly on process dictionaries outside the in-memory repository.
- [x] Migration includes extracted text persistence.
- [x] Tests cover repository persistence.
- [x] Docs distinguish persisted app data from deferred raw PDF storage.

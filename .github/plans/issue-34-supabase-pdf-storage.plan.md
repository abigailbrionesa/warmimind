# Plan: Supabase Raw PDF Storage Posture

## Summary

Add optional raw PDF storage support for Supabase-backed deployments. Local memory mode keeps its current behavior and does not retain raw PDF bytes, while Supabase mode can upload PDF bytes to a configured Storage bucket, persist the storage path, and produce a short-lived signed URL through a server-side endpoint.

## User Story

As a WarmiMIND operator
I want uploaded PDFs stored behind server-controlled Supabase Storage
So that future PDF viewing, retention, and signed-access flows have a concrete backend path.

## Metadata

| Field | Value |
|-------|-------|
| Type | ENHANCEMENT |
| Complexity | MEDIUM |
| Systems Affected | FastAPI repository, models, migrations, API, docs, tests |
| GitHub Issue | #34 |

---

## Patterns to Follow

### Repository Persistence

```python
# SOURCE: api/app/repositories.py
def save_document(self, document, extracted_text, chunks) -> None:
    self.client.table("documents").upsert({...}).execute()
```

Extend the repository boundary instead of adding Supabase calls to service routes.

### API Error Mapping

```python
# SOURCE: api/app/api/v1/learning.py
except services.UserFacingError as exc:
    raise HTTPException(status_code=404, detail=str(exc)) from exc
```

Keep storage URL failures mapped to stable user-facing responses.

### Config

```python
# SOURCE: api/app/core/config.py
repository_backend: str = "memory"
supabase_url: str | None = None
```

Add bucket and signed URL TTL settings beside Supabase repository config.

---

## Files to Change

| File | Action | Purpose |
|------|--------|---------|
| `api/app/models.py` | UPDATE | Add optional `storage_path` to document metadata |
| `api/app/repositories.py` | UPDATE | Add raw PDF upload and signed URL repository methods |
| `api/app/services.py` | UPDATE | Pass raw bytes into repository and expose signed URL service |
| `api/app/api/v1/learning.py` | UPDATE | Add signed URL endpoint |
| `api/app/core/config.py` | UPDATE | Add Supabase bucket and signed URL TTL config |
| `migrations/0006_document_storage_path.sql` | CREATE | Persist raw PDF storage path |
| `api/tests/test_repositories.py` | UPDATE | Assert memory repository ignores raw PDF bytes and unavailable signed URL |
| `api/tests/test_services.py` | UPDATE | Cover stable unavailable signed URL response |
| `.env.example`, `README.md`, `docs/deployment.md`, `docs/limitations.md` | UPDATE | Document storage posture |

---

## Tasks

### Task 0: Gate Signed URL Issuance

- **Files**: `api/app/core/config.py`, `api/app/services.py`, `.env.example`, docs
- **Action**: UPDATE
- **Implement**: Add `ENABLE_PDF_SIGNED_URLS=false` by default and return a stable unavailable response unless explicitly enabled.
- **Validate**: `pnpm test`

### Task 1: Add Storage Metadata and Repository Methods

- **Files**: `api/app/models.py`, `api/app/repositories.py`
- **Action**: UPDATE
- **Implement**: Add `storage_path`, optional raw PDF save input, signed URL method, Supabase Storage upload, and memory no-op behavior.
- **Validate**: `pnpm test`

### Task 2: Wire Service and API Endpoint

- **Files**: `api/app/services.py`, `api/app/api/v1/learning.py`
- **Action**: UPDATE
- **Implement**: Pass raw upload bytes to the repository and add `GET /api/v1/documents/{document_id}/signed-url`.
- **Validate**: `pnpm test`

### Task 3: Add Migration and Docs

- **Files**: `migrations/0006_document_storage_path.sql`, `.env.example`, `README.md`, `docs/deployment.md`, `docs/limitations.md`
- **Action**: CREATE / UPDATE
- **Implement**: Add storage path migration and document optional bucket/signed URL posture.
- **Validate**: `py -m compileall api`

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

- [x] Supabase repository uploads raw PDF bytes to the configured bucket when configured.
- [x] Document metadata can include a storage path.
- [x] Signed URL endpoint returns a signed URL only when storage is configured and signed URL issuance is explicitly enabled.
- [x] Local tests run without Supabase credentials and without retaining raw PDF bytes.
- [x] Tests and validation pass.

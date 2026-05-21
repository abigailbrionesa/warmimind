# Plan: Issue #19 Embedding Dimension Alignment

## Summary

Align the SQL pgvector schema with the deterministic MVP embedding dimension and document how provider-specific dimensions should be handled later.

## User Story

As a maintainer, I want runtime embeddings and migrations to agree so chunk persistence does not fail when the backend stores vectors.

## Metadata

| Field | Value |
|-------|-------|
| Type | BUG_FIX |
| Complexity | SMALL |
| Systems Affected | Migrations, retrieval services, docs, tests |
| GitHub Issue | #19 |

## Patterns to Follow

| Category | File | Pattern |
|----------|------|---------|
| Constants | `api/app/services.py` | Keep deterministic MVP dimensions centralized as `EMBEDDING_DIMENSIONS`. |
| Migrations | `migrations/0001_v2_learning_core.sql` | Declare pgvector dimensions in the chunk table schema. |
| ADRs | `docs/adr/0003-use-pgvector-for-pdf-chunk-retrieval.md` | Capture retrieval storage decisions and consequences. |

## Tasks

- [x] Choose 16 dimensions for the deterministic MVP embedding test double.
- [x] Update the pgvector migration to `vector(16)`.
- [x] Add a test that compares migration dimensions to `EMBEDDING_DIMENSIONS`.
- [x] Update ADR documentation for future provider swaps.

## Validation

- [x] `python -m compileall api`
- [x] `pnpm test`
- [x] `pnpm lint`
- [x] `pnpm exec tsc --noEmit --pretty false`
- [x] `pnpm build`

## Acceptance Criteria

- [x] Choose and document the MVP embedding dimension.
- [x] Align `EMBEDDING_DIMENSIONS` with the migration schema.
- [x] Add a test or migration check that detects dimension mismatch.
- [x] Update ADR/docs if the dimension is intentionally provider-specific.

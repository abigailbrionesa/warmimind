# Plan: Issue 4 - Persistent PDF Learning Session

## Summary

Create the first end-to-end v2 backend slice for uploading a PDF, creating a document record, and creating a learning session. The implementation uses the FastAPI skeleton, Supabase-ready migrations, and deterministic local services for validation.

## Tasks

- [x] Add `documents` and `learning_sessions` migrations in `migrations/0001_v2_learning_core.sql`
- [x] Add upload validation for PDF type, size, and empty content in `api/app/services.py`
- [x] Implement `POST /api/v1/documents`
- [x] Implement `POST /api/v1/learning-sessions`
- [x] Add upload/start-session UI entry points in `/landing` and `/workspace`
- [x] Show document metadata through `GET /api/v1/documents/{document_id}`
- [x] Add tests for invalid type, oversized file, and successful session creation

## Validation Results

- `python -m compileall api`: passed
- `pnpm test`: passed
- `pnpm lint`: passed
- `pnpm exec tsc --noEmit --pretty false`: passed after build refreshed route types
- `pnpm build`: passed

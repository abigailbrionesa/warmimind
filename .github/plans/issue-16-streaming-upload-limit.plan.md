# Plan: Issue #16 Streaming Upload Limit

## Summary

Enforce the PDF upload size limit while reading the request stream so oversized files are rejected before full content is accumulated.

## User Story

As a student uploading a PDF, I want oversized files to be rejected predictably so the service remains stable and tells me how to fix the upload.

## Metadata

| Field | Value |
|-------|-------|
| Type | BUG_FIX |
| Complexity | MEDIUM |
| Systems Affected | FastAPI learning routes, service validation, API docs, tests |
| GitHub Issue | #16 |

## Patterns to Follow

| Category | File | Pattern |
|----------|------|---------|
| Errors | `api/app/services.py` | Raise `UserFacingError` for user-correctable validation failures. |
| Routes | `api/app/api/v1/learning.py` | Convert expected service errors into `HTTPException` responses. |
| Tests | `api/tests/test_services.py` | Use unittest cases with deterministic in-memory service state. |

## Tasks

- [x] Add metadata-only PDF validation for filename and content type.
- [x] Stream-read uploads in bounded chunks and stop at `MAX_FILE_BYTES`.
- [x] Return HTTP 413 for oversized request bodies.
- [x] Add regression coverage for oversized streaming uploads.
- [x] Document the 12 MB upload limit.

## Validation

- [x] `python -m compileall api`
- [x] `pnpm test`
- [x] `pnpm lint`
- [x] `pnpm exec tsc --noEmit --pretty false`
- [x] `pnpm build`

## Acceptance Criteria

- [x] Enforce a request/body size limit before or during upload streaming.
- [x] Stream-read uploaded files with an early cutoff at the configured max size.
- [x] Return a stable 400/413 response for oversized files.
- [x] Add a regression test that proves oversized uploads are rejected without full processing.
- [x] Document the upload limit in API docs.

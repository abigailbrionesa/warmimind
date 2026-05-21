# Plan: Issue #22 V2 Visible Upload Flow

## Summary

Route the visible PDF upload journey through the FastAPI v2 document, session, summary, concepts, and questions endpoints.

## User Story

As a student, I want PDF uploads to use the same size and type checks as the backend so that unsafe files are rejected predictably.

## Metadata

| Field | Value |
|-------|-------|
| Type | ENHANCEMENT |
| Complexity | LARGE |
| Systems Affected | Upload UI, API client helper, FastAPI CORS, docs, tests |
| GitHub Issue | #22 |

## Tasks

- [x] Add local CORS support for the Next.js frontend.
- [x] Upload the actual PDF file to `POST /api/v1/documents`.
- [x] Create sessions and learning outputs through v2 endpoints.
- [x] Render summary, questions, concepts, citations, errors, and next action.
- [x] Remove browser PDF text extraction and full-text logging from the visible path.
- [x] Add visible upload contract tests.

## Validation

- [x] `python -m compileall api`
- [x] `pnpm test`
- [x] `pnpm lint`
- [x] `pnpm exec tsc --noEmit --pretty false`
- [x] `pnpm build`
- [x] `pnpm audit --audit-level low`

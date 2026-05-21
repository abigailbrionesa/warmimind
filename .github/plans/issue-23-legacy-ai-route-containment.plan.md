# Plan: Issue #23 Legacy AI Route Containment

## Summary

Make the recommended chat path use the v2 chat endpoint and ensure legacy chat refuses when no source evidence is available.

## User Story

As a student, I want tutor answers to cite the uploaded source or refuse so that I do not learn unsupported claims.

## Metadata

| Field | Value |
|-------|-------|
| Type | BUG_FIX |
| Complexity | MEDIUM |
| Systems Affected | Chat UI, legacy Next.js chat route, tests, docs |
| GitHub Issue | #23 |

## Tasks

- [x] Replace the visible chat panel's AI SDK route usage with v2 API calls.
- [x] Render returned citations.
- [x] Add no-evidence refusal guard to the legacy `/api/chat` route.
- [x] Update docs to label legacy routes outside the recommended path.
- [x] Add visible chat contract tests.

## Validation

- [x] `python -m compileall api`
- [x] `pnpm test`
- [x] `pnpm lint`
- [x] `pnpm exec tsc --noEmit --pretty false`
- [x] `pnpm build`
- [x] `pnpm audit --audit-level low`

# Plan: Issue #18 Stable Learning HTTP Errors

## Summary

Wrap expected learning-service failures at the route layer so missing sessions and unavailable resources return stable 4xx responses.

## User Story

As an API client, I want expected missing-resource failures to return stable HTTP responses so I can recover without parsing internal errors.

## Metadata

| Field | Value |
|-------|-------|
| Type | BUG_FIX |
| Complexity | SMALL |
| Systems Affected | FastAPI learning routes, tests |
| GitHub Issue | #18 |

## Patterns to Follow

| Category | File | Pattern |
|----------|------|---------|
| Errors | `api/app/api/v1/learning.py` | Existing document/session endpoints return `HTTPException` for missing resources. |
| Tests | `api/tests/test_services.py` | Endpoint functions can be exercised directly with lightweight test doubles. |

## Tasks

- [x] Add a shared `user_error` mapper.
- [x] Wrap retrieve, summary, concepts, questions, chat, and misconception-check endpoints.
- [x] Return 404 for missing learning sessions.
- [x] Add missing-session tests for multiple endpoints.

## Validation

- [x] `python -m compileall api`
- [x] `pnpm test`
- [x] `pnpm lint`
- [x] `pnpm exec tsc --noEmit --pretty false`
- [x] `pnpm build`

## Acceptance Criteria

- [x] Wrap retrieve, summary, concepts, questions, chat, and misconception-check service calls.
- [x] Convert `UserFacingError` into stable `HTTPException` responses.
- [x] Avoid exposing stack traces or provider/internal details.
- [x] Add tests for missing session behavior on at least two learning endpoints.

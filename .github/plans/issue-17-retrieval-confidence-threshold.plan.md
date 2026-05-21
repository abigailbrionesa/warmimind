# Plan: Issue #17 Retrieval Confidence Threshold

## Summary

Add deterministic confidence gating to retrieval so unsupported tutor questions refuse instead of presenting weakly matched citations.

## User Story

As a student, I want WarmiMIND to say when my PDF does not support an answer so I do not learn from invented evidence.

## Metadata

| Field | Value |
|-------|-------|
| Type | BUG_FIX |
| Complexity | MEDIUM |
| Systems Affected | Retrieval, tutor chat, evals, tests, methodology docs |
| GitHub Issue | #17 |

## Patterns to Follow

| Category | File | Pattern |
|----------|------|---------|
| Retrieval | `api/app/services.py` | Use deterministic local scoring before provider integrations land. |
| Chat | `api/app/services.py` | Return source-grounded answers only when citations exist. |
| Tests | `api/tests/test_services.py` | Seed small STEM sources and assert model outputs deterministically. |

## Tasks

- [x] Add `MIN_RETRIEVAL_SCORE`.
- [x] Combine lexical overlap with deterministic embedding similarity.
- [x] Suppress citations below the retrieval threshold.
- [x] Make tutor chat refuse when no evidence clears the threshold.
- [x] Add unsupported-question regression coverage.
- [x] Document refusal behavior in methodology docs.

## Validation

- [x] `python -m compileall api`
- [x] `pnpm test`
- [x] `pnpm lint`
- [x] `pnpm exec tsc --noEmit --pretty false`
- [x] `pnpm build`

## Acceptance Criteria

- [x] Add a minimum retrieval similarity threshold.
- [x] Return an explicit no-evidence result when all chunks are below threshold.
- [x] Make tutor chat refuse unsupported questions when no evidence clears the threshold.
- [x] Add a regression test for an unsupported question against a seeded STEM source.
- [x] Add eval coverage for unsupported-question refusal pass rate.

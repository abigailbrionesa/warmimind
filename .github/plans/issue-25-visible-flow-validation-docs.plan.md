# Plan: Issue #25 Visible-Flow Validation And Docs

## Summary

Add regression coverage and documentation so the public route, visible upload flow, refusal behavior, and production caveats stay aligned.

## User Story

As a reviewer, I want tests and docs for the visible user journey so that validation reflects the product direction.

## Metadata

| Field | Value |
|-------|-------|
| Type | ENHANCEMENT |
| Complexity | MEDIUM |
| Systems Affected | Python tests, README, architecture docs, deployment docs |
| GitHub Issue | #25 |

## Tasks

- [x] Add visible-flow contract tests.
- [x] Update README with recommended route and v2 API setup.
- [x] Update architecture and limitation docs.
- [x] Document full validation commands.

## Validation

- [x] `python -m compileall api`
- [x] `pnpm test`
- [x] `pnpm lint`
- [x] `pnpm exec tsc --noEmit --pretty false`
- [x] `pnpm build`
- [x] `pnpm audit --audit-level low`

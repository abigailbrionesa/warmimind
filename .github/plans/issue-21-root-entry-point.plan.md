# Plan: Issue #21 Root Entry Point

## Summary

Replace the blank root route with a useful WarmiMIND v2 entry point and align README guidance with the recommended demo path.

## User Story

As a student, I want the home page to show the learning workspace entry point so that I can start without guessing the route.

## Metadata

| Field | Value |
|-------|-------|
| Type | BUG_FIX |
| Complexity | SMALL |
| Systems Affected | Next.js root route, docs, visible-flow tests |
| GitHub Issue | #21 |

## Tasks

- [x] Replace the empty root component with a non-empty product entry.
- [x] Link users to `/landing`, `/workspace`, and `/about`.
- [x] Update README route guidance.
- [x] Add a visible-flow contract test for `/`.

## Validation

- [x] `python -m compileall api`
- [x] `pnpm test`
- [x] `pnpm lint`
- [x] `pnpm exec tsc --noEmit --pretty false`
- [x] `pnpm build`
- [x] `pnpm audit --audit-level low`

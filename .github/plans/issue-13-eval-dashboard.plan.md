# Plan: Issue 13 - Evaluation Dashboard

## Summary

Build a first evaluation dashboard that makes quality metrics and per-question results visible.

## Tasks

- [x] Add endpoints to list eval runs and view one eval run
- [x] Add `/evals` dashboard page
- [x] Show retrieval hit rate, citation coverage, refusal pass rate, guided-question quality, and latency
- [x] Show per-question eval results
- [x] Highlight failed-case inspection area through per-result status
- [x] Link dashboard from `/workspace`
- [x] Include stable page states via static seeded dashboard content

## Validation Results

- `pnpm lint`: passed
- `pnpm exec tsc --noEmit --pretty false`: passed
- `pnpm build`: passed

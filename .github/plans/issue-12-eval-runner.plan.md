# Plan: Issue 12 - Learning-System Evaluation Runner

## Summary

Create a first deterministic eval runner for retrieval, citations, refusal behavior, guided-question quality, and latency.

## Tasks

- [x] Add `eval_questions`, `eval_runs`, and `eval_results` migrations
- [x] Add `evals/sample_stem_eval.json`
- [x] Measure retrieval hit rate in runner output
- [x] Measure citation coverage in runner output
- [x] Measure refusal pass rate in runner output
- [x] Include guided-question quality result
- [x] Store eval runs in backend store
- [x] Add tests for eval run storage

## Validation Results

- `python -m compileall api`: passed
- `pnpm test`: passed
- `pnpm lint`: passed
- `pnpm build`: passed

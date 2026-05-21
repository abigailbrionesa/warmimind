# Plan: Issue 7 - Source-Grounded Summary And Concepts

## Summary

Generate source-grounded summary and concepts for a learning session using stored chunks and citations.

## Tasks

- [x] Add `concepts` migration in `migrations/0002_v2_learning_outputs.sql`
- [x] Implement `POST /api/v1/learning-sessions/{session_id}/summary`
- [x] Implement `POST /api/v1/learning-sessions/{session_id}/concepts`
- [x] Require outputs to cite document chunks
- [x] Return citation references for summary and concepts
- [x] Display summary/concept workflow in `/workspace`
- [x] Add tests for citation presence through the learning-output flow

## Validation Results

- `python -m compileall api`: passed
- `pnpm test`: passed
- `pnpm lint`: passed
- `pnpm build`: passed

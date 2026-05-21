# Plan: Issue 10 - Misconception Checks And Learning State

## Summary

Add misconception checks that evaluate a student answer against source evidence and update weak concepts plus next action.

## Tasks

- [x] Add `misconception_checks` migration
- [x] Add concept confidence and weak concept fields
- [x] Implement `POST /api/v1/learning-sessions/{session_id}/misconception-checks`
- [x] Compare student answer against retrieved evidence
- [x] Return correct, missing, and review-next feedback
- [x] Update learning state after a check
- [x] Display misconception-check workflow in `/workspace`
- [x] Add tests for feedback and learning-state update through the service flow

## Validation Results

- `python -m compileall api`: passed
- `pnpm test`: passed
- `pnpm lint`: passed
- `pnpm build`: passed

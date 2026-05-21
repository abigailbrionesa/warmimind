# Plan: Issue 11 - Progress And Next Recommended Action

## Summary

Expose learning state with concepts, questions, misconceptions, weak areas, citations, and next recommended action without fake grades or mastery percentages.

## Tasks

- [x] Add `session_events` migration for future event tracking
- [x] Track concepts, questions, misconceptions, weak concepts, and next action in `LearningSession`
- [x] Expose full learning session state from `GET /api/v1/learning-sessions/{session_id}`
- [x] Build progress/next-action panel description in `/workspace`
- [x] Avoid grades, streaks, leaderboards, and unsupported mastery percentages
- [x] Add tests for state aggregation through service flow

## Validation Results

- `python -m compileall api`: passed
- `pnpm test`: passed
- `pnpm lint`: passed
- `pnpm build`: passed

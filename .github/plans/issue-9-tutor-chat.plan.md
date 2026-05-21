# Plan: Issue 9 - Source-Grounded Tutor Chat

## Summary

Build tutor chat behavior that retrieves source chunks, answers with citations, and refuses unsupported questions when evidence is missing.

## Tasks

- [x] Add `chat_messages` migration in `migrations/0002_v2_learning_outputs.sql`
- [x] Implement `POST /api/v1/learning-sessions/{session_id}/chat`
- [x] Retrieve relevant chunks before answer generation
- [x] Ground answers in retrieved PDF evidence
- [x] Include citations in answer responses
- [x] Store user and assistant chat messages
- [x] Display tutor-chat workflow in `/workspace`
- [x] Add tests for grounded cited answers

## Validation Results

- `python -m compileall api`: passed
- `pnpm test`: passed
- `pnpm lint`: passed
- `pnpm build`: passed

# Plan: Issue 6 - Semantic Retrieval Over PDF Chunks

## Summary

Add deterministic embedding and retrieval behavior so v2 routes can rank source chunks before generation. Migrations enable pgvector for the production target.

## Tasks

- [x] Enable pgvector in `migrations/0001_v2_learning_core.sql`
- [x] Add embedding column to `document_chunks`
- [x] Add deterministic embedding wrapper in `api/app/services.py`
- [x] Generate embeddings during chunk creation
- [x] Implement `POST /api/v1/learning-sessions/{session_id}/retrieve`
- [x] Return score, snippet, chunk ID, and page reference
- [x] Use retrieval for summary, concepts, questions, chat, and misconception checks
- [x] Add mocked-provider style unit coverage through deterministic embeddings

## Validation Results

- `python -m compileall api`: passed
- `pnpm test`: passed
- `pnpm lint`: passed
- `pnpm build`: passed

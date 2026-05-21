# Plan: Issue 5 - Extract And Inspect Source Chunks

## Summary

Extract text from uploaded PDF bytes, create stable document chunks, store chunk metadata, and expose chunks through the document detail endpoint.

## Tasks

- [x] Add `document_chunks` migration in `migrations/0001_v2_learning_core.sql`
- [x] Extract text in `extract_text_from_pdf_bytes`
- [x] Create stable chunk IDs as `{document_id}-chunk-{index}`
- [x] Store chunk content, index, page reference, char count, and embedding field
- [x] Return chunk metadata from `GET /api/v1/documents/{document_id}`
- [x] Add workspace chunk-inspection description in `/workspace`
- [x] Add unit coverage for chunk creation through successful session flow

## Validation Results

- `python -m compileall api`: passed
- `pnpm test`: passed
- `pnpm lint`: passed
- `pnpm build`: passed

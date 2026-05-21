# ADR 0003: Use pgvector For PDF Chunk Retrieval

## Status

Proposed

## Context

Tutor answers, summaries, questions, and misconception checks need source evidence from uploaded PDFs.

## Decision

Use pgvector embeddings on document chunks for semantic retrieval.

## Consequences

- Retrieval quality can be evaluated with hit-rate metrics.
- Chunk metadata must preserve page or section references for citations.

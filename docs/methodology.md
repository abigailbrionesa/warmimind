# Methodology

WarmiMIND v2 uses a source-grounded learning workflow:

1. Validate and ingest one uploaded STEM PDF.
2. Extract text and create stable, page-aware chunks.
3. Store chunks for retrieval.
4. Retrieve relevant chunks before any learning output is generated.
5. Produce summaries, concepts, guided questions, tutor responses, and misconception feedback with citations.
6. Update learning state with weak concepts and next recommended actions.
7. Evaluate retrieval, citations, refusal behavior, question quality, and latency.

The current implementation uses deterministic local service logic so the architecture, API contracts, user flows, and validation tests can land before provider-specific AI integrations are added.

The deterministic retrieval layer applies a minimum confidence threshold. If no source chunk clears that threshold, tutor chat must refuse or ask for clarification instead of presenting a cited answer.

## Evaluation Method

The first eval runner reports:

- retrieval hit rate
- citation coverage
- unsupported-question refusal pass rate
- guided-question quality
- latency

The seeded eval file is `evals/sample_stem_eval.json`.

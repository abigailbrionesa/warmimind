# ADR 0001: Use FastAPI For AI And Document Backend

## Status

Proposed

## Context

WarmiMIND v2 needs PDF ingestion, chunking, retrieval, tutoring, learning-state updates, and evaluations behind explicit API contracts.

## Decision

Use FastAPI for the v2 backend and expose versioned routes under `/api/v1`.

## Consequences

- AI and document-processing logic stays out of the frontend.
- OpenAPI documentation can describe backend behavior.
- Python testing can cover ingestion, retrieval, grounding, and eval modules.

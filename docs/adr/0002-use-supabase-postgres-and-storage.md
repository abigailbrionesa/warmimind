# ADR 0002: Use Supabase Postgres And Storage

## Status

Proposed

## Context

WarmiMIND v2 needs persistent documents, sessions, generated learning artifacts, events, and evaluation runs.

## Decision

Use Supabase Postgres for structured data and Supabase Storage for uploaded PDFs.

## Consequences

- The MVP can use managed Postgres while keeping SQL migrations inspectable.
- Storage and retention rules must be documented before handling sensitive PDFs.

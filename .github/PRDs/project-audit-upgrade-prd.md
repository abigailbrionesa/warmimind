# Product Requirements Document: WarmiMIND Project Audit Upgrade

## 1. Executive Summary

WarmiMIND is a source-grounded STEM learning workspace for uploaded PDFs. The current repository contains a v2 FastAPI backend, a visible Next.js learning flow, deterministic retrieval and generation logic, seeded evaluations, Supabase-ready persistence work, and documentation for architecture, methodology, limitations, deployment, and demo review.

The upgrade objective is to make the repository easier to audit, validate, and operate locally. The work should connect existing implementation evidence into a formal review path, add an executable static smoke check for review-critical assets and contracts, and expose the review path from the README without changing the product behavior.

## 2. Audit Basis

The project audit reviewed the following areas:

- Next.js routes in `app/`, including root, landing, workspace, evaluation, and about pages.
- Shared frontend components in `components/`, including upload, PDF preview, chat, source chunks, guided questions, misconception checks, and progress surfaces.
- FastAPI v2 service modules in `api/app/`, including upload validation, PDF extraction, chunking, retrieval, learning outputs, chat, misconception checks, evals, repository selection, and signed URL posture.
- API tests in `api/tests/`.
- Supabase migrations in `migrations/`.
- Existing documentation in `README.md`, `api/README.md`, `web/README.md`, `docs/`, `evals/README.md`, and ADRs.
- Environment examples, package scripts, and validation commands.

## 3. Problem Statement

The implementation includes several reviewable system guarantees, but the repository does not yet provide a compact, mechanically checkable review path for the full project. Important claims are distributed across the README, docs, tests, migrations, API modules, and screenshots. This makes review slower and increases the risk that future changes will accidentally break the documented review surface.

## 4. Goals

- Document the current system contract in one audit guide.
- Distinguish implemented behavior, optional Supabase behavior, legacy routes, and production caveats.
- Add a static smoke check that verifies review-critical files, docs, routes, scripts, and API contract references.
- Add a README review index with current validation commands.
- Preserve local validation without provider credentials or hosted Supabase access.

## 5. Non-Goals

- Replace deterministic service logic with a production AI provider.
- Add user accounts, teacher dashboards, or multi-document libraries.
- Change PDF ingestion, retrieval, generation, or signed URL behavior.
- Claim production readiness for raw PDF uploads.
- Claim broad tutoring accuracy or cultural validation.

## 6. Requirements

### 6.1 System Audit Guide

- Add a concise project audit guide under `docs/`.
- Summarize implemented routes, backend services, validation commands, optional persistence, and known limitations.
- Link directly to key implementation files and existing docs.
- Keep the language formal, product-centered, and free of personal statements.

### 6.2 Static Review Smoke Check

- Add a Node script under `scripts/` that can run without backend services, provider credentials, or Supabase access.
- Verify the presence of review-critical docs, screenshots, migrations, API modules, tests, and route files.
- Verify key contract references such as FastAPI endpoints, signed URL default-disabled posture, PDF upload validation, source chunk rendering, and eval dashboard API usage.
- Add a package script for the check.

### 6.3 README Review Index

- Add a near-top README section that explains how to review the repository.
- Link to the audit guide, architecture, methodology, limitations, deployment, demo script, screenshots, evals, API docs, migrations, and PRD.
- Include exact validation commands for frontend, backend, Python compile checks, and static review smoke checks.

## 7. Issue Breakdown

- Add project audit guide and PRD traceability.
- Add static review smoke check and package script.
- Add README review path and validation index.

## 8. Acceptance Criteria

- A reviewer can identify the recommended review path from the README without reading the entire file.
- The audit guide maps product surfaces to implementation files, docs, validation commands, and caveats.
- The static review smoke check runs locally without provider credentials.
- Existing backend tests, TypeScript checks, linting, and build validation pass.
- GitHub issues created from this PRD are planned, implemented, validated, commented, and closed.

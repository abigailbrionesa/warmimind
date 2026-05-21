# Plan: Issue #24 Supabase Access-Control Posture

## Summary

Add a production-readiness posture for Supabase tables so uploaded learning data is not treated as public-ready without RLS and ownership policies.

## User Story

As a deployer, I want Supabase access-control requirements captured in migrations or docs so that production planning does not miss RLS.

## Metadata

| Field | Value |
|-------|-------|
| Type | ENHANCEMENT |
| Complexity | MEDIUM |
| Systems Affected | Migrations, deployment docs, limitations docs, tests |
| GitHub Issue | #24 |

## Tasks

- [x] Add an access-control posture migration enabling RLS on v2 tables.
- [x] Document service-role-only local posture and production ownership requirements.
- [x] Update limitations docs.
- [x] Add contract coverage for access-control docs/migration.

## Validation

- [x] `python -m compileall api`
- [x] `pnpm test`
- [x] `pnpm lint`
- [x] `pnpm exec tsc --noEmit --pretty false`
- [x] `pnpm build`
- [x] `pnpm audit --audit-level low`

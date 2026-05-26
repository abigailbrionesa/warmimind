# Issue 36 Plan: Project Audit Guide

## Goal

Add a concise project audit guide that gives technical reviewers an ordered map of the implemented WarmiMIND system.

## Scope

- Add `docs/project-audit.md`.
- Map routes, frontend components, FastAPI services, tests, migrations, and docs.
- Separate default local behavior from optional Supabase persistence and signed URL behavior.
- Include current validation commands and production caveats.

## Implementation Steps

1. Create the audit guide from the repository audit and PRD.
2. Link key implementation files and docs.
3. Keep the guide formal and product-centered.

## Validation

- `py -m compileall api`
- `pnpm test`
- `pnpm lint`
- `pnpm exec tsc --noEmit --pretty false`
- `pnpm build`
- `git diff --check`

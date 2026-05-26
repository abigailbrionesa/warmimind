# Issue 38 Plan: README Review Path And Validation Index

## Goal

Add a near-top README review path that connects the PRD, audit guide, core docs, implementation boundaries, and validation commands.

## Scope

- Add `How to Review This Repo` near the top of `README.md`.
- Link the PRD, project audit guide, architecture, methodology, limitations, deployment, demo script, screenshots, evals, API docs, migrations, and ADRs.
- Include exact validation commands, including `pnpm review:smoke`.
- Update the static review smoke check to guard the new README section.

## Implementation Steps

1. Add the README review section below the opening summary.
2. Add the review smoke command to the README command and validation lists.
3. Update `scripts/review-smoke.mjs` with README review-path checks.

## Validation

- `pnpm review:smoke`
- `py -m compileall api`
- `pnpm test`
- `pnpm lint`
- `pnpm exec tsc --noEmit --pretty false`
- `pnpm build`
- `git diff --check`

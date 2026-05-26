# Issue 41 Plan: Project Audit CI Docs

## Goal

Update the project audit guide so it describes automated CI quality gates as the repository-level version of the local validation path.

## Scope

- Update `docs/project-audit.md`.
- List the workflow file and core checks.
- Clarify credential-free memory-mode assumptions.
- Keep production caveats intact.

## Implementation Steps

1. Add CI to the recommended review order.
2. Add an automated quality gates section.
3. Update validation commands to include `pnpm review:smoke`.
4. Update audit findings to reflect that static review checks and CI now exist.

## Validation

- `pnpm review:smoke`
- `py -m compileall api`
- `pnpm test`
- `pnpm lint`
- `pnpm exec tsc --noEmit --pretty false`
- `pnpm build`
- `git diff --check`

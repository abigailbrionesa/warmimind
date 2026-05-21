# Plan: Issue #20 Dependency Audit Remediation

## Summary

Upgrade patched direct dependencies, remove unused risky packages, and pin vulnerable transitives with pnpm overrides so moderate-and-higher audit findings are resolved.

## User Story

As a deployer, I want the dependency audit to pass for moderate and higher issues so the project can move toward review and deployment without known high-risk packages.

## Metadata

| Field | Value |
|-------|-------|
| Type | BUG_FIX |
| Complexity | LARGE |
| Systems Affected | Next.js app, package graph, lockfile, CSS, validation |
| GitHub Issue | #20 |

## Patterns to Follow

| Category | File | Pattern |
|----------|------|---------|
| Dependencies | `package.json` | Keep runtime dependencies explicit and remove unused packages. |
| Styling | `app/globals.css` | Keep Tailwind theme tokens local to the app. |
| Validation | `package.json` | Use existing `lint`, `test`, `build`, and TypeScript commands. |

## Tasks

- [x] Upgrade Next.js and matching ESLint config to patched versions.
- [x] Upgrade Google Cloud Translate to the latest available version.
- [x] Remove unused `shadcn`, `pdfjs-dist`, and `@pdf-viewer/react` package dependencies.
- [x] Remove unused PDF viewer wrapper components tied to the removed package.
- [x] Replace the removed shadcn CSS package import with local theme CSS.
- [x] Add pnpm overrides for vulnerable transitive packages.
- [x] Re-run audit and full validation.

## Validation

- [x] `pnpm audit --audit-level moderate`
- [x] `python -m compileall api`
- [x] `pnpm test`
- [x] `pnpm lint`
- [x] `pnpm exec tsc --noEmit --pretty false`
- [x] `pnpm build`

## Acceptance Criteria

- [x] Upgrade direct dependencies with available patched versions.
- [x] Remove unused high-risk dependencies where practical.
- [x] Re-run `pnpm audit --audit-level moderate`.
- [x] Document any remaining accepted risk with scope and mitigation. No accepted audit risk remains after `pnpm audit --audit-level low` passes.
- [x] Ensure `pnpm lint`, `pnpm test`, `pnpm exec tsc --noEmit`, and `pnpm build` still pass.

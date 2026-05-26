# Issue 37 Plan: Static Review Smoke Check

## Goal

Add a credential-free static smoke check for review-critical repository assets and contract references.

## Scope

- Add `scripts/review-smoke.mjs`.
- Verify required docs, screenshots, migrations, routes, API modules, and tests exist.
- Verify key references for v2 upload, source chunks, eval dashboard, signed URL default-disabled posture, and validation docs.
- Add a package script.

## Implementation Steps

1. Create the review smoke script with clear pass/fail output.
2. Add `pnpm review:smoke` to `package.json`.
3. Validate the script and existing test/build commands.

## Validation

- `pnpm review:smoke`
- `py -m compileall api`
- `pnpm test`
- `pnpm lint`
- `pnpm exec tsc --noEmit --pretty false`
- `pnpm build`
- `git diff --check`

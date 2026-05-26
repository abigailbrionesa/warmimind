# Issue 40 Plan: README CI Badge And Validation Docs

## Goal

Expose automated CI validation near the top of the README and connect it to the local review path.

## Scope

- Add a GitHub Actions CI badge near the README title.
- Mention that CI mirrors the local credential-free validation path.
- Keep the existing validation commands explicit.
- Update the static review smoke check to guard the CI badge/docs.

## Implementation Steps

1. Add the CI badge to `README.md`.
2. Update `How to Review This Repo` with automated CI wording.
3. Update `scripts/review-smoke.mjs` to check the README CI references.

## Validation

- `pnpm review:smoke`
- `py -m compileall api`
- `pnpm test`
- `pnpm lint`
- `pnpm exec tsc --noEmit --pretty false`
- `pnpm build`
- `git diff --check`

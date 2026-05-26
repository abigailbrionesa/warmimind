# Issue 39 Plan: CI Workflow For Warmimind Validation

## Goal

Add a credential-free GitHub Actions workflow that runs the current Warmimind validation path automatically.

## Scope

- Add `.github/workflows/ci.yml`.
- Trigger on pull requests and pushes to `master`, `codex/**`, and `v2-*` branches.
- Set up Node.js, pnpm, and Python.
- Install frontend and backend dependencies.
- Run static review, lint, typecheck, backend tests, Python compile checks, and production build.
- Use memory-mode defaults so no Supabase or provider secrets are required.

## Implementation Steps

1. Create the workflow directory and CI workflow.
2. Use `pnpm install --frozen-lockfile` for lockfile enforcement.
3. Install Python requirements from `api/requirements.txt`.
4. Run the documented validation commands.

## Validation

- `pnpm review:smoke`
- `py -m compileall api`
- `pnpm test`
- `pnpm lint`
- `pnpm exec tsc --noEmit --pretty false`
- `pnpm build`
- `git diff --check`

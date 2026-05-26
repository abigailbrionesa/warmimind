# Product Requirements Document: WarmiMIND CI Quality Gates

## 1. Executive Summary

WarmiMIND has a mature local validation path for a source-grounded AI learning workspace, including frontend linting, TypeScript checks, backend tests, Python compile checks, production build validation, and a static review smoke check. The next engineering upgrade is to make those checks automatic through continuous integration.

This PRD defines the CI quality-gates work required to ensure that every pull request and branch update validates the core system contract before review. The goal is to strengthen project credibility, reduce regression risk, and make the repository easier to evaluate as a production-minded software engineering project.

## 2. Problem Statement

Current validation commands are documented and pass locally, but they are not yet enforced automatically by GitHub Actions. This creates a review gap: technical reviewers can see that validation exists, but there is no repository-level signal that changes are continuously checked.

For an AI learning system that handles uploaded PDFs, retrieval, citations, refusal behavior, persistence posture, and evaluation metrics, automated quality gates are important because future changes can break system behavior across frontend, backend, documentation, or API contracts.

## 3. Goals

- Add GitHub Actions CI for the current Warmimind validation path.
- Run frontend, backend, build, and static review checks on pull requests and pushes.
- Keep CI credential-free and compatible with `REPOSITORY_BACKEND=memory`.
- Add a visible CI badge and documentation so reviewers can quickly find the quality gates.
- Preserve the existing local validation workflow.

## 4. Non-Goals

- Add hosted Supabase integration tests.
- Add live browser end-to-end tests.
- Require provider keys or AI model credentials.
- Deploy the application.
- Replace local validation commands.

## 5. Requirements

### 5.1 CI Workflow

- Add a GitHub Actions workflow under `.github/workflows/`.
- Trigger on pull requests and pushes to active project branches.
- Install Node and pnpm.
- Install Python.
- Install project dependencies with lockfile enforcement.
- Run the current validation commands:
  - `pnpm review:smoke`
  - `pnpm lint`
  - `pnpm exec tsc --noEmit --pretty false`
  - `pnpm test`
  - `py -m compileall api` or the Linux-compatible Python equivalent
  - `pnpm build`
- Use memory-mode environment defaults so CI does not require secrets.

### 5.2 Documentation And Review Signal

- Add a CI status badge near the top of `README.md`.
- Update the README review path to mention automated CI checks.
- Update `docs/project-audit.md` to identify CI as the automated version of the local validation path.

### 5.3 Validation

- Validate the workflow syntax and local commands.
- Ensure existing local validation still passes.
- Keep the static review smoke check credential-free.

## 6. Acceptance Criteria

- GitHub Actions workflow exists and runs the core validation path.
- CI does not require Supabase, provider credentials, or deployed infrastructure.
- README includes a CI badge and links validation commands to the automated workflow.
- Project audit documentation mentions CI quality gates.
- Existing local validation passes.

## 7. Issue Breakdown

- Add GitHub Actions CI workflow for Warmimind validation.
- Add README CI badge and validation documentation.
- Update project audit documentation for automated quality gates.

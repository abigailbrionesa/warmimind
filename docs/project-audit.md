# WarmiMIND Project Audit Guide

This guide summarizes the current WarmiMIND system for technical review. It connects the product surface, implementation files, validation commands, optional infrastructure, and known caveats into one review path.

## Recommended Review Order

1. Read `README.md` for the product summary, local setup, commands, and FastAPI endpoint index.
2. Read `.github/PRDs/project-audit-upgrade-prd.md` for the current audit upgrade scope.
3. Review `docs/architecture.md`, `docs/methodology.md`, `docs/limitations.md`, and `docs/deployment.md`.
4. Inspect the visible Next.js routes in `app/` and the learning components in `components/`.
5. Inspect the FastAPI v2 backend in `api/app/`.
6. Review Supabase migrations in `migrations/`.
7. Run backend, frontend, build, and static review validations.

## Implemented Product Surface

| Area | Status | Review files |
| --- | --- | --- |
| Root entry | Implemented review entry point | `app/page.tsx` |
| PDF upload demo | Implemented visible v2 flow | `app/landing/page.tsx`, `components/pdf-section.tsx` |
| Workspace map | Implemented overview route | `app/workspace/page.tsx` |
| Learning panel | Implemented summary, sources, questions, practice, progress, and chat tabs | `components/chat-panel.tsx` |
| PDF preview | Implemented local object URL preview | `components/PDFViewer.tsx` |
| Eval dashboard | Implemented live seeded eval runner UI | `app/evals/page.tsx` |
| Methodology page | Implemented limitation-oriented review page | `app/about/page.tsx` |

## Backend Contract

The visible demo uses the FastAPI v2 API through `NEXT_PUBLIC_API_BASE_URL`.

| Area | Status | Review files |
| --- | --- | --- |
| App and routing | Implemented | `api/app/main.py`, `api/app/api/v1/router.py`, `api/app/api/v1/learning.py` |
| Upload validation | Implemented PDF type, empty file, and 12 MB checks | `api/app/services.py`, `api/app/api/v1/learning.py` |
| PDF extraction | Implemented for text-based PDFs | `api/app/document_processing.py` |
| Chunking and embeddings | Implemented deterministic local vector representation | `api/app/services.py` |
| Retrieval threshold | Implemented refusal path for weak evidence | `api/app/services.py` |
| Learning outputs | Implemented summary, concepts, questions, chat, misconception checks, and next action | `api/app/services.py` |
| Repository layer | Implemented in-memory default and optional Supabase repository | `api/app/repositories.py` |
| Signed URL posture | Implemented default-disabled endpoint | `api/app/services.py`, `api/app/api/v1/learning.py` |
| Evals | Implemented seeded eval runner and persistence hook | `api/app/services.py`, `evals/sample_stem_eval.json` |

## Default, Optional, And Legacy Behavior

| Category | Current posture |
| --- | --- |
| Default local storage | In-memory repository; no provider credentials required. |
| Supabase repository | Optional when `REPOSITORY_BACKEND=supabase`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `SUPABASE_PDF_BUCKET` are configured. |
| Raw PDF storage | Optional Supabase Storage path; local memory mode does not retain raw PDF bytes. |
| Signed PDF URLs | Disabled by default with `ENABLE_PDF_SIGNED_URLS=false`; should remain disabled until ownership and retention controls are complete. |
| Legacy Next.js AI routes | Present for prototype reference and not the recommended v2 demo path. |
| Production readiness | Not ready for public production uploads until authentication, ownership, RLS policies, storage policy, and retention requirements are complete. |

## Validation Commands

```bash
py -m compileall api
```

```bash
pnpm test
```

```bash
pnpm lint
```

```bash
pnpm exec tsc --noEmit --pretty false
```

```bash
pnpm build
```

```bash
pnpm audit --audit-level low
```

## Existing Evidence

| Evidence type | Location |
| --- | --- |
| Architecture | `docs/architecture.md` |
| Methodology | `docs/methodology.md` |
| Limitations | `docs/limitations.md` |
| Deployment posture | `docs/deployment.md` |
| Demo script | `docs/demo-script.md` |
| Screenshots | `docs/screenshots/` |
| ADRs | `docs/adr/` |
| API docs | `api/README.md` |
| Web boundary note | `web/README.md` |
| Migration notes | `migrations/README.md` |
| Seeded eval fixture | `evals/sample_stem_eval.json` |

## Audit Findings

- The recommended product path is the v2 FastAPI-backed upload and learning flow.
- The repository has focused backend tests for upload validation, extraction failures, retrieval, refusal, learning outputs, evals, and repository persistence.
- The repository has visible-flow contract tests that guard the public route and component integration posture.
- Supabase persistence and raw PDF storage are optional and should not be described as required for local validation.
- Signed URL issuance is intentionally default-disabled.
- The strongest remaining review need is a compact, executable way to verify that review-critical files and references stay present as the project evolves.

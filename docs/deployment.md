# Deployment Readiness

WarmiMIND v2 is not ready for public production uploads until the persistence, storage, and access-control layers are finished.

## Required Before Production

- Keep `SUPABASE_SERVICE_ROLE_KEY` server-only.
- Enable RLS for all document, chunk, session, chat, and eval tables.
- Add authenticated ownership columns and policies before exposing Supabase data to browser clients.
- Configure Supabase Storage policies for uploaded PDFs.
- Configure a private `SUPABASE_PDF_BUCKET`, keep `ENABLE_PDF_SIGNED_URLS=false` until ownership checks exist, and keep signed URL issuance server-side.
- Keep `NEXT_PUBLIC_API_BASE_URL` pointed at the FastAPI backend used by the visible demo.
- Do not log full extracted PDF text, chat messages, or generated payloads in production.

## Current Local Posture

- The visible Next.js demo calls the FastAPI v2 backend directly through `NEXT_PUBLIC_API_BASE_URL`.
- The FastAPI service defaults to deterministic in-memory storage for local validation.
- Set `REPOSITORY_BACKEND=supabase`, `SUPABASE_URL`, server-only `SUPABASE_SERVICE_ROLE_KEY`, and `SUPABASE_PDF_BUCKET` to persist document metadata, extracted text, chunks, sessions, learning outputs, misconception checks, eval runs, and raw PDF bytes.
- `migrations/0004_v2_access_control_posture.sql` enables RLS so new tables are not accidentally treated as public-ready.
- The signed URL endpoint returns unavailable by default. Enable it with `ENABLE_PDF_SIGNED_URLS=true` only after production ownership policies and retention rules have a dedicated pass.

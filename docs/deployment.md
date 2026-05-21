# Deployment Readiness

WarmiMIND v2 is not ready for public production uploads until the persistence, storage, and access-control layers are finished.

## Required Before Production

- Keep `SUPABASE_SERVICE_ROLE_KEY` server-only.
- Enable RLS for all document, chunk, session, chat, and eval tables.
- Add authenticated ownership columns and policies before exposing Supabase data to browser clients.
- Configure Supabase Storage policies for uploaded PDFs.
- Keep `NEXT_PUBLIC_API_BASE_URL` pointed at the FastAPI backend used by the visible demo.
- Do not log full extracted PDF text, chat messages, or generated payloads in production.

## Current Local Posture

- The visible Next.js demo calls the FastAPI v2 backend directly through `NEXT_PUBLIC_API_BASE_URL`.
- The FastAPI service defaults to deterministic in-memory storage for local validation.
- Set `REPOSITORY_BACKEND=supabase`, `SUPABASE_URL`, and server-only `SUPABASE_SERVICE_ROLE_KEY` to persist document metadata, extracted text, chunks, sessions, learning outputs, misconception checks, and eval runs.
- `migrations/0004_v2_access_control_posture.sql` enables RLS so new tables are not accidentally treated as public-ready.
- Raw uploaded PDF bytes are still not stored in Supabase Storage; signed URLs and PDF retention controls remain a separate production-readiness step.

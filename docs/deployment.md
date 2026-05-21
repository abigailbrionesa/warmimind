# Deployment Readiness

WarmiMIND v2 is not ready for public production uploads until the persistence and access-control layer is finished.

## Required Before Production

- Keep `SUPABASE_SERVICE_ROLE_KEY` server-only.
- Enable RLS for all document, chunk, session, chat, and eval tables.
- Add authenticated ownership columns and policies before exposing Supabase data to browser clients.
- Configure Supabase Storage policies for uploaded PDFs.
- Keep `NEXT_PUBLIC_API_BASE_URL` pointed at the FastAPI backend used by the visible demo.
- Do not log full extracted PDF text, chat messages, or generated payloads in production.

## Current Local Posture

- The visible Next.js demo calls the FastAPI v2 backend directly through `NEXT_PUBLIC_API_BASE_URL`.
- The FastAPI service uses deterministic in-memory storage for local validation.
- `migrations/0004_v2_access_control_posture.sql` enables RLS so new tables are not accidentally treated as public-ready.

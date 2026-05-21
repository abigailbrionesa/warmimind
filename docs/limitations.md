# Limitations

WarmiMIND v2 is under active rebuild.

- The current FastAPI backend is a deterministic skeleton, not a production AI tutoring system.
- PDF text extraction supports text-based PDFs through `pypdf`; scanned/image-only PDFs require a future OCR pass.
- The backend defaults to in-memory storage for local validation, but can persist app data through the Supabase repository when configured.
- Supabase RLS is enabled in the access-control posture migration, but authenticated ownership policies are not complete.
- Quechua support is experimental and requires human language review before any quality claims.
- Cultural examples are prompt-guided only and are not community validation.
- Raw uploaded PDF storage is available only in Supabase repository mode. Short-lived signed URLs are disabled by default and should remain disabled until retention and user ownership controls are finalized.
- The first eval runner is seeded and should be expanded with real PDF fixtures.

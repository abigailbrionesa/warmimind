# Limitations

WarmiMIND v2 is under active rebuild.

- The current FastAPI backend is a deterministic skeleton, not a production AI tutoring system.
- PDF text extraction is a placeholder in the backend skeleton and should be replaced with a robust parser.
- Supabase migrations are present, but the backend store is currently in memory for local validation.
- Supabase RLS is enabled in the access-control posture migration, but authenticated ownership policies are not complete.
- Quechua support is experimental and requires human language review before any quality claims.
- Cultural examples are prompt-guided only and are not community validation.
- Uploaded document retention and access control must be finalized before production use.
- The first eval runner is seeded and should be expanded with real PDF fixtures.

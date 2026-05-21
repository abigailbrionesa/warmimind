# Plan: Live Eval Runner Dashboard

## Summary

Replace the static evaluation dashboard with a live dashboard backed by the FastAPI eval endpoints. The backend eval runner will execute the seeded eval file, persist run results through the repository layer, and the frontend will fetch/list runs plus trigger new runs from `/evals`.

## User Story

As a reviewer
I want eval metrics and per-question results from actual seeded runs
So that WarmiMIND grounding quality is measured rather than assumed.

## Metadata

| Field | Value |
|-------|-------|
| Type | ENHANCEMENT |
| Complexity | MEDIUM |
| Systems Affected | FastAPI learning service, eval dashboard, tests |
| GitHub Issue | #30 |

---

## Patterns to Follow

### Eval API

```python
# SOURCE: api/app/api/v1/learning.py
@router.post("/evals/runs")
async def create_eval_run() -> dict:
    return services.run_eval()
```

Keep the public API shape and improve the service behind it.

### Repository Persistence

```python
# SOURCE: api/app/services.py
store.save_eval_run(result)
```

Persist completed runs through the existing repository boundary.

### Frontend Backend Calls

```tsx
// SOURCE: components/chat-panel.tsx
createBackendApiUrl(`/api/v1/learning-sessions/${learningSession.sessionId}/chat`)
```

Use the same backend URL helper for live dashboard fetches.

---

## Files to Change

| File | Action | Purpose |
|------|--------|---------|
| `api/app/services.py` | UPDATE | Execute seeded eval cases and calculate metrics |
| `app/evals/page.tsx` | UPDATE | Fetch live eval runs and trigger new runs |
| `api/tests/test_services.py` | UPDATE | Assert seeded eval results and persisted listing |
| `api/tests/test_visible_flow_contracts.py` | UPDATE | Assert dashboard uses live eval endpoints |
| `.github/plans/issue-30-live-eval-dashboard.plan.md` | CREATE | Track plan and validation |

---

## Tasks

### Task 1: Implement Seeded Eval Runner

- **File**: `api/app/services.py`
- **Action**: UPDATE
- **Implement**: Load `evals/sample_stem_eval.json`, seed deterministic sample document/session, execute retrieval and chat checks, calculate metrics, and persist results.
- **Mirror**: Existing retrieval, chat, question, and repository patterns.
- **Validate**: `pnpm test`

### Task 2: Connect Dashboard to API

- **File**: `app/evals/page.tsx`
- **Action**: UPDATE
- **Implement**: Convert the page to a client component that lists eval runs, triggers `POST /api/v1/evals/runs`, and renders returned metric/result data.
- **Mirror**: Existing `readBackendJson`/`createBackendApiUrl` frontend usage.
- **Validate**: `pnpm exec tsc --noEmit --pretty false`

### Task 3: Add Contract Coverage

- **Files**: `api/tests/test_services.py`, `api/tests/test_visible_flow_contracts.py`
- **Action**: UPDATE
- **Implement**: Cover seeded eval result ids/listing and live dashboard endpoint usage.
- **Mirror**: Existing unittest contract style.
- **Validate**: `pnpm test`

---

## Validation

```bash
py -m compileall api
pnpm test
pnpm lint
pnpm exec tsc --noEmit --pretty false
pnpm build
pnpm audit --audit-level low
```

---

## Acceptance Criteria

- [x] `POST /api/v1/evals/runs` produces a run from the seeded eval file.
- [x] `GET /api/v1/evals/runs` returns persisted runs through the repository layer.
- [x] `/evals` fetches live runs, can trigger a new run, and renders returned metrics/results.
- [x] Static fake dashboard values are removed from the visible page.
- [x] Tests and validation pass.

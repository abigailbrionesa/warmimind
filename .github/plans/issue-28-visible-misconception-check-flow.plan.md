# Plan: Visible Misconception Check Flow

## Summary

Add a visible misconception-check interaction to the active `/landing` learning panel. The UI will let students select a guided question, submit an attempted answer, call the existing FastAPI misconception-check endpoint, display feedback with citations, and update the visible next recommended action.

## User Story

As a student
I want to submit an answer to a guided question
So that WarmiMIND can show what I got right, what I missed, and what to review next.

## Metadata

| Field | Value |
|-------|-------|
| Type | ENHANCEMENT |
| Complexity | MEDIUM |
| Systems Affected | Next.js learning panel, visible-flow contract tests |
| GitHub Issue | #28 |

---

## Patterns to Follow

### Backend Calls

```tsx
// SOURCE: components/chat-panel.tsx
const response = await readBackendJson<ChatResponse>(
  await fetch(
    createBackendApiUrl(`/api/v1/learning-sessions/${learningSession.sessionId}/chat`),
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    }
  )
);
```

Reuse `createBackendApiUrl` and `readBackendJson` for the misconception-check endpoint.

### Guided Questions

```tsx
// SOURCE: components/chat-panel.tsx
{learningSession.questions.map((question) => (
  <button key={question.text} type="button">
    <span>{question.difficulty}</span>
    <span>{question.text}</span>
  </button>
))}
```

Use the existing guided questions as selectable practice prompts.

### Visible Flow Tests

```python
# SOURCE: api/tests/test_visible_flow_contracts.py
self.assertIn("/api/v1/learning-sessions/${learningSession.sessionId}/chat", chat_panel)
```

Add static contract coverage for the visible misconception-check endpoint and UI labels.

---

## Files to Change

| File | Action | Purpose |
|------|--------|---------|
| `components/chat-panel.tsx` | UPDATE | Add Practice tab, answer form, feedback rendering, and next-action state |
| `api/tests/test_visible_flow_contracts.py` | UPDATE | Assert the visible flow calls the misconception-check endpoint |
| `.github/plans/issue-28-visible-misconception-check-flow.plan.md` | CREATE | Track plan and validation |

---

## Tasks

### Task 1: Add Practice State and Types

- **File**: `components/chat-panel.tsx`
- **Action**: UPDATE
- **Implement**: Add misconception-check response types and local state for selected question, attempted answer, loading, error, feedback, and next action.
- **Mirror**: Existing chat state and `ChatResponse`.
- **Validate**: `pnpm exec tsc --noEmit --pretty false`

### Task 2: Add Misconception-Check UI

- **File**: `components/chat-panel.tsx`
- **Action**: UPDATE
- **Implement**: Add a Practice tab with selectable guided questions, textarea answer input, submit button, feedback lists, citation snippets, and review-next guidance.
- **Mirror**: Existing Questions and Progress tab layout.
- **Validate**: `pnpm lint`

### Task 3: Add Contract Coverage

- **File**: `api/tests/test_visible_flow_contracts.py`
- **Action**: UPDATE
- **Implement**: Assert the visible chat panel references `/misconception-checks`, feedback labels, and avoids legacy endpoints.
- **Mirror**: Existing visible flow contract assertions.
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

- [x] A processed PDF session exposes a visible misconception-check UI.
- [x] Submitting an answer calls the v2 FastAPI misconception-check endpoint and displays feedback.
- [x] Missing session or request errors render without crashing the panel.
- [x] The progress/next-action view reflects the latest misconception-check result.
- [x] Tests and validation pass.

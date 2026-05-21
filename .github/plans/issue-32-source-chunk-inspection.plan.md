# Plan: Source Chunk Inspection UI

## Summary

Expose extracted document chunks in the visible learning flow. The upload step already receives chunks from the v2 API, so this change preserves those chunks in session state and adds a Sources tab to the learning panel with chunk id, page, character count, and source text.

## User Story

As a student
I want to inspect extracted source chunks
So that I can verify what WarmiMIND read before trusting summaries, questions, citations, or tutor answers.

## Metadata

| Field | Value |
|-------|-------|
| Type | ENHANCEMENT |
| Complexity | LOW |
| Systems Affected | Next.js upload flow, learning panel, visible-flow tests |
| GitHub Issue | #32 |

---

## Patterns to Follow

### Upload Response

```tsx
// SOURCE: components/pdf-section.tsx
const documentPayload = await readBackendJson<DocumentResponse>(
  await fetch(createBackendApiUrl("/api/v1/documents"), {
    method: "POST",
    body: formData,
  })
);
```

Keep using the existing document upload response and preserve its `chunks` array.

### Tab Layout

```tsx
// SOURCE: components/chat-panel.tsx
<TabsTrigger value="summary" className="flex items-center gap-2">
  <FileText className="h-4 w-4" /> Summary
</TabsTrigger>
```

Add a Sources tab using the same tab/list patterns.

### Contract Tests

```python
# SOURCE: api/tests/test_visible_flow_contracts.py
self.assertIn('createBackendApiUrl("/api/v1/documents")', upload)
```

Extend static visible-flow coverage to assert chunks are carried and rendered.

---

## Files to Change

| File | Action | Purpose |
|------|--------|---------|
| `components/pdf-section.tsx` | UPDATE | Add source chunk type and preserve chunks in processed session state |
| `components/chat-panel.tsx` | UPDATE | Add Sources tab and render extracted chunks |
| `api/tests/test_visible_flow_contracts.py` | UPDATE | Assert visible chunk inspection contract |
| `.github/plans/issue-32-source-chunk-inspection.plan.md` | CREATE | Track plan and validation |

---

## Tasks

### Task 1: Preserve Chunks from Upload

- **File**: `components/pdf-section.tsx`
- **Action**: UPDATE
- **Implement**: Add `SourceChunk` type, add `chunks` to `DocumentResponse`, and include chunks in `ProcessedLearningSession`.
- **Mirror**: Existing citation and response type structure.
- **Validate**: `pnpm exec tsc --noEmit --pretty false`

### Task 2: Render Sources Tab

- **File**: `components/chat-panel.tsx`
- **Action**: UPDATE
- **Implement**: Add a Sources tab with chunk id, page, char count, and content preview.
- **Mirror**: Existing Summary and Questions tab layout.
- **Validate**: `pnpm lint`

### Task 3: Add Visible Contract Coverage

- **File**: `api/tests/test_visible_flow_contracts.py`
- **Action**: UPDATE
- **Implement**: Assert upload keeps chunks and chat panel renders source chunk inspection labels.
- **Mirror**: Existing visible-flow contract tests.
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

- [x] After a PDF is processed, students can inspect extracted chunks in the visible flow.
- [x] The UI shows chunk identity, page, character count, and source text.
- [x] Existing summary/chat/practice flows continue working.
- [x] Tests and validation pass.

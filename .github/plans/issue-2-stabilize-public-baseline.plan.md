# Plan: Issue 2 - Stabilize Public Baseline

## Summary

Stabilize the current public repository before v2 work begins. The repo currently has unresolved merge conflict markers in `app/viewer/page.tsx`, public README language that overstates Quechua/cultural validation and hallucination guarantees, and API error responses that expose implementation details. This plan resolves those blockers while preserving the current demo flow as the baseline.

## User Story

As a technical reviewer
I want the public repository to build cleanly and describe its limitations accurately
So that v2 work starts from a credible baseline.

## Metadata

| Field | Value |
|---|---|
| GitHub Issue | #2 |
| Type | BUG_FIX / DOCUMENTATION |
| Complexity | MEDIUM |
| Systems Affected | Next.js app route, API routes, README |

## Patterns to Follow

### Current Demo Flow

```tsx
// SOURCE: app/landing/page.tsx
<PdfSection
  onProcessed={(data, fileUrl) => {
    setSessionId(data.sessionId);
    setSummaryQu(data.summaryQu);
    setQuestionsQu(data.questionsQu);
    setPdfFile(fileUrl);
  }}
/>
```

### Existing Viewer Component

```tsx
// SOURCE: components/PDFViewer.tsx
export default PDFViewer;
```

### API Error Shape To Preserve

```ts
// Existing client-facing APIs return JSON with an `error` field.
return NextResponse.json({ error: "Stable public message" }, { status: 500 });
```

## Files to Change

| File | Action | Purpose |
|---|---|---|
| `app/viewer/page.tsx` | UPDATE | Remove merge conflict markers and route to the existing stable landing/demo flow |
| `app/api/process/route.ts` | UPDATE | Stop returning raw error details and provider/type names |
| `app/api/chat/route.ts` | UPDATE | Stop returning raw exception messages |
| `app/api/translate/route.ts` | UPDATE | Stop returning raw translation exception messages |
| `README.md` | UPDATE | Remove unsupported claims and add v2 rebuild note |
| `.github/plans/issue-2-stabilize-public-baseline.plan.md` | UPDATE | Track implementation progress |

## Tasks

Execute in order.

### Task 1: Resolve Viewer Merge Conflict

- **File**: `app/viewer/page.tsx`
- **Action**: UPDATE
- **Implement**: Remove conflict markers and make the page render the existing stable PDF learning flow.
- **Mirror**: `app/landing/page.tsx`
- **Validate**: `rg -n "<<<<<<<|=======|>>>>>>>" app/viewer/page.tsx`
- **Status**: [x] Complete

### Task 2: Sanitize Public API Errors

- **Files**: `app/api/process/route.ts`, `app/api/chat/route.ts`, `app/api/translate/route.ts`
- **Action**: UPDATE
- **Implement**: Keep detailed errors in server logs only. Return stable user-facing messages without stack traces, provider messages, constructor names, or raw implementation details.
- **Mirror**: Existing `NextResponse.json({ error }, { status })` API style
- **Validate**: `rg -n "details:|type:|err\\.message|errorMessage" app/api`
- **Status**: [x] Complete

### Task 3: Rewrite README Claims

- **File**: `README.md`
- **Action**: UPDATE
- **Implement**: Describe the current app as a prototype/demo, label Quechua support as experimental, remove cultural validation/no-hallucination guarantees, and add a short v2 source-grounded learning workspace note.
- **Mirror**: Issue #1 PRD positioning and limitations
- **Validate**: `rg -n "no hallucinations|validated|cultural authority|Automatic detection of Quechua|Native language support" README.md`
- **Status**: [x] Complete

### Task 4: Run Baseline Validation

- **Target**: Repository
- **Action**: VALIDATE
- **Implement**: Run the local `/validate` checks using available repo tooling. This repo uses `pnpm`, so prefer equivalent commands when `bun` is unavailable or scripts are missing.
- **Mirror**: `C:\Users\abiga\.config\opencode\commands\validate.md`
- **Validate**: `pnpm lint`, `pnpm exec tsc --noEmit`, and available tests if configured.
- **Status**: [x] Complete

## Validation

```powershell
rg -n "<<<<<<<|=======|>>>>>>>" app README.md components lib
pnpm lint
pnpm exec tsc --noEmit
pnpm test
pnpm build
```

If `pnpm test` is unavailable because no test script exists, record that as a validation limitation.

## Validation Results

| Check | Result | Details |
|---|---|---|
| Conflict markers | Passed | No conflict markers found in app/docs/components/lib |
| Lint | Passed | `pnpm lint` completed successfully |
| Type check | Passed | `pnpm exec tsc --noEmit --pretty false` completed successfully |
| Tests | Not configured | `pnpm test` failed because no `test` script exists |
| Build | Passed | `pnpm build` completed successfully |

## Acceptance Criteria

- [x] Resolve unresolved merge conflict markers in `app/viewer/page.tsx`
- [x] Run `pnpm build` successfully
- [x] Run `pnpm lint` successfully or document non-blocking warnings
- [x] Remove or rewrite unsupported claims about language quality, cultural validation, and no hallucinations
- [x] Remove internal implementation details from public error responses where touched
- [x] Add a short note that v2 is a source-grounded learning workspace rebuild

# Plan: Issue 1 - WarmiMIND v2 Roadmap

## Summary

Issue #1 is the parent PRD for rebuilding WarmiMIND as a source-grounded AI STEM learning workspace. The implementation approach is to treat #1 as the roadmap container, then execute issues #2 through #14 in dependency order with a plan, implementation, and validation checkpoint for each issue.

## User Story

As a student
I want to upload a STEM PDF and get a source-grounded learning session
So that I can study dense material through summaries, concepts, questions, tutor chat, misconception checks, and next actions tied back to the source.

## Metadata

| Field | Value |
|---|---|
| GitHub Issue | #1 |
| Type | NEW_CAPABILITY |
| Complexity | HIGH |
| Systems Affected | Frontend, backend/API, AI pipeline, storage/data model, evals, docs |

## Patterns to Follow

### Existing App Structure

```text
app/          Next.js routes and API routes
components/   Existing UI panels and viewer components
lib/          AI, translation, session, retrieval helpers
```

### Current Baseline Risks

```text
app/viewer/page.tsx contains unresolved merge conflict markers.
README.md currently overstates Quechua/cultural validation and anti-hallucination guarantees.
app/api/process/route.ts and app/api/chat/route.ts expose raw internal error details.
```

## Files to Change

| File | Action | Purpose |
|---|---|---|
| `.github/plans/issue-1-warmimind-v2-roadmap.plan.md` | CREATE | Track issue #1 as the parent roadmap plan |
| GitHub issue #1 | UPDATE | Add reference to this plan and mark as planned |

## Tasks

Execute in order.

### Task 1: Create Parent Roadmap Plan

- **File**: `.github/plans/issue-1-warmimind-v2-roadmap.plan.md`
- **Action**: CREATE
- **Implement**: Capture #1 as the parent roadmap and define the execution order for #2 through #14.
- **Mirror**: `C:\Users\abiga\.config\opencode\commands\plan.md`
- **Validate**: Confirm the plan file exists and is tracked by git.
- **Status**: [x] Complete

### Task 2: Link Plan To GitHub Issue

- **Target**: GitHub issue #1
- **Action**: UPDATE
- **Implement**: Add a comment linking the plan path and noting that issues #2 through #14 will be executed in order.
- **Mirror**: `C:\Users\abiga\.config\opencode\commands\plan.md`
- **Validate**: Confirm the issue comment was created.
- **Status**: [x] Complete

### Task 3: Establish Execution Queue

- **Target**: Issue sequence
- **Action**: DOCUMENT
- **Implement**: Use #2 as the first actionable implementation issue, then proceed through #14 according to blocker relationships.
- **Mirror**: Issue bodies from GitHub
- **Validate**: Confirm #2 is next and unblocked.
- **Status**: [x] Complete

## Validation

```powershell
git status --short
Test-Path .github/plans/issue-1-warmimind-v2-roadmap.plan.md
```

Full repository validation will run after code-affecting implementation issues using the local `/validate` command workflow.

## Acceptance Criteria

- [x] Parent roadmap plan exists in `.github/plans`
- [x] GitHub issue #1 references the plan
- [x] Issue execution queue is clear
- [x] Next actionable issue is #2

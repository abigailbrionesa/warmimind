# Plan: Issue 8 - Evidence-Linked Guided Questions

## Summary

Generate guided questions with difficulty labels, related concepts, and evidence citations.

## Tasks

- [x] Add `guided_questions` migration in `migrations/0002_v2_learning_outputs.sql`
- [x] Generate guided questions from extracted concepts and citations
- [x] Store question text, difficulty, related concept, and evidence references
- [x] Display guided-question workflow in `/workspace`
- [x] Support attempted answer storage in the data model
- [x] Add tests for question creation and evidence references through the service flow

## Validation Results

- `python -m compileall api`: passed
- `pnpm test`: passed
- `pnpm lint`: passed
- `pnpm build`: passed

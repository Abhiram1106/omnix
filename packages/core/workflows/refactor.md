# Workflow: Refactor

## Pre-conditions

- Tests cover the behavior being preserved. If not: write tests first.
- Behavior change is **out of scope**. If you find a bug, fix it in a separate commit.

## Pre-work

- Memory retrieval as usual.
- State the goal: what gets clearer / faster / smaller / safer? Measure if possible.

## Steps

1. **Pin the behavior** with characterization tests if missing.
2. **Small steps.** Each commit compiles and tests pass.
3. **Mechanical transformations first** (extract, rename, move).
4. **Structural changes second** (split modules, change boundaries).
5. **Delete dead code** as you go.

## Verify

- All tests pass after each commit, not just at the end.
- Public API surface unchanged (or changed deliberately, in ADR).

## Document

- ADR if module boundaries shifted.
- Update architecture doc if structure changed.

## Digest

Note before/after metrics if any. Note any latent bugs found (filed as separate fixes).

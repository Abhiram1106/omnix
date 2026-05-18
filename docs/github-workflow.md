# GitHub Workflow

## Branching

- Trunk-based: `main` is always shippable.
- Feature branches short-lived (hours to a few days).
- No long-running release branches unless you genuinely need them.

## PRs

- One concern per PR.
- Description format:
  - **Summary** (1-3 bullets).
  - **Test plan** (checklist).
  - **Rollback plan** (one line — flag off / revert / forward fix).
- Link to relevant ADR / decision entry / error memory if applicable.

## Reviews

- AI-assisted first pass against `workflows/code-review.md`.
- Human reviewer focuses on intent, edge cases, system fit.
- Distinguish blocking from suggestion.

## Required checks

- Lint, typecheck, unit tests on every PR.
- Integration tests gated to a slower job or merge queue.
- Security scan (dep audit) on a schedule + on PRs touching deps.

## Merge

- Squash merge by default. Clean main history.
- Commit message = PR title; body = PR description summary.

## Tags & releases

- Semver tags from main.
- Release notes generated from PR titles (or Changesets).

## Memory integration

- After a non-trivial PR, the session digest links the PR.
- Postmortems link the bad commit + the fix commit.

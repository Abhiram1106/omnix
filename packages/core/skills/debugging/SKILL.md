---
name: debugging
version: 1.1.0
status: stable
description: >
  Activate when user reports an error, broken behavior, failing test, crash,
  exception, or unexpected output. Use systematic hypothesis-driven debugging
  rather than random code changes.
triggers:
  - error
  - broken
  - crash
  - exception
  - failing
  - bug
  - not working
  - unexpected
  - investigate
  - reproduce
memory_reads:
  - { path: "03-ERRORS/error-memory.md", priority: critical }
  - { path: "03-ERRORS/anti-patterns.md", priority: high }
  - { path: "02-PROJECTS/project-context.md", priority: high }
memory_writes:
  - { path: "03-ERRORS/error-memory.md", condition: "when root cause found" }
  - { path: "03-ERRORS/anti-patterns.md", condition: "when error appears 3+ times" }
token_budget: { self: 900, context_reads: 2000, total: 2900 }
verification_required: true
destructive: false
tags: [debugging, errors, root-cause, hypothesis]
---

## When to activate

Any time the problem is "this doesn't work" rather than "build this." Pair with the error-memory check — the fix may already be documented.

## Core concepts

**Hypothesis-driven debugging** — form a specific, falsifiable hypothesis before changing any code. "I think X is happening because Y" — then test *only* that hypothesis.

**Narrow before fix** — reproduce in isolation → narrow to module → narrow to function → narrow to line. Never write a fix before you've seen the exact failing case.

**Error memory first** — check `03-ERRORS/error-memory.md` before doing anything. If this error or a similar root cause has been seen before, the fix is already there.

## Practical guidance

1. **Read the full error message** — not just the first line. The root cause is usually in the stack trace middle or the "caused by" chain.
2. **Reproduce before fixing** — if you can't reproduce it, you can't know your fix worked.
3. **State your hypothesis explicitly** — write it in the session (e.g., "hypothesis: null value reaching formatDate because user.createdAt is optional"). This prevents scope creep.
4. **Binary search the call stack** — add a log/assertion at the midpoint. Works up or down from there.
5. **Change one thing at a time** — simultaneous changes make it impossible to know which fixed (or broke) what.
6. **Write the regression test before merging** — the test encodes the bug, so it can never silently return.
7. **Update error memory** — after fixing, add an entry to `03-ERRORS/error-memory.md` with root cause, fix, and prevention rule. This is mandatory, not optional.

## Retrieval mode

Use **debugging mode** (2000 token budget): load project-context + last 5 session digests + `03-ERRORS/error-memory.md` (area-filtered) + `03-ERRORS/anti-patterns.md` + `07-LESSONS/debugging-lessons.md`.

## Common failure modes by area

**TypeScript/Node**: null/undefined propagation, async race conditions, import resolution errors, env var not loaded.
**React**: stale closure in effect, missing dependency array, hydration mismatch (SSR), key collision.
**Database**: N+1 query, missing index, migration not applied, connection pool exhausted.
**Auth**: token expiry not handled, cookie scope wrong, CORS preflight blocking.
**Docker/CI**: cached layer with stale deps, env var not injected, port binding conflict.

## Gotchas

- "Works on my machine" almost always means an env var, seed data, or dependency version differs.
- Changing multiple things to "try" something creates technical debt and ambiguity. Resist it.
- If the fix takes > 20 minutes and you haven't narrowed to a specific line, step back and re-read the error from scratch.
- Tests that pass after `--clearCache` and fail without it indicate a real isolation bug, not a test runner glitch.

## Integration

- After fix: write to `03-ERRORS/error-memory.md` using `templates/error-entry.md`.
- Workflow: `packages/core/workflows/debugging.md` and `bug-fix.md`.
- Agents: `debugger`, `qa` (for regression test).

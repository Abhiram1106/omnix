---
name: error-intelligence
version: 1.0.0
status: stable
description: >
  Four-phase failure recovery: capture error → diagnose root cause → apply minimal fix →
  write to error memory. Searches past errors BEFORE diagnosing. Never repeats known fixes.
triggers:
  - "error:"
  - "Error:"
  - "exception:"
  - "TypeError"
  - "cannot read"
  - "undefined is not"
  - "ECONNREFUSED"
  - "failed to"
  - "why is this broken"
  - "this isn't working"
  - "test failing"
  - "build error"
  - "compilation error"
auto_activate: false
requires: []
produces:
  - "root cause analysis"
  - "03-ERRORS/error-memory.md entry"
  - "regression test"
memory_reads:
  - { path: "03-ERRORS/error-memory.md", priority: critical }
  - { path: "03-ERRORS/anti-patterns.md", priority: critical }
  - { path: "02-PROJECTS/project-context.md", priority: high }
memory_writes:
  - { path: "03-ERRORS/error-memory.md", condition: "when root cause found and fix applied" }
  - { path: "03-ERRORS/anti-patterns.md", condition: "when this error type appears 3+ times" }
token_budget: { self: 900, context_reads: 2000, total: 2900 }
verification_required: true
destructive: false
tags: [debugging, errors, root-cause, recovery, error-memory]
compatible_adapters: [claude-code, cursor, generic]
---

## When to activate

Any time the problem is "this doesn't work" — error messages, failing tests, broken behavior, crashes.

## When NOT to activate

- "How do I implement X?" — use workflow-router instead
- "Review this code" — use the reviewer agent
- "Explain what this does" — no skill needed

## Phase 1: Error Capture

Before touching any code, capture:

```
- Error type:        [TypeError / ECONNREFUSED / ImportError / etc.]
- Full message:      [complete error text, not just first line]
- Stack trace:       [top 5 frames]
- Last action taken: [what was the user doing when this occurred]
- Context pressure:  [is context window near limit?]
- Environment:       [local/CI/production, Node version, OS]
```

**Read the FULL error message.** The root cause is usually in the middle of the stack trace or in the "caused by" chain — not the first line.

## Phase 2: Error Memory Search (MANDATORY FIRST STEP)

Before diagnosing, search error-memory.md:

```bash
omnix error-match "<paste error text>"
```

If a match is found (score > 0):
- Read the past root cause + fix
- Verify it applies to the current situation
- Apply if relevant (saves diagnosis time)
- Note in session that error-memory was consulted

If no match found: proceed to Phase 3.

## Phase 3: Hypothesis-Driven Diagnosis

State ONE hypothesis as the most likely cause:

> "Hypothesis: null value is reaching `formatDate()` because `user.createdAt` is optional but not handled."

Rules:
- ONE hypothesis at a time — not "maybe X or Y or Z"
- Must be falsifiable — "something is wrong" is not a hypothesis
- Choose the cheapest test to falsify it

**Decision table for common patterns:**

| Pattern | Likely Cause | Cheapest Check |
|---------|-------------|----------------|
| `cannot read property of undefined` | Null propagation, missing guard | Add console.log before failing line |
| `ECONNREFUSED` | Service not running, wrong port | `curl localhost:PORT` |
| Test passes locally, fails CI | Env var not set, timezone diff, race condition | Check CI env vars, add explicit waits |
| `TypeError: X is not a function` | Wrong import, API changed | Check import path, check library version |
| `Module not found` | Wrong path, not installed | `ls node_modules/X`, check tsconfig paths |
| Hydration mismatch (React) | Server/client render differs | Check Date(), Math.random(), localStorage usage |
| N+1 queries | Missing eager load | Log SQL queries, add `include:` or `JOIN` |

**Binary search the call stack:** Add a log/assertion at the midpoint. Works up or down.

## Phase 4: Minimal Fix + Regression Test

Rules:
- Change ONE thing at a time
- Write the regression test BEFORE merging
- The test must catch this exact bug if it returns

**PASS: Minimal fix with test**
```typescript
// Fix: add null guard
function formatDate(user: User): string {
  if (!user.createdAt) return "Unknown date";  // ← added guard
  return new Date(user.createdAt).toLocaleDateString();
}

// Regression test
it("handles missing createdAt gracefully", () => {
  expect(formatDate({ id: 1, createdAt: null })).toBe("Unknown date");
});
```

**FAIL: Changing multiple things simultaneously**
```typescript
// BAD: changed 3 things — can't tell which fixed it
function formatDate(user: User): string {
  const date = user.createdAt ?? user.updatedAt ?? new Date();
  return format(date, 'yyyy-MM-dd');  // also changed format library
}
```

## Phase 5: Error Memory Write (MANDATORY)

After every fix, write to `03-ERRORS/error-memory.md`:

```markdown
## [Brief error title]
- Date: YYYY-MM-DD
- Last Verified: YYYY-MM-DD
- Status: resolved
- Symptom: [what the error looked like]
- Root Cause: [why it happened — specific, not vague]
- Fix: [what was done — specific code change]
- Prevention Rule: [how to never cause this again]
- Regression Test Added: yes
- Related Files: [src/utils/date.ts]
```

## Gotchas

- "Works on my machine" = env var, seed data, or dependency version differs
- Never change multiple things to "try" something — creates ambiguity
- If debugging > 20 minutes without narrowing to a specific line: re-read the error from scratch
- Tests passing after `--clearCache` but failing without = real isolation bug, not a test runner issue

## Verification

- [ ] Error is no longer reproducible
- [ ] Regression test exists and catches the bug
- [ ] Error entry written to `03-ERRORS/error-memory.md`
- [ ] No other tests broken by the fix

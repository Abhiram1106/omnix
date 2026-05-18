---
name: code-review
description: >
  Activate when user asks to review, audit, check, or assess code. Use for
  pull request reviews, architecture audits, security checks, and quality
  assessments. Produces structured, actionable findings — not style opinions.
triggers:
  - review
  - audit
  - check
  - assess
  - PR
  - pull request
  - code quality
  - lint
  - smell
---

## When to activate

When the goal is to find problems in existing code rather than write new code. Also activate proactively after writing a significant feature before claiming it's complete.

## Core concepts

**Confidence-based filtering** — only report findings you're confident are real problems. A review with 3 genuine issues is better than 20 guesses. Filter: would this cause a bug, security issue, or meaningful maintenance cost? If no → skip.

**Layered review** — work from coarse to fine: architecture → security → correctness → tests → conventions. Stop early if a coarse-layer issue makes fine-layer issues moot.

**Priority levels**:
- 🔴 **Blocker**: will cause a bug, data loss, or security issue in production.
- 🟡 **Warning**: will cause problems under specific conditions or at scale.
- 🟢 **Suggestion**: improves readability or maintainability, non-urgent.

## Review checklist (run in order)

**1. Architecture**
- Does this change fit within existing module boundaries?
- Does it introduce a circular dependency?
- Is the abstraction level consistent with the surrounding code?

**2. Security** (auto-activate security agent if any of these are touched)
- Unsanitized input reaching SQL/shell/HTML?
- Auth/authz check present and correct?
- Secrets or PII in logs or responses?
- OWASP Top 10 surface (injection, broken auth, IDOR, misconfig)?

**3. Correctness**
- Are error paths handled (not just the happy path)?
- Are edge cases covered (empty, null, max, concurrent)?
- Is async/await used correctly (no floating promises)?
- Are types correct — no unchecked `as` casts or `any`?

**4. Tests**
- Is there a test for the new behavior?
- Is there a regression test if this fixes a bug?
- Do tests cover the failure case, not just the success case?
- Are mocks scoped correctly (test the real behavior, not the mock)?

**5. Conventions**
- Does this match the patterns already in the codebase?
- Are names consistent with existing naming (no "users" next to "accounts" for the same thing)?
- Are comments explaining *why*, not *what*?

## Output format

```
## Review: <file or feature>

### Blockers
- [file:line] <finding> — <why it's a problem> — <suggested fix>

### Warnings
- [file:line] <finding> — <why> — <fix or consider>

### Suggestions (optional)
- [file:line] <finding>

### Verdict
APPROVE | REQUEST_CHANGES | NEEDS_DISCUSSION
```

Omit sections with no findings. Never include empty sections.

## Gotchas

- Style preferences ("I would have named it differently") are not review findings.
- If you haven't run the code, you may have missed runtime-only bugs. State this.
- Reviewing untested code: note that the lack of tests is itself a blocker.
- Don't review things that are outside the PR scope — note them as out-of-scope, not findings.

## Integration

- After review: if errors found → add to `03-ERRORS/error-memory.md`. If architectural decisions visible → add to `04-DECISIONS/decisions.md`.
- Agents: `reviewer`, `security` (auto-activated on auth/payment/secrets).
- Workflow: `packages/core/workflows/code-review.md`.

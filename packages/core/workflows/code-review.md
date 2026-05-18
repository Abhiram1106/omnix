# Workflow: Code Review

## What to check

1. **Correctness** — does it do what the PR description claims?
2. **Tests** — added for new behavior, modified for changed behavior, covering edge cases.
3. **Conventions** — matches existing patterns; deviations are justified.
4. **Surface area** — public APIs are minimal and intentional.
5. **Errors** — handled meaningfully, not swallowed; logged with context.
6. **Security** — input validated, secrets not exposed, auth/authz applied.
7. **Performance** — no obvious N+1, no unbounded loops on user input.
8. **Docs** — updated when behavior/setup changes.

## What not to nitpick

- Style auto-formatters already handle.
- Personal preferences when the project convention is established.
- Hypothetical future requirements.

## How to comment

- Lead with the issue. Suggest a fix or ask a question.
- Distinguish blocking ("needs change") from suggestion ("consider").
- Reference code with `file.ext:LN`.

## AI-assisted review

- The AI does a first pass against this checklist + `standards/`.
- Human reviewer confirms or overrides.
- Findings of recurring nature → `07-LESSONS/lessons-learned.md`.

## Digest

If review surfaced a recurring pattern, log it as a lesson.

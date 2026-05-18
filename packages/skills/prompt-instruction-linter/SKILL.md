---
name: prompt-instruction-linter
version: 0.8.0
status: experimental
description: >
  Lints prompts and AI instructions for quality. Detects 37 anti-patterns (vague verbs,
  two tasks in one, no success criteria, wrong technique for model type). Produces
  optimized version with tool-specific routing.
triggers:
  - "improve this prompt"
  - "optimize prompt"
  - "lint this instruction"
  - "prompt quality"
  - "CLAUDE.md quality"
  - "improve AGENTS.md"
  - "is this prompt good"
  - "prompt review"
auto_activate: false
requires: []
produces:
  - "optimized prompt"
  - "linter report"
memory_reads:
  - { path: "02-PROJECTS/project-context.md", priority: medium }
memory_writes: []
token_budget: { self: 700, context_reads: 200, total: 900 }
verification_required: false
destructive: false
tags: [prompts, instructions, linting, optimization, CLAUDE.md, AGENTS.md, quality]
compatible_adapters: [claude-code, cursor, generic]
---

## When to activate

Writing prompts, reviewing CLAUDE.md or AGENTS.md content, improving skill instructions, before using a prompt in production.

## When NOT to activate

- Already running a task (lint before, not during)
- Simple one-liner questions (not worth optimizing)

## The 9-Dimension Intent Extraction

Before generating or optimizing any prompt, extract:

1. **Task:** Specific action (not "help me with X")
2. **Target tool:** Claude Code / Cursor / o3 / GPT-4 / generic
3. **Output format:** What shape should the output have?
4. **Constraints:** What MUST and MUST NOT happen?
5. **Input:** What does the user provide?
6. **Context:** Domain, project state, relevant background
7. **Audience:** Who reads the output?
8. **Success criteria:** How do you know it worked? (binary if possible)
9. **Examples:** Input/output pairs if complex

If any of these is missing: ask max 3 clarifying questions. No more.

## Top 20 Anti-Patterns (from prompt-master)

| # | Anti-Pattern | Bad Example | Fixed |
|---|-------------|-------------|-------|
| 1 | Vague task verb | "help me with my code" | "Refactor `getUserData()` to use async/await and handle errors" |
| 2 | Two tasks in one | "explain AND rewrite this" | Split into two separate prompts |
| 3 | No success criteria | "make it better" | "Return zero TypeScript errors and pass all existing tests" |
| 4 | Missing target tool | "write a prompt for this" | Specify Claude Code / Cursor / o3 etc. |
| 5 | No stack constraints | "build a REST API" | "Express 4.x, TypeScript 5.x, PostgreSQL, no extra libraries" |
| 6 | No stop condition for agents | "build the whole feature" | "Stop after implementing the API. Do not touch the frontend." |
| 7 | Adding CoT to reasoning models | "think step by step" to o3/o4-mini | Remove it — reasoning models think internally |
| 8 | No starting state | "fix the login bug" | "Current state: login works locally, fails in CI. Error: ECONNREFUSED 5432" |
| 9 | Scope creep invitation | "and anything else you think is needed" | Be explicit about exactly what to include |
| 10 | No output format | "give me the results" | "Return JSON: `{ files: string[], issues: Issue[] }`" |
| 11 | Omnidirectional instruction | "be creative but professional" | Pick one or the other, or define both specifically |
| 12 | Hallucination bait | "list all best practices" | "List 5 specific practices for this exact stack" |
| 13 | No error handling instruction | "implement the feature" | "Handle these error cases: [list]" |
| 14 | Missing persona | (no role) | "You are a senior TypeScript engineer reviewing for security" |
| 15 | Conflicting instructions | "be concise but comprehensive" | Pick one |
| 16 | No context about existing code | "add tests" | "Add tests for `src/utils/date.ts`. Existing test runner: Vitest. No existing tests." |
| 17 | Open-ended agent | "do whatever it takes" | Explicit permitted/forbidden actions |
| 18 | Late constraints | Instructions at end of long prompt | Critical rules at the TOP (primacy zone) |
| 19 | Generic framing | "fix this" | Exact file path + function name + line number |
| 20 | No verification instruction | "implement X" | "Run `pnpm test` before reporting done. Share test output." |

## Tool-specific routing rules

**Claude Code / Claude (any model):**
- Front-load everything: intent, constraints, acceptance criteria in turn 1
- XML tags for multi-section complex prompts: `<context>`, `<task>`, `<constraints>`
- Do NOT add "think step by step" — Opus uses adaptive thinking
- Specify file paths explicitly

**Cursor:**
- File-Scope template: include file path + scope boundary
- Explicit "Only modify this file" constraints
- Short, declarative rules work better than narrative explanations

**o3 / o4-mini (reasoning models):**
- SHORT clean instructions ONLY (< 200 words system prompt)
- NEVER add CoT ("think step by step") — degrades output
- Zero-shot first — don't add examples unless necessary
- No scaffolding, no structure, trust the reasoning

**Generic / API usage:**
- Intent + Output format + Constraints + Examples
- CO-STAR template for professional outputs
- RISEN for complex multi-step tasks

## Linter output format

```
Prompt Lint Report
──────────────────
Input tokens (estimated):  ~340
Issues found: 3

[HIGH] No stop condition for agent task (anti-pattern #6)
  → Add: "Stop after [specific milestone]. Do not proceed to [next step]."

[MED] Missing target tool (anti-pattern #4)
  → Specify: Claude Code / Cursor / o3 / generic

[LOW] Success criteria vague: "make it work" (anti-pattern #3)
  → Replace with: binary success condition

Optimized prompt:
─────────────────
[optimized version of the input prompt]
```

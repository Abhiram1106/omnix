---
name: project-onboarder
version: 1.0.0
status: stable
description: >
  Full project onboarding for new repositories. Scans stack, asks 5 forcing questions,
  seeds vault with project context, installs adapter, writes first digest. Use once per project.
triggers:
  - "set up omnix"
  - "initialize project"
  - "first time setup"
  - "empty vault"
  - "onboard this project"
auto_activate: false
memory_reads: []
memory_writes:
  - { path: "02-PROJECTS/project-context.md", condition: "always" }
  - { path: "02-PROJECTS/active-goals.md", condition: "always" }
  - { path: "03-ERRORS/error-memory.md", condition: "always (empty seed)" }
  - { path: "01-SESSIONS/", condition: "first digest" }
token_budget: { self: 800, context_reads: 0, total: 800 }
verification_required: true
destructive: false
tags: [onboarding, init, setup, first-run, project-context]
---

## When to activate

Once per project, when vault is empty or when running `omnix init` for the first time.

## Forcing questions (discovery form)

Before writing anything, emit these 5 questions and wait for answers:

1. **What are we building?** (product description in 1-2 sentences)
2. **Who is it for?** (primary users / audience)
3. **What is the current most important goal?** (this sprint / this week)
4. **What constraints must we never violate?** (security, performance, compliance, tech debt limits)
5. **What does "done" look like for the next milestone?** (binary success criteria)

These answers go directly into `project-context.md`. Skip if `--yes` flag is set.

## Core execution

1. Ask the 5 forcing questions (or skip with `--yes`)
2. Run `omnix scan` to detect stack (languages, frameworks, tools)
3. Write `02-PROJECTS/project-context.md` with detected info + answers
4. Write `02-PROJECTS/active-goals.md` with the stated goal from question 3
5. Seed `03-ERRORS/error-memory.md` (empty with header)
6. Ask which AI tool to install adapter for → run `omnix install-adapters`
7. Run `omnix verify` → confirm all checks pass
8. Write first session digest with `omnix session-digest --auto`

## Verification

`omnix verify` must pass all 8 checks before onboarding is complete.
`project-context.md` must have no `(fill in)` markers — all fields answered.

## What gets created (minimal mode)

```
.obsidian-ai-memory/
  02-PROJECTS/
    project-context.md    ← seeded with stack + discovery answers
    active-goals.md       ← seeded with stated goal
    vault-index.md        ← empty, populated by first sync-memory
  03-ERRORS/
    error-memory.md       ← empty header
  templates/              ← session-digest, error-entry, decision-entry
AGENTS.md                 ← universal rules
{tool-specific adapter}   ← e.g., CLAUDE.md, .cursor/rules/project-rules.mdc
.omnix/settings/omnix.json
```
Total: ~6-8 files. Not 30.

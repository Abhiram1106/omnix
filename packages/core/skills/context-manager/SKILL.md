---
name: context-manager
version: 1.0.0
status: stable
description: >
  Loads relevant vault context before any task using progressive disclosure and
  task-type-aware retrieval. Auto-activated every session.
triggers:
  - "before any session starts"
  - "starting work on"
auto_activate: true
memory_reads:
  - { path: "02-PROJECTS/project-context.md", priority: critical }
  - { path: "02-PROJECTS/active-goals.md", priority: critical }
  - { path: "02-PROJECTS/vault-index.md", priority: high }
  - { path: "03-ERRORS/error-memory.md", priority: high }
  - { path: "04-DECISIONS/decisions.md", priority: medium }
memory_writes:
  - { path: "02-PROJECTS/vault-index.md", condition: "when index is stale (>1 day)" }
token_budget: { self: 600, context_reads: 2000, total: 2600 }
verification_required: false
destructive: false
tags: [context, retrieval, memory, auto-activate]
---

## When to activate

Every session. This skill is `auto_activate: true` — it runs before any task begins.

## Core execution

1. Detect task type from request → select retrieval mode:
   - debug/error keywords → `debugging` mode (error-memory first, 2000 tokens)
   - architecture/design keywords → `architecture` mode (5-ARCHITECTURE first, 4000 tokens)
   - quick question → `minimal` mode (project-context only, 500 tokens)
   - feature/build → `deep` mode (full context, 3000 tokens)
   - default → `balanced` mode (1500 tokens)

2. Load files in priority order, stopping at token budget. Use progressive disclosure:
   - **Tier 1 (always):** vault-index.md (lightweight index, ~100 tokens)
   - **Tier 2 (on match):** file summaries for candidates
   - **Tier 3 (on selection):** full content for top-N files

3. Check for stale entries: warn if any file has `last-verified` > 90 days old.

4. Emit compact startup block:
   ```
   [Omnix] {project} | {stack} | mode: {mode}
   Loaded: {files} | Known errors: {N} | Last session: {date}
   ```

5. Proceed with task.

## Token budgets by mode

| Mode | Budget | Priority order |
|------|--------|----------------|
| minimal | 500 | project-context only |
| balanced | 1500 | context → goals → errors → decisions |
| deep | 3000 | all files, errors → architecture → decisions |
| architecture | 4000 | architecture → decisions → context → lessons |
| debugging | 2000 | error-memory → anti-patterns → context → sessions |

## Output

Emit the startup block. Then load the task into attention and begin.
Do NOT narrate the loading process in detail — startup block is 2 lines max.

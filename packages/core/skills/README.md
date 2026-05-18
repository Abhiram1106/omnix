# Omnix Skills

Progressive-disclosure skill modules. AI tools load skill names at startup; full content activates on demand when a trigger keyword matches the user's request.

## Design principles

- **Max 500 lines per skill** — stays within context budget.
- **YAML frontmatter** — name, description, triggers. Description is the activation signal.
- **Three disclosure levels**: skill name → full skill content → referenced data files.
- **Position-aware**: critical rules at top and bottom of each file (middle of context window loses accuracy).

## Skill index

| Skill                 | Package | Triggers                               | Purpose                                          |
|-----------------------|---------|----------------------------------------|--------------------------------------------------|
| `context-engineering` | core    | context, tokens, retrieval, memory     | Retrieval hierarchy, token budgets, compression  |
| `agent-orchestration` | core    | agents, roles, parallel, team          | Multi-role reasoning, parallel team mode         |
| `debugging`           | core    | debug, error, broken, crash, fix       | Hypothesis-driven debugging, error memory        |
| `code-review`         | core    | review, audit, check, assess           | Layered review, confidence-based filtering       |
| `prompt-engineering`  | core    | prompt, LLM, instruction               | Intent algebra, anti-patterns, evals             |
| `session-memory`      | core    | digest, session, memory, vault         | Memory loop, digest writing, compression         |
| `web-scraping`        | core    | scrape, crawl, extract data, playwright| Fetcher escalation, LLM extraction, browser auto |
| `design-brief`        | design  | design brief, brand identity, palette  | 8-dimension brief resolver → design system       |
| `design-review`       | design  | design review, UI review, accessibility| Layered UI critique, accessibility checks        |
| `component-design`    | design  | component, button, form, modal, table  | Component spec with all states and tokens        |

## Adding a skill

1. Create `packages/core/skills/<name>/SKILL.md` or `packages/design/skills/<name>/SKILL.md`.
2. Add a row to the index above.
3. Keep it under 500 lines. Split into separate skills if larger.

## Skill template

```markdown
---
name: skill-name
description: >
  Activate when user asks about X, Y, or Z. Use for tasks involving A, B, C.
triggers:
  - keyword1
  - keyword2
---

## When to activate
[1-2 sentences]

## Core concepts
[Mental models, not implementation]

## Practical guidance
[Numbered, verifiable rules]

## Gotchas
[Experience-derived failure modes — highest-signal content]

## Integration
[How this skill relates to other Omnix skills/agents]
```

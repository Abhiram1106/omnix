---
name: workflow-router
version: 1.1.0
status: stable
description: >
  Routes any user request to the correct workflow + agent roles using deterministic
  rule-based matching. No LLM required. Fast, reliable, consistent.
triggers:
  - "what should I do"
  - "help me"
  - "how do I"
  - "I need to"
auto_activate: false
memory_reads:
  - { path: "06-WORKFLOWS/", priority: medium }
memory_writes: []
token_budget: { self: 400, context_reads: 200, total: 600 }
verification_required: false
destructive: false
tags: [routing, workflows, agents, orchestration, deterministic]
---

## When to activate

When a user gives a goal and the correct workflow needs to be determined. This is the first routing layer — deterministic, no LLM dependency.

## Routing table

| Request signal | Workflow | Activate roles | Retrieval mode |
|----------------|----------|----------------|----------------|
| build / add / implement / create | feature-build | architect + fullstack + reviewer | balanced |
| error / broken / crash / failing / exception | debugging → bug-fix | debugger + security | debugging |
| test failing / test broken | bug-fix + testing | debugger + qa | debugging |
| review / audit / check quality | code-review | reviewer + security | balanced |
| refactor / clean / improve / simplify | refactor | architect + reviewer | balanced |
| deploy / ship / release / publish | deployment | devops (specialized) | minimal |
| slow / performance / optimize | debugging + performance | debugger + performance (specialized) | deep |
| docs / readme / document / runbook | docs-update | docs (specialized) | minimal |
| security / auth / vulnerability / CVE | code-review + security | security + reviewer | deep |
| schema / migration / database / query | feature-build + database | architect + database (specialized) | deep |
| first run / empty vault / setup | project-onboarding | fullstack | deep |

## Multi-area detection

If request spans > 2 areas (e.g., "add auth to the API and update the database schema"):
- Activate all relevant workflows in sequence (not parallel)
- Activate multi-role: architect + security + database + reviewer
- Use `deep` retrieval mode
- Emit role list in startup block

## Output format

```
Workflow: {workflow}
Agents: {role1}, {role2}, ...
Retrieval mode: {mode}
```

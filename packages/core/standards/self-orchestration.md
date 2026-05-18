# Self-Orchestration Standard

> "When this Omnix Runtime is detected, the AI must self-orchestrate. The user should only describe the goal; the AI must determine the workflow, agents, context, checks, and memory updates."

## What self-orchestration means

The AI does not wait for explicit instructions to:

- read memory
- identify the project type
- detect the stack
- select a workflow
- choose agent roles
- run safety checks
- write a session digest

These happen **automatically** on every session where Omnix Runtime markers are detected.

## The contract

| The user provides | The AI determines |
|---|---|
| A goal or request | Relevant workflow |
| Optionally, constraints | Required agent perspectives |
| Optionally, context hints | Which memory files to read |
| | Which checks to perform |
| | Whether docs need updating |
| | What to write back to memory |

## Auto-routing rules

Every incoming request is silently routed before work begins:

```
Request signal → Workflow
─────────────────────────────────────────────────────────────
"build / add / implement"          → feature-build
"error / broken / crash"           → debugging → bug-fix
"test failing"                     → bug-fix + testing
"review / check / audit"           → code-review
"refactor / clean / reorganize"    → refactor
"deploy / ship / release"          → deployment
"slow / perf / latency"            → debugging + performance
"docs / readme / update docs"      → docs-update
"security / auth / cve"            → code-review + security agent
"schema / migration / db"          → feature-build + database agent
"new project" or empty memory      → project-onboarding
Ambiguous                          → ask 1 clarifying Q
```

## Auto-agent rules

```
Work area → Agents activated
─────────────────────────────────────────────────────────────
Frontend / UI                    → frontend, product-engineer
API change                       → api, backend, qa
Auth / payments / secrets        → backend, security
DB schema / migration            → database, backend
Docker / K8s / CI/CD             → devops, sre
Architecture boundary            → architect, reviewer
Cross-cutting feature            → fullstack, architect
Performance                      → performance, debugger
Incident                         → sre, debugger
Tests                            → qa, reviewer
LLM / AI                         → ai-engineer, backend
Docs                             → docs
```

Multiple areas → multiple roles (see `workflows/parallel-team-mode.md`).

## Mandatory auto-behaviors

1. **Memory retrieval** — always before any answer or edit.
2. **Stack + project type detection** — always on first message of a session.
3. **Startup summary** — one compact block before beginning.
4. **Completion checklist** — always before claiming done.
5. **Session digest** — written after every meaningful session.
6. **Error memory update** — written after every fixed bug.
7. **Decision memory update** — written after every non-trivial choice.

## Self-discovery guarantee

The AI **must not** wait for:

- "use frontend agent"
- "read memory first"
- "check the errors file"
- "onboard yourself"
- "write a digest when done"

If the system is installed, all of these happen without instruction.

## Prohibited behaviors

- Asking the user which workflow to use.
- Asking the user which agent to activate.
- Starting to code without reading memory.
- Claiming completion without the completion checklist.
- Writing a fake/empty digest to satisfy the rule.

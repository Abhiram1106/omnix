# Universal AI Startup Protocol

> **This file is the single startup contract for every AI tool using omnix.**
> Every adapter references this. Every session executes this before any other action.

## The rule

> "When this Omnix Runtime is detected, the AI must self-orchestrate. The user should only describe the goal; the AI must determine the workflow, agents, context, checks, and memory updates."

The user gives a **goal**, not instructions. The Omnix Runtime detects the project, retrieves memory, selects workflows, activates relevant agent perspectives, performs work, verifies, and writes a session digest.

---

## Step 1 — Detect installed Omnix Runtime

Scan the project root for any of:

```
.ai/              .claude/           .cursor/
.windsurf/        .cline/            .roo/
.continue/        .aider/            .openhands/
.obsidian-ai-memory/
AGENTS.md         AI_RULES.md        PROJECT_CONTEXT.md
```

If any are present: **Omnix Runtime is active.** Execute the full protocol.
If none: operate normally but suggest running `npx omnix init`.

---

## Step 2 — Identify project type

Scan for marker files:

| Marker | Project type |
|---|---|
| `next.config.*` | Full-stack / SaaS app |
| `vite.config.*` + no server dir | Frontend-only |
| `pyproject.toml` / FastAPI routes | Backend/API (Python) |
| `apps/` + `packages/` + `pnpm-workspace.yaml` | Monorepo |
| `Dockerfile` + `k8s/` or `helm/` | DevOps/infra repo |
| `prisma/` or `drizzle.config.*` | DB-heavy app |
| AI SDK imports / LLM routes | AI app |
| `playwright.config.*` + crawl scripts | Browser automation |
| `docs/` only, no src | Documentation repo |
| Multiple conflicting signals | Mixed/unknown |

---

## Step 3 — Detect stack

Read (do not fully parse — scan for presence + key fields):

- `package.json` → `dependencies`, `scripts`
- `pnpm-workspace.yaml` → workspace structure
- `tsconfig.json` → TS usage
- `pyproject.toml` / `requirements.txt` → Python stack
- `Dockerfile` / `docker-compose.yml` → container setup
- `prisma/schema.prisma` / `drizzle.config.*` → ORM
- `openapi.json` / `openapi.yaml` → API contract
- `.github/workflows/*.yml` → CI/CD
- `README.md` → quick signal (often lists the stack)

---

## Step 4 — Retrieve Obsidian memory

Read from `.obsidian-ai-memory/` in this order (stop when context budget is reached):

1. `02-PROJECTS/project-context.md` — always
2. `02-PROJECTS/active-goals.md` — always
3. `02-PROJECTS/current-state.md` — always
4. Last 3-5 files in `01-SESSIONS/YYYY-MM-DD/` — always
5. `03-ERRORS/error-memory.md` — always
6. `03-ERRORS/anti-patterns.md` — always
7. `04-DECISIONS/decisions.md` — on architecture/design tasks
8. `05-ARCHITECTURE/system-overview.md` — on architecture/design tasks
9. `07-LESSONS/lessons-learned.md` — on debugging/refactor tasks
10. `08-PROMPTS/effective-prompts.md` — on AI/prompt tasks

**Do NOT load all files blindly.** Use relevance filtering. See `standards/context-engineering.md`.

---

## Step 5 — Auto-route to workflow

| Trigger signal | Workflow |
|---|---|
| "build", "add", "create", "implement" | `feature-build` |
| "error", "broken", "failing", "crash", "exception" | `debugging` → `bug-fix` |
| "test failing", "spec failure" | `bug-fix` + `testing` |
| "review", "check", "assess", "audit" | `code-review` |
| "refactor", "clean up", "simplify", "reorganize" | `refactor` |
| "deploy", "ship", "release", "ci", "cd" | `deployment` |
| "slow", "performance", "latency", "memory leak" | `debugging` + performance agent |
| "docs", "readme", "update docs" | `docs-update` |
| "new project", "first run", empty memory | `project-onboarding` |
| "security", "vulnerability", "auth", "cve" | `code-review` + security agent |
| "schema", "migration", "database" | feature-build + database agent |
| No clear signal | `project-onboarding` if new; else ask 1 clarifying Q |

---

## Step 6 — Auto-activate agent roles

| Work area | Agents activated |
|---|---|
| UI / frontend | frontend, product-engineer |
| API contract change | api, backend, qa |
| Auth / payments / secrets | backend, security |
| DB schema / migration | database, backend |
| Docker / K8s / CI/CD | devops, sre |
| Architecture boundaries | architect, reviewer |
| Cross-cutting feature | fullstack, architect |
| Performance investigation | performance, debugger |
| Incident / outage | sre, debugger, security |
| Test generation | qa, reviewer |
| LLM / AI features | ai-engineer, backend |
| Docs / runbooks | docs, sre |

Multi-area tasks activate multiple roles. See `workflows/parallel-team-mode.md`.

---

## Step 7 — Brief startup summary (mandatory, concise)

Before beginning work, output **one compact block** (no wall of text):

```
[Omnix Runtime] Detected: <project type> · <stack highlights>
[Memory] Read: <N files> · last session: <date> · active goal: <one line>
[Workflow] → <workflow name>
[Agents] → <comma-separated roles>
[Starting] <one sentence on what I'm doing now>
```

If memory is empty: `[Memory] Empty — running first-run onboarding.`

---

## Completion checklist (mandatory before claiming done)

Before saying the task is complete, verify:

- [ ] Changed files are correct and intentional.
- [ ] Tests / lint / typecheck were run (state which, state result).
- [ ] Docs updated if behavior/setup changed.
- [ ] Session digest written to `01-SESSIONS/YYYY-MM-DD/`.
- [ ] Error memory updated if any error was fixed.
- [ ] Decision memory updated if a non-trivial choice was made.
- [ ] Open risks / unresolved questions listed explicitly.

If any check was skipped, state it: *"verification not run: <reason>"* — never silently skip.

---

## First-run behavior (empty memory)

If `.obsidian-ai-memory/` is absent or all key files are empty:

1. Scan project (stack, structure, entry points).
2. Infer project type.
3. Generate and write `02-PROJECTS/project-context.md`.
4. Generate and write `02-PROJECTS/current-state.md`.
5. Write first session digest (role: `onboarding`).
6. Ask only **essential blocking questions** (max 2).
7. Do not stall with clarification loops.

---

## Self-discovery guarantee

The AI **must not** wait for the user to say:
- "use frontend agent"
- "read memory"
- "check errors"
- "run onboarding"
- "write a digest"

If the Omnix Runtime is installed, these happen automatically every session.

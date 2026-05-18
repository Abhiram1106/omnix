# Workflow: Auto-Detection

Runs at the **start of every session** before any user request is answered. Automated. Silent unless the brief startup summary is relevant to the user.

## Purpose

Eliminate the need for the user to manually specify: which agent to use, which memory to read, which workflow applies, or what context the AI needs.

## Detection sequence

### 1. Omnix Runtime presence check

Scan project root for: `.obsidian-ai-memory/`, `AGENTS.md`, `AI_RULES.md`, `.claude/`, `.cursor/`, `.windsurf/`, `.cline/`, `.roo/`, `.continue/`, `.aider/`, `.openhands/`.

If found → full protocol active (this file + `STARTUP_PROTOCOL.md`).
If not found → bare mode; suggest `npx omnix init`.

### 2. Project type inference

| Signal | Inferred type |
|---|---|
| `next.config.*` + `app/` dir | Full-stack / SaaS |
| `vite.config.*`, no backend | Frontend SPA |
| `pyproject.toml` + `fastapi` or `flask` | Python API |
| `pnpm-workspace.yaml` + multiple `apps/` | Monorepo |
| `k8s/`, `helm/`, `.github/workflows/deploy*` | DevOps / infra |
| AI SDK or `openai`/`anthropic` imports | AI app |
| `playwright.config.*` + crawl scripts | Browser/scraping |
| Only `docs/` tree | Documentation repo |
| Mixed / ambiguous | Unknown — use general approach |

### 3. Stack detection (fast scan only — do not parse fully)

Read the **first 30 lines** of each manifest unless the relevant field is found first:

```
package.json           → scripts, deps
pyproject.toml         → tool.poetry.dependencies or project.dependencies
go.mod                 → module, require
Cargo.toml             → [dependencies]
Dockerfile             → FROM line
docker-compose.yml     → services
prisma/schema.prisma   → datasource provider
drizzle.config.*       → dialect
openapi.json/yaml      → info.title
.github/workflows/     → trigger events
```

### 4. Memory snapshot

Read in order, stop at context budget:

1. `02-PROJECTS/project-context.md`
2. `02-PROJECTS/active-goals.md`
3. Latest 3-5 session digests (`01-SESSIONS/`)
4. `03-ERRORS/error-memory.md`
5. `03-ERRORS/anti-patterns.md`
6. `04-DECISIONS/decisions.md` (on architectural work)
7. `05-ARCHITECTURE/system-overview.md` (on architectural work)
8. `07-LESSONS/lessons-learned.md` (on debugging/refactor)

Never load all files blindly. See `standards/context-engineering.md` for budget rules.

### 5. Request analysis

Parse the user's request for:

- **Verbs**: build / add / fix / debug / review / refactor / test / deploy / update / optimize / secure
- **Nouns**: component / API / schema / migration / CI / docs / auth / payment / prompt / agent
- **Qualifiers**: broken / failing / slow / missing / wrong / outdated

Map these signals to a workflow and role set using the routing table in `STARTUP_PROTOCOL.md`.

### 6. Output

Emit one compact startup block, then begin work. Do not ask for permission to start unless the task is ambiguous or destructive.

## Failure mode prevention

- If stack detection finds nothing useful, say so in the startup block and use general standards.
- If memory is empty or missing, proceed with first-run behavior (see `STARTUP_PROTOCOL.md`).
- If the request is genuinely ambiguous, ask **one** clarifying question, not five.

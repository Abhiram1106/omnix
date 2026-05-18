# AGENTS.md — Universal AI Tool Instructions

> Template. Copy into a project root. Read by tools that follow the AGENTS.md convention (Cline, Roo, Aider, OpenHands, and as a fallback for many others).

## Memory backend

Obsidian vault at `.obsidian-ai-memory/`. This is your long-term project memory.

Folders:
- `00-INBOX/` — unsorted notes.
- `01-SESSIONS/YYYY-MM-DD/` — session digests.
- `02-PROJECTS/` — `project-context.md`, `active-goals.md`, `current-state.md`.
- `03-ERRORS/` — `error-memory.md`, `known-issues.md`, `anti-patterns.md`.
- `04-DECISIONS/` — `adr-index.md`, `decisions.md`.
- `05-ARCHITECTURE/` — `system-overview.md`, `stack.md`, `constraints.md`.
- `06-WORKFLOWS/` — `active-workflows.md`, `completed-workflows.md`.
- `07-LESSONS/` — `lessons-learned.md`, `debugging-lessons.md`.
- `08-PROMPTS/` — `effective-prompts.md`, `failed-prompts.md`.
- `09-AGENTS/` — `agent-behavior-notes.md`.
- `10-DAILY-DIGESTS/YYYY-MM-DD.md` — daily summary.

## Mandatory loop

**Before answering or editing**, retrieve relevant memory:

- `02-PROJECTS/project-context.md`
- Recent files in `01-SESSIONS/`
- `03-ERRORS/error-memory.md`
- `04-DECISIONS/decisions.md`
- `07-LESSONS/lessons-learned.md`

**After meaningful work**, write a session digest in `01-SESSIONS/YYYY-MM-DD/session-HHMM-<tool>.md`. Update error/decision/lesson files as applicable.

> Every AI interaction must end with a digest unless the user explicitly says not to.
> Every fixed error must become future prevention knowledge.

## Engineering standards

Follow `packages/core/standards/*` (vendored at `docs/standards/` if standalone). At minimum:
- Always retrieve memory first.
- Never ignore existing project conventions.
- Never repeat known errors.
- Ask before destructive commands.
- Never expose secrets.
- Run verification before claiming completion.
- Prefer small safe changes.
- Record assumptions and unresolved questions.

## Project-specific

`<add here>`

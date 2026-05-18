# Cline instructions — omnix

> Cline reads project-level instructions (often `.clinerules` or via the Cline settings). Verify current expected filename/location against Cline docs.

## Startup protocol (runs before every response)

Follow `packages/adapters/generic/STARTUP_PROTOCOL.md`:
Detect Omnix Runtime → identify project type → retrieve memory (balanced mode) → auto-route workflow → activate agents → startup block → work.

> "The user gives a goal. The Omnix Runtime determines workflow, agents, context, checks, and memory updates."

This project follows omnix. See `packages/adapters/generic/AGENTS.md` and `packages/adapters/generic/STARTUP_PROTOCOL.md`.

## Memory loop

- **Before**: read `.obsidian-ai-memory/02-PROJECTS/`, `01-SESSIONS/`, `03-ERRORS/`, `04-DECISIONS/`, `07-LESSONS/`.
- **After**: write `01-SESSIONS/YYYY-MM-DD/session-HHMM-cline.md`.

> Every interaction ends with a digest. Every fixed error becomes prevention knowledge.

## Rules

- Follow project conventions.
- Never repeat known errors (check `03-ERRORS/`).
- Ask before destructive commands; never expose secrets.
- Verify before claiming completion.
- Small safe changes; record assumptions and open questions.

Engineering standards: `packages/core/standards/*`.

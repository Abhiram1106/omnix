# Roo Code instructions — omnix

> Roo Code (fork of Cline) reads project rules similarly. Verify the expected filename against current Roo docs.

## Startup protocol (runs before every response)

Follow `packages/adapters/generic/STARTUP_PROTOCOL.md`:
Detect Omnix Runtime → identify project type → retrieve memory (balanced mode) → auto-route workflow → activate agents → startup block → work.

> "The user gives a goal. The Omnix Runtime determines workflow, agents, context, checks, and memory updates."

This project follows omnix. See `packages/adapters/generic/AGENTS.md` and `packages/adapters/generic/STARTUP_PROTOCOL.md`.

## Memory loop

- **Before**: read `.obsidian-ai-memory/02-PROJECTS/`, `01-SESSIONS/`, `03-ERRORS/`, `04-DECISIONS/`, `07-LESSONS/`.
- **After**: write `01-SESSIONS/YYYY-MM-DD/session-HHMM-roo.md`.

> Every interaction ends with a digest. Every fixed error becomes prevention knowledge.

## Rules

Same as `cline/instructions.md`. Engineering standards: `packages/core/standards/*`.

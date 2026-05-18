# Windsurf rules — omnix

> Adapter for Windsurf / Codeium Cascade. Verify file location and naming against current Windsurf docs (typically `.windsurfrules` or `.codeiumrules` at repo root).

## Startup protocol (runs before every response)

Follow `packages/adapters/generic/STARTUP_PROTOCOL.md`:
Detect Omnix Runtime → identify project type → retrieve memory (balanced mode) → auto-route workflow → activate agents → startup block → work.

> "The user gives a goal. The Omnix Runtime determines workflow, agents, context, checks, and memory updates."

## Universal

This project follows the omnix memory loop. See `packages/adapters/generic/AGENTS.md` and `packages/adapters/generic/STARTUP_PROTOCOL.md`.

## Memory loop (mandatory)

- **Before** answering or editing, read `.obsidian-ai-memory/02-PROJECTS/`, recent `01-SESSIONS/`, `03-ERRORS/`, `04-DECISIONS/`, `07-LESSONS/`.
- **After** meaningful work, write a session digest at `01-SESSIONS/YYYY-MM-DD/session-HHMM-windsurf.md`.

> Every interaction ends with a digest unless I say otherwise.
> Every fixed error becomes a prevention rule.

## Rules

- Follow project conventions; check `03-ERRORS/` to avoid repeats.
- Ask before destructive commands.
- Never expose secrets.
- Verify before claiming completion.
- Prefer small safe changes.
- Record assumptions + open questions in the digest.

Engineering standards: `packages/core/standards/*`.

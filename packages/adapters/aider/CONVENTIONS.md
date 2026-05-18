# CONVENTIONS.md — Aider adapter

> Aider reads `CONVENTIONS.md` automatically (when added via `aider --read CONVENTIONS.md` or referenced in `.aider.conf.yml`). Verify against current Aider docs.

## Startup protocol (runs before every response)

Follow `packages/adapters/generic/STARTUP_PROTOCOL.md`:
Detect Omnix Runtime markers → identify project type → retrieve memory (balanced mode) → auto-route workflow → activate agents → startup block → work.

> "The user gives a goal. The Omnix Runtime determines workflow, agents, context, checks, and memory updates."

## Memory loop (mandatory)

This project follows omnix. See `packages/adapters/generic/AGENTS.md`.

- **Before** any edit, read from `.obsidian-ai-memory/`: `02-PROJECTS/project-context.md`, last 3-5 `01-SESSIONS/`, `03-ERRORS/error-memory.md`, `04-DECISIONS/decisions.md`, `07-LESSONS/lessons-learned.md`.
- **After** meaningful work, write `01-SESSIONS/YYYY-MM-DD/session-HHMM-aider.md` using the session-digest template.

> Every fixed error becomes a prevention rule in `03-ERRORS/`.

## Engineering rules

- Follow existing conventions in this codebase. Detect from code, not from your training data.
- Validate inputs at boundaries; never trust client input.
- Type signatures on every function (TS strict / mypy strict).
- Tests with every change of behavior. Regression test for every bug fix.
- Ask before destructive commands (`rm -rf`, force pushes, schema drops).
- Never commit secrets.
- Run tests / typecheck before claiming completion. If you can't run them, say so.

See `packages/core/standards/*` for the long form.

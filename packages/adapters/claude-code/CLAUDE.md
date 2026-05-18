# CLAUDE.md — Claude Code adapter

> Drop this file at your project root. Claude Code reads it on every session.

## Startup protocol (runs before every response)

Follow `packages/adapters/generic/STARTUP_PROTOCOL.md` in full on every session:

1. Detect Omnix Runtime markers in the project.
2. Identify project type and stack.
3. Retrieve relevant Obsidian memory (context-mode-appropriate — see `standards/context-engineering.md`).
4. Auto-route to the correct workflow.
5. Activate required agent roles.
6. Emit one compact startup block, then begin work.

> "When this Omnix Runtime is detected, the AI must self-orchestrate. The user only describes the goal."

## Universal rules

This project follows **omnix**. The full memory loop and rules live in:

- `packages/adapters/generic/STARTUP_PROTOCOL.md` — startup + auto-detection (primary).
- `packages/adapters/generic/AGENTS.md` — memory loop (source of truth).
- `packages/core/standards/ai-collaboration.md` — mandatory AI rules.
- `packages/core/standards/self-orchestration.md` — auto-routing and agent activation.
- `packages/core/standards/context-engineering.md` — retrieval hierarchy and token budgets.
- `packages/core/standards/*` — engineering standards.

If those files aren't vendored into this repo, treat the URLs / paths above as the contract and behave accordingly.

## Memory backend

`.obsidian-ai-memory/` at repo root.

**Before** any answer/edit: retrieve from `02-PROJECTS/`, `01-SESSIONS/`, `03-ERRORS/`, `04-DECISIONS/`, `07-LESSONS/`.

**After** meaningful work: write a session digest into `01-SESSIONS/YYYY-MM-DD/session-HHMM-claude-code.md`.

> Every interaction ends with a digest unless I explicitly say not to.
> Every fixed error becomes a prevention rule in `03-ERRORS/`.

## Claude Code specifics

- Settings file lives at `.claude/settings.json` (project) or this adapter's `settings.json` (template).
- Slash commands live in `.claude/commands/`.
- Subagents in `.claude/agents/` (or invoked via the Task tool).

## Project-specific

`<add project-specific conventions / commands here>`

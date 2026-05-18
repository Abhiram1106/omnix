# CLAUDE.md — Project Rules

> Template. Copy into a project root and fill in the bracketed sections. Claude Code reads this on every session.

## Project

- Name: `<name>`
- Stack: `<lang/framework>` · `<db>` · `<deploy target>`
- Memory vault: `.obsidian-ai-memory/` at repo root (or `<path>`).

## Universal rules (apply to every session)

Read these every time you start:

- `packages/core/standards/ai-collaboration.md` — the memory loop, mandatory rules.
- `packages/core/standards/architecture.md`
- `packages/core/standards/<language>.md` (e.g., `typescript.md`, `python.md`)
- `packages/core/standards/frontend.md` / `backend.md` / `api.md` / `database.md` (as applicable)
- `packages/core/standards/testing.md`, `security.md`, `devops.md`, `documentation.md`

If this project is published as a separate repo, copy the relevant standards into `docs/standards/` or vendor them via the CLI.

## The memory loop (non-negotiable)

1. **Before answering or editing**, read:
   - `.obsidian-ai-memory/02-PROJECTS/project-context.md`
   - last 3 files in `.obsidian-ai-memory/01-SESSIONS/`
   - `.obsidian-ai-memory/03-ERRORS/error-memory.md`
   - `.obsidian-ai-memory/04-DECISIONS/decisions.md` (skim)
   - `.obsidian-ai-memory/07-LESSONS/lessons-learned.md`
2. **During work**, track decisions, files changed, commands, errors, assumptions, open questions.
3. **After meaningful work**, write a session digest into `.obsidian-ai-memory/01-SESSIONS/YYYY-MM-DD/session-HHMM-claude-code.md` using the template at `packages/memory/obsidian/vault-template/templates/session-digest.md`.

> Every interaction ends with a digest unless I explicitly say not to.
> Every fixed error becomes a prevention rule in `03-ERRORS/`.

## Project-specific rules

`<add project-specific conventions here>`

## How to run / test / build

`<commands>`

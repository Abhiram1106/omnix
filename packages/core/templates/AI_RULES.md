# AI_RULES.md

> Compact, tool-agnostic rules. Compatible with tools that read `AI_RULES.md` or as a supplementary file for any AI coding tool.

## Core

1. Retrieve memory before working: `.obsidian-ai-memory/02-PROJECTS/`, `01-SESSIONS/`, `03-ERRORS/`, `04-DECISIONS/`, `07-LESSONS/`.
2. Follow existing project conventions.
3. Never repeat a known error (check `03-ERRORS/`).
4. Update memory after meaningful work — session digest mandatory.
5. Update docs when behavior or setup changes.
6. Ask before destructive commands.
7. Never expose secrets.
8. Verify before claiming completion.
9. Prefer small safe changes.
10. Record assumptions and open questions in the digest.

## Memory templates

Use `packages/memory/obsidian/vault-template/templates/`:
- `session-digest.md`
- `error-entry.md`
- `decision-entry.md`
- `project-context.md`

## Failure modes to avoid

- Inventing files / APIs / commands.
- Claiming completion without verification.
- Silent assumptions.
- Refactors not asked for.
- Skipping the digest.

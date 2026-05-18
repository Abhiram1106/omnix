# @omnix/adapters

Thin compatibility layers per AI coding tool.

## Contract

Each adapter:

1. **Points back to the core** (`packages/core/standards/*`) for engineering rules.
2. **Points back to the generic adapter** (`packages/adapters/generic/AGENTS.md`) for the memory loop.
3. **Translates** the universal rules into the tool's expected file format (filename, location, header syntax).

Adapters **do not** re-implement rules. If a rule needs to change, change it in `core/` once; adapters propagate by reference.

## Source of truth

`packages/adapters/generic/AGENTS.md` is the keystone universal instruction file. Tool-specific adapters are pointers, not duplicates.

## Tools shipped

| Tool | Adapter folder | Primary file |
|---|---|---|
| Claude Code | `claude-code/` | `CLAUDE.md`, `settings.json` |
| Cursor | `cursor/` | `rules/*.mdc` |
| Windsurf | `windsurf/` | `rules.md` |
| Cline | `cline/` | `instructions.md` |
| Roo Code | `roo/` | `instructions.md` |
| Continue | `continue/` | `config.md` (notes) |
| Aider | `aider/` | `CONVENTIONS.md` |
| OpenHands | `openhands/` | `instructions.md` |
| Generic / fallback | `generic/` | `AGENTS.md`, `AI_RULES.md`, `PROJECT_CONTEXT.md` |

## Versioning note

Tool config formats evolve. Where syntax is uncertain at the time of writing, the adapter file is marked as **template/spec** — verify against the current upstream tool docs before relying on it.

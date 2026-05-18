# @omnix/memory

Obsidian-backed long-term memory for AI coding tools.

## Why Obsidian

- Plain markdown files in folders. No DB to run. AI tools and humans read the same files.
- Backlinks, tags, graph view — when a human wants to navigate the AI's memory.
- Per-project vault: drop `.obsidian-ai-memory/` next to (or inside) your repo.

## What's here

- `obsidian/vault-template/` — folder skeleton + entry templates. The CLI copies this into your project as `.obsidian-ai-memory/`.
- `schemas/` — markdown specifications for each memory record type (session digest, error, decision, project context).

## Memory record types

- **Session digest** — one per meaningful AI session.
- **Error memory** — one per fixed bug. Includes prevention rule.
- **Decision entry** — one per non-trivial decision.
- **Project context** — single living doc per project.
- **Daily digest** — optional summary aggregating sessions of the day.

See `schemas/` for field specs and `obsidian/vault-template/templates/` for fill-in templates.

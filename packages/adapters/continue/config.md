# Continue configuration notes — omnix

> Continue uses `~/.continue/config.json` or `config.yaml` (or `config.ts` in newer versions). This file is **guidance**, not a drop-in config — verify against current Continue docs before applying.

## Startup protocol reference

Include `packages/adapters/generic/STARTUP_PROTOCOL.md` content in the system message or as a context provider. The AI must detect Omnix Runtime markers, auto-route to the correct workflow, and activate agent roles before answering.

## Project context

Reference this project's rules via Continue's `customCommands` or `contextProviders` (depending on version). At minimum, include:

- `packages/adapters/generic/AGENTS.md`
- `packages/core/standards/ai-collaboration.md`
- the project's `.obsidian-ai-memory/02-PROJECTS/project-context.md`

## System message snippet

Add to your model's system message:

```text
You are working in a project that follows omnix.

Before answering or editing:
1. Read .obsidian-ai-memory/02-PROJECTS/project-context.md
2. Read the last 3 files in .obsidian-ai-memory/01-SESSIONS/
3. Read .obsidian-ai-memory/03-ERRORS/error-memory.md
4. Read .obsidian-ai-memory/07-LESSONS/lessons-learned.md

After meaningful work, write a session digest into
.obsidian-ai-memory/01-SESSIONS/YYYY-MM-DD/session-HHMM-continue.md
using the template at packages/memory/obsidian/vault-template/templates/session-digest.md.

Never repeat a known error. Never expose secrets. Ask before destructive commands.
Verify before claiming completion.
```

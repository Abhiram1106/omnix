# Continue Config Notes — Omnix

> **Status: TEMPLATE** — Verify the correct config location and format against current Continue docs before relying on this file.

> Continue uses `~/.continue/config.json`, `config.yaml`, or `config.ts`. Add the snippet below to your model's system message. Confirm format against current Continue docs.

## System message snippet

```
This project uses Omnix conventions. Before answering or editing, read STARTUP_PROTOCOL.md,
retrieve memory from .obsidian-ai-memory/, and follow the rules in AGENTS.md (source of truth).
After work, write a session digest to .obsidian-ai-memory/01-SESSIONS/YYYY-MM-DD/.
```

See `AGENTS.md` · `AI_RULES.md` · `STARTUP_PROTOCOL.md` for the complete rule set.

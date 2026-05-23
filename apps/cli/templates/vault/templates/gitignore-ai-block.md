# .gitignore AI Block

> Copy this block into your `.gitignore`.
> Rule: track shared team config and the engineering memory vault. Ignore personal overrides and runtime caches.

```gitignore
# ── AI / IDE assistant configuration ──────────────────────────────────────────
# Convention: track shared config, ignore personal runtime files and local overrides.

# Cursor — personal overrides (local only)
.cursor/AGENTS.local.md
.cursor/.local/

# Claude Code — personal overrides (local only)
.claude/settings.local.json
.claude/CLAUDE.local.md

# Omnix — runtime caches (auto-managed, no value in tracking)
.omnix/memory/
.omnix/cache/

# Memory vault — INTENTIONALLY TRACKED (shared engineering memory)
# Uncomment the line below ONLY if you want the vault private (not recommended for teams):
# .obsidian-ai-memory/

# Obsidian app UI state — not meaningful to track
.obsidian-ai-memory/.obsidian/workspace.json
.obsidian-ai-memory/.obsidian/graph.json
.obsidian-ai-memory/.obsidian/cache
.obsidian-ai-memory/.obsidian/plugins/
```

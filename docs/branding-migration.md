# Branding Migration — to Omnix

## Summary

This project has been officially renamed and rebranded to **Omnix**.

> "Omnix is a universal AI engineering runtime and orchestration system for modern software development."

---

## Previous names (all deprecated)

| Old name | Status |
|---|---|
| `omnix` | Deprecated — replaced by `omnix` |
| `AI Engineering OS` | Deprecated — replaced by `Omnix Runtime` |
| `AIOS` | Deprecated — replaced by `Omnix` |
| `KernelOps` | Was never released — replaced by `Omnix` |
| `@omnix/cli` | Deprecated — replaced by `omnix` (npm package) |
| `create-omnix` | Deprecated — replaced by `omnix` / `create-omnix` |

---

## Updated commands

| Old command | New command |
|---|---|
| `npx omnix init` | `npx omnix init` |
| `npx create-omnix` | `npx omnix` or `npx create-omnix` |
| `aios init` | `omnix init` |
| `aios scan` | `omnix scan` |
| `aios detect` | `omnix detect` |
| `aios doctor` | `omnix doctor` |
| `aios install-adapters` | `omnix install-adapters` |
| `aios retrieve-context` | `omnix retrieve-context` |
| `aios session-digest` | `omnix session-digest` |
| `aios sync-memory` | `omnix sync-memory` |
| `aios route "..."` | `omnix route "..."` |
| `aios team-plan "..."` | `omnix team-plan "..."` |

---

## Updated npm package

| Field | Old | New |
|---|---|---|
| Package name | `create-omnix` | `omnix` |
| Bin alias (primary) | `aios` | `omnix` |
| Bin alias (create) | `create-omnix` | `create-omnix` |

---

## Renamed folders / directories

| Old path | New path |
|---|---|
| `omnix/` (repo root) | `omnix/` |
| Generated: `.ai/` marker | Generated: `.omnix/` (new primary config dir) |

---

## Updated terminology

| Old term | New term |
|---|---|
| AI OS | Omnix Runtime |
| AI Engineering OS | Omnix Runtime |
| AIOS markers | Omnix Runtime markers |
| AI OS detection | Omnix Runtime detection |

---

## Updated installed files

When `omnix init` runs, it now generates:

```
.omnix/                          ← NEW: runtime config directory
  agents/                        custom agent overrides
  workflows/                     workflow overrides
  memory/                        active-session cache (gitignore this)
  commands/                      custom commands
  settings/omnix.json            runtime settings
.obsidian-ai-memory/             unchanged: long-term memory vault
AGENTS.md                        unchanged
AI_RULES.md                      unchanged
STARTUP_PROTOCOL.md              unchanged
PROJECT_CONTEXT.md               unchanged
CLAUDE.md                        if claude adapter selected
.cursor/rules/                   if cursor adapter selected
```

---

## Migration for existing projects

If you installed the old `omnix` or `aios`:

```bash
# 1. Uninstall old package (if globally installed)
npm uninstall -g create-omnix

# 2. Install Omnix
npm install -g omnix
# or use npx directly:
npx omnix --version

# 3. In your existing project — re-run init to update adapter files
npx omnix install-adapters --force

# 4. Run doctor to verify
npx omnix doctor
```

Your `.obsidian-ai-memory/` vault is fully compatible — no migration needed there.

---

## Internal reference replacements applied

All occurrences of the following were replaced across the entire monorepo:

- `omnix` → `omnix`
- `AI Engineering OS` → `Omnix Runtime`
- `create-omnix` → `omnix`
- `@omnix/cli` → `omnix`
- `AIOS` → `Omnix`
- `aios` → `omnix`
- `AI OS` → `Omnix Runtime`
- `KernelOps` → `Omnix`

---

## Intentional remaining references

The following references to old names are **intentional and should not be renamed**:

- This file (`docs/branding-migration.md`) — historical record
- `LICENSE_NOTES.md` — attribution to source repos retains their original names
- `docs/source-repo-analysis.md` — analysis of source repos uses their original names
- Git history — not rewritten

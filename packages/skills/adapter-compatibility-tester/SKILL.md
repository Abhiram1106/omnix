---
name: adapter-compatibility-tester
version: 0.4.0
status: experimental
description: >
  Verifies Omnix adapter files are present, correctly formatted, and match current
  AI tool specifications. Detects stale paths, broken imports, and format drift.
triggers:
  - "check adapters"
  - "adapter broken"
  - "cursor not reading rules"
  - "CLAUDE.md not working"
  - "verify adapters"
  - "adapter compatibility"
  - "adapter stale"
auto_activate: false
requires: []
produces:
  - "adapter compatibility report"
memory_reads:
  - { path: "02-PROJECTS/project-context.md", priority: high }
memory_writes: []
token_budget: { self: 600, context_reads: 200, total: 800 }
verification_required: false
destructive: false
tags: [adapters, compatibility, claude-code, cursor, verification, stale, format]
compatible_adapters: [claude-code, cursor, generic]
---

## When to activate

When "the AI isn't following the rules", after upgrading an AI tool, when adapters haven't been checked in > 90 days.

## When NOT to activate

- Fresh project (use project-onboarder instead)
- The issue is a code bug, not an adapter issue

## Adapter locations to verify

| Tool | Primary file | Secondary files |
|------|-------------|----------------|
| Claude Code | `CLAUDE.md` | `.claude/settings.json` |
| Cursor | `.cursor/rules/project-rules.mdc` | `.cursor/rules/*.mdc` |
| Windsurf | `.windsurf/rules.md` | — |
| Cline | `.cline/instructions.md` | — |
| Roo Code | `.roo/instructions.md` | — |
| Continue | `.continue/config.md` | — |
| Aider | `CONVENTIONS.md` | — |
| OpenHands | `.openhands/instructions.md` | — |
| Generic | `AGENTS.md` | `AI_RULES.md`, `STARTUP_PROTOCOL.md` |

## Check 1: File existence

```bash
# Check which adapters are installed
ls CLAUDE.md AGENTS.md STARTUP_PROTOCOL.md 2>/dev/null
ls .cursor/rules/ 2>/dev/null
ls .windsurf/rules.md .cline/instructions.md .roo/instructions.md 2>/dev/null
```

## Check 2: CLAUDE.md quality (Claude Code)

Required elements in CLAUDE.md:
- [ ] References `AGENTS.md` (via `@AGENTS.md` import or explicit mention)
- [ ] Memory loop instructions present (or imported from AGENTS.md)
- [ ] Startup protocol reference present
- [ ] Completion gate / verification checklist present
- [ ] File size > 100 chars (not empty template)

**PASS: CLAUDE.md with @import**
```markdown
# CLAUDE.md — Omnix

@AGENTS.md

## Claude Code-specific settings
...
```

**FAIL: CLAUDE.md with only generic text**
```markdown
# CLAUDE.md
You are a helpful coding assistant.
```

## Check 3: AGENTS.md quality

Required elements:
- [ ] Memory loop (before/after work instructions)
- [ ] Mandatory rules (numbered list)
- [ ] Safety rules (confirmation before destructive ops)
- [ ] Agent routing table
- [ ] When to write digest

## Check 4: Staleness detection

```bash
# Check last-modified date of adapter files
git log --oneline -- CLAUDE.md | head -3
git log --oneline -- .cursor/rules/project-rules.mdc | head -3
```

Stale signals:
- File not committed for > 90 days AND project has had active development
- `last-verified:` field in adapter header is > 90 days old
- Adapter references file paths that no longer exist

## Check 5: Speculative adapter warnings

For these adapters, always check current tool docs before relying:
- Windsurf: verify `.windsurf/rules.md` path (may have changed)
- Cline: verify `.cline/instructions.md` path
- Roo: verify `.roo/instructions.md` path
- Continue: verify config location (may be `~/.continue/` not project-local)
- OpenHands: verify `.openhands/microagents/repo.md` path

## Output format

```
Adapter Compatibility Report
────────────────────────────
CLAUDE.md:           ✓ present, @AGENTS.md import found
AGENTS.md:           ✓ present, memory loop found
.cursor/rules/:      ✓ present, 5 rule files
Windsurf adapter:    ⚠ TEMPLATE — verify path against current Windsurf docs
Cline adapter:       ⚠ TEMPLATE — verify path against current Cline docs

Staleness:
  CLAUDE.md: last modified 2025-01-10 (5 days ago) ✓
  AGENTS.md: last modified 2025-01-10 ✓

Recommendations:
  → Verify Windsurf adapter path: docs.codeium.com/windsurf/rules
  → CLAUDE.md looks healthy — Claude Code should be reading it
```

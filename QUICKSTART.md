# Quickstart

## 1. Install adapters in your project

```bash
cd your-project
npx omnix install-adapters --tools claude-code,cursor
```

This drops:
- `CLAUDE.md` (Claude Code)
- `.cursor/rules/*.mdc` (Cursor)
- `AGENTS.md` (generic, read by Cline/Roo/Aider/OpenHands and as fallback)

## 2. Initialize Obsidian memory

```bash
npx omnix init
```

Creates `.obsidian-ai-memory/` next to your repo (or inside, your choice — see prompts):

```
00-INBOX/
01-SESSIONS/
02-PROJECTS/
03-ERRORS/
04-DECISIONS/
05-ARCHITECTURE/
06-WORKFLOWS/
07-LESSONS/
08-PROMPTS/
09-AGENTS/
10-DAILY-DIGESTS/
```

## 3. Seed project context

```bash
npx omnix scan
```

Detects your stack (Node/Python/Go/etc), package manager, frameworks, and writes `02-PROJECTS/project-context.md`.

## 4. Loop

Every AI session you run, in any tool:

- **Before** the AI starts: it (or you) runs `retrieve-context` and pastes the result into the chat.
- **After** meaningful work: `session-digest` writes `01-SESSIONS/YYYY-MM-DD/session-HHMM-<tool>.md`.

## 5. Errors become prevention memory

When a bug is fixed, write an entry in `03-ERRORS/error-memory.md` using the template at `packages/memory/obsidian/vault-template/templates/error-entry.md`. Future sessions retrieve that file and won't repeat the mistake.

## 6. Open in Obsidian (optional but recommended)

Point Obsidian at `.obsidian-ai-memory/`. You get backlinks, graph view, and tag search across all session digests, errors, decisions, and lessons.

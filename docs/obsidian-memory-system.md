# Obsidian Memory System

## Why Obsidian

- Plain markdown in folders. Tools read files; humans get backlinks + graph.
- No service to run.
- Versionable in git alongside (or adjacent to) the project.

## Where the vault lives

Per project, at `.obsidian-ai-memory/` either:
- Inside the repo (committed) — for shared team memory.
- Next to the repo (gitignored or in a separate repo) — for solo / private memory.

Our default `.gitignore` excludes it; flip the default if you want shared memory.

## Folder roles (one-liners)

| Folder | Role |
|---|---|
| `00-INBOX/` | Unsorted captures. |
| `01-SESSIONS/YYYY-MM-DD/` | Session digests. |
| `02-PROJECTS/` | Living project context, goals, state. |
| `03-ERRORS/` | Errors, known issues, anti-patterns. |
| `04-DECISIONS/` | ADRs + decision entries. |
| `05-ARCHITECTURE/` | System overview, stack, constraints. |
| `06-WORKFLOWS/` | Active and completed workflows. |
| `07-LESSONS/` | Lessons learned. |
| `08-PROMPTS/` | Effective + failed prompts. |
| `09-AGENTS/` | Project-specific tool/model notes. |
| `10-DAILY-DIGESTS/` | Daily summaries. |

## The retrieve set

Every session reads, at minimum:
- `02-PROJECTS/project-context.md`
- Last 3-5 `01-SESSIONS/`
- `03-ERRORS/error-memory.md`
- `04-DECISIONS/decisions.md`
- `07-LESSONS/lessons-learned.md`

The CLI's `retrieve-context` command will eventually rank-and-paste this set.

## The write set

After meaningful work:
- Always: new file in `01-SESSIONS/`.
- If error fixed: append to `03-ERRORS/error-memory.md`.
- If decision made: append to `04-DECISIONS/decisions.md` (and add ADR if architectural).
- If lesson: append to `07-LESSONS/lessons-learned.md`.
- Daily: append to `10-DAILY-DIGESTS/YYYY-MM-DD.md`.

## Why not a database

Markdown wins on durability, portability, diff-ability, and tool-agnosticism. A vector index can sit on top later without replacing the canonical store.

# Obsidian vault template

A skeleton vault for AI memory. Copy `vault-template/` into your project as `.obsidian-ai-memory/` (the CLI's `init` does this).

## Layout

```
.obsidian-ai-memory/
  00-INBOX/              unsorted notes / quick captures
  01-SESSIONS/           session digests, organized by date
    YYYY-MM-DD/
      session-HHMM-<tool>.md
  02-PROJECTS/           project context, goals, current state
  03-ERRORS/             error memory, known issues, anti-patterns
  04-DECISIONS/          ADR index, decision entries
  05-ARCHITECTURE/       system overview, stack, constraints
  06-WORKFLOWS/          active + completed workflows
  07-LESSONS/            lessons learned, debugging lessons
  08-PROMPTS/            effective + failed prompts
  09-AGENTS/             agent behavior notes
  10-DAILY-DIGESTS/      daily summaries
  templates/             fill-in templates for each record type
```

## Opening in Obsidian (optional but useful)

Open `.obsidian-ai-memory/` as a vault in Obsidian. You get backlinks, tag search, and a graph view across all session digests, errors, decisions, and lessons.

The AI tools don't need Obsidian installed — they read the markdown directly.

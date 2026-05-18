# Memory Lifecycle

How vault content moves from creation → active → archived → pruned.

```
[create]  → hot      (0-7 days, full content, raw)
hot       → warm     (7-30 days, weekly summary replaces raw load)
warm      → cold     (30-90 days, monthly summary)
cold      → archive  (90+ days, kept for audit, not loaded in retrieval)
archive   → pruned   (optional, > 1 year, user opts in via `omnix vault prune`)
```

## Stage definitions

### Hot (0-7 days)
- Loaded directly in retrieval.
- Full content.
- Lives in source folder (`01-SESSIONS/`, `03-ERRORS/`, etc.).

### Warm (7-30 days)
- Original file remains in place.
- A summary file is generated (e.g. weekly summary).
- Retrieval prefers the summary; full file loaded only if explicit reference.

### Cold (30-90 days)
- Monthly summary supersedes weekly.
- Original raw sessions still on disk but not retrieved by default.

### Archive (90+ days)
- Moved to `archived-<area>.md` consolidated file or `archive/YYYY/` folder.
- Index entries marked `[ARCHIVED]`.
- Not loaded in retrieval unless task explicitly requests historical context.

### Pruned (optional, > 1 year)
- User runs `omnix vault prune --older-than 1y --dry-run` first.
- Confirmed deletion only.

## Triggers for transitions

| Transition | Trigger | Action |
|---|---|---|
| hot → warm | 5+ sessions in same ISO week | Generate weekly summary |
| warm → cold | 4+ weekly summaries in same month | Generate monthly summary |
| cold → archive | Manual or 90 days elapsed | Move to archive folder |
| any → re-verify | `last-verified` > 90 days | Flag `[STALE]` until re-verified |

## Conflict handling

When a new entry contradicts an active one:

1. Detection: same `Area` + opposite `Decision` / `Prevention Rule` value.
2. Both entries get `⚠ CONFLICT: see also <other entry>` markers.
3. INDEX.md flags the area as `[CONFLICT]`.
4. Resolution requires a human decision; documented as a new entry that supersedes.

## Re-verification protocol

Quarterly task (manual or scheduled):
1. List entries with `last-verified` > 90 days.
2. For each: human or AI confirms the entry is still accurate.
3. Update `last-verified` date.
4. If no longer accurate: mark `[OUTDATED]` and write a superseding entry.

## Where this is enforced

- **Today (v0.1)**: `omnix sync-memory --compress` does weekly summary (EXPERIMENTAL).
- **v0.2 target**: monthly summaries, archive transition, conflict markers.
- **v0.3 target**: re-verification reminders, prune command.

## Backup recommendation

Before any compression / archive / prune operation:
```bash
omnix vault backup --to <path>
```
(FUTURE.) Today: `cp -r .obsidian-ai-memory/ .obsidian-ai-memory.bak/` before running compression.

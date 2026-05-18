# Workflow: Memory Compression

How vault memory ages from hot → warm → cold → archived.

## Lifecycle stages

```
hot       ← session 0-7 days; full content
warm      ← session 7-30 days; weekly summary replaces raw
cold      ← session 30+ days; monthly summary replaces weekly
archived  ← session 90+ days; quarterly snapshot
```

## Compression triggers

| Trigger | Action |
|---|---|
| 5+ session digests in same ISO week | Generate `10-DAILY-DIGESTS/YYYY-WNN-summary.md` |
| 4+ weekly summaries in same month | Generate `10-DAILY-DIGESTS/YYYY-MM-summary.md` |
| Error entry > 30 days with regression test and no recurrence | Move to `archived-errors.md`, keep prevention rule in `anti-patterns.md` |
| Decision > 90 days, no active follow-up | Tag `archived: true`; keep in place |
| Architecture doc > 200 lines | Generate `summary.md` companion; use summary in retrieval |

## Procedure (manual or scheduled)

```bash
omnix sync-memory --compress           # current week's eligible content
omnix sync-memory --compress --since 30d
omnix sync-memory --compress --dry-run
```

Steps:

```
1. List files in 01-SESSIONS/ grouped by ISO week.
2. For each week older than 7 days with > 0 digests:
   a. Skip if weekly-summary file already exists.
   b. Read all digests.
   c. Extract: Decisions Made, Errors Encountered, Next Steps, Tool counts.
   d. Write 10-DAILY-DIGESTS/YYYY-WNN-summary.md.
   e. Original digests REMAIN — summary is additive, not destructive.

3. List error-memory entries > 30 days with regression_test_added=true.
4. If 30 days passed with no recurrence (no entries with same Symptom):
   a. Append to 03-ERRORS/archived-errors.md.
   b. Remove from active error-memory.md.
   c. Keep prevention rule in anti-patterns.md.

5. Update 03-ERRORS/INDEX.md.
6. Update 04-DECISIONS/INDEX.md.
```

## Summary content

A weekly summary contains:
- Sessions count and tool breakdown
- Key decisions (one line each)
- Errors fixed (one line each)
- Carried-forward "Next steps" (one line each)
- Links to original files

A monthly summary aggregates weekly summaries the same way.

## Anti-destruction rule

Compression NEVER deletes original files. It creates summary files that:
- Become the preferred retrieval target.
- Reduce vault scan time.
- Are smaller, so the AI loads more recent context per budget.

To actually delete: user runs `omnix vault prune --older-than 1y` (FUTURE, with confirmation).

## Schedule (FUTURE)

- Optional cron / scheduled task (FUTURE — `omnix install-hooks --schedule weekly`).
- Today: manual `omnix sync-memory --compress`.

## Failure modes
- **No vault** → no-op with notice.
- **No old sessions** → no-op with notice (already verified).
- **Summary already exists** → skip; don't overwrite.

## Implementation status
- Weekly summary generation: **EXPERIMENTAL** (implemented in `sync-memory.ts`).
- Monthly summary: TODO.
- Error archive: TODO.
- INDEX.md generation: TODO.
- Scheduled runs: FUTURE.

# Error Memory System

## Rule

> Every fixed error must become future prevention knowledge.

## Where

- `.obsidian-ai-memory/03-ERRORS/error-memory.md` — log of fixed errors.
- `.obsidian-ai-memory/03-ERRORS/known-issues.md` — open issues with workarounds.
- `.obsidian-ai-memory/03-ERRORS/anti-patterns.md` — prevention rules promoted from recurring errors.

## What an entry contains

(see `packages/memory/schemas/error-memory.schema.md`)

Date · Project · Area · Symptom · Root Cause · Fix · **Prevention Rule** · Do Not Repeat · Regression Test Added · Related Files · Related Session Digest.

## The prevention rule

Phrased as "always X" or "never Y". Concrete, testable, narrow.

Bad: "Be careful with timezones."
Good: "Always store datetimes as UTC in the DB; convert at the edge."

## Promotion to anti-pattern

When the same prevention rule appears twice, promote it to `anti-patterns.md` as a one-liner with a backlink to the originating entries. Every future AI session reads `anti-patterns.md` pre-work.

## Integration with bug-fix workflow

`packages/core/workflows/bug-fix.md` makes the entry mandatory before closing the session. Don't merge bug-fix PRs without it.

## Failure mode

Logging "fixed it" without the prevention rule. Then the AI repeats the same mistake next month. That defeats the system.

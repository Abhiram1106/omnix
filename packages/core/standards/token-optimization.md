# Token Optimization Standard

Aggressive token discipline is a first-class engineering concern in this OS. Every wasted token is a wasted compute cycle and a smaller window for useful work.

## Core goals

- More engineering work per context window.
- Higher signal-to-noise ratio.
- Fewer repeated explanations.
- Smarter retrieval → less raw data in context.
- Compressed memory → relevant history without bloat.

## Token budgeting strategies

### Per-session budget allocation (rough guide)

```
System instructions + adapter rules      ~300-500 tokens
Memory retrieval (context-mode-dependent) ~500-4000 tokens
User request                              as-is
Code under discussion                     as-is
AI response                               remainder
```

Keep memory retrieval lean. The code and the request are the real work.

### Budget by task type

| Task | Memory budget | Code budget |
|---|---|---|
| Quick question | 300 | 0 |
| Single-file bug fix | 800 | file + tests |
| Feature (one module) | 1500 | affected files |
| Cross-module feature | 2500 | affected files |
| Architecture review | 4000 | relevant modules |
| Production incident | 1000 (focused) | error traces |

## Compact prompting strategies

1. **No preamble.** Don't re-explain the task to yourself.
2. **No trailing summaries.** The diff speaks for itself.
3. **Inline code, not descriptions of code.** Show it, don't say it.
4. **One concern per message/action.** Batching unrelated changes wastes review cycles.
5. **Use file:line references** instead of quoting entire functions.
6. **State assumptions in one line.** "Assuming X; will record in digest."

## Context chunking

- Break large retrievals into sequential focused reads (goal → errors → architecture), not one giant dump.
- Process one memory category at a time.
- Use the retrieval hierarchy from `context-engineering.md` as the chunking order.

## Rolling summaries

- After 5 session digests in the same week → auto-generate a `weekly-summary.md` entry and compress the 5 digests to references.
- After a debugging session cluster → generate a `debugging-summary.md`.
- After an architecture spike → generate an `architecture-summary.md`.
- The originals are preserved; the summary is the active retrieval target.

## Retrieval compression

- On retrieval, extract only the **relevant sections** of a file, not the whole file.
- For `error-memory.md`: retrieve only entries matching the current area (by module/area field).
- For `decisions.md`: retrieve only the last 5 entries + any tagged with the current stack area.
- For session digests: retrieve only the *Next Recommended Step*, *Open Questions*, and *Decisions Made* fields unless deep context is needed.

## Architecture summarization

`05-ARCHITECTURE/` files grow large. Maintain a `05-ARCHITECTURE/summary.md` — a 50-100 line condensed view. Retrieve the summary first; load the full docs only when needed.

## Anti-token-bloat rules

1. Never re-read a file already in context.
2. Never paste full error stack traces when a 3-line summary of the cause is enough.
3. Never include all historical decisions when only the most recent one is relevant.
4. Never load the whole session archive when the last 3 digests suffice.
5. Never generate verbose role-checking reports for simple single-domain tasks.
6. Never repeat the project stack description mid-session.
7. Never include file headers/boilerplate when only the function body is needed.

## Memory indexing ideas (v0.2+)

- `03-ERRORS/index.md` — one-line per error entry with area + date, linking to full entry.
- `04-DECISIONS/index.md` — one-line per decision with area + date.
- `01-SESSIONS/index.md` — one-line per session with tool + date + summary.

These indexes are the retrieval target by default; full files are loaded only when the index points to relevant content.

## Stale-context cleanup

Detect and remove/compress:
- Resolved decisions older than 90 days with no open follow-up.
- Archived errors with confirmed regression tests + 30 days no recurrence.
- Session digests older than 30 days → compress to monthly summary.
- Identical content across multiple digests → deduplicate.

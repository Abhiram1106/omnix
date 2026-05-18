# Retrieval Architecture

RTK Query-style principles applied to AI memory retrieval. The goal: cache-aware, deduplicated, normalized, lazy context loading.

> "Obsidian memory is the persistent engineering brain. Always retrieve context before work and write memory after work."

## The pipeline

```
User request
    ↓
[1] Request classification
    ↓
[2] Retrieval mode selection (minimal / balanced / deep / etc.)
    ↓
[3] Cache check — has this context been read this session?
    ↓
[4] Selective fetch — retrieve only relevant files at right depth
    ↓
[5] Relevance filter — score and trim before loading to context
    ↓
[6] Context assembly — structured, not dumped
    ↓
[7] Work
    ↓
[8] Invalidation triggers — what memory is now stale?
    ↓
[9] Write-back — digest, errors, decisions, updated project context
```

## Context cache strategy (per-session)

Within a session, once a memory file has been read:
- **Do not re-read it** unless explicitly invalidated by work done.
- Store as "loaded this session" reference.
- If the file was updated during the session (e.g., appended an error entry), mark it as "dirty" — the in-session version supersedes the on-disk version.

## Memory invalidation strategy

After completing meaningful work, mark as stale / trigger rewrite:

| Action taken | Invalidated files |
|---|---|
| Fixed a bug | `03-ERRORS/error-memory.md`, current session digest |
| Made a decision | `04-DECISIONS/decisions.md` |
| Changed architecture | `05-ARCHITECTURE/system-overview.md` |
| Changed project state | `02-PROJECTS/current-state.md` |
| Session ended | `01-SESSIONS/` (new digest) |
| Learned something | `07-LESSONS/lessons-learned.md` |

## Digest indexing

Future CLI support (`retrieve-context` command) will maintain:

- `01-SESSIONS/index.md` — one line per session: date · tool · one-line summary · key decision (if any).
- `03-ERRORS/index.md` — one line per error: date · area · symptom (5 words) · fixed? y/n.
- `04-DECISIONS/index.md` — one line per decision: date · area · choice (5 words).

Retrieve the index first. Load the full entry only when the index line points to something relevant.

## Selective retrieval

Don't retrieve full `error-memory.md`. Retrieve by **area**:

```
Request: "fix a bug in the auth module"
→ retrieve: errors where Area = "auth" or "security"
→ skip: errors for DB, frontend, CI
```

Apply the same pattern to decisions and lessons.

## Active vs archived memory

| State | Location | Retrieval |
|---|---|---|
| Active (last 30 days, no resolution) | Main files | Always in retrieval set |
| Resolved (fix confirmed, test added) | Main files + flag | Low priority; skip in minimal mode |
| Archived (>30 days, resolved) | `archived-*` files | Only in deep mode |
| Compressed (weekly/monthly summaries) | Summary files | Preferred over raw archives |

## Retrieval scoring (qualitative)

Before loading a file to context, assign a relevance score:

- **High**: area matches current module/task; date < 14 days.
- **Medium**: area adjacent; date < 30 days.
- **Low**: area unrelated OR date > 30 days.

Only load High by default. Load Medium if budget allows. Skip Low unless deep mode.

## Retrieval prioritization

```
1. active-goals + current-state      (what are we doing right now)
2. project-context                    (what is this project)
3. recent session digests             (what happened last)
4. errors + anti-patterns             (what not to repeat)
5. decisions (area-filtered)          (what was already decided)
6. architecture (area-filtered)       (how it's structured)
7. lessons (area-filtered)            (what we learned)
8. archived summaries                 (deep mode only)
```

## Efficient synchronization

- **Incremental writes**: append new entries to `error-memory.md`, don't rewrite the whole file.
- **Targeted updates**: update only the changed section of `project-context.md`, not the whole file.
- **Summary promotion**: when a file exceeds ~200 lines, generate a summary and use it as the primary retrieval target.

# Retrieval Policy

Concrete rules for what memory to load, in what order, under what budget.

> This replaces the prose in `context-engineering.md` for the *operational* layer.

## Hard token budgets per retrieval mode

| Mode | Budget (tokens) | When |
|---|---|---|
| `minimal` | 400 | Short question, single-file edit |
| `balanced` | 1500 | Standard feature work, single-domain bug fix |
| `deep` | 3500 | Cross-module work, architecture review |
| `architecture` | 4500 | System redesign, ADR authoring |
| `debugging` | 2000 | Bug investigation, incident |
| `emergency` | 1000 | Outage — fastest most-relevant only |

These are **memory retrieval** budgets, separate from code-under-discussion budgets.

## Mandatory load order (priority 1 → priority N)

1. `02-PROJECTS/active-context.md` — the "what's the current state" file. ALWAYS loaded.
2. `02-PROJECTS/active-goals.md` — current goals.
3. `02-PROJECTS/project-context.md` — stack, constraints, architecture summary.
4. `03-ERRORS/INDEX.md` — one-line summaries of known errors.
5. `04-DECISIONS/INDEX.md` — one-line summaries of decisions.
6. Recent sessions: latest **2** session digests from `01-SESSIONS/`.
7. `03-ERRORS/anti-patterns.md` — prevention rules.
8. (deep mode only) `05-ARCHITECTURE/system-overview.md` or `summary.md`.
9. (deep mode only) `07-LESSONS/lessons-learned.md`.

Stop loading when **80% of budget** consumed. Leave 20% headroom for the task itself.

## Selective retrieval rules

### Area filtering

When the task mentions a specific area, load **only** entries tagged with that area from index files:

```
Task: "fix the auth login bug"
→ Area: auth, security
→ Load: error-memory entries where area ∈ {auth, security}
→ Skip:  error-memory entries where area ∈ {frontend, db, devops}
```

Each entry has `Area:` field in frontmatter or first 5 lines.

### Date filtering

Skip entries older than these thresholds (load summary instead):

| Content type | Max age (raw load) | After: load summary |
|---|---|---|
| Session digest | 7 days | Weekly summary |
| Error memory entry | 30 days (if no recurrence) | Compress to anti-pattern |
| Decision | 90 days | Still load if active |
| Architecture doc | 90 days | Load summary |

### Re-verification rule

Any memory file with `last-verified` older than 90 days is loaded with a `[STALE]` marker. The AI must verify against current code before trusting it.

## Cache (per-session)

A file loaded once during a session must not be re-loaded. Implementation:

- `omnix retrieve-context` outputs a manifest of what was retrieved.
- The AI tool must track session-loaded files (via Omnix instructions in CLAUDE.md / AGENTS.md).
- If retrieval is needed mid-session, only NEW files are loaded.

## Eviction rule (when over budget)

If selected files exceed the budget:

1. Skip lowest-priority files first.
2. Replace full file with summary version where available.
3. Truncate session digests to *Decisions Made + Next Step* fields only.
4. Always retain `active-context.md` (it's the smallest, most relevant).

## Compliance hint for AI tools

The AI's startup block must include:

```
[Memory] Loaded: <N files, ~X tokens / budget Y>
```

If `[Memory]` line is missing from a session, retrieval didn't happen — flag it.

## Anti-patterns

- **Loading "everything to be safe."** Wastes budget; reduces accuracy via lost-in-middle.
- **Re-loading the same file in one session.** Burns budget twice.
- **Loading raw 500-line architecture doc** when a 30-line summary exists.
- **Ignoring `last-verified` dates.** Stale memory misleads more than no memory.
- **Loading sessions older than 7 days raw** instead of the weekly summary.

## Implementation status

- `apps/cli/src/commands/retrieve-context.ts` — implements priority + tag scoring. **EXPERIMENTAL**.
- `active-context.md` — template defined here. Maintenance: TODO.
- INDEX.md files — template defined here. Generation: TODO (target: `omnix sync-memory --index`).
- Date-based filtering — TODO.
- Session cache — TODO.

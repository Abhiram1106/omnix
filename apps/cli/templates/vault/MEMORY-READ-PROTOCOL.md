# Memory Read Protocol

> Governs how every AI tool retrieves context from this vault.
> Source: AGENTS.md §1. This file is the authoritative reference.

---

## Retrieval modes

Choose based on task complexity. Stop reading when token budget is hit.

| Mode | Budget | When to use |
|------|--------|-------------|
| `minimal` | ~400 tokens | One-liner answers, quick lookups |
| `balanced` | ~1500 tokens | Most feature work (default) |
| `deep` | ~3000 tokens | Architecture changes, complex refactors |
| `debugging` | ~2000 tokens | Error investigation (error-memory first) |
| `architecture` | ~4000 tokens | System design, decision-heavy work |

---

## Read order

### balanced (default)

1. `02-PROJECTS/session-continuity.md` — rolling handoff ← start here always
2. `02-PROJECTS/project-context.md` — stack, constraints
3. `02-PROJECTS/active-goals.md` — week priorities
4. `03-ERRORS/error-memory.md` — known bugs (stop budget here if minimal)
5. `03-ERRORS/anti-patterns.md` — prevention rules
6. `01-SESSIONS/` — latest 1–3 digests

### debugging (error-first)

1. `02-PROJECTS/session-continuity.md`
2. `03-ERRORS/error-memory.md` ← elevated priority
3. `03-ERRORS/anti-patterns.md` ← elevated priority
4. `02-PROJECTS/project-context.md`
5. `01-SESSIONS/` — latest 2

### architecture (decision-first)

1. `02-PROJECTS/session-continuity.md`
2. `04-DECISIONS/decisions.md` ← elevated priority
3. `05-ARCHITECTURE/` ← elevated priority
4. `02-PROJECTS/project-context.md`
5. `02-PROJECTS/active-goals.md`

### minimal (project-context only)

1. `02-PROJECTS/session-continuity.md`
2. `02-PROJECTS/project-context.md`

---

## Red flags — stop work and surface to user if

- The user's request matches a known error in `03-ERRORS/error-memory.md`
- `01-SESSIONS/` last digest says tests were failing or build was broken
- The request contradicts an open decision in `04-DECISIONS/decisions.md`
- Active goals in `02-PROJECTS/active-goals.md` don't match the stated task

Surface the red flag explicitly before proceeding. Do not silently continue.

---

## What NOT to read

- `01-SESSIONS/` beyond the latest 3 (stale context, no value)
- `templates/` — fill-in blanks, not knowledge
- `00-INBOX/` unless specifically asked
- Full architecture files for simple tasks — scope to relevant sections

---

## After reading

State what was loaded before beginning work (helps the user verify):

```
Memory loaded: session-continuity ✓ | project-context ✓ | error-memory (N entries) | mode: balanced
Last session: YYYY-MM-DD | Known errors: N | Goals: <current week goal>
```

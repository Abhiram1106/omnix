# Cursor Memory Workflow

> Follow this at the end of every meaningful Cursor chat session.
> "Meaningful" = file changed, bug fixed, decision made, or session > 15 min.

---

## Shutdown ritual (8 steps — do not skip)

### Step 1 — Write session digest

Create or append to: `{{VAULT_DIR}}/01-SESSIONS/YYYY-MM-DD/session-HHMM-cursor.md`

Use the template at `{{VAULT_DIR}}/templates/session-digest.md`. Required fields:
- Date, Tool (cursor), User Request
- Files Changed, Commands Run, Verification Result
- Decisions Made, Errors Fixed
- Open Questions, Next 3 Tasks

### Step 2 — Overwrite session-continuity.md

Overwrite (do not append) `{{VAULT_DIR}}/02-PROJECTS/session-continuity.md` with:

```
## Where we left off
<2–3 sentences: what was accomplished this session>

## Active thread
- <max 5 bullets: what is still in flight>

## Current week goal
<from active-goals.md>

## Verification state
<tests passing / failing / untested — last known>

## Next 3 tasks
1. <concrete, ordered>
2.
3.

## Open risks
- <what could break or is unresolved>
```

### Step 3 — Update vault as applicable

| If this happened | Update this file |
|-----------------|-----------------|
| Bug fixed | Append to `03-ERRORS/error-memory.md` |
| Pattern repeating | Append to `03-ERRORS/anti-patterns.md` |
| Decision made | Append to `04-DECISIONS/decisions.md` |
| Architecture changed | Update `05-ARCHITECTURE/` |
| Goal completed | Check box in `02-PROJECTS/active-goals.md` |
| Project state changed | Overwrite `02-PROJECTS/current-state.md` |

### Step 4 — Code commit

Stage source files **only** (no vault files):

```bash
git add <changed source files>
git commit -m "feat(scope): what changed and why"
# Or: fix(scope): / refactor(scope): / chore(scope):
```

### Step 5 — Memory commit

Stage vault files **only** (no source files):

```bash
git add {{VAULT_DIR}}/
git commit -m "memory: YYYY-MM-DD cursor — one-line summary of session"
```

**Why two commits:** `git log --grep="memory:"` reconstructs the full cross-tool handoff history. Application history stays clean.

### Step 6 — Push

```bash
git push origin HEAD
```

Decline only if the user explicitly asks not to push.

### Step 7 — Verify the handoff

Confirm the next session can pick up cleanly:
- `session-continuity.md` is overwritten and complete
- Session digest exists in `01-SESSIONS/YYYY-MM-DD/`
- `error-memory.md` updated if a bug was fixed
- Both commits are pushed

### Step 8 — Final reply

Your final message to the user must include:

```
## Memory

- Digest: 01-SESSIONS/YYYY-MM-DD/session-HHMM-cursor.md
- Code commit: <hash> feat(scope): ...
- Memory commit: <hash> memory: YYYY-MM-DD cursor — ...
- Push: ✓ pushed to origin/HEAD
```

---

## Quick reference

```
1. Digest      → 01-SESSIONS/YYYY-MM-DD/session-HHMM-cursor.md
2. Continuity  → 02-PROJECTS/session-continuity.md (overwrite)
3. Vault       → update error/decision/goals as applicable
4. Code commit → source files, feat/fix/refactor:
5. Mem commit  → vault only, memory: YYYY-MM-DD cursor — ...
6. Push        → git push origin HEAD
7. Verify      → continuity + digest exist
8. Reply       → ## Memory block with paths + hashes
```

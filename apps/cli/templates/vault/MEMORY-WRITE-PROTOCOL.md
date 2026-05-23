# Memory Write Protocol

> Governs how every AI tool writes to this vault.
> Source: AGENTS.md §5–6. This file is the authoritative reference.

---

## When to write

**Write a session digest when:**
- Files were meaningfully changed
- A bug was fixed
- A significant decision was made
- Session lasted > 15 minutes

**Skip for:** one-liner answers, exploratory reading, read-only sessions.

---

## Append-only vs overwrite

| File | Rule | Reason |
|------|------|--------|
| `01-SESSIONS/**` | Append (new file per session) | Audit trail — history must not change |
| `03-ERRORS/error-memory.md` | Append only | Bug history is permanent |
| `03-ERRORS/anti-patterns.md` | Append only | Prevention rules accumulate |
| `04-DECISIONS/decisions.md` | Append only | Decision history is permanent |
| `07-LESSONS/**` | Append only | Lessons accumulate |
| `02-PROJECTS/session-continuity.md` | **Overwrite** | Represents "right now" — replace entirely |
| `02-PROJECTS/current-state.md` | **Overwrite** | Represents "right now" — replace entirely |
| `02-PROJECTS/active-goals.md` | Update checkboxes | Check completed goals, never delete rows |
| `05-ARCHITECTURE/**` | Update or add | Evolving docs — replace relevant sections |

**Never edit history.** If an old entry was wrong, append a correction note with a date — do not modify the original.

---

## What to write per file

### `01-SESSIONS/YYYY-MM-DD/session-HHMM-<tool>.md`

Use template: `templates/session-digest.md`

Required:
- Date, Tool, User Request
- Files Changed (relative paths)
- Commands Run (with results)
- Verification Result (tests/typecheck status)
- Decisions Made
- Errors Fixed
- Open Questions
- Next 3 Tasks

### `02-PROJECTS/session-continuity.md`

Required (overwrite entirely):
- Where we left off (2–3 sentences)
- Active thread (max 5 bullets)
- Current week goal
- Verification state
- Next 3 tasks (concrete, ordered)
- Open risks

### `03-ERRORS/error-memory.md`

Required fields per entry (use template: `templates/error-entry.md`):
- Title, Date, Tool
- Symptom (what the user saw)
- Root cause (why it happened)
- Fix (what was changed — file + line if helpful)
- Prevention (how to stop it recurring)

### `04-DECISIONS/decisions.md`

Required fields per entry (use template: `templates/decision-entry.md`):
- Title, Date, Status
- Decision (one sentence)
- Rationale (why this, not the alternatives)
- Consequences (what this enables / constrains)
- Supersedes (if replacing a prior decision)

---

## What NEVER goes in the vault

- Raw code blocks — reference file paths instead
- Secrets, tokens, API keys, DB credentials with passwords
- Duplicate content already in another vault file
- Speculation without factual basis
- Full stack traces (symptom + root cause + fix is enough)
- Absolute paths to the user's home directory (`/Users/...`, `C:\Users\...`)
- Unfinished thoughts or TODO-only entries

---

## Two-commit pattern (enforce this)

```bash
# 1. Code commit — source files only, NEVER vault files
git add <source files>
git commit -m "feat(scope): ..."

# 2. Memory commit — vault files only, NEVER source files
git add {{VAULT_DIR}}/
git commit -m "memory: YYYY-MM-DD <tool> — one-line summary"

# 3. Push both
git push origin HEAD
```

**Why:** `git log --grep="memory:"` reconstructs full handoff history. Application history stays clean and readable.

---

## Sanitization checklist

Before writing anything to the vault, verify no secrets are present:

- [ ] No `sk-`, `ghp_`, `AKIA`, `eyJ` (JWT), `xoxb-`, `sk_live_`, `sk_test_` patterns
- [ ] No postgres/mysql URIs with embedded passwords
- [ ] No `.env` values (reference key names only, not values)
- [ ] No private key PEM blocks
- [ ] No internal hostnames or IP addresses that should not be shared

Omnix auto-sanitizes via `omnix session-digest`. If writing manually, check this list.

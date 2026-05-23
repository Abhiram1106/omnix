# AGENTS.md

> **Single source of truth for every AI adapter.**
> Every tool config (CLAUDE.md, .cursorrules, .cursor/rules/, windsurf, cline) points here.
> Do not duplicate rules into adapter files — adapters add mechanism, not rules.

---

## 1. Startup protocol

**Before any response, edit, or command — do this in order:**

1. Read `{{VAULT_DIR}}/02-PROJECTS/session-continuity.md` — rolling handoff from last chat
2. Read `{{VAULT_DIR}}/02-PROJECTS/project-context.md` — stack, constraints, do-not-repeat
3. Read `{{VAULT_DIR}}/02-PROJECTS/active-goals.md` — current week priorities
4. Read `{{VAULT_DIR}}/03-ERRORS/error-memory.md` — known bugs, never repeat
5. Read `{{VAULT_DIR}}/03-ERRORS/anti-patterns.md` — promoted prevention rules
6. Read latest 1–3 digests from `{{VAULT_DIR}}/01-SESSIONS/` — context continuity
7. If architecture/design task → also read `{{VAULT_DIR}}/04-DECISIONS/decisions.md`
8. If debug task → skip step 7, re-read error-memory with higher priority
9. Begin work

**Token budgets (stop reading when hit):**
- `minimal` (~400 tokens) — project-context only. Use for one-liner answers.
- `balanced` (~1500 tokens) — steps 1–6. Default for most tasks.
- `deep` (~3000 tokens) — all steps. Use for architecture, refactors, complex features.
- `debugging` (~2000 tokens) — steps 4–5 first, then 1–3. Use when diagnosing errors.
- `architecture` (~4000 tokens) — step 7 prioritized, then steps 1–3. Use for design tasks.

**Red flags — stop work and surface to user if:**
- The user's request matches a known error in `error-memory.md`
- Last digest says tests were failing or build was broken
- The request contradicts an open decision in `decisions.md`
- Active goals don't match the user's stated priority

---

## 2. Mandatory engineering rules

**Critical (highest recall — non-negotiable):**

1. **Always retrieve memory before answering or editing.** Prevents repeating known mistakes.
2. **Never repeat known errors.** Check `03-ERRORS/error-memory.md` before diagnosing anything.
3. **Never expose secrets.** No API keys, tokens, passwords, private keys, or DB URIs in any file.
4. **Confirm before destructive operations.** Stop and ask before: `rm`, `DROP TABLE`, force push, `git reset --hard`, running migrations against production, overwriting with `--force`, publishing packages.
5. **Verify before claiming done.** Tests pass + typecheck clean + no regressions in adjacent code.

**Supporting rules:**

6. Follow existing project conventions — naming, error handling, async patterns, file structure.
7. Update docs when behavior or setup changes (not just code).
8. Prefer small, safe, targeted changes over large rewrites.
9. Record assumptions explicitly — they may be wrong and should be verifiable.
10. Record unresolved questions — they may block others or resurface.
11. Update memory after meaningful work (bug fixed, decision made, architecture changed).

---

## 3. Agent routing

Auto-route based on request signals before starting work:

| Signal keywords | Workflow | Activate roles |
|-----------------|----------|----------------|
| build / add / implement / create | feature-build | architect + fullstack + reviewer |
| error / broken / crash / failing / exception | debugging → bug-fix | debugger + security |
| test failing / test broken | bug-fix + testing | debugger + qa |
| review / audit / check quality | code-review | reviewer + security |
| refactor / clean / improve / simplify | refactor | architect + reviewer |
| deploy / ship / release / publish | deployment | devops |
| slow / performance / optimize / lag | debugging + performance | debugger + performance |
| docs / readme / document / runbook / changelog | docs-update | docs |
| security / auth / vulnerability / CVE / injection | code-review + security | security + reviewer |
| schema / migration / database / query / ORM | feature-build + database | architect + database |
| first run / empty vault / setup / onboard | project-onboarding | fullstack |

---

## 4. Skill system

Before acting on any task, check if an Omnix skill covers it:

| Task type | Skill |
|-----------|-------|
| Debugging / root cause | `debugging-specialist` + `error-intelligence` |
| Test strategy / gaps | `test-architect` |
| Security review / STRIDE | `security-threat-modeler` |
| Codebase intelligence | `repo-scanner` |
| Dependency audit / CVE | `dependency-doctor` |
| Documentation drift | `documentation-maintainer` |
| Release checklist | `release-manager` |
| Workflow routing | `workflow-router` |
| Context management | `context-manager` |

Skill location: `{{VAULT_DIR}}/../.omnix/` or installed project skills directory.
If a skill's triggers match the task, read the SKILL.md file before proceeding.

---

## 5. Memory write rules (memory loop)

**Write session digest when:**
- Files were meaningfully changed
- A bug was fixed
- A decision was made
- Session lasted > 15 minutes

**Skip digest for:** one-liner answers, exploratory reading, read-only sessions.

**After every meaningful session — do all that apply:**

| What happened | Write to |
|---------------|----------|
| Always (if meaningful) | `01-SESSIONS/YYYY-MM-DD/session-HHMM-<tool>.md` (append or create) |
| Always (if meaningful) | `02-PROJECTS/session-continuity.md` (overwrite — this is the handoff file) |
| Bug fixed | `03-ERRORS/error-memory.md` (append entry) |
| Pattern repeating | `03-ERRORS/anti-patterns.md` (append promotion rule) |
| Decision made | `04-DECISIONS/decisions.md` (append ADR entry) |
| Architecture changed | `05-ARCHITECTURE/` (update relevant file) |
| Project state changed | `02-PROJECTS/current-state.md` (overwrite) |
| Goals updated | `02-PROJECTS/active-goals.md` (update checkboxes) |

**Append-only files** (never edit history): `error-memory.md`, `decisions.md`, `anti-patterns.md`, session digests.
**Overwrite-only files** (represent "right now"): `session-continuity.md`, `current-state.md`.

---

## 6. Shutdown protocol (two-commit pattern)

At the end of every meaningful session:

```
1. Write session digest → 01-SESSIONS/YYYY-MM-DD/session-HHMM-<tool>.md
2. Overwrite session-continuity.md with next-chat handoff
3. Update error-memory / decisions / active-goals as applicable
4. CODE COMMIT: scoped to changed source files only
   Message: feat(scope): ... or fix(scope): ... or refactor(scope): ...
   Never include vault files in this commit.
5. MEMORY COMMIT: vault files only
   Message: memory: YYYY-MM-DD <tool> — <one-line summary>
   Never include source files in this commit.
6. git push origin HEAD (unless user explicitly declines)
7. Final reply must include a ## Memory block:
   - Digest: 01-SESSIONS/YYYY-MM-DD/session-HHMM-<tool>.md
   - Code commit: <hash> feat(scope): ...
   - Memory commit: <hash> memory: YYYY-MM-DD ...
   - Push: ✓ pushed / ✗ declined / ✗ failed (reason)
```

**Why two commits:** `git log --grep="memory:"` reconstructs the full cross-tool handoff history without polluting application history.

---

## 7. Safety gates

Stop and wait for explicit user confirmation before any of:

- Deleting files or directories
- Dropping or truncating database tables
- Force-pushing to any branch
- `git reset --hard`
- Running migrations against a production database
- Writing real values to `.env` files
- Publishing packages to npm, PyPI, or any registry
- Overwriting files with `--force` when backup is unclear

---

## 8. What never goes in memory

Do not write to the vault:
- Raw code blocks (reference file paths instead)
- Secrets, tokens, API keys, DB credentials
- Duplicate content already in another vault file
- Speculation without factual basis
- Full stack traces (symptom + root cause + fix is enough)
- Absolute paths to the user's home directory
- Unfinished thoughts or TODO-only entries

---

## 9. The session-continuity.md contract

`02-PROJECTS/session-continuity.md` is the **most important file in the vault**.
It is overwritten at the end of every session. It contains:

- Where we left off (2–3 sentences)
- Active thread (max 5 bullets — what's in flight)
- Current week goal (from active-goals.md)
- Verification state (last known: tests passing / failing / unknown)
- Next 3 tasks (concrete, ordered)
- Open risks (what could break, what's unresolved)

Any tool that reads this file first can pick up exactly where any other tool left off.

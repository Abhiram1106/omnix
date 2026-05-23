# Roo Code Instructions — Omnix

> Placement: `.roo/rules.md` or `.roorules` at repo root (check current Roo Code docs for exact path).
> Roo reads project rules from this file and applies them to every mode (code, architect, ask, debug).

---

## Startup protocol

Before every response, edit, or command — in order:

1. Read `{{VAULT_DIR}}/02-PROJECTS/session-continuity.md` — rolling handoff from last session
2. Read `{{VAULT_DIR}}/02-PROJECTS/project-context.md` — stack, constraints, do-not-repeat list
3. Read `{{VAULT_DIR}}/03-ERRORS/error-memory.md` — known bugs, never repeat
4. Read `{{VAULT_DIR}}/03-ERRORS/anti-patterns.md` — promoted prevention rules
5. Read latest 1–2 digests from `{{VAULT_DIR}}/01-SESSIONS/` — recent context
6. Begin work

Full rule set and retrieval modes: see `AGENTS.md` (single source of truth).

---

## Mandatory rules

1. **Retrieve memory before answering or editing** — prevents repeating known mistakes.
2. **Never repeat known errors** — check `error-memory.md` before diagnosing anything.
3. **Never expose secrets** — no API keys, tokens, passwords, DB URIs in any file.
4. **Confirm before destructive operations** — `rm`, `DROP TABLE`, force push, `git reset --hard`, production migrations.
5. **Verify before claiming done** — tests pass, typecheck clean, no regressions.
6. Follow existing project conventions (naming, async patterns, file structure).
7. Prefer small, safe, targeted changes over large rewrites.
8. Record assumptions and unresolved questions explicitly.
9. Update docs when behavior or setup changes.

---

## Roo mode guidance

| Roo mode | Primary vault reads | Primary vault writes |
|----------|--------------------|--------------------|
| **Code** | session-continuity, error-memory | session digest, error-memory (if bug fixed) |
| **Architect** | session-continuity, decisions, project-context | decisions, session digest |
| **Ask** | session-continuity, project-context | session digest (only if meaningful) |
| **Debug** | error-memory (priority), anti-patterns, session-continuity | error-memory (append), anti-patterns (if pattern) |

---

## Shutdown protocol

After every meaningful session:

1. Write session digest to `{{VAULT_DIR}}/01-SESSIONS/YYYY-MM-DD/session-HHMM-roo.md`
2. Overwrite `{{VAULT_DIR}}/02-PROJECTS/session-continuity.md` with next-session handoff
3. Append to error-memory / decisions / anti-patterns as applicable
4. Code commit (source files only): `feat(scope): ...`
5. Memory commit (vault files only): `memory: YYYY-MM-DD roo — <summary>`
6. Final reply includes a `## Memory` block with digest path + commit hashes

---

## Agent routing

| Request signal | Route to |
|---------------|----------|
| build / add / implement | feature-build workflow |
| error / crash / failing | debugging → bug-fix workflow |
| review / audit | code-review workflow |
| refactor / clean | refactor workflow |
| deploy / ship / release | deployment workflow |
| slow / optimize | debugging + performance workflow |
| security / auth / CVE | code-review + security workflow |

Full routing table: `AGENTS.md` § 3.

---

## Safety gates

Stop and confirm before: deleting files, dropping tables, force push, `git reset --hard`,
production migrations, writing `.env` values, publishing packages.

---

## Memory reference

| File | Purpose | Write mode |
|------|---------|-----------|
| `{{VAULT_DIR}}/02-PROJECTS/session-continuity.md` | Rolling handoff | Overwrite |
| `{{VAULT_DIR}}/03-ERRORS/error-memory.md` | Bug log | Append-only |
| `{{VAULT_DIR}}/04-DECISIONS/decisions.md` | Decision log | Append-only |
| `{{VAULT_DIR}}/01-SESSIONS/` | Session digests | New file each session |

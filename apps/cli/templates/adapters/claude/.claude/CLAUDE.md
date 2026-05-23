# CLAUDE.md — Project

> Claude Code loads this every session. Full contract → AGENTS.md.

@../AGENTS.md

---

## Retrieval mode

Switch based on task:
- `minimal` — quick lookups, one-liner answers
- `balanced` (default) — most tasks
- `deep` — architecture, complex refactors
- `debugging` — error investigation
- `architecture` — design and decision-heavy work

---

## Monorepo

If working in a monorepo:
- Read `.claude/rules/packages/<pkg-name>.md` for the package you are editing
- Never assume package A follows the same rules as package B unless stated
- Cross-package imports must go through declared public APIs only

---

## Completion gate

Do not say "done" until:

- [ ] Changed files match stated intent
- [ ] Typecheck clean — state result or reason skipped
- [ ] Tests pass on touched areas — state result or reason skipped
- [ ] Docs updated if behavior changed
- [ ] Session digest written (skip only for read-only sessions)
- [ ] `session-continuity.md` overwritten with next-chat handoff
- [ ] Error memory updated if a bug was fixed
- [ ] No secrets in any written file
- [ ] Open risks listed

---

## Shutdown ritual

1. Write `{{VAULT_DIR}}/01-SESSIONS/YYYY-MM-DD/session-HHMM-claude-code.md`
2. Overwrite `{{VAULT_DIR}}/02-PROJECTS/session-continuity.md`
3. Update `error-memory.md` / `decisions.md` / `active-goals.md` as needed
4. **Code commit** — source files only (`feat:` / `fix:` / `refactor:`)
5. **Memory commit** — vault files only (`memory: YYYY-MM-DD claude-code — ...`)
6. `git push origin HEAD`
7. Reply with `## Memory` block: digest path, both commit hashes, push status

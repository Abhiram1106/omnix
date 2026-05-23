# CLAUDE.md

> Auto-loaded by Claude Code. Full rules and protocols → AGENTS.md.

@AGENTS.md

---

## Retrieval mode

Switch based on task complexity:
- `minimal` — one-liner answers, quick lookups
- `balanced` (default) — most feature work
- `deep` — architecture changes, complex refactors
- `debugging` — error investigation (error-memory loaded first)
- `architecture` — system design, decision records prioritized

---

## Completion gate

**Do not say "done" until every checked item is true:**

- [ ] Changed files match the stated intent exactly
- [ ] Typecheck clean (`tsc --noEmit` or equivalent) — state result or reason skipped
- [ ] Tests pass on all touched areas — state result or reason skipped
- [ ] Docs updated if behavior or CLI changed
- [ ] Session digest written (skip only for read-only sessions)
- [ ] Error memory updated if a bug was fixed
- [ ] `session-continuity.md` overwritten with next-chat handoff
- [ ] No secrets in any written file
- [ ] Open risks listed if any remain unresolved

---

## Shutdown ritual

At end of every meaningful session, run in order:

1. Write `{{VAULT_DIR}}/01-SESSIONS/YYYY-MM-DD/session-HHMM-claude-code.md`
2. Overwrite `{{VAULT_DIR}}/02-PROJECTS/session-continuity.md`
3. Update `error-memory.md` / `decisions.md` / `active-goals.md` as applicable
4. **Code commit** — source files only, `feat(scope):` or `fix(scope):`
5. **Memory commit** — vault files only, `memory: YYYY-MM-DD claude-code — <summary>`
6. `git push origin HEAD`
7. Reply with `## Memory` block (digest path, both commit hashes, push status)

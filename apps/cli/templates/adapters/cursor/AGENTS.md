# Cursor AGENTS.md

> Cursor-specific startup and shutdown. Full rules → root `AGENTS.md`.

---

## Startup

At the start of every chat, before doing anything else:

1. Read `{{VAULT_DIR}}/02-PROJECTS/session-continuity.md` (rolling handoff from last session)
2. Read `{{VAULT_DIR}}/02-PROJECTS/project-context.md`
3. Read `{{VAULT_DIR}}/02-PROJECTS/active-goals.md`
4. Read `{{VAULT_DIR}}/03-ERRORS/error-memory.md`
5. Read `{{VAULT_DIR}}/03-ERRORS/anti-patterns.md`
6. Read 1–3 latest digests from `{{VAULT_DIR}}/01-SESSIONS/`
7. If architecture task → also read `{{VAULT_DIR}}/04-DECISIONS/decisions.md`

Adjust reading order based on task type (see §1 of `AGENTS.md`).

**Red flags — pause and surface to user:**
- Request matches a known error in `error-memory.md`
- Last digest says tests were failing
- Request contradicts an open decision
- Task doesn't match active week goals

---

## Area context packs

Load these with `@file` when working in specific areas:

| Area | Context pack |
|------|-------------|
| Backend / API / services | `.cursor/context/backend-context.md` |
| Frontend / UI / components | `.cursor/context/frontend-context.md` |
| Database / schema / migrations | `.cursor/context/database-context.md` |

---

## Shutdown

Follow `.cursor/MEMORY-WORKFLOW.md` at the end of every meaningful session.

Quick checklist:
- [ ] Session digest written
- [ ] `session-continuity.md` overwritten
- [ ] Code commit (source only)
- [ ] Memory commit (vault only)
- [ ] Pushed
- [ ] `## Memory` block in final reply

---

## Full rules

See root `AGENTS.md` for: complete startup protocol · engineering rules · routing table · safety gates · write rules · shutdown protocol.

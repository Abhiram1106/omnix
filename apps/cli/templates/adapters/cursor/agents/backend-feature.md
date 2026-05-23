# Agent Recipe: Backend Feature

**Trigger phrases:** add endpoint / implement API / build service / create route / add handler / database / schema / migration

---

## Always load at start of this session

1. `{{VAULT_DIR}}/02-PROJECTS/session-continuity.md`
2. `{{VAULT_DIR}}/02-PROJECTS/project-context.md`
3. `{{VAULT_DIR}}/02-PROJECTS/active-goals.md`
4. `{{VAULT_DIR}}/03-ERRORS/error-memory.md`
5. `{{VAULT_DIR}}/04-DECISIONS/decisions.md`
6. `.cursor/context/backend-context.md`
7. `.cursor/context/database-context.md` (if schema/DB work involved)

---

## Execution steps

**Step 1 — Requirements**

- Restate the requirement in one sentence
- Identify: what input? what output? what are the error cases?
- Check `decisions.md` — does this contradict an existing decision?
- Check `active-goals.md` — does this align with current week goal?

**Step 2 — Design**

- Where does this live in the service map? (see `backend-context.md`)
- Does this need a new table/field? If yes: write migration first.
- What auth/permission applies? State it explicitly.
- What are the edge cases? State them before coding.

**Step 3 — Implement**

- Schema/migration first (if needed)
- Data access layer (repository/service)
- Business logic
- Route handler / controller
- Input validation at boundary (Zod / Pydantic)
- Error mapping to HTTP codes

**Step 4 — Test**

- Unit test for business logic
- Integration test for the endpoint (real DB, not mocked)
- Test the happy path + each error case

**Step 5 — Verify**

- Run typecheck — must be clean
- Run tests — must pass
- Manual curl/Postman test of the endpoint
- Check: auth required? rate-limited? errors structured correctly?

**Step 6 — Record**

If a decision was made during implementation, append to `{{VAULT_DIR}}/04-DECISIONS/decisions.md`.

---

## Pre-done checklist

- [ ] Requirements restated and edge cases listed
- [ ] Decisions checked for conflicts
- [ ] Migration written and tested (if schema changed)
- [ ] Input validated at boundary
- [ ] Auth checked on the endpoint
- [ ] Unit + integration tests written and passing
- [ ] Typecheck clean
- [ ] Decision recorded if architecture choice was made
- [ ] Session digest written
- [ ] session-continuity.md overwritten

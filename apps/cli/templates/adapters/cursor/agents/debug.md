# Agent Recipe: Debug

**Trigger phrases:** error / broken / crash / failing / exception / TypeError / undefined / null / 500

---

## Always load at start of this session

1. `{{VAULT_DIR}}/02-PROJECTS/session-continuity.md`
2. `{{VAULT_DIR}}/03-ERRORS/error-memory.md` ← priority read
3. `{{VAULT_DIR}}/03-ERRORS/anti-patterns.md` ← priority read
4. `{{VAULT_DIR}}/02-PROJECTS/project-context.md`
5. Latest 2 session digests from `{{VAULT_DIR}}/01-SESSIONS/`

---

## Execution steps

**Phase 1 — History check (before touching code)**

- Search `error-memory.md` for matching symptoms
- If found: surface the past fix first — do not re-diagnose
- Check `anti-patterns.md` for prevention rules that apply

**Phase 2 — Reproduce**

- Identify the minimal reproduction path
- State: what is the actual vs expected behavior?
- State: what environment / inputs trigger it?

**Phase 3 — Root cause**

- Trace the stack: where does control flow diverge from expected?
- Check: null/undefined access, async timing, wrong type, missing auth, env var missing
- Form a hypothesis. State it explicitly before touching code.

**Phase 4 — Fix**

- Make the smallest change that fixes the root cause
- Do not fix adjacent "nice to have" issues in the same change
- Add a regression test that fails before the fix and passes after

**Phase 5 — Verify**

- Run the test suite on affected area
- Run typecheck
- Manually reproduce the original scenario — confirm fixed

**Phase 6 — Record**

After fixing, write to `{{VAULT_DIR}}/03-ERRORS/error-memory.md`:

```
## <Error title>
- Date: YYYY-MM-DD
- Tool: cursor
- Symptom: <what the user saw>
- Root cause: <why it happened>
- Fix: <what was changed>
- Prevention: <what stops this recurring>
- Files: <files changed>
```

If this is a recurring pattern, also append to `anti-patterns.md`.

---

## Pre-done checklist

- [ ] History checked in error-memory before diagnosing
- [ ] Root cause stated explicitly before coding
- [ ] Regression test written
- [ ] Typecheck passes
- [ ] Test suite passes on affected area
- [ ] Error recorded in error-memory.md
- [ ] Session digest written
- [ ] session-continuity.md overwritten

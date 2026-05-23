# Agent Recipe: Frontend Feature

**Trigger phrases:** add component / build page / implement UI / create form / add screen / fix layout / add route

---

## Always load at start of this session

1. `{{VAULT_DIR}}/02-PROJECTS/session-continuity.md`
2. `{{VAULT_DIR}}/02-PROJECTS/project-context.md`
3. `{{VAULT_DIR}}/02-PROJECTS/active-goals.md`
4. `{{VAULT_DIR}}/03-ERRORS/error-memory.md`
5. `.cursor/context/frontend-context.md`

---

## Execution steps

**Step 1 — Requirements**

- Restate what the user wants in one sentence
- Identify: what states does this UI have? (loading, empty, error, data, disabled)
- Identify: what user interactions? (click, input, submit, navigate)
- Is this client-side or server-side rendered?

**Step 2 — Design**

- Which existing components can be reused? (check `frontend-context.md`)
- Where does this live in the routing structure?
- Does this need new API calls? If yes, coordinate with backend-feature recipe.
- What accessibility requirements apply? (keyboard nav, ARIA, screen reader labels)

**Step 3 — Implement**

- Scaffold with existing component library (shadcn/ui, Radix, etc.)
- Handle all states: loading skeleton, empty state, error state, data state
- Wire data fetching (TanStack Query / SWR / Server Component fetch)
- Add form validation if applicable (React Hook Form + Zod)
- Apply design tokens — no hardcoded colors/spacing
- Ensure keyboard reachability for all interactive elements

**Step 4 — Test**

- Test each UI state (loading, error, empty, data)
- Test form validation (valid + invalid inputs)
- Test keyboard navigation
- Check for layout shift (no CLS)

**Step 5 — Verify**

- Run typecheck — must be clean
- Run component tests
- Visual check in browser for all states
- Check mobile viewport

**Step 6 — Record**

If a design decision was made, append to `{{VAULT_DIR}}/04-DECISIONS/decisions.md`.

---

## Pre-done checklist

- [ ] All UI states handled (loading, empty, error, data)
- [ ] Accessibility: keyboard reachable, ARIA labels on interactive elements
- [ ] No hardcoded colors or spacing (design tokens used)
- [ ] Form validation complete (if applicable)
- [ ] Component tests pass
- [ ] Typecheck clean
- [ ] Visually verified in browser
- [ ] Session digest written
- [ ] session-continuity.md overwritten

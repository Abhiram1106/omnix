---
name: test-architect
version: 0.8.0
status: experimental
description: >
  Designs test strategy for any component. Applies 70/20/10 pyramid rule.
  Uses Vitest + Playwright + Testcontainers. Finds gaps. Writes from specs.
triggers:
  - "write tests for"
  - "test strategy"
  - "test coverage"
  - "add tests"
  - "coverage gaps"
  - "test this component"
  - "missing tests"
  - "TDD"
  - "test-driven"
auto_activate: false
requires: []
produces:
  - "test plan"
  - "test files"
  - "07-LESSONS/test-patterns.md update"
memory_reads:
  - { path: "02-PROJECTS/project-context.md", priority: high }
  - { path: "07-LESSONS/test-patterns.md", priority: medium }
  - { path: "03-ERRORS/error-memory.md", priority: medium }
memory_writes:
  - { path: "07-LESSONS/test-patterns.md", condition: "when novel test pattern used" }
token_budget: { self: 800, context_reads: 1000, total: 1800 }
verification_required: true
destructive: false
tags: [testing, TDD, coverage, playwright, vitest, testcontainers]
compatible_adapters: [claude-code, cursor, generic]
---

## When to activate

Before writing a new feature, when test coverage drops below 80%, when finding test gaps during a code review.

## When NOT to activate

- "Fix this bug" — use error-intelligence, then write a regression test
- "Review my tests" — use the reviewer agent

## Test pyramid (70/20/10 rule)

```
Unit Tests      70% — fast, isolated, functions + components
Integration     20% — API endpoints, DB operations, service interactions
E2E Tests       10% — critical user flows only (login, checkout, core happy path)
```

**PASS: Right test type for the job**
```typescript
// Unit: pure function — fast, no deps
it("formatDate returns Unknown for null input", () => {
  expect(formatDate(null)).toBe("Unknown");
});

// Integration: real database (Testcontainers)
it("creates user in database", async () => {
  const user = await userService.create({ name: "Test" });
  expect(user.id).toBeDefined();
  const found = await db.users.findById(user.id);
  expect(found.name).toBe("Test");
});

// E2E: critical path (Playwright)
it("user can complete checkout", async ({ page }) => {
  await page.goto("/shop");
  await page.click('[data-testid="add-to-cart"]');
  await page.click('[data-testid="checkout"]');
  await expect(page.locator('[data-testid="confirmation"]')).toBeVisible();
});
```

**FAIL: Testing implementation details**
```typescript
// BAD: tests internal state, not behavior
it("sets isLoading to true", () => {
  const store = useStore();
  store.fetchUsers();
  expect(store.isLoading).toBe(true);  // brittle — tests internals
});
```

## Step-by-step execution

### Step 1: Identify what needs testing

```
1. List all public functions/methods/components in scope
2. Find existing test files (look for *.test.ts, *.spec.ts, __tests__/)
3. Identify gaps: src file without corresponding test file
4. Classify each: unit / integration / E2E
```

### Step 2: Write test plan (before code)

```markdown
## Test Plan: [component/feature]

### Unit Tests (Vitest)
- [ ] Happy path: [description]
- [ ] Edge case: [null/empty/boundary]
- [ ] Error case: [what happens on failure]

### Integration Tests (Testcontainers + real DB)
- [ ] Creates/reads/updates/deletes correctly
- [ ] Returns errors on invalid input
- [ ] Handles concurrent requests

### E2E Tests (Playwright)
- [ ] [Critical user flow 1]
- [ ] [Critical user flow 2]
```

### Step 3: Setup

**Vitest config:**
```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    globals: true,
    coverage: {
      provider: "v8",
      thresholds: { lines: 80, functions: 80, branches: 70 },
    },
  },
});
```

**Testcontainers (real Postgres):**
```typescript
import { PostgreSqlContainer } from "@testcontainers/postgresql";

let container: StartedPostgreSqlContainer;

beforeAll(async () => {
  container = await new PostgreSqlContainer().start();
  process.env.DATABASE_URL = container.getConnectionUri();
  await runMigrations();
});

afterAll(() => container.stop());
```

**Playwright setup:**
```typescript
// playwright.config.ts
export default defineConfig({
  testDir: "./e2e",
  use: { baseURL: "http://localhost:3000", headless: true },
  webServer: { command: "npm run dev", url: "http://localhost:3000" },
});
```

### Step 4: Priority order for writing tests

1. Regression tests for known bugs (from error-memory.md)
2. Happy path for new features
3. Error/edge cases
4. Integration with external services
5. E2E for user-visible flows

## Coverage thresholds

| Metric | Target | Minimum |
|--------|--------|---------|
| Lines | 85% | 80% |
| Functions | 85% | 80% |
| Branches | 75% | 70% |
| E2E | Critical paths only | No minimum |

## Verification

- [ ] `pnpm test` passes with 0 failures
- [ ] Coverage thresholds met (run `pnpm test:coverage`)
- [ ] No test uses `any` or ignores TypeScript errors
- [ ] Regression tests exist for all bugs in error-memory.md
- [ ] No tests mock database (use Testcontainers instead)

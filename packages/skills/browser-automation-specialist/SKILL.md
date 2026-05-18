---
name: browser-automation-specialist
version: 0.6.0
status: experimental
description: >
  Browser automation for UI testing, web research, and visual verification.
  Playwright for E2E, browser-use for AI agents, dev-browser for sandboxed execution.
triggers:
  - "open browser"
  - "click on"
  - "fill in form"
  - "web scrape"
  - "visual test"
  - "check this URL"
  - "E2E test"
  - "playwright"
  - "browser automation"
  - "take screenshot"
auto_activate: false
requires: []
produces:
  - "browser test results"
  - "screenshots"
  - "extracted content"
memory_reads:
  - { path: "02-PROJECTS/project-context.md", priority: high }
memory_writes:
  - { path: "07-LESSONS/ui-notes.md", condition: "when visual bugs found" }
token_budget: { self: 700, context_reads: 300, total: 1000 }
verification_required: true
destructive: false
tags: [browser, playwright, automation, E2E, testing, web, visual]
compatible_adapters: [claude-code, cursor, generic]
---

## When to activate

E2E testing, visual verification, browser-based research, automated form filling.

## When NOT to activate

- Pure unit/integration tests (use test-architect)
- Static content scraping (use scraping-specialist)

## Tool selection hierarchy

```
1. Playwright directly    → CI pipelines, E2E tests (best for deterministic tests)
2. dev-browser            → Claude Code development loops (sandboxed, safe)
3. browser-use (Python)   → Autonomous AI agents that need browser (claude/openai/gemini)
4. Stagehand              → Repeated workflows with caching
```

**Check if dev-browser available:**
```bash
npx dev-browser --version 2>/dev/null && echo "available" || echo "not installed"
# Install: npm install -g dev-browser
```

## Playwright — E2E test pattern

```typescript
import { test, expect, Page } from '@playwright/test';

test.describe('User authentication', () => {
  test('user can log in', async ({ page }) => {
    await page.goto('/login');

    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="login-button"]');

    // Wait for navigation — don't use arbitrary timeouts
    await page.waitForURL('/dashboard');
    await expect(page.locator('h1')).toContainText('Dashboard');
  });

  test('shows error on invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid="email"]', 'wrong@example.com');
    await page.fill('[data-testid="password"]', 'wrongpassword');
    await page.click('[data-testid="login-button"]');

    await expect(page.locator('[data-testid="error"]')).toBeVisible();
  });
});
```

**PASS: data-testid selectors (stable)**
```typescript
page.locator('[data-testid="submit-button"]')
page.getByRole('button', { name: 'Submit' })
page.getByLabel('Email address')
```

**FAIL: CSS/XPath selectors (brittle)**
```typescript
page.locator('.btn.btn-primary.mt-2')     // breaks on CSS changes
page.locator('//div[@class="container"]/button[1]')  // position-based
```

## Snapshot approach for AI agents (token efficiency)

```typescript
// AI-friendly snapshot — reduces tokens vs full HTML
const snapshot = await page.accessibility.snapshot();

// Or use Playwright MCP (March 2025)
// Let Claude Code control Playwright directly via MCP protocol
```

## dev-browser script (sandboxed execution)

```javascript
// Run via: npx dev-browser run script.js
const page = await browser.getPage('main');
await page.goto('https://example.com');

// Extract content
const title = await page.evaluate(() => document.title);
const text = await page.locator('main').textContent();

// Screenshot
const screenshot = await page.screenshot({ fullPage: false });
await saveScreenshot(screenshot, 'page.png');

console.log({ title, textLength: text?.length });
```

## browser-use (Python — AI agent browser)

```python
# pip install browser-use
from browser_use import Agent
from anthropic import Anthropic

agent = Agent(
    task="Go to github.com/anthropics/anthropic-sdk-python and find the latest release version",
    llm=Anthropic(),
)
result = await agent.run()
print(result)
```

## Visual regression testing

```typescript
// Playwright visual comparison
test('dashboard looks correct', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page).toHaveScreenshot('dashboard.png', {
    maxDiffPixels: 100,  // allow minor font rendering differences
  });
});

// Update snapshots after intentional UI changes:
// npx playwright test --update-snapshots
```

## Verification

- [ ] Tests use data-testid selectors (not CSS classes)
- [ ] No arbitrary sleep() calls (use waitForURL, waitForSelector)
- [ ] Screenshots saved for failed tests
- [ ] Tests run headless in CI, headed in debug mode

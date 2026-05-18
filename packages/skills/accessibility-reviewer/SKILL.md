---
name: accessibility-reviewer
version: 0.5.0
status: experimental
description: >
  Reviews components for WCAG 2.1 AA compliance. Checks color contrast, keyboard navigation,
  ARIA labels, screen reader compatibility, and focus management.
triggers:
  - "accessibility"
  - "a11y"
  - "WCAG"
  - "screen reader"
  - "aria"
  - "keyboard navigation"
  - "color contrast"
  - "focus management"
auto_activate: false
requires: []
produces:
  - "accessibility report"
memory_reads:
  - { path: "02-PROJECTS/project-context.md", priority: medium }
memory_writes: []
token_budget: { self: 700, context_reads: 200, total: 900 }
verification_required: false
destructive: false
tags: [accessibility, a11y, WCAG, aria, keyboard, screen-reader, contrast]
compatible_adapters: [claude-code, cursor, generic]
---

## When to activate

Before releasing any user-facing UI, when reviewing forms and modals, when accessibility is explicitly required.

## When NOT to activate

- Backend-only changes
- Internal tools without public users (though still good practice)

## WCAG 2.1 AA Checklist

### 1. Color contrast

```
Normal text (< 18pt): 4.5:1 minimum contrast ratio
Large text (≥ 18pt):  3:1 minimum contrast ratio
UI components:        3:1 minimum (borders, icons, input fields)

# Tools to check:
# Chrome DevTools: inspect element → Accessibility → Color Contrast
# WebAIM Contrast Checker: webaim.org/resources/contrastchecker/
```

**PASS:**
```css
/* #1a1a1a on #ffffff = 19.1:1 contrast ✓ */
color: #1a1a1a;
background: #ffffff;
```

**FAIL:**
```css
/* #999999 on #ffffff = 2.85:1 contrast ✗ */
color: #999999;  /* common gray that fails — use #767676 minimum */
```

### 2. Keyboard navigation

Every interactive element must be:
- Reachable via Tab key
- Operable via Enter/Space
- Has visible focus indicator
- In logical tab order (matches visual order)

**PASS:**
```tsx
<button
  onClick={handleClick}
  className="focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
>
  Submit
</button>
```

**FAIL:**
```tsx
<div onClick={handleClick}>Submit</div>
// Not keyboard accessible — no tabIndex, no Enter handler
```

### 3. ARIA labels

```tsx
// PASS: Labeled icon buttons
<button aria-label="Close dialog">
  <XIcon className="w-5 h-5" aria-hidden="true" />
</button>

// PASS: Form fields
<div>
  <label htmlFor="email">Email address</label>
  <input id="email" type="email" name="email" />
</div>

// PASS: Status messages
<div role="alert" aria-live="polite">
  {errorMessage}
</div>

// FAIL: Unlabeled icon button
<button>
  <XIcon />  {/* screen reader says "button" — no context */}
</button>
```

### 4. Images and media

```tsx
// PASS: Meaningful image
<img src="user-avatar.jpg" alt="John Smith's profile photo" />

// PASS: Decorative image
<img src="background-pattern.svg" alt="" role="presentation" />

// FAIL: Missing alt
<img src="chart.png" />  {/* screen reader: "image" */}
```

### 5. Focus management (modals/dialogs)

```tsx
// PASS: Focus trapped in modal
import { Dialog } from "@/components/ui/dialog";
// shadcn/ui Dialog handles focus trap automatically

// Manual focus management for custom modals:
function Modal({ onClose }) {
  const closeButtonRef = useRef(null);

  useEffect(() => {
    closeButtonRef.current?.focus();  // focus first element on open
    return () => previousFocus?.focus();  // restore focus on close
  }, []);

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <h2 id="modal-title">Modal Title</h2>
      <button ref={closeButtonRef} onClick={onClose}>Close</button>
    </div>
  );
}
```

### 6. Forms

```tsx
// PASS: Complete form accessibility
<form>
  <div>
    <label htmlFor="name">
      Full name
      <span aria-hidden="true"> *</span>
    </label>
    <input
      id="name"
      type="text"
      required
      aria-required="true"
      aria-describedby="name-error"
    />
    {error && (
      <p id="name-error" role="alert" className="text-red-600 text-sm">
        {error}
      </p>
    )}
  </div>
</form>
```

## Automated testing

```bash
# axe-core (Playwright integration)
# npm install -D @axe-core/playwright
import AxeBuilder from '@axe-core/playwright';

test('Dashboard has no accessibility violations', async ({ page }) => {
  await page.goto('/dashboard');
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze();
  expect(results.violations).toEqual([]);
});
```

## Common failures

| Issue | Fix |
|-------|-----|
| Clickable div | Use `<button>` or `<a>` |
| Missing alt text | Add `alt` to all `<img>` |
| Low contrast gray text | Use #767676 minimum on white |
| outline: none | Use `focus-visible:` Tailwind classes |
| Placeholder as label | Add real `<label>` element |
| No error association | Use `aria-describedby` pointing to error element |

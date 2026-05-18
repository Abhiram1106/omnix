---
name: design-review
description: >
  Activate when user wants to review, critique, or assess a UI design, component,
  or design system. Provides structured feedback on visual hierarchy, accessibility,
  consistency, and usability — not personal opinions.
triggers:
  - design review
  - UI review
  - review design
  - critique this
  - assess the UI
  - check accessibility
  - design audit
---

## When to activate

When the task is to evaluate existing UI rather than create it. Pair with the frontend agent for implementation notes.

## Review layers (run in order)

### 1. Accessibility (blocking issues first)
- Color contrast ratios — fail = blocker.
- Keyboard navigability — no focus trap, all interactives reachable.
- Missing alt text, missing labels, incorrect ARIA usage.
- Touch target size < 44px.

### 2. Visual hierarchy
- Is there one dominant primary action per screen?
- Is the reading path clear (F-pattern / Z-pattern appropriate for content)?
- Are related elements visually grouped?
- Does whitespace guide, not just fill?

### 3. Token consistency
- Are colors from the design token system or hardcoded?
- Is spacing from the 4px grid?
- Are border radii consistent?
- Is typography using the defined scale?

### 4. Component states
- Are all 5 states designed: default, hover, focus, active, disabled?
- Are loading and empty states designed?
- Are error states actionable (say what went wrong + what to do)?

### 5. Responsiveness
- Does it work at 320px (minimum mobile width)?
- Are touch targets large enough on mobile?
- Does layout shift on load?

## Output format

```
## Design Review: <component/page>

### Blockers (must fix before shipping)
- [element] <issue> — <reason> — <fix>

### Warnings (should fix)
- [element] <issue> — <fix>

### Suggestions (consider)
- [element] <idea>

### Verdict: PASS | CONDITIONAL | FAIL
```

Omit empty sections. Never pad with "looks good" filler — if it passes a check, don't mention it.

## Integration

- Token reference: `packages/design/standards/design-tokens.md`
- UI rules: `packages/design/standards/ui-engineering.md`
- Agents: `frontend`, `security` (for data exposure in UI)

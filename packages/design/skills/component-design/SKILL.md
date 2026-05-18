---
name: component-design
description: >
  Activate when designing or spec-ing individual UI components — buttons, cards,
  forms, modals, tables, navigation, data visualization. Produces component specs
  with all states, token references, and accessibility requirements.
triggers:
  - component
  - button design
  - card design
  - form design
  - modal
  - table design
  - nav design
  - data viz
  - chart design
---

## When to activate

When the task is a specific component, not an entire page or system. Pair with design-brief for system context.

## Component spec format

Every component spec must include:

```markdown
## Component: <Name>

**Purpose**: one sentence
**Variants**: list all variants (e.g. primary, secondary, ghost, destructive)
**Sizes**: sm | md | lg

### States
| State    | Visual change                              |
|----------|--------------------------------------------|
| Default  | base styles                                |
| Hover    | background lightens/darkens, cursor pointer |
| Focus    | 2px focus ring, visible contrast           |
| Active   | pressed: scale 0.98, color darkens         |
| Disabled | 40% opacity, cursor not-allowed            |
| Loading  | spinner replaces label, same dimensions    |

### Tokens used
- Background: --button-bg
- Text: --button-text
- Padding: --button-padding-x, --button-padding-y
- Radius: --button-radius

### Accessibility
- Role: button (native or aria)
- Keyboard: Enter + Space activate
- Focus visible: yes
- aria-disabled (not HTML disabled) when disabled to keep in tab order for screen readers

### Don't
- Never disable a primary button — show it greyed with a tooltip explaining why
- Never change button text during loading — use a spinner alongside or replace label
```

## Common component patterns

**Button hierarchy**: Primary (one per view) → Secondary → Ghost → Destructive. Use destructive sparingly; require confirmation.

**Card**: Surface + padding + optional border or shadow. Never both heavy border AND heavy shadow — pick one signal of elevation.

**Form layout**: Label (above) → Input → Helper text → Error message. Vertical stacking only on mobile; 2-column possible on desktop for short fields.

**Modal**: Trap focus, Escape closes, overlay click closes (unless unsaved changes), always one primary CTA.

**Table**: Sticky header for long tables, sortable columns indicate direction with icon, row hover highlight, zebra striping only for data-dense tables.

**Navigation**: Mobile: bottom nav (≤5 items) or hamburger (>5). Desktop: sidebar for apps, top nav for marketing. Active state must be visually unambiguous.

## Integration

- Tokens: `packages/design/standards/design-tokens.md`
- UI rules: `packages/design/standards/ui-engineering.md`
- Frontend agent: `packages/core/agents/frontend.md`

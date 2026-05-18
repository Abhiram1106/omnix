---
name: design-brief
description: >
  Activate when user describes a product, brand, or UI and needs a visual
  design system generated from natural language. Translates brief descriptions
  into concrete design tokens, color palettes, typography, and component styles.
triggers:
  - design brief
  - create design system
  - brand identity
  - visual identity
  - color palette
  - design tokens
  - UI style
---

## When to activate

When the user describes what they want to build visually ("a dark minimal SaaS dashboard", "a friendly consumer app", "a corporate financial product") and needs that translated into a concrete design system.

## 8-dimension brief resolver

Parse every design brief against these 8 dimensions before generating anything:

| Dimension | What to extract | Examples |
|---|---|---|
| **Palette** | Base color scheme | monochrome-dark, ocean-blue, warm-earth, forest-green |
| **Accent** | Brand highlight color | electric-purple, coral-red, golden-yellow |
| **Typography** | Font personality | geometric-sans, humanist-sans, editorial-serif, technical-mono |
| **Display** | Heading treatment | bold-modern, elegant-light, brutalist-heavy |
| **Layout** | Spatial density | spacious, balanced, compact |
| **Mood** | Emotional register | professional-minimal, friendly-approachable, playful-creative, premium-luxury |
| **Density** | Information density | data-dense, content-focused, landing-sparse |
| **Constraints** | Technical requirements | dark-mode-only, light-only, print-compatible, high-contrast-required |

## Natural language → dimension mapping

```
"dark"         → palette: monochrome-dark
"minimal"      → mood: professional-minimal, density: content-focused
"clean"        → mood: professional-minimal
"spacious"     → layout: spacious, density: landing-sparse
"compact"      → layout: compact, density: data-dense
"bold"         → display: bold-modern
"editorial"    → typography: editorial-serif
"friendly"     → mood: friendly-approachable
"playful"      → mood: playful-creative
"premium"      → mood: premium-luxury
"corporate"    → mood: professional-minimal, typography: geometric-sans
"SaaS"         → layout: balanced, density: data-dense
"consumer app" → mood: friendly-approachable
"fintech"      → palette: ocean-blue or neutral, mood: professional-minimal
"health"       → palette: forest-green or soft-teal, mood: friendly-approachable
"AI/ML tool"   → mood: premium-luxury or minimal, typography: technical-mono accent
```

## Output format

Generate a structured DESIGN.md covering:

1. **Color palette** — 5 colors with roles (background, surface, primary, accent, text)
2. **Typography** — font family pair, size scale, weight usage
3. **Spacing scale** — 4px-grid values
4. **Key effects** — shadow system, border radius, transition timing
5. **Component patterns** — button, card, input style direction
6. **Do / Don't** — 3 do, 3 don't for this specific design language
7. **Mood reference** — 3 adjectives that describe the visual feel

## Integration

- Token values: `packages/design/standards/design-tokens.md`
- UI rules: `packages/design/standards/ui-engineering.md`
- Agent: `packages/core/agents/frontend.md`

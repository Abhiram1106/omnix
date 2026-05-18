---
name: design-system-builder
version: 0.4.0
status: experimental
description: >
  Builds design systems with token architecture, component libraries (shadcn/ui),
  Tailwind configuration, and DESIGN.md documentation. Consistent across teams.
triggers:
  - "design system"
  - "design tokens"
  - "component library"
  - "brand system"
  - "color system"
  - "typography system"
  - "spacing scale"
  - "DESIGN.md"
auto_activate: false
requires: []
produces:
  - "design tokens"
  - "Tailwind config"
  - "DESIGN.md"
  - "component stubs"
memory_reads:
  - { path: "02-PROJECTS/project-context.md", priority: high }
  - { path: "05-ARCHITECTURE/", priority: medium }
memory_writes: []
token_budget: { self: 800, context_reads: 600, total: 1400 }
verification_required: false
destructive: false
tags: [design-system, tokens, tailwind, shadcn, DESIGN.md, components, brand]
compatible_adapters: [claude-code, cursor, generic]
---

## When to activate

Starting a new product, establishing consistency across components, creating a component library.

## When NOT to activate

- Single component fix (use ui-ux-enhancer)
- Accessibility review (use accessibility-reviewer)

## Token architecture (3 layers)

```
Layer 1: Primitive tokens (raw values)
  color.blue.500 = #3b82f6
  font.size.16 = 16px

Layer 2: Semantic tokens (role-based)
  color.primary.default = color.blue.500
  color.text.body = color.gray.900

Layer 3: Component tokens (component-specific)
  button.primary.bg = color.primary.default
  button.primary.text = color.white
```

## Tailwind design system config

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Semantic color system (CSS variables)
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'Menlo', 'monospace'],
      },
      borderRadius: {
        sm: 'calc(var(--radius) - 4px)',
        md: 'calc(var(--radius) - 2px)',
        lg: 'var(--radius)',
      },
    },
  },
} satisfies Config;
```

## CSS variables (global.css)

```css
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
  }
}
```

## DESIGN.md format (for AI consumption)

```markdown
# DESIGN.md — [Product Name]

## Visual theme
[2-3 sentences: mood, philosophy, target audience]

## Color palette
| Token | Hex | Role |
|-------|-----|------|
| primary | #1a1a1a | Primary actions, headings |
| secondary | #6b7280 | Secondary text, borders |
| accent | #3b82f6 | Interactive elements, links |
| destructive | #ef4444 | Errors, destructive actions |

## Typography
| Element | Font | Size | Weight | Line height |
|---------|------|------|--------|-------------|
| Heading 1 | Inter | 36px | 700 | 1.2 |
| Body | Inter | 16px | 400 | 1.6 |
| Caption | Inter | 12px | 400 | 1.4 |

## Spacing scale
4px base unit. Scale: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128px

## Component notes
- Buttons: 4px border-radius, medium weight label, 8px horizontal padding
- Cards: subtle shadow (0 1px 3px rgba(0,0,0,0.1)), white background

## Anti-patterns
- Never use pure black (#000000) — use #1a1a1a
- No drop shadows on text
- No more than 3 font sizes on one screen
```

## Verification

- [ ] CSS variables defined for both light and dark modes
- [ ] Color contrast meets WCAG AA (4.5:1 for text)
- [ ] Typography scale consistent (no arbitrary font sizes)
- [ ] DESIGN.md documents token choices + anti-patterns

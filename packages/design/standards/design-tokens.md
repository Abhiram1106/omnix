# Design Token Standard

Three-layer token architecture. Every visual property flows through this hierarchy — never hardcoded.

Patterns from: `ui-ux-pro-max-skill`.

## Layer 1 — Primitive tokens (raw values)

```css
/* Color */
--color-gray-50:  #F9FAFB;
--color-gray-100: #F3F4F6;
--color-gray-900: #111827;
--color-blue-500: #3B82F6;
--color-blue-600: #2563EB;
--color-red-500:  #EF4444;
--color-green-500:#10B981;

/* Spacing (4px grid) */
--space-1: 0.25rem;   /* 4px  */
--space-2: 0.5rem;    /* 8px  */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */

/* Typography */
--font-sans: 'Inter', system-ui, sans-serif;
--font-serif: 'Playfair Display', Georgia, serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;
--text-xs:   0.75rem;   /* 12px */
--text-sm:   0.875rem;  /* 14px */
--text-base: 1rem;      /* 16px */
--text-lg:   1.125rem;  /* 18px */
--text-xl:   1.25rem;   /* 20px */
--text-2xl:  1.5rem;    /* 24px */
--text-4xl:  2.25rem;   /* 36px */

/* Radius */
--radius-sm: 0.25rem;
--radius-md: 0.375rem;
--radius-lg: 0.5rem;
--radius-xl: 0.75rem;
--radius-full: 9999px;

/* Shadow */
--shadow-sm: 0 1px 2px 0 rgba(0,0,0,0.05);
--shadow-md: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1);
--shadow-lg: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1);
```

## Layer 2 — Semantic tokens (purpose-based aliases)

```css
/* Backgrounds */
--color-background:        var(--color-gray-50);
--color-background-subtle: var(--color-gray-100);
--color-surface:           #FFFFFF;
--color-surface-raised:    var(--color-gray-50);

/* Text */
--color-text-primary:   var(--color-gray-900);
--color-text-secondary: var(--color-gray-600);
--color-text-disabled:  var(--color-gray-400);
--color-text-inverse:   #FFFFFF;

/* Brand */
--color-primary:         var(--color-blue-600);
--color-primary-hover:   var(--color-blue-700);
--color-primary-subtle:  var(--color-blue-50);

/* Status */
--color-success: var(--color-green-500);
--color-error:   var(--color-red-500);
--color-warning: var(--color-yellow-500);

/* Border */
--color-border:        var(--color-gray-200);
--color-border-strong: var(--color-gray-400);
```

## Layer 3 — Component tokens (per-component overrides)

```css
/* Button */
--button-bg:          var(--color-primary);
--button-bg-hover:    var(--color-primary-hover);
--button-text:        var(--color-text-inverse);
--button-padding-x:   var(--space-4);
--button-padding-y:   var(--space-2);
--button-radius:      var(--radius-md);

/* Card */
--card-padding:       var(--space-6);
--card-radius:        var(--radius-lg);
--card-shadow:        var(--shadow-md);
--card-border:        1px solid var(--color-border);

/* Input */
--input-border:       var(--color-border-strong);
--input-radius:       var(--radius-md);
--input-padding-x:    var(--space-3);
--input-padding-y:    var(--space-2);
--input-focus-ring:   0 0 0 3px rgba(59,130,246,0.3);
```

## Rules

1. **Never hardcode hex values in components** — always use semantic or component tokens.
2. **Primitives → Semantics → Components** — never skip layers.
3. **Dark mode via semantic layer** — swap semantic tokens, never touch components.
4. **4px grid for spacing** — all spacing values are multiples of 4px.
5. **Contrast ratio ≥ 4.5:1** for normal text, ≥ 3:1 for large text (WCAG AA).

## Design brief → token mapping

| Natural language | Dimension | Token effect |
|---|---|---|
| "dark mode", "dark theme" | palette | swap --color-background, --color-surface |
| "minimal", "clean" | mood | reduce shadow, increase whitespace |
| "spacious" | density | increase --space-* by 1.5x |
| "compact", "dense" | density | reduce --space-* by 0.75x |
| "serif", "editorial" | typography | --font-sans → Playfair Display |
| "monospace", "code" | typography | --font-sans → JetBrains Mono |
| "rounded", "friendly" | radius | --radius-md → 0.75rem, --radius-lg → 1rem |
| "sharp", "corporate" | radius | --radius-md → 0.125rem |
| "high contrast" | palette | --color-text-primary → pure black |

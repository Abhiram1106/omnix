# Frontend — React Rules

- Components in `PascalCase`, hooks in `camelCase` starting with `use`
- Prefer composition over props drilling — use context or state libs for depth > 2
- Co-locate component files: `Component.tsx`, `Component.test.tsx`, `Component.module.css`
- No inline styles — use CSS modules or Tailwind utility classes
- `useEffect` dependencies must be exhaustive — no suppression comments
- Suspense boundaries at route level minimum
- All user-facing strings must go through i18n layer if project has one

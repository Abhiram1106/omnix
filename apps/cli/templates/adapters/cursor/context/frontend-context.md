# Frontend Context Pack

> Load with `@.cursor/context/frontend-context.md` when working on UI, components, or pages.

---

## App structure

<!-- Fill in your actual structure -->
| Area | Path | Notes |
|------|------|-------|
| Pages / routes | `app/` or `src/pages/` | |
| Shared components | `packages/ui/` or `src/components/` | |
| Layouts | (path) | |
| Styles | (path) | |

## Design system

- Component library: (e.g. shadcn/ui, Radix, custom)
- Styling approach: (e.g. Tailwind CSS, CSS Modules, styled-components)
- Design tokens: (e.g. `src/styles/tokens.ts` or CSS vars in `global.css`)
- Icon set: (e.g. lucide-react, heroicons)
- Font: (e.g. Geist, Inter — loaded via next/font or @fontsource)

## State management

- Global state: (e.g. Zustand store at `src/store/`)
- Server state: (e.g. TanStack Query, SWR)
- Form state: (e.g. React Hook Form + Zod)

## Conventions

- Component naming: PascalCase
- File co-location: `Component.tsx` + `Component.test.tsx` in same directory
- Data fetching: (e.g. fetch in Server Components / TanStack Query in Client Components)
- Error boundaries: (location of root error boundary)

## Current state

- In-flight UI work: (fill in or see `{{VAULT_DIR}}/02-PROJECTS/session-continuity.md`)
- Known UI bugs: (fill in or see `{{VAULT_DIR}}/03-ERRORS/error-memory.md`)

## Do not

- (fill in from `{{VAULT_DIR}}/03-ERRORS/anti-patterns.md`)

# Frontend Standards

## Stack defaults

- Framework: React (Next.js for fullstack, Vite for SPAs) or SvelteKit / Solid / Astro if project chooses.
- Language: TypeScript, `strict`.
- Styling: Tailwind + design tokens, or CSS Modules. Avoid inline styles for non-trivial UI.
- Components: shadcn/ui or Radix primitives. Don't reinvent.

## Components

- One component per file. Filename = component name.
- Props are typed explicitly; no `any`.
- Server components / client components split is intentional, not accidental (App Router).
- Suspense + Error Boundaries at meaningful UI seams, not everywhere.

## State

- Local first: `useState` / `useReducer`.
- Cross-component: pick **one** of Zustand, Jotai, Redux Toolkit, or React Context. Don't mix.
- Server state: TanStack Query or Next/SvelteKit native fetch with built-in caching. Do not duplicate server state in client state.

## Accessibility

- Every interactive element is reachable by keyboard and announces correctly.
- Labels associated with inputs. Buttons have accessible names.
- Color contrast meets WCAG AA.
- Run an a11y audit before shipping new flows.

## Performance

- Measure before optimizing. Use the framework's profiler.
- Lazy-load routes; code-split heavy components.
- Images: use the framework's image component, define sizes, use modern formats.
- Avoid layout shift: reserve space for images, async content, fonts.

## Testing

- Unit: component logic with Vitest/Jest.
- Integration: Testing Library, query by role.
- E2E: Playwright for critical user flows only.

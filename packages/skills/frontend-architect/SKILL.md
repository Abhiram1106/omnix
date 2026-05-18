---
name: frontend-architect
version: 0.7.0
status: experimental
description: >
  Designs React/Next.js application architecture. Component patterns, state management,
  performance budgets, bundle optimization, accessibility foundations.
triggers:
  - "frontend architecture"
  - "React architecture"
  - "Next.js"
  - "component design"
  - "state management"
  - "bundle size"
  - "frontend design"
  - "client architecture"
auto_activate: false
requires: []
produces:
  - "architecture decision"
  - "component structure"
  - "04-DECISIONS/frontend-decisions.md"
memory_reads:
  - { path: "02-PROJECTS/project-context.md", priority: critical }
  - { path: "05-ARCHITECTURE/system-overview.md", priority: high }
  - { path: "04-DECISIONS/decisions.md", priority: medium }
memory_writes:
  - { path: "04-DECISIONS/decisions.md", condition: "when frontend architecture decision made" }
token_budget: { self: 900, context_reads: 1000, total: 1900 }
verification_required: false
destructive: false
tags: [frontend, React, Next.js, architecture, components, state, performance, bundle]
compatible_adapters: [claude-code, cursor, generic]
---

## When to activate

Designing new features, choosing state management, planning component hierarchy, reviewing architecture before a large build.

## When NOT to activate

- Small component tweaks (just write it)
- CSS/styling only changes (use ui-ux-enhancer)
- Backend API design (use api-contract-reviewer)

## Component hierarchy (layer separation)

```
pages/            → Route handlers, data fetching, layouts (thin)
components/
  ui/             → Presentational only, no business logic
    Button.tsx
    Card.tsx
  features/       → Feature-specific, may have state
    UserProfile/
      index.tsx   → Composition root
      UserAvatar.tsx
      UserBio.tsx
  layouts/        → Page layouts, navigation
lib/              → Business logic, utils, API clients
hooks/            → Shared React hooks
stores/           → Global state (Zustand/Jotai)
```

**PASS: Thin page, fat components**
```typescript
// pages/users/[id].tsx — thin: only data fetching
export default async function UserPage({ params }: { params: { id: string } }) {
  const user = await fetchUser(params.id);  // server-side, fast
  return <UserProfile user={user} />;
}
```

**FAIL: Logic in pages**
```typescript
export default function UserPage({ params }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { /* fetch logic */ }, []);
  // 100 lines of business logic in a page component
}
```

## State management decision tree

```
Local UI state only?           → useState / useReducer
Shared across a feature?       → Context (small, collocated)
Shared across app?             → Zustand (simple) or Jotai (atomic)
Server state (async data)?     → TanStack Query (React Query)
Form state?                    → React Hook Form
URL state?                     → useSearchParams / nuqs
```

**PASS: Right tool for the job**
```typescript
// Server state: TanStack Query
const { data: user, isLoading } = useQuery({
  queryKey: ['user', userId],
  queryFn: () => fetchUser(userId),
  staleTime: 5 * 60 * 1000,  // 5 min cache
});

// Global UI state: Zustand
const useStore = create<AppStore>((set) => ({
  theme: 'light',
  setTheme: (theme) => set({ theme }),
}));
```

**FAIL: Everything in Redux**
```typescript
// Avoid Redux for new projects in 2025
// Too much boilerplate for the value it provides
// Use Zustand (500 bytes) instead
```

## Performance budgets

| Metric | Target | Hard Limit |
|--------|--------|-----------|
| First JS bundle | < 100KB gzip | 200KB |
| Route JS chunks | < 50KB each | 100KB |
| LCP | < 2.5s | 4s |
| CLS | < 0.1 | 0.25 |
| Time to Interactive | < 3.5s | 7.5s |

## Bundle optimization

```typescript
// Code splitting — dynamic imports
const HeavyChart = dynamic(() => import('./HeavyChart'), {
  loading: () => <ChartSkeleton />,
  ssr: false,  // if not needed on server
});

// Analyze bundle
npx @next/bundle-analyzer
# or
pnpm add -D webpack-bundle-analyzer
```

## Server vs Client components (Next.js App Router)

```
Server Components (default): data fetching, no interactivity, no hooks
Client Components ('use client'): event handlers, useState, useEffect

Rule: Push 'use client' as far DOWN the tree as possible
```

**PASS: Client boundary at leaf**
```typescript
// UserProfile.tsx — SERVER component
async function UserProfile({ userId }: { userId: string }) {
  const user = await fetchUser(userId);  // async in server
  return (
    <div>
      <h1>{user.name}</h1>
      <FollowButton userId={userId} />  {/* only this is client */}
    </div>
  );
}

// FollowButton.tsx — client component (small leaf)
'use client';
function FollowButton({ userId }: { userId: string }) {
  const [following, setFollowing] = useState(false);
  return <button onClick={() => setFollowing(!following)}>...</button>;
}
```

## Verification

- [ ] Component hierarchy follows layer separation
- [ ] No business logic in UI components
- [ ] State management choice documented with rationale
- [ ] Bundle size within budget (`next build` output)
- [ ] No useEffect for data fetching (use React Query / Server Components)

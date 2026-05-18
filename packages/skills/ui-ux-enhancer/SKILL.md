---
name: ui-ux-enhancer
version: 0.6.0
status: experimental
description: >
  Improves UI/UX quality with specific, actionable fixes. shadcn/ui + Tailwind patterns,
  interaction states, spacing systems, dark mode, loading/error states.
triggers:
  - "improve UI"
  - "UI looks bad"
  - "fix the design"
  - "add dark mode"
  - "loading state"
  - "error state"
  - "empty state"
  - "hover effects"
  - "responsive"
  - "spacing"
  - "shadcn"
  - "tailwind"
auto_activate: false
requires: []
produces:
  - "improved UI components"
memory_reads:
  - { path: "02-PROJECTS/project-context.md", priority: high }
memory_writes: []
token_budget: { self: 800, context_reads: 300, total: 1100 }
verification_required: false
destructive: false
tags: [UI, UX, shadcn, tailwind, dark-mode, responsive, accessibility, states]
compatible_adapters: [claude-code, cursor, generic]
---

## When to activate

Improving visual quality, adding interaction states, implementing dark mode, fixing responsive layout.

## When NOT to activate

- Architecture decisions (use frontend-architect)
- Accessibility audit (use accessibility-reviewer)
- Design system creation (use design-system-builder)

## The 5 states every component needs

Every interactive component must handle all 5 states:

```typescript
// PASS: Complete state handling
function Button({ loading, disabled, children, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        "px-4 py-2 rounded-md font-medium transition-all duration-200",
        "bg-blue-600 text-white",
        "hover:bg-blue-700",                          // hover
        "active:scale-95",                            // pressed
        "focus-visible:ring-2 focus-visible:ring-offset-2",  // focused
        "disabled:opacity-50 disabled:cursor-not-allowed",   // disabled
        loading && "cursor-wait"                      // loading
      )}
    >
      {loading ? <Spinner className="w-4 h-4" /> : children}
    </button>
  );
}
```

**FAIL: No states**
```typescript
<button onClick={onClick} className="bg-blue-600 text-white px-4 py-2">
  {children}
</button>
// No hover, no loading, no disabled, no focus, no active
```

## Loading + Error + Empty states (always needed for async data)

```typescript
// Data loading pattern
function UserList() {
  const { data: users, isLoading, error } = useQuery(...)

  if (isLoading) return <UserListSkeleton />    // skeleton, not spinner
  if (error) return <ErrorState error={error} retry={refetch} />
  if (!users?.length) return <EmptyState message="No users yet" action={<CreateUser />} />

  return <ul>{users.map(u => <UserItem key={u.id} user={u} />)}</ul>;
}

// Skeleton component
function UserListSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="animate-pulse h-16 bg-muted rounded-md" />
      ))}
    </div>
  );
}
```

## Tailwind spacing system

Use the Tailwind scale consistently — never arbitrary values:

```
Micro (icon padding):     p-1  (4px)
Tight (inline elements):  p-2  (8px)
Normal (buttons):         p-3  (12px)
Comfortable (cards):      p-4  (16px)
Section gaps:             gap-6 (24px)
Page sections:            py-8  (32px)
Large sections:           py-16 (64px)
```

**PASS: Consistent scale**
```tsx
<div className="p-4 space-y-3">
  <h2 className="text-xl font-semibold">Title</h2>
  <p className="text-sm text-muted-foreground">Description</p>
</div>
```

**FAIL: Arbitrary values**
```tsx
<div style={{ padding: "17px", marginBottom: "23px" }}>
```

## Dark mode (Tailwind + Next.js)

```typescript
// tailwind.config.ts
export default {
  darkMode: 'class',  // controlled by class on <html>
}

// Using CSS variables (shadcn/ui pattern)
<div className="bg-background text-foreground">
  <p className="text-muted-foreground">...</p>
</div>
// bg-background = white in light, dark gray in dark (via CSS vars)
```

## shadcn/ui usage pattern

```bash
# Install component
npx shadcn@latest add button card dialog

# Use with proper variants
import { Button } from "@/components/ui/button";

<Button variant="default">Primary action</Button>
<Button variant="outline">Secondary</Button>
<Button variant="destructive">Delete</Button>
<Button variant="ghost">Subtle</Button>
```

## Responsive grid

```typescript
// PASS: Responsive grid
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  {items.map(item => <Card key={item.id} item={item} />)}
</div>

// FAIL: Fixed columns
<div className="grid grid-cols-3 gap-4">  // breaks on mobile
```

## Verification

- [ ] All interactive elements have hover + focus + active states
- [ ] All async data shows loading + error + empty states
- [ ] Colors use Tailwind semantic classes (bg-background, not hardcoded hex)
- [ ] Responsive at 375px (mobile), 768px (tablet), 1280px (desktop)
- [ ] Dark mode works (toggle class on html element)

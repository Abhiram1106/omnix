# UI Engineering Standard

161-rule condensed set for building high-quality, accessible, performant user interfaces.

Patterns from: `ui-ux-pro-max-skill`, `open-design`.

## Visual hierarchy

1. One dominant element per screen — the primary action must be visually loudest.
2. No more than 3 visual weights on one page (primary, secondary, tertiary).
3. Establish a reading axis — F-pattern for content, Z-pattern for landing pages.
4. Whitespace is not empty space — it separates, groups, and guides attention.
5. Group related elements with proximity; separate unrelated with distance, not just color.

## Color

6. Primary color: one brand color, used sparingly for CTAs and active states only.
7. Never rely on color alone to convey meaning — always pair with icon or text label.
8. Accessible contrast: 4.5:1 for body text, 3:1 for large text and UI components.
9. Success/error/warning: use standard semantic colors — don't invent custom meanings.
10. Dark mode: invert backgrounds and surfaces, not text or icons.

## Typography

11. Maximum 2 font families per product: one for UI, one for display/marketing.
12. Line height: 1.4–1.6 for body text; 1.1–1.2 for headings.
13. Line length: 60–75 characters per line for readability.
14. Never use `font-size < 14px` for body copy.
15. Font weight: 400 for body, 500–600 for labels, 700 for headings. No 900 in UI.
16. Tracking (letter-spacing): negative for large headings, 0 for body, slightly positive for all-caps labels.

## Spacing and layout

17. Use a consistent spacing scale (4px grid) — every spacing value is a multiple of 4.
18. Padding inside components must be proportional to the component size.
19. Align to a grid — 12-column for complex layouts, 4-column for mobile.
20. Touch targets: minimum 44×44px for interactive elements on mobile.
21. Never use absolute positioning for layout — use flexbox or grid.

## Components

22. One component, one responsibility — no "God components" that do many things.
23. Every interactive component has 5 states: default, hover, focus, active, disabled.
24. Disabled ≠ hidden — disable the element, don't remove it from the DOM.
25. Loading state must match the skeleton/placeholder dimensions of the loaded state.
26. Empty states are content — design them deliberately (icon + message + CTA).
27. Error states must say what went wrong AND what the user can do about it.

## Forms

28. Label above input — never placeholder-only labels.
29. Inline validation: validate on blur, not on keydown (exceptions: password strength, search).
30. Error message: red text below the input, never inside a toast.
31. Required fields: mark required, not optional (fewer marked = clearer form).
32. Submit button: one per form, placed at the bottom-right of the form.
33. Autocomplete attributes: always set `autocomplete` on common fields.

## Accessibility (mandatory, not optional)

34. All interactive elements reachable and operable by keyboard.
35. Focus ring: visible, ≥ 2px, contrasts with background (never `outline: none` without replacement).
36. Semantic HTML first — use `<button>` not `<div onClick>`.
37. Images: `alt` for informational, `alt=""` for decorative, `role="img"` + `aria-label` for SVG icons.
38. ARIA only when semantic HTML is insufficient — ARIA does not fix non-semantic HTML.
39. Heading hierarchy: one `<h1>` per page, no skipped levels.
40. Form inputs: every input has a `<label>` with matching `for`/`id` or wrapping relationship.

## Motion and animation

41. Duration: micro-interactions 100–200ms, transitions 200–400ms, page-level 300–500ms.
42. Easing: ease-out for elements entering, ease-in for elements leaving.
43. `prefers-reduced-motion`: all animations must respect this media query — no exceptions.
44. Never animate layout properties (width, height, top, left) — use transform and opacity.
45. Skeleton loaders: match content shape, animate with subtle shimmer (not spinning circles for long loads).

## Performance

46. No layout shift above the fold — reserve space for all dynamic content.
47. Images: use `loading="lazy"` below the fold, explicit `width` + `height` always.
48. Fonts: use `font-display: swap`, subset to languages needed.
49. CSS: no unused styles shipped; purge in production build.
50. Bundle: measure before adding any library — check bundle-buddy/bundlephobia first.

## Pre-delivery checklist (12 items)

- [ ] Passes WCAG 2.1 AA (run axe DevTools)
- [ ] Keyboard navigable end-to-end
- [ ] No layout shift on load (CLS < 0.1)
- [ ] LCP < 2.5s on 4G
- [ ] All interactive states designed (hover/focus/active/disabled/loading/empty/error)
- [ ] Dark mode tested if supported
- [ ] Mobile breakpoints tested (320px, 375px, 768px, 1024px, 1440px)
- [ ] No hardcoded colors — all from design token system
- [ ] Touch targets ≥ 44×44px on mobile
- [ ] Form validation accessible (labels, error messages, aria)
- [ ] Images have `alt` attributes
- [ ] `prefers-reduced-motion` respected

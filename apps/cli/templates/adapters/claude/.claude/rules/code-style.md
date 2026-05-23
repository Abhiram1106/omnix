# Code Style Rules

## General

- Prefer explicit over clever — readable beats terse
- No abbreviations in names unless universally known (e.g., `id`, `url`, `api`)
- Functions ≤ 40 lines; extract if longer
- No comments explaining WHAT — only WHY (hidden constraints, workarounds, non-obvious invariants)

## TypeScript

- `strict: true` always — no `any` unless wrapping an untyped third-party boundary
- Prefer `const` / `readonly` by default
- Return types explicit on all exported functions
- Prefer `type` over `interface` for plain data shapes; use `interface` for extension points

## Commits

- Imperative subject line: "Add feature" not "Added feature"
- Subject ≤ 72 chars
- Body explains WHY, not WHAT

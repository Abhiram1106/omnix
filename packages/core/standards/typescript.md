# TypeScript Standards

## Config

- `strict: true`. No exceptions; if a file fights it, fix the file.
- `noUncheckedIndexedAccess: true`.
- `exactOptionalPropertyTypes: true` for new projects.
- Target: current LTS Node or browser baseline.
- Module resolution: `Bundler` (frontend) or `NodeNext` (backend).

## Types

- Prefer `type` for unions/intersections and one-shot shapes; `interface` for nominal/public objects you expect to extend.
- No `any`. Use `unknown` and narrow. If `any` is genuinely needed (3rd-party gap), isolate it behind a typed wrapper.
- Discriminated unions over boolean flags + optional fields.
- `as const` for literal tuples and enums-by-object.
- Avoid `enum`; prefer `as const` objects.

## Errors

- Throw `Error` subclasses with a `code` field, not strings.
- At system boundaries (HTTP handlers, CLI commands), catch and translate to a typed response.

## Imports

- No deep imports into a package's internals. Use the public entry point.
- Sort: external → workspace packages → relative.

## Functions

- Pure where possible. Side-effects at the edges.
- Prefer named parameters via object for >2 args.
- Return early on guard conditions.

## Async

- `async/await` over `.then`. Avoid mixing.
- Always `await` or explicitly `void` a returned promise.

## Tests

- Tests in `*.test.ts` next to the unit, or in `tests/` for integration.
- One assertion focus per test where reasonable. Group with `describe`.

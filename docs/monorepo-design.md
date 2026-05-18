# Monorepo design

## Workspaces

- `apps/*` — runnable applications (CLI today).
- `packages/*` — shared libraries and content (`core`, `adapters`, `memory`).
- `tools/*` — repo-internal scripts (not published).

Driven by pnpm workspaces + Turbo for task running.

## Naming

- Public-ish packages: `@omnix/<name>`.
- Internal: any name; not published.

## Versioning

- Synced versioning across packages (Changesets-style or manual major bumps).
- Tagged releases. Consumers pin to a tag.

## Build

- TypeScript packages compile to `dist/`.
- Markdown packages have no build step.
- Turbo caches per-package outputs.

## Adding a new adapter

1. Create `packages/adapters/<tool>/` with at minimum a primary instruction file that points to `packages/adapters/generic/AGENTS.md`.
2. Add the tool to `apps/cli/src/commands/install-adapters.ts` `SupportedTool` union and the file-mapping note.
3. Update `packages/adapters/README.md` table.

## Adding a new standard / workflow / agent

1. Create the markdown file in the right `packages/core/` subfolder.
2. Cross-reference from any agent or workflow that depends on it.
3. No adapter changes needed — adapters reference `core/` paths.

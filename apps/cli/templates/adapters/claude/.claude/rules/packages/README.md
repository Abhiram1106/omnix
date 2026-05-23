# .claude/rules/packages/

Per-package rule overrides for monorepos. Omnix auto-generates one file per workspace package during `omnix init`.

## Naming

File name = package directory name, e.g.:
- `apps/web` → `web.md`
- `packages/shared` → `shared.md`
- `apps/api` → `api.md`

## Contents

Each file should specify:
- Package purpose and boundaries
- Specific tech constraints
- What this package is NOT allowed to import
- Test requirements specific to this package

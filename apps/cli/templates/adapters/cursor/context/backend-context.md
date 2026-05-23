# Backend Context Pack

> Load with `@.cursor/context/backend-context.md` when working on backend/API/services.

---

## Service map

<!-- Fill in your actual services -->
| Service | Path | Tech | Port |
|---------|------|------|------|
| API | `apps/api/` or `src/api/` | (framework) | — |
| Worker | `apps/worker/` | (framework) | — |
| (add your services) | | | |

## Key files

<!-- Fill in the actual entry points and key modules -->
- Entry point: (e.g. `src/index.ts` or `apps/api/src/main.ts`)
- Router: (e.g. `src/router.ts`)
- Auth middleware: (e.g. `src/middleware/auth.ts`)
- DB client: (e.g. `src/db/client.ts`)

## Conventions in this project

- Error handling pattern: (e.g. Result type / throw + catch at boundary / custom error classes)
- Auth method: (e.g. JWT Bearer / session cookie / API key)
- ORM / query builder: (e.g. Prisma / Drizzle / raw pg)
- Validation: (e.g. Zod schemas in `src/schemas/`)
- Testing: (e.g. Vitest + Supertest for integration)

## Current state

- Known issues: (fill in or see `{{VAULT_DIR}}/03-ERRORS/error-memory.md`)
- In-flight work: (fill in or see `{{VAULT_DIR}}/02-PROJECTS/session-continuity.md`)
- Recent decisions: (fill in or see `{{VAULT_DIR}}/04-DECISIONS/decisions.md`)

## Do not

<!-- Project-specific anti-patterns for the backend -->
- (fill in from `{{VAULT_DIR}}/03-ERRORS/anti-patterns.md`)

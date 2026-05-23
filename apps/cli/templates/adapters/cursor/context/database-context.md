# Database Context Pack

> Load with `@.cursor/context/database-context.md` when working on schema, migrations, or queries.

---

## Database setup

- Engine: (e.g. PostgreSQL 15, SQLite, MySQL)
- ORM / query builder: (e.g. Prisma, Drizzle, raw pg)
- Schema location: (e.g. `prisma/schema.prisma`, `src/db/schema.ts`)
- Migrations: (e.g. `prisma migrate`, `drizzle-kit generate`)
- Connection: (e.g. via `DATABASE_URL` env var, pooled via PgBouncer)

## Key tables / models

<!-- Fill in your critical tables -->
| Table | Purpose | Key fields |
|-------|---------|-----------|
| users | Authentication | id, email, createdAt |
| (add your tables) | | |

## Migration conventions

- Never edit a committed migration — always create a new one
- Destructive migrations (DROP COLUMN, rename) require explicit approval
- Test migration on staging before production
- Migration file naming: `YYYYMMDD_description`
- Always run `prisma db push` / `drizzle-kit push` in dev, `migrate deploy` in production

## Query conventions

- All queries through ORM layer — no raw SQL in application code
- Multi-table mutations in a transaction
- Use `select` to specify fields — never `SELECT *` in production queries
- Add DB-level constraints (NOT NULL, UNIQUE, FK) — don't rely only on app validation

## Current state

- Pending migrations: (fill in)
- Schema version: (fill in)
- Known query performance issues: (fill in or see `{{VAULT_DIR}}/03-ERRORS/error-memory.md`)

## Do not

- (fill in from `{{VAULT_DIR}}/03-ERRORS/anti-patterns.md`)

# Database Standards

## Defaults

- Relational primary: Postgres.
- Cache: Redis (or KeyDB / DragonflyDB).
- Search: Postgres FTS first, then Meilisearch / Typesense / Elastic if needed.
- OLAP / analytics: ClickHouse or warehouse (BigQuery / Snowflake) — never the OLTP DB.

## Schema

- Snake_case for tables and columns.
- `id` UUID v7 primary key (time-sortable). Avoid sequential int IDs for public-facing entities.
- `created_at`, `updated_at` on every table.
- Soft-delete only when a real requirement exists; otherwise hard-delete.
- Foreign keys explicit and indexed.

## Migrations

- Migrations versioned and committed. Tool per project: Prisma migrate, Drizzle, Alembic, Flyway, Liquibase.
- Forward-only in production. Backout = forward migration that reverts state.
- Test migrations against production-shaped data before applying.

## Queries

- Index every WHERE / JOIN / ORDER BY column used at scale.
- `EXPLAIN ANALYZE` for any query > ~50ms on realistic data.
- Avoid N+1; use joins or batched loaders.
- Don't `SELECT *` in application code.

## Transactions

- Smallest scope that gives correctness.
- Read-only transactions where supported.
- Avoid holding transactions across external API calls.

## Multi-tenant

- Tenant ID on every row + composite indexes including tenant_id.
- Row-level security where the DB supports it (Postgres RLS).

## Backups & recovery

- Automated daily backups + point-in-time recovery.
- Test restore quarterly.

## Memory

- Schema decisions go to ADRs.
- Slow-query incidents go to `07-LESSONS/lessons-learned.md`.

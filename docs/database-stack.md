# Database Stack

## OLTP

- **Postgres** is the default. Modern versions support JSONB, FTS, RLS, partitioning, and pgvector.
- Managed: Neon, Supabase, RDS, Cloud SQL, Crunchy, Cockroach (if distributed SQL is needed).

## Cache

- Redis (or Valkey / DragonflyDB / KeyDB). One instance per environment; not multi-tenant within an app.

## Search

- Postgres FTS first. Meilisearch / Typesense if you outgrow it. Elasticsearch only when scale demands.

## Object storage

- S3-compatible: AWS S3, R2, GCS, MinIO (self-hosted).

## OLAP / analytics

- Don't run analytical queries on the OLTP DB.
- Warehouse: BigQuery, Snowflake, Redshift, ClickHouse.
- ELT via Airbyte / Fivetran / dlt.

## Vectors

- pgvector inside Postgres when scale fits.
- Qdrant / LanceDB / Pinecone otherwise.

## Migrations

- Forward-only in production.
- Migration tool per project (Drizzle, Prisma, Alembic, Flyway, Liquibase).
- Test against production-shaped data.

## Memory integration

- Every schema decision → ADR.
- Slow-query incidents → `07-LESSONS/lessons-learned.md`.

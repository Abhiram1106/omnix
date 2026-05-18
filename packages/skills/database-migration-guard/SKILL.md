---
name: database-migration-guard
version: 0.7.0
status: experimental
description: >
  Validates database migrations for safety before execution. Detects destructive ops,
  missing rollback plans, lock risks, and data loss scenarios.
triggers:
  - "database migration"
  - "schema change"
  - "ALTER TABLE"
  - "DROP TABLE"
  - "migration"
  - "prisma migrate"
  - "alembic"
  - "flyway"
  - "schema drift"
  - "add column"
  - "rename column"
auto_activate: false
requires: []
produces:
  - "migration safety report"
  - "04-DECISIONS/schema-decisions.md update"
memory_reads:
  - { path: "02-PROJECTS/project-context.md", priority: critical }
  - { path: "05-ARCHITECTURE/system-overview.md", priority: high }
  - { path: "04-DECISIONS/decisions.md", priority: medium }
  - { path: "03-ERRORS/error-memory.md", priority: medium }
memory_writes:
  - { path: "04-DECISIONS/decisions.md", condition: "when schema decision made" }
token_budget: { self: 900, context_reads: 1000, total: 1900 }
verification_required: true
destructive: true
tags: [database, migrations, schema, safety, rollback, postgres, mysql]
compatible_adapters: [claude-code, cursor, generic]
---

## When to activate

Before running ANY database migration. Especially for: DROP, ALTER, RENAME, removing NOT NULL constraints, adding NOT NULL to existing columns.

## When NOT to activate

- Adding a NEW table (low risk)
- Adding an index CONCURRENTLY (safe on Postgres)
- Read-only schema inspection

## ⚠ SAFETY RULE: Always confirm before executing migrations

This skill has `destructive: true`. Never run migrations against production without:
1. Running this skill's safety check
2. Testing against a copy of prod data
3. Having a verified rollback plan

## Migration Safety Checklist

### HIGH RISK operations (require extra review)

| Operation | Risk | Safe Pattern |
|-----------|------|-------------|
| `DROP TABLE` | Data loss if data exists | Check row count first; export backup |
| `DROP COLUMN` | Data loss | Multi-step: deprecate → backfill null → drop |
| `RENAME TABLE/COLUMN` | Breaks existing queries | Multi-step with alias period |
| `ALTER COLUMN TYPE` | Lock on large tables | Add new column → backfill → swap → drop old |
| `ADD NOT NULL` | Fails if existing nulls | Add nullable → backfill → add NOT NULL |
| `TRUNCATE TABLE` | Total data loss | Require explicit confirmation |
| Long-running ALTER | Table lock | Use `CONCURRENTLY` (Postgres), or online DDL |

### PASS: Safe column rename (multi-step)

```sql
-- Step 1 (deploy): Add new column
ALTER TABLE users ADD COLUMN full_name VARCHAR(255);

-- Step 2 (backfill): Copy data
UPDATE users SET full_name = name WHERE full_name IS NULL;

-- Step 3 (code): Update app to write both columns
-- Step 4 (verify): Check all rows backfilled
SELECT COUNT(*) FROM users WHERE full_name IS NULL;  -- should be 0

-- Step 5 (next deploy): Drop old column
ALTER TABLE users DROP COLUMN name;
```

**FAIL: Rename in one step on production**
```sql
ALTER TABLE users RENAME COLUMN name TO full_name;  -- breaks all existing queries instantly
```

### PASS: Adding NOT NULL column

```sql
-- Step 1: Add as nullable
ALTER TABLE orders ADD COLUMN confirmed_at TIMESTAMP NULL;

-- Step 2: Backfill
UPDATE orders SET confirmed_at = created_at WHERE confirmed_at IS NULL;

-- Step 3: Verify no nulls remain
SELECT COUNT(*) FROM orders WHERE confirmed_at IS NULL;

-- Step 4: Add constraint
ALTER TABLE orders ALTER COLUMN confirmed_at SET NOT NULL;
```

**FAIL: Adding NOT NULL directly**
```sql
ALTER TABLE orders ADD COLUMN confirmed_at TIMESTAMP NOT NULL;
-- Fails on tables with existing rows
```

### Lock risk analysis

```sql
-- Check table size before long migrations
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
  n_live_tup AS rows
FROM pg_stat_user_tables
WHERE tablename = 'orders';
```

Rules:
- Tables > 1M rows: use `CONCURRENTLY` for indexes, online DDL for schema changes
- Tables > 10M rows: plan for offline migration window or blue-green deploy
- Any lock > 30s on a high-traffic table: reconsider approach

### Rollback plan (mandatory)

Every migration must have a documented rollback:

```markdown
## Migration: Add confirmed_at to orders
**Forward:** ALTER TABLE orders ADD COLUMN confirmed_at TIMESTAMP NULL;
**Rollback:** ALTER TABLE orders DROP COLUMN confirmed_at;
**Can rollback after backfill?** Yes (if dropping the column)
**Can rollback after constraint added?** Yes (DROP NOT NULL)
**Data loss on rollback?** Only confirmed_at data (acceptable)
```

## Pre-migration verification

```bash
# 1. Backup (non-prod: can skip; prod: always)
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Test on copy
psql $TEST_DATABASE_URL < migration.sql

# 3. Verify data integrity after test
# Run data integrity queries specific to your migration
```

## Verification

- [ ] Migration tested on non-production copy of data
- [ ] Rollback plan documented and tested
- [ ] No data loss for existing rows
- [ ] Lock duration estimated (< 30s or mitigated)
- [ ] Decision recorded in `04-DECISIONS/decisions.md` with rationale

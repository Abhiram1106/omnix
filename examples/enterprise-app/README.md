# Example: Enterprise App

**Stub.** This directory will demonstrate omnix in a multi-service enterprise monorepo.

## Intended demonstration

- 3-5 services (mix of Node + Python).
- Shared packages.
- Postgres + Redis + a queue (Temporal / BullMQ / Inngest).
- Terraform for infra.
- GitHub Actions matrix CI.
- On-call rotation with runbooks.

## omnix pieces shown

- Per-service `CLAUDE.md` / `AGENTS.md` referencing the monorepo-level standards.
- Single shared `.obsidian-ai-memory/` at repo root.
- Multiple ADRs covering service boundaries.
- Runbooks per alert class.
- Postmortems for at least one synthetic incident.

## Status

Not yet populated. Tracking in `ROADMAP.md` (v0.5).

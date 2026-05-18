# Debugging Stack

## Local

- Debugger over `console.log`. Node `--inspect`, VS Code debug configs, Python `debugpy`.
- Structured logs (pino, structlog) with adjustable levels.
- `git bisect` for "it used to work."

## Distributed

- Tracing first. OpenTelemetry → Tempo / Jaeger / Honeycomb / Datadog APM / Vercel Observability.
- Correlation IDs propagated end-to-end.
- Logs aggregated (Loki, Datadog Logs, CloudWatch).
- Metrics for high-level alerts (Prometheus, Grafana, Vercel, CloudWatch).

## Frontend

- Devtools Performance + Network tabs first.
- React Profiler / Svelte devtools.
- Lighthouse CI in pipelines for regression detection.

## DB

- `EXPLAIN ANALYZE` is the answer to most "why slow" questions.
- Slow query log on in dev and staging.
- pg_stat_statements (Postgres) for hot queries in prod.

## Process

See `packages/core/workflows/debugging.md`. One hypothesis at a time. Cheapest test first. Never change two things at once.

## Memory integration

- Every notable investigation → `07-LESSONS/debugging-lessons.md`.
- Every reproducible bug found → `03-ERRORS/error-memory.md` after fix.

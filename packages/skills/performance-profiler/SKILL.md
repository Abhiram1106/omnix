---
name: performance-profiler
version: 0.5.0
status: experimental
description: >
  Profiles and optimizes application performance. Language-specific tools (py-spy, pprof,
  Lighthouse, Chrome DevTools). Identifies CPU, memory, and query bottlenecks.
triggers:
  - "performance"
  - "slow"
  - "memory leak"
  - "high CPU"
  - "latency"
  - "optimize"
  - "profiling"
  - "bottleneck"
  - "Lighthouse"
  - "Core Web Vitals"
auto_activate: false
requires: []
produces:
  - "performance report"
  - "07-LESSONS/performance-notes.md"
memory_reads:
  - { path: "02-PROJECTS/project-context.md", priority: high }
  - { path: "07-LESSONS/performance-notes.md", priority: medium }
memory_writes:
  - { path: "07-LESSONS/performance-notes.md", condition: "when performance issue resolved" }
token_budget: { self: 800, context_reads: 600, total: 1400 }
verification_required: false
destructive: false
tags: [performance, profiling, optimization, latency, memory, CPU, lighthouse]
compatible_adapters: [claude-code, cursor, generic]
---

## When to activate

When an operation is measurably slow, when memory grows unboundedly, high CPU usage detected, Core Web Vitals failing.

## When NOT to activate

- Premature optimization (no measured problem)
- Performance review without a specific measurable issue

## Profiling by language

### Node.js / TypeScript

```bash
# CPU profiling (built-in)
node --prof server.js
node --prof-process isolate-*.log > profile.txt | head -50

# Memory leak detection
node --inspect server.js
# Then open chrome://inspect in Chrome, take heap snapshots

# Clinic.js (recommended for AI-assisted workflows)
npx clinic doctor -- node server.js
npx clinic flame -- node server.js  # flame graph
```

### Python

```bash
# Production-safe (low overhead)
pip install py-spy
py-spy top --pid <PID>      # live top view
py-spy record -o profile.svg --pid <PID>  # flame graph

# Line-level (dev only)
pip install line_profiler
# Add @profile decorator to function, then:
kernprof -l -v script.py
```

### Go

```bash
# CPU profile
go test -cpuprofile=cpu.prof -bench=.
go tool pprof -http=:8080 cpu.prof

# Memory profile
go test -memprofile=mem.prof -bench=.
go tool pprof -http=:8080 mem.prof
```

## Frontend (Lighthouse / Core Web Vitals)

```bash
# CLI audit
npx lighthouse https://myapp.com --output json --output-path report.json

# Key metrics
LCP (Largest Contentful Paint) — target < 2.5s
FID (First Input Delay)        — target < 100ms
CLS (Cumulative Layout Shift)  — target < 0.1
TTFB (Time to First Byte)      — target < 600ms
```

**Common fixes:**
- LCP slow: lazy load images below fold, preload hero image, use CDN
- CLS bad: reserve space for images (width/height attributes), avoid injecting content above fold
- TTFB slow: optimize DB queries, add caching layer, use edge/CDN

## Database query profiling

**Postgres:**
```sql
-- Enable slow query log (find slow queries)
ALTER SYSTEM SET log_min_duration_statement = 1000;  -- 1 second
SELECT reload_conf();

-- Analyze a specific query
EXPLAIN ANALYZE
SELECT u.*, p.* FROM users u
JOIN posts p ON p.user_id = u.id
WHERE u.email = 'test@example.com';

-- Find missing indexes
SELECT schemaname, tablename, attname, n_distinct, correlation
FROM pg_stats
WHERE tablename = 'posts' AND attname = 'user_id';
```

## Common bottlenecks and fixes

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| API response > 500ms | N+1 queries | Add `include`/`JOIN`, eager load |
| Memory grows over time | Event listener leak, growing cache | Profile heap, add TTL to cache |
| CPU spike during requests | Synchronous computation on event loop | Move to worker thread or queue |
| Slow first load | No caching, full bundle | Code splitting, CDN, HTTP/2 push |
| DB CPU high | Missing index on WHERE/JOIN columns | `EXPLAIN ANALYZE` + add index |

## Performance baseline before optimization

```bash
# Never optimize without measuring first
# Example: API latency baseline
for i in {1..10}; do
  curl -w "%{time_total}\n" -o /dev/null -s "http://localhost:3000/api/users"
done
```

## Verification

- [ ] Measured before AND after optimization (don't assume it improved)
- [ ] No regressions introduced (run test suite)
- [ ] Performance notes written to vault if novel technique used

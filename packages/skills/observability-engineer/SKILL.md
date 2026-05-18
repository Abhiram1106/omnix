---
name: observability-engineer
version: 0.6.0
status: experimental
description: >
  Sets up and maintains observability stacks. OpenTelemetry + Prometheus + Grafana + Loki.
  Defines SLOs, alert rules, dashboards, and structured logging.
triggers:
  - "observability"
  - "monitoring"
  - "alerting"
  - "metrics"
  - "traces"
  - "logs"
  - "SLO"
  - "SLA"
  - "dashboard"
  - "prometheus"
  - "grafana"
  - "opentelemetry"
auto_activate: false
requires: []
produces:
  - "observability config"
  - "alert rules"
  - "05-ARCHITECTURE/observability.md"
memory_reads:
  - { path: "02-PROJECTS/project-context.md", priority: critical }
  - { path: "05-ARCHITECTURE/system-overview.md", priority: high }
memory_writes:
  - { path: "05-ARCHITECTURE/observability.md", condition: "when observability setup documented" }
token_budget: { self: 900, context_reads: 800, total: 1700 }
verification_required: false
destructive: false
tags: [observability, monitoring, OpenTelemetry, prometheus, grafana, loki, SLO, alerts]
compatible_adapters: [claude-code, cursor, generic]
---

## When to activate

Setting up monitoring, writing alert rules, implementing structured logging, defining SLOs.

## When NOT to activate

- Performance profiling a specific endpoint (use performance-profiler)
- Deployment pipeline (use devops-orchestrator)

## The Three Pillars

```
Metrics  → Prometheus (what is happening, in numbers)
Logs     → Loki (why it happened, in text)
Traces   → Tempo (where time was spent, across services)
          → All routed through OpenTelemetry Collector
          → Visualized in Grafana
```

## OpenTelemetry setup (Node.js)

```typescript
// src/instrumentation.ts — load before everything else
import { NodeSDK } from '@opentelemetry/sdk-node';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { Resource } from '@opentelemetry/resources';
import { SEMRESATTRS_SERVICE_NAME } from '@opentelemetry/semantic-conventions';

const sdk = new NodeSDK({
  resource: new Resource({
    [SEMRESATTRS_SERVICE_NAME]: process.env.SERVICE_NAME ?? 'myapp',
  }),
  metricReader: new PrometheusExporter({ port: 9090 }),
  traceExporter: new OTLPTraceExporter({
    url: process.env.OTLP_ENDPOINT ?? 'http://localhost:4318/v1/traces',
  }),
});

sdk.start();
```

## Structured logging

**PASS: Structured, queryable**
```typescript
import pino from 'pino';
const log = pino({ level: process.env.LOG_LEVEL ?? 'info' });

// Always include: requestId, userId, duration
log.info({ requestId, userId, duration: Date.now() - start, path: req.path }, 'request completed');
log.error({ requestId, error: err.message, stack: err.stack }, 'request failed');
```

**FAIL: Unstructured, unsearchable**
```typescript
console.log(`Request from user ${userId} completed in ${duration}ms`);
console.error(`Error: ${err.message}`);  // loses stack trace, no structured fields
```

## SLO definition template

```yaml
# SLOs for myapp
slos:
  - name: api-availability
    description: "API returns 2xx for 99.9% of requests"
    target: 99.9%
    window: 30d
    indicator:
      ratio:
        good_events: http_requests_total{status=~"2..|3.."}
        total_events: http_requests_total

  - name: api-latency
    description: "P95 latency < 500ms"
    target: 95%
    window: 30d
    indicator:
      ratio:
        good_events: http_request_duration_ms_bucket{le="500"}
        total_events: http_request_duration_ms_count
```

## Alert rules (Prometheus)

```yaml
# prometheus/alerts.yml
groups:
- name: myapp
  rules:
  - alert: HighErrorRate
    expr: rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m]) > 0.05
    for: 5m
    labels: { severity: critical }
    annotations:
      summary: "Error rate > 5% for 5 minutes"
      runbook: "https://wiki.internal/runbooks/high-error-rate"

  - alert: HighLatency
    expr: histogram_quantile(0.95, rate(http_request_duration_ms_bucket[5m])) > 500
    for: 5m
    labels: { severity: warning }
    annotations:
      summary: "P95 latency > 500ms"
```

## Grafana dashboard essentials

Every service dashboard must show:
- Request rate (req/s)
- Error rate (%)
- P50 / P95 / P99 latency (ms)
- Active connections
- Memory usage (MB)
- CPU usage (%)

## Verification

- [ ] Metrics endpoint responding (`curl localhost:9090/metrics`)
- [ ] Structured logs with requestId + userId + duration
- [ ] At least 2 alert rules defined (high error rate + high latency)
- [ ] SLO target documented in `05-ARCHITECTURE/observability.md`

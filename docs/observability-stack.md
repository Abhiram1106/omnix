# Observability Stack

## Three signals

1. **Logs** — structured, queryable, retained.
2. **Metrics** — RED (rate / error / duration) per endpoint; USE (utilization / saturation / errors) per resource.
3. **Traces** — OpenTelemetry-compatible, correlation IDs everywhere.

## Defaults

| Layer | Default | Alternates |
|---|---|---|
| Tracing | OpenTelemetry → Tempo / Honeycomb / Datadog / Vercel Observability | Jaeger, Zipkin |
| Metrics | Prometheus + Grafana / platform native | Datadog, New Relic |
| Logs | Loki / platform native | Datadog Logs, CloudWatch |
| Alerting | Grafana Alerting / PagerDuty / Opsgenie | platform native |
| Synthetic | Checkly / k6 Cloud | Grafana Synthetic, Datadog |

## SLOs

- Define per service (latency, availability, success rate).
- Error budget drives engineering attention.

## Alerts

- Alert on user impact, not noise.
- Every alert has a runbook (see `templates/runbook-template.md`).

## Memory integration

- Postmortems link the dashboards used during the incident.
- Tuning of noisy alerts → lesson learned.

# Backend Standards

## Service shape

- Stateless HTTP services by default. State lives in DBs and queues.
- One service owns one bounded context. Cross-service calls are explicit, versioned, and observable.
- Health endpoints: `/healthz` (liveness), `/readyz` (readiness).

## Request lifecycle

1. Validate input at the boundary (schema validation: Zod / Pydantic / equivalent).
2. Authenticate + authorize before business logic.
3. Translate input → domain types.
4. Execute use case (pure where possible).
5. Translate result → output schema.
6. Log structured event.

## Errors

- Domain errors are typed and mapped to HTTP/gRPC codes at the edge.
- Never leak stack traces to clients.
- Every error log has a correlation/request ID.

## Background work

- Don't block requests on slow work. Enqueue and respond.
- Queue choice per project (BullMQ / SQS / Pub/Sub / Temporal / Inngest / Trigger.dev).
- Idempotency on every consumer.

## Configuration

- Config from env vars, validated at startup (typed config object).
- Fail fast on missing required config.
- No secrets in code, logs, or repo. `.env.example` documents shape.

## Observability

- Structured logs (JSON), one event per significant operation.
- Metrics: RED (rate, errors, duration) on every public endpoint.
- Tracing: OpenTelemetry-compatible.

## Testing

- Unit tests for domain logic — no IO.
- Integration tests for handlers + repositories — real DB in a container.
- Contract tests where you integrate with another service you don't own.

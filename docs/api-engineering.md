# API Engineering

## Style choice

| Use case | Default | Notes |
|---|---|---|
| Public API | REST + OpenAPI | Predictable, cacheable, widely-tooled |
| Internal service-to-service | gRPC | Strong types, binary, streaming |
| Typed client across TS monorepo | tRPC | Zero codegen, end-to-end types |
| Public graph-shaped queries | GraphQL | Only when client variability justifies it |

## Schema-first

- The schema (OpenAPI / Proto / SDL) is the source of truth.
- Generate types and clients from it. Don't write them by hand.

## Versioning

- URL versioning for public REST (`/v1`).
- Field-level deprecation for GraphQL.
- gRPC: per-method or per-message; never break wire format inside a major.

## Error envelopes

```json
{
  "error": {
    "code": "USER_NOT_FOUND",
    "message": "...",
    "details": { }
  }
}
```

Stable string codes. HTTP status reflects category.

## Idempotency

- All POST/PUT/PATCH/DELETE accept `Idempotency-Key`.
- Servers store + replay results for ~24h.

## Pagination

- Cursor-based: `limit`, `cursor`, response `next_cursor`.
- Offset only for bounded admin lists.

## Rate limits

- Per-key, with `X-RateLimit-Limit/Remaining/Reset` headers.
- 429 + `Retry-After`.

## Memory integration

- Contract changes → ADR + decision entry.
- Production-impacting API bugs → error memory + prevention rule.

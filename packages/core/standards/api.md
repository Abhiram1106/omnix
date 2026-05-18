# API Standards

## Style

- REST for resource CRUD; RPC (gRPC/tRPC) for actions and tightly-coupled services.
- GraphQL only when client variability genuinely requires it; otherwise prefer typed REST/RPC.

## Versioning

- URL versioning for public APIs: `/v1/...`.
- Breaking changes ship as `/v2`. Never break `v1` in place.
- Deprecation announced in changelog + `Deprecation` header.

## Contracts

- Every endpoint has a typed schema (OpenAPI 3.1 / Protobuf / GraphQL SDL / tRPC types).
- Schema is the source of truth — code generates from it, not the other way around (when possible).

## Pagination

- Cursor-based by default. Offset only for bounded admin lists.
- Standard query params: `limit`, `cursor`. Response includes `next_cursor`.

## Errors

- Consistent error envelope: `{ "error": { "code": "...", "message": "...", "details": {} } }`.
- Codes are stable strings, not HTTP status names.
- HTTP status reflects category: 4xx client, 5xx server.

## Auth

- Bearer tokens for service-to-service.
- OAuth2 / OIDC for user-facing.
- Never accept credentials via query string.

## Idempotency

- All write endpoints accept `Idempotency-Key` header for safe retries.

## Rate limiting

- Per-key, with `X-RateLimit-*` response headers.
- 429 with `Retry-After`.

## Docs

- OpenAPI spec served at `/openapi.json` (or equivalent) and rendered.
- Every endpoint has a description, an example request, and an example response.

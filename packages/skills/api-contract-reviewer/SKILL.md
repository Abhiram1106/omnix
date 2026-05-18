---
name: api-contract-reviewer
version: 0.6.0
status: experimental
description: >
  Reviews API contracts for consistency, versioning, security, error handling,
  and OpenAPI spec compliance. Catches breaking changes before they ship.
triggers:
  - "review API"
  - "API design"
  - "API contract"
  - "openapi"
  - "swagger"
  - "breaking change"
  - "API versioning"
  - "REST API review"
  - "GraphQL review"
auto_activate: false
requires: []
produces:
  - "API review report"
  - "04-DECISIONS/api-decisions.md update"
memory_reads:
  - { path: "02-PROJECTS/project-context.md", priority: critical }
  - { path: "05-ARCHITECTURE/system-overview.md", priority: high }
  - { path: "04-DECISIONS/decisions.md", priority: medium }
memory_writes:
  - { path: "04-DECISIONS/decisions.md", condition: "when API design decision made" }
token_budget: { self: 800, context_reads: 1000, total: 1800 }
verification_required: false
destructive: false
tags: [api, REST, GraphQL, contract, versioning, openapi, breaking-changes]
compatible_adapters: [claude-code, cursor, generic]
---

## When to activate

Before merging any API changes, when designing new endpoints, when reviewing OpenAPI specs.

## When NOT to activate

- Frontend-only changes with no API surface changes
- Internal function refactors (no external contract change)
- Database-only migrations (no API impact)

## The API Contract Checklist

### 1. Versioning

**PASS: Explicit version in URL**
```
GET /api/v1/users/{id}
GET /api/v2/users/{id}    ← new version for breaking changes
```

**FAIL: No versioning**
```
GET /api/users/{id}       ← no way to introduce breaking changes safely
```

### 2. Breaking Change Detection

Breaking changes (require version bump):
- Removing a field from a response
- Renaming a field
- Changing a field's type
- Removing an endpoint
- Making a previously optional param required
- Changing HTTP method for an endpoint

Non-breaking (safe):
- Adding new optional fields to response
- Adding new optional query parameters
- Adding new endpoints
- Adding new enum values (unless exhaustive switch)

### 3. Error responses (consistency check)

**PASS: Consistent error schema**
```typescript
interface ApiError {
  error: string;      // machine-readable code: "user_not_found"
  message: string;    // human-readable: "User with ID 123 not found"
  status: number;     // HTTP status code
  requestId?: string; // for debugging
}
```

**FAIL: Inconsistent errors**
```
// Endpoint A returns: { "error": "Not found" }
// Endpoint B returns: { "message": "User doesn't exist", "code": 404 }
// Endpoint C returns: 404 with no body
```

### 4. HTTP status codes (correctness)

| Situation | Correct Code | Wrong Code |
|-----------|-------------|------------|
| Resource created | 201 | 200 |
| No content to return | 204 | 200 with empty body |
| Client sent bad data | 400 | 500 |
| Not authenticated | 401 | 403 |
| Authenticated but not authorized | 403 | 401 |
| Resource not found | 404 | 400 |
| Conflict (duplicate) | 409 | 400 |
| Server error | 500 | 400 |

### 5. Security checks

- [ ] Authentication required on all non-public endpoints
- [ ] Authorization checked (not just auth — can THIS user access THIS resource?)
- [ ] Rate limiting on auth endpoints and public endpoints
- [ ] No sensitive data in URL (passwords, tokens, PII) — use POST body
- [ ] No server internals in error messages (no stack traces, no DB errors)
- [ ] CORS configured correctly (not `*` in production)
- [ ] Input validation on all request bodies (schema validation, not just type checking)

### 6. Pagination for list endpoints

**PASS: Cursor-based pagination**
```json
{
  "data": [...],
  "cursor": "eyJpZCI6MTAwfQ==",
  "hasMore": true
}
```

**Also acceptable: Offset pagination with metadata**
```json
{
  "data": [...],
  "total": 1247,
  "page": 3,
  "pageSize": 20
}
```

**FAIL: Returning all records**
```json
[{ "id": 1 }, { "id": 2 }, ... { "id": 100000 }]  // will OOM at scale
```

### 7. Idempotency

- PUT should be idempotent (same result every time)
- DELETE should be idempotent (delete twice = same state)
- POST should use idempotency keys for payment/mutation operations

### 8. OpenAPI spec review

If an OpenAPI spec exists (`openapi.yaml` / `swagger.json`):
```bash
# Validate spec
npx @redocly/cli lint openapi.yaml

# Check for breaking changes vs previous version
npx @optic/api-cli diff old-spec.yaml openapi.yaml
```

## Output format

```
API Contract Review: [endpoint or spec]
─────────────────────────────────────

Breaking Changes:     0 ✓ / N ⚠
Security Issues:      0 ✓ / N ⚠
Consistency Issues:   0 ✓ / N ⚠
Missing Pagination:   0 ✓ / N ⚠

Issues:
[HIGH] GET /users returns all users with no pagination
[MED]  DELETE /users/{id} returns 200, should be 204
[LOW]  Error responses inconsistent between /users and /posts
```

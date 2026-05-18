# API Spec: <Endpoint or Service>

- **Version**: v1
- **Status**: draft | active | deprecated
- **Owner**: <team>

## Overview

What this API does. Audience (internal / partner / public).

## Endpoints

### `<METHOD> /path`

- **Summary**: …
- **Auth**: bearer | none | session
- **Request**:
  ```json
  { ... }
  ```
- **Response 200**:
  ```json
  { ... }
  ```
- **Errors**: list of `code` strings with HTTP status.
- **Idempotency**: yes/no. Header used.
- **Pagination**: cursor (if applicable).

## Schemas

- Inline or reference (`#/components/schemas/...`).

## Versioning

- Breaking changes ship under `/v2`.

## Deprecation

- Date · `Deprecation` header · migration guide link.

## Examples

- Curl example for each endpoint.

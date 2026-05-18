# Workflow: Feature Build

## Pre-work

1. Retrieve memory: project context, recent digests, decisions, errors, lessons.
2. Read the feature spec / PRD. If none, ask for clarification before writing code.
3. Identify the smallest end-to-end slice that demonstrates value.

## Plan

- List affected modules.
- List new types / schemas.
- List tests to add.
- Note risks, assumptions, open questions.
- For non-trivial scope, write a short ADR.

## Build

1. Write or update types / schema first.
2. Domain logic + unit tests.
3. Adapter (HTTP/DB/queue) wiring + integration tests.
4. UI / API surface wiring.
5. Smoke test end-to-end manually.

Small commits, scoped messages.

## Verify

- Lint, typecheck, unit, integration pass locally.
- Manual run of the new flow.
- For UI: open in browser, click through the happy path and one edge case.
- For backend: hit the endpoint with a real request.

## Document

- Update README/docs if behavior or setup changed.
- Update API docs (schema-driven).

## Digest

Write the digest. Note any decisions and any errors encountered + fixed.

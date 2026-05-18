# Testing Stack

## Defaults

| Layer | TypeScript | Python |
|---|---|---|
| Unit | Vitest | pytest |
| Integration | Vitest + Testcontainers | pytest + Testcontainers (or `pytest-docker`) |
| E2E (web) | Playwright | Playwright (Python bindings) |
| Property-based | fast-check | hypothesis |
| Snapshot | Vitest snapshot (sparingly) | pytest-snapshot |
| Load | k6 | locust |
| Contract | Pact (cross-lang) | Pact |

## Coverage

- Track coverage but don't optimize for the number. Cover risk.
- Pull request shows coverage delta in informational mode.

## Speed budget

- Unit suite: < 5 min in CI.
- Integration: < 15 min.
- E2E: parallelized; budget per critical flow ≤ 2 min.

## Flake policy

Flakes are bugs. No retries. Quarantine or fix.

## Memory integration

- Flake root causes → `07-LESSONS/debugging-lessons.md`.
- Patterns in missed bugs → `03-ERRORS/anti-patterns.md`.

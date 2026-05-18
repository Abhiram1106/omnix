# Testing Standards

## Pyramid

- **Unit** — fast, no IO, hundreds-thousands of them.
- **Integration** — real dependencies (DB, queue) in containers, dozens.
- **E2E** — critical user flows only, single-digit count, browser or HTTP.

Skewed pyramid: lots of unit, some integration, few E2E. Inverted pyramids cause slow, flaky CI.

## Rules

- Tests describe behavior, not implementation. Name: "does X when Y".
- One reason to fail per test where reasonable.
- No shared mutable state between tests; each test owns its setup.
- Fixtures over `beforeEach` chains.
- Time and randomness are injected, not called directly.

## What to test

- Every bug fix gets a regression test.
- Every public function has at least one happy-path test and one edge-case test.
- Schema validators, error mappers, and pure domain logic — exhaustive.

## What not to over-test

- Trivial getters/setters.
- Framework code you don't own.
- Pixel-perfect snapshots that flake.

## CI

- All tests run on PR.
- Slow tests gated to a separate job; can't block fast feedback.
- Flaky tests are bugs — quarantine, fix, or delete. Never retry-until-green.

## Mocks

- Mock at boundaries (HTTP clients, time, randomness).
- Don't mock the thing under test.
- Prefer fakes (in-memory implementations) over mocks for repositories.

## Memory

- Recurring test failures go to `03-ERRORS/error-memory.md` with prevention rule.

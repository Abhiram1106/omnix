# Workflow: Testing

## When writing a new test

1. Name describes behavior: "<unit> does X when Y".
2. Arrange / Act / Assert separated by blank lines.
3. One reason to fail.
4. No reliance on shared state or test order.

## When fixing a flaky test

- Flakes are bugs in the test or the system. They are not retried.
- Identify the source: time, randomness, network, shared state, ordering.
- Inject the unstable dependency; control it deterministically.
- If unfixable in <30 min, quarantine with a tracked task — do not merge unfixed.

## When raising coverage

- Cover risk, not lines. Find the untested branches in domain logic and error paths.
- Don't add tests just to hit a coverage number.

## When integration tests are slow

- Profile. Most slowness is fixture setup, not assertions.
- Share immutable fixtures; reset only what each test mutates.
- Run integration suite in parallel where the DB allows.

## Memory

- Each flake's root cause goes to `07-LESSONS/debugging-lessons.md`.
- Patterns in missed bugs go to `03-ERRORS/anti-patterns.md`.

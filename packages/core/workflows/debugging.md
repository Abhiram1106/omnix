# Workflow: Debugging

For investigation when the symptom isn't yet a reliable reproduction.

## Frame

- One sentence: what's happening, what should happen.
- Scope: where it does and doesn't occur (env, user, time, data).

## Pre-work

- `03-ERRORS/error-memory.md` and `07-LESSONS/debugging-lessons.md` for prior art.
- Recent deploys, config changes, dependency updates.

## Method

1. **Hypothesis** — write it down before changing anything.
2. **Cheapest test** — what's the smallest thing that confirms or rejects?
3. **Observe** — logs, metrics, traces, network, DB state.
4. **Bisect** — code (`git bisect`), config, or data, depending on where suspicion points.
5. **Repeat** with a narrower hypothesis.

Do not change two things at once. Do not "try stuff."

## Tooling defaults

- Local: debugger over `print/console.log`; structured logs over ad-hoc.
- Distributed: tracing first, logs second.
- DB: `EXPLAIN ANALYZE`, slow query logs.
- Frontend: devtools performance + network panel before code changes.

## End

- Either: deterministic reproduction → switch to `bug-fix.md`.
- Or: bounded conclusion (e.g., "third-party degradation, not our bug") → write it to lessons + digest.

## Digest

Capture every step in the digest. Debugging digests are the most valuable kind of memory.

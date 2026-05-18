# Workflow: Docs Update

## When triggered

- Behavior changes that affect how a user runs, configures, or operates the system.
- Public API surface changes.
- New on-call alert.
- New external dependency.
- New decision (→ ADR).

## Where to update

- User-facing run/install/usage → `README.md`.
- System overview, modules, flows → `docs/architecture.md` + memory vault `05-ARCHITECTURE/`.
- API → schema source (OpenAPI / SDL / Protobuf), then regenerate docs.
- Operational → runbooks.
- Decision → new ADR file, listed in `04-DECISIONS/decisions.md`.

## Standards

- Same PR as the code change. Not "next sprint."
- Examples that run as written.
- Update dates / version notes where the doc lists them.

## Memory

- If a doc drift was discovered during the session, capture *what was wrong* in the digest under *Docs Updated*.
- Repeated drift in the same area → lesson learned (consider auto-generation).

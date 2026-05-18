# Documentation Standards

## Layers

- **README.md** — what the project is, how to run it, where to look next. Always current.
- **ARCHITECTURE.md / docs/architecture.md** — system overview, diagrams, key flows.
- **ADRs** (`docs/adr/NNNN-*.md`) — one per architectural decision. See `templates/adr-template.md`.
- **Runbooks** — one per alert / incident class.
- **API docs** — generated from schema (OpenAPI / Protobuf / GraphQL SDL).

## Writing rules

- Compact. Lead with the answer. Examples over prose.
- Code blocks runnable as written, or marked clearly as illustrative.
- No "TBD" without a date + owner.
- Every doc lists its update date or has a footer note.

## When to update

- Behavior changes → update README / ARCHITECTURE / API docs in the same PR.
- New decision → new ADR.
- New on-call alert → new runbook.
- New external integration → docs/integrations/ entry.

## What lives where

- **Repo docs** — code-adjacent, changes with code.
- **Memory vault** (`.obsidian-ai-memory/`) — session digests, errors, decisions, lessons, project context. AI-readable, evolves continuously.

Repo docs are stable user-facing knowledge. Memory vault is operational AI-facing knowledge. Don't merge them.

## Memory

- Doc drift discovered in a session → log under *Docs Updated* in the digest, fix in the same or next PR.

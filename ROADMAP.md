# Roadmap

## v0.1 — scaffold (current)

- Universal standards, workflows, agents, templates.
- Adapter files for 8 AI coding tools + generic.
- Obsidian vault template + schemas.
- CLI as typed stubs (contracts only).
- Source repo pattern analysis.

## v0.2 — working CLI

- `init`, `install-adapters`, `scan` working end-to-end on Node + Python projects.
- Stack detection from `package.json`, `pyproject.toml`, `go.mod`, `Cargo.toml`, `pom.xml`.
- Template variable substitution (project name, stack, date).

## v0.3 — memory CLI

- `session-digest` reads conversation transcripts (where exportable) or a free-form notes file and produces a structured digest.
- `retrieve-context` aggregates the top-N most-relevant memory files for a given task description.
- `update-error-memory` interactive flow.

## v0.4 — adapter parity

- Verify each adapter's file syntax against the current upstream tool spec (Cursor `.mdc`, Continue `config.yaml/.ts`, etc.).
- Add per-tool installation tests where feasible.

## v0.5 — examples

- `examples/fullstack-saas` — concrete Next.js + Postgres reference project with full memory loop.
- `examples/ai-app` — Python LLM app reference.
- `examples/enterprise-app` — multi-service monorepo reference.

## Later

- Optional vector-store sidecar for semantic memory retrieval (the markdown vault remains canonical).
- VS Code extension surfacing the vault in the editor.
- Pluggable agent definitions.

## Non-goals

- Becoming yet another agent-swarm framework.
- Locking in to one AI tool.
- Replacing Obsidian, your IDE, or your version control.

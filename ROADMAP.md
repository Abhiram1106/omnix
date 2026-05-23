# Roadmap

## v0.1 — scaffold ✓ released 2026-05-15

- Universal standards, workflows, agents, templates.
- Adapter files for 8 AI coding tools + generic.
- Obsidian vault template + schemas.
- 23 CLI commands (working, not stubs).
- 126 passing tests across 16 test files.

## v0.2 — AI infrastructure upgrade ✓ released 2026-05-23

- `AGENTS.md` rewritten as 9-section single source of truth contract.
- Full `.claude/` structure on `omnix init --adapters claude`.
- Cursor adapter expanded: 6 glob-scoped rules, 3 context packs, 3 agent runbooks, settings.
- Vault: MEMORY-READ-PROTOCOL, MEMORY-WRITE-PROTOCOL, `_INDEX.md` MOC, session-continuity template.
- All stub adapters (Windsurf, Cline, Roo, Continue) fully expanded.
- Monorepo detection: turbo/nx/lerna/pnpm; `omnix workspace` per-package health scoring.
- Two-commit shutdown pattern documented throughout.
- `omnix --version` now reads from `package.json` — never drifts.

## v0.3 — memory CLI

- `session-digest` reads conversation transcripts or free-form notes and produces a structured digest.
- `retrieve-context` aggregates the top-N most-relevant memory files for a given task description.
- `update-error-memory` interactive flow: detect → confirm → append.
- `omnix sync` — cross-tool vault sync with conflict detection.

## v0.4 — adapter parity

- Verify each adapter's file syntax against current upstream tool specs
  (Cursor `.mdc` format, Continue `config.yaml`, Windsurf `rules.md` placement).
- Per-tool installation smoke tests.
- Aider `CONVENTIONS.md` and OpenHands `instructions.md` expanded to full feature parity.

## v0.5 — examples

- `examples/fullstack-saas` — Next.js + Postgres reference with full memory loop wired.
- `examples/ai-app` — Python LLM app reference.
- `examples/enterprise-app` — multi-service monorepo reference.

## Later

- Optional vector-store sidecar for semantic memory retrieval (markdown vault stays canonical).
- VS Code extension surfacing the vault and session-continuity in the editor sidebar.
- Pluggable agent definitions via `.omnix/agents/`.
- `omnix mcp` — install and configure MCP servers per tool adapter.

## Non-goals

- Becoming yet another agent-swarm framework.
- Locking in to one AI tool.
- Replacing Obsidian, your IDE, or your version control.

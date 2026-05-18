# Changelog

All notable changes to `omnix` are documented here.

Format: [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
Versioning: [Semantic Versioning](https://semver.org/)

---

## [Unreleased]

### Added
- `omnix tutorial` — interactive first-run walkthrough for new users
- 3 more skill handlers with real runtime code: `test-architect`, `security-threat-modeler`, `release-manager`
- Top-level `uncaughtException` + `unhandledRejection` handlers
- Test coverage for 10 additional commands (status, check-secrets, verify, error-match,
  install-adapters, diff, hooks, vault, research, skills-run) — test count more than doubled
- `omnix research` now handles general queries (npm packages, GitHub repos, Node.js versions,
  MDN web docs, caniuse) — previously only npm and Node

### Changed
- `omnix research` returns useful output for any common dev query
- `omnix vault streak` uses millisecond-arithmetic date math (no DST/timezone bugs)
- `dependency-doctor` skill auto-detects package manager (npm/pnpm/yarn) instead of
  using POSIX-only shell operators that fail on Windows

### Fixed
- `dependency-doctor` skill silently failed on Windows (`||` and `2>/dev/null` are
  POSIX-only; replaced with Node child_process calls that handle errors directly)
- `omnix diff` and `documentation-maintainer` skill had the same Windows shell bug
- `omnix vault streak` had a date mutation bug — the current streak counter worked
  by accident; now uses millisecond arithmetic on a stable epoch
- `omnix session-digest --auto` used POSIX shell redirection that failed on Windows
- `omnix vault migrate` always reported "you need to migrate" on a fresh install —
  init now writes the current vault version on first run
- `CONTRIBUTING.md` had a broken `github.com/TODO` clone URL

---

## [0.1.0] — 2026-05-15

### Added

- Monorepo scaffold: `apps/cli`, `packages/core`, `packages/adapters`, `packages/memory`.
- CLI package `omnix` with bin aliases `omnix` and `create-omnix`.
- Commands: `init`, `scan`, `detect`, `doctor`, `install-adapters`, `retrieve-context`,
  `session-digest`, `sync-memory`, `route`, `team-plan`.
- Universal adapter templates for: Claude Code, Cursor, Windsurf, Cline, Roo, Continue, Aider,
  OpenHands, Generic.
- Obsidian vault template with 11 folders and fill-in templates.
- `.omnix/` runtime config directory (agents, workflows, memory, commands, settings).
- Core standards: ai-collaboration, self-orchestration, context-engineering, token-optimization,
  retrieval-architecture, external-retrieval, architecture, typescript, frontend, backend, python,
  api, database, testing, security, devops, documentation.
- Core workflows: auto-detection, parallel-team-mode, retrieval-modes, external-intelligence,
  feature-build, bug-fix, debugging, code-review, refactor, testing, deployment, docs-update,
  project-onboarding.
- Core agents: architect, frontend, backend, fullstack, devops, qa, security, database, api,
  performance, sre, docs, ai-engineer, product-engineer, reviewer, debugger, context-manager.
- CLI utilities: logger, paths, copy-template, detect-stack, prompts, write-digest.
- Startup protocol: `STARTUP_PROTOCOL.md` — universal auto-detection and self-orchestration.
- Rule-based routing in `route` and `team-plan` — no LLM required.
- tsup CJS build with bundled runtime deps.
- GitHub Actions: publish-dry-run on PR, manual release workflow.
- PUBLISHING.md, RELEASE_CHECKLIST.md, docs/branding-migration.md.

# Changelog

All notable changes to `omnix` are documented here.

Format: [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
Versioning: [Semantic Versioning](https://semver.org/)

---

## [0.2.1] — 2026-05-23

### Fixed

- `omnix --version` reported `0.1.0` even after upgrading — hardcoded constant replaced with
  `require("../package.json").version` so the binary always reflects the installed package version.

---

## [0.2.0] — 2026-05-23

### Added

#### AGENTS.md — single source of truth contract

- Rewrote `adapters/generic/AGENTS.md` as a 9-section universal contract covering: startup protocol
  with 5 retrieval modes + token budgets, red-flag detection, mandatory engineering rules, agent
  routing table, skill system lookup, memory write rules (memory loop), two-commit shutdown pattern,
  safety gates, the session-continuity.md contract definition.
- All tool adapter files now point back to `AGENTS.md` as the sole rule authority — no rule
  duplication across adapters.

#### Claude Code adapter — full `.claude/` structure

- `CLAUDE.md` thinned to an entry-point that imports `@AGENTS.md`.
- `.claude/CLAUDE.md` — project-level rules with monorepo section.
- `.claude/settings.json` — real hooks: Stop hook (shutdown ritual reminder),
  PreToolUse hook (memory-load reminder), full permission allowlist.
- `.claude/settings.local.json` — personal overrides stub.
- `.claude/.mcp.json` — MCP server config placeholder.
- `.claude/agents/README.md` — sub-agent definition guide.
- `.claude/skills/README.md` — skill registration guide.
- `.claude/rules/code-style.md` — project code style rules.
- `.claude/rules/frontend/react.md` — React-specific rules.
- `.claude/rules/packages/README.md` — per-package rule guide (monorepo).

#### Cursor adapter — expanded from 5 to 15 files

- `memory-session.mdc` — new `alwaysApply: true` memory loop reminder rule.
- `project-rules.mdc`, `backend.mdc`, `frontend.mdc`, `testing.mdc`, `security.mdc` — tightened
  glob scopes (area rules only fire for matching file paths, not project-wide).
- `MEMORY-WORKFLOW.md` — 8-step Cursor shutdown ritual with two-commit pattern.
- `AGENTS.md` — Cursor-specific startup/shutdown referencing root AGENTS.md.
- `cursor-settings.json` — `alwaysInclude` vault files + indexing exclude rules.
- `context/backend-context.md`, `context/frontend-context.md`, `context/database-context.md` —
  `@`-includable area context packs for targeted retrieval.
- `agents/debug.md`, `agents/backend-feature.md`, `agents/frontend-feature.md` — agent runbooks
  with trigger phrases and numbered workflow steps.

#### Vault — new protocol files and templates

- `MEMORY-READ-PROTOCOL.md` — 5 retrieval modes with token budgets and read order tables.
- `MEMORY-WRITE-PROTOCOL.md` — append vs overwrite rules, per-file write specs, two-commit
  pattern, sanitization checklist.
- `_INDEX.md` — Obsidian-style MOC graph root with wikilinks to all vault clusters.
- `templates/session-continuity.md` — overwrite-only handoff template (6 required sections).
- `templates/session-digest.md` — upgraded to 17 fields + `## Memory` block with commit hashes.
- `templates/gitignore-ai-block.md` — gitignore patterns for AI directories.
- `templates/CODEOWNERS-ai-block.md` — CODEOWNERS entries for AI infrastructure review.
- `03-ERRORS/anti-patterns.md` — seeded append-only prevention rules file.

#### Expanded adapters — all now full-featured

- `adapters/windsurf/rules.md` — full startup protocol, routing table, shutdown protocol,
  memory reference table.
- `adapters/cline/instructions.md` — full rules + Cline-specific auto-approve guidance +
  context-window management notes.
- `adapters/roo/instructions.md` — full rules + per-mode table (Code / Architect / Ask / Debug).
- `adapters/continue/config.md` — full `config.yaml` snippets for `systemMessage`,
  context providers, and slash commands (`/memory`, `/digest`, `/errors`).

#### Monorepo support

- Stack detection upgraded: detects `turbo.json`, `nx.json`, `lerna.json`, `pnpm-workspace.yaml`.
- Auto-scans `apps/`, `packages/`, `libs/`, `services/`, `tools/` for workspace packages.
- `omnix workspace` — per-package health scoring across 5 dimensions
  (tests 30 pts, typecheck 25 pts, lint 20 pts, readme 15 pts, omnix-rule 10 pts) with A–F grades.
- `omnix scan --deep` — workspace-aware scan with per-package path prefixes.
- `omnix init` generates per-package rules into `.claude/rules/packages/<name>.md` for monorepos.

#### npm publish pipeline

- `pnpm run release` — build + typecheck + test + publish in one command.
- `pnpm run publish:npm` — direct publish shortcut.
- `prepublishOnly` now gates on all 126 tests (was build + typecheck only).

### Changed

- `copy-template.ts` — added `tokens?: Record<string, string>` option; `{{TOKEN}}` placeholders
  in `.md`, `.mdc`, `.json`, `.yaml`, `.ts`, `.js` files are substituted on copy.
- `init.ts` — vault seeding uses `tokens: { VAULT_DIR }` so all template files resolve the
  correct vault directory; added seeding of `decisions.md`, `vault-index.md`,
  `session-continuity.md`, `_INDEX.md`, `MEMORY-READ-PROTOCOL.md`, `MEMORY-WRITE-PROTOCOL.md`.
- `adapter-files.ts` — cursor adapter expanded from 5 to 15 entries; all new files registered.

### Fixed

- `verify.ts` check for "memory loop" keyword now passes — AGENTS.md section 5 heading
  updated to include the phrase.

---

## [0.1.0] — 2026-05-15

### Added

- Monorepo scaffold: `apps/cli`, `packages/core`, `packages/adapters`, `packages/memory`.
- CLI package `omnix` with bin aliases `omnix` and `create-omnix`.
- Commands: `init`, `scan`, `detect`, `doctor`, `install-adapters`, `retrieve-context`,
  `session-digest`, `sync-memory`, `route`, `team-plan`, `skills`, `update`, `verify`,
  `error-match`, `status`, `check-secrets`, `research`, `diff`, `hooks`, `vault`,
  `tutorial`, `workspace`.
- Universal adapter templates for: Claude Code, Cursor, Windsurf, Cline, Roo, Continue, Aider,
  OpenHands, Generic.
- Obsidian vault template with 11 folders and fill-in templates.
- `.omnix/` runtime config directory (agents, workflows, memory, commands, settings).
- Core standards, workflows, and agent definitions.
- Rule-based routing in `route` and `team-plan` — no LLM required.
- tsup CJS build with bundled runtime deps.
- GitHub Actions: publish-dry-run on PR, manual release workflow.
- PUBLISHING.md, RELEASE_CHECKLIST.md, ROADMAP.md.
- 126 passing tests across 16 test files.

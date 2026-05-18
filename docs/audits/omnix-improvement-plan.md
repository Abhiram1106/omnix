# Omnix Improvement Plan

Derived from `omnix-deep-audit.md`. Honest prioritization.
Every item: task · reason · files · acceptance · risk if skipped.

---

## Priority 0 — BLOCKS PUBLIC RELEASE

These cannot ship to npm as-is.

### P0.1 — Add LICENSE file
- **Task**: Create `LICENSE` (MIT) at repo root.
- **Reason**: npm publish technically allowed without it but unprofessional + legally ambiguous.
- **Files**: `LICENSE`
- **Acceptance**: `npm pack` includes LICENSE; `npm view <pkg>` shows license.
- **Risk if skipped**: Users won't trust adoption.

### P0.2 — Fill package.json metadata
- **Task**: Replace all `TODO:` fields in `apps/cli/package.json`.
- **Files**: `apps/cli/package.json`
- **Acceptance**: No `TODO` strings in published manifest.
- **Risk if skipped**: npm shows broken links.

### P0.3 — Reframe "runtime" claim
- **Task**: Rewrite README and core docs to describe Omnix as a *scaffolding + convention system*, not a "runtime."
- **Reason**: Current language oversells; "AI runtime" implies execution. Trust killer when users discover the gap.
- **Files**: `README.md`, `packages/adapters/generic/STARTUP_PROTOCOL.md`, `packages/core/standards/self-orchestration.md`.
- **Acceptance**: No instance of "runtime" implying execution.
- **Risk if skipped**: Bad reviews on Hacker News day 1.

### P0.4 — Memory sanitization
- **Task**: Implement secret redaction before any session-digest is written.
- **Files**: NEW `apps/cli/src/utils/sanitize.ts`; modify `write-digest.ts`.
- **Acceptance**: Test with API key in `commandsRun` field — must be redacted.
- **Risk if skipped**: First user accidentally commits an API key from their session.

### P0.5 — Auto-update project `.gitignore`
- **Task**: `omnix init` appends safe defaults to `.gitignore`.
- **Files**: `apps/cli/src/commands/init.ts`.
- **Acceptance**: After init, `.gitignore` contains `.omnix/memory/` and `.omnix/cache/`.
- **Risk if skipped**: Users commit session cache.

### P0.6 — Realistic first-run experience
- **Task**: Reduce `init` interactive questions from 3 to 1 (Which AI tool?). Infer rest. Generate a *seeded* `project-context.md` from `scan` results (already partially built) rather than empty template.
- **Files**: `apps/cli/src/utils/prompts.ts`, `apps/cli/src/commands/init.ts`.
- **Acceptance**: First-run produces a project-context.md the AI can actually use (not just headers with empty values).
- **Risk if skipped**: Users churn after 5 minutes.

### P0.7 — Adapter consolidation
- **Task**: Make `AGENTS.md` the canonical adapter. Tool-specific files become thin pointers (~20 lines each), no rule duplication.
- **Files**: All `apps/cli/templates/adapters/*/` files.
- **Acceptance**: Updating a rule in AGENTS.md propagates without touching tool-specific files.
- **Risk if skipped**: Rules drift across adapters; documentation rot.

---

## Priority 1 — MVP RELEASE (first useful 0.1.x)

These make Omnix genuinely useful.

### P1.1 — `omnix doctor` real coverage
- **Task**: Expand doctor to check: adapter file presence, vault structure, settings.json schema, .gitignore safety, recent session activity.
- **Files**: `apps/cli/src/commands/doctor.ts`.
- **Acceptance**: Doctor catches all P0 misconfigs.
- **Risk if skipped**: Users can't self-diagnose.

### P1.2 — `omnix demo` command
- **Task**: Show what Omnix would do without writing. Runs init in a temp dir, prints summary.
- **Files**: NEW `apps/cli/src/commands/demo.ts`.
- **Acceptance**: `npx omnix demo` produces a 30-line preview of installation effects.
- **Risk if skipped**: First-time users don't know what they're committing to.

### P1.3 — `omnix explain <file>` command
- **Task**: Print what a given Omnix file does, which AI tool reads it, and when.
- **Files**: NEW `apps/cli/src/commands/explain.ts`.
- **Acceptance**: `omnix explain CLAUDE.md` returns a 10-line clear explanation.
- **Risk if skipped**: Users delete files they don't understand.

### P1.4 — Memory lifecycle (hot/warm/cold)
- **Task**: Implement memory-curator and token-optimizer skills as real CLI subcommands. Auto-compress sessions > 7 days. Generate `INDEX.md` files in `03-ERRORS/` and `04-DECISIONS/`.
- **Files**: NEW skills + `apps/cli/src/commands/sync-memory.ts` already has partial compress.
- **Acceptance**: After 10 sessions over 2 weeks, retrieval still works in < 1 second.
- **Risk if skipped**: Vault becomes garbage pile.

### P1.5 — Active context file
- **Task**: `active-context.md` — single file updated every session. The "one file to read" for current state.
- **Files**: NEW template; modify `init.ts` + `scan.ts` to maintain it.
- **Acceptance**: AI tool reads one file to know current state.
- **Risk if skipped**: AI has to read 5 files; some get stale silently.

### P1.6 — Adapter compatibility tester
- **Task**: CI workflow that runs weekly, fetches current adapter format specs (Cursor `.mdc`, Cline rules, etc.), compares to our templates.
- **Files**: NEW `.github/workflows/adapter-compat.yml`, NEW skill spec.
- **Acceptance**: Open issue when an adapter format drifts.
- **Risk if skipped**: Templates silently break in production.

### P1.7 — Reduce agent set to 6 core
- **Task**: Keep architect, fullstack, security, qa, debugger, reviewer in `packages/core/agents/`. Move 11 others to `packages/core/agents/specialized/`.
- **Files**: agent files (move).
- **Acceptance**: New users see 6 agents by default; can opt into more.
- **Risk if skipped**: Noise > signal.

### P1.8 — Prompt/instruction linter
- **Task**: CLI command that scans adapter files for known anti-patterns.
- **Files**: NEW `apps/cli/src/commands/lint.ts` + skill spec.
- **Acceptance**: Catches "you are an expert" filler and contradictions.
- **Risk if skipped**: Adapter rot.

### P1.9 — README rewrite
- **Task**: 60-second pitch at top. Move rest to `docs/`.
- **Files**: `README.md`, possibly new `docs/full-readme.md`.
- **Acceptance**: A skim reader understands value in 2 minutes.
- **Risk if skipped**: Low adoption.

### P1.10 — Real example project
- **Task**: Convert `examples/fullstack-saas/` from empty README to actual minimal Next.js project pre-omnix-initialized.
- **Files**: `examples/fullstack-saas/`.
- **Acceptance**: User can clone it and see Omnix files in context.
- **Risk if skipped**: "I don't get what this does" reviews.

---

## Priority 2 — STRONG OSS RELEASE

Needed for serious adoption.

### P2.1 — CONTRIBUTING.md, CODE_OF_CONDUCT.md, SECURITY.md
- **Files**: 3 new root files.
- **Acceptance**: GitHub shows green checks on community profile.

### P2.2 — Issue + PR templates
- **Files**: `.github/ISSUE_TEMPLATE/bug.md`, `.github/ISSUE_TEMPLATE/feature.md`, `.github/PULL_REQUEST_TEMPLATE.md`.

### P2.3 — Skill plugin system (real)
- **Task**: Define skill manifest (`skill.yaml`), runtime loader, validation. See `docs/architecture/skill-plugin-system.md`.
- **Files**: NEW `packages/skills/*` with full structure.
- **Acceptance**: `omnix skills install <name>` works.
- **Risk if skipped**: Ecosystem stalls at "10 markdown files."

### P2.4 — `omnix vault encrypt` / sanitize
- **Task**: Optional encryption + offline sanitization audit.
- **Risk if skipped**: Privacy-conscious users won't use it.

### P2.5 — Telemetry opt-in
- **Task**: Measure which commands are used. Send anonymous counters.
- **Acceptance**: Off by default; transparent docs.
- **Risk if skipped**: Building blind. But shipping telemetry has its own risks — only do this if there's a clear product question to answer.

### P2.6 — Cross-tool integration tests
- **Task**: Spin up real Claude Code session / Cursor session in CI, verify adapter is read.
- **Risk if skipped**: We never confirm the premise actually works.

### P2.7 — `omnix update` adapter format drift handling
- **Task**: When adapter compatibility tester flags drift, `omnix update --target=adapters` can migrate to new format.
- **Risk if skipped**: Users have to re-init.

### P2.8 — Web docs site
- **Task**: Deploy `docs/` as a static site (e.g. Astro Starlight, Mintlify).
- **Risk if skipped**: GitHub docs only — fine for power users, weak for new users.

---

## Priority 3 — ADVANCED ECOSYSTEM

### P3.1 — Browser automation specialist (real)
Wraps dev-browser patterns. Today SPEC only.

### P3.2 — External research specialist (real)
Implements `scrapling` / `Scrapegraph-ai` patterns. Today SPEC only.

### P3.3 — Plugin marketplace
- **Task**: Registry of community-built skills + adapters. Could start as a curated list in repo.

### P3.4 — VS Code extension
- **Task**: Surface vault contents + active context in editor sidebar.

### P3.5 — Semantic memory retrieval
- **Task**: Optional vector embeddings sidecar for semantic search.
- **Risk**: Adds runtime complexity.

### P3.6 — Multi-vault federation
- **Task**: Share vault across team via git or sync server.

### P3.7 — Local LLM integration
- **Task**: Use Ollama for offline session-digest summarization.

---

## Summary table

| Priority | Items | Estimated effort | Releases unlocked |
|---|---|---|---|
| P0 | 7 | 2-4 days | Public 0.1.0 release |
| P1 | 10 | 1-2 weeks | Useful 0.2.0 release |
| P2 | 8 | 1-2 months | OSS adoption-ready 1.0 |
| P3 | 7 | Open-ended | Ecosystem expansion |

---

## What this plan does NOT promise

- **Autonomous behavior.** Omnix remains a convention + scaffolding system. The AI tool is responsible for actually following the rules.
- **Multi-agent runtime.** Parallel team mode is a reasoning checklist, not separate processes.
- **Guaranteed token savings.** We provide rules and measurement; the LLM provider's behavior is its own.

These are deliberate limits. Honesty > overpromise.

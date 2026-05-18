# Plugin / Skill Ecosystem Roadmap

How Omnix moves from markdown skills (today) to a real plugin ecosystem.

## Current state (v0.1)

- 10 skill specs in `packages/skills/` (all status: SPEC).
- No runtime — skills are documents AI tools may read.
- No plugin discovery, no marketplace, no third-party support.

## Phase 1 — SPEC stabilization (v0.1 → v0.2)

**Goal**: every shipped skill has the 8 required files and passes validation.

- [ ] `omnix skill validate <name>` command.
- [ ] CI workflow that validates every skill in `packages/skills/`.
- [ ] Skill schema published as JSON Schema.

## Phase 2 — Built-in handlers (v0.2 → v0.3)

**Goal**: 4 critical skills have working TypeScript handlers.

Priority order:
1. `context-manager` — handler reads retrieval-policy, produces context pack.
2. `memory-curator` — handler runs sanitization + dedup + stale marking.
3. `error-intelligence` — handler matches errors against INDEX.md.
4. `token-optimizer` — handler measures + reports vault size.

These are LOW RISK (no network, scoped writes).

## Phase 3 — Skill SDK + runtime (v0.3 → v0.4)

**Goal**: external developers can write skills.

- [ ] Publish `@omnix/skill-sdk` package with `SkillContext`, `SkillResult` types.
- [ ] `omnix skill run <name>` invokes any built-in or local skill.
- [ ] `omnix skill add <path-to-skill>` registers a local skill.
- [ ] Local skill path: `.omnix/skills/<name>/`.

## Phase 4 — Composition (v0.4 → v0.5)

**Goal**: workflows that compose multiple skills.

- [ ] Workflow YAML format (see `docs/architecture/skill-plugin-system.md`).
- [ ] `omnix workflow run <name>` chains skills.
- [ ] Conditional steps, error handling, partial-failure semantics.

## Phase 5 — Distribution (v0.5 → v1.0)

**Goal**: skill marketplace.

- [ ] Curated registry (start as a list in this repo).
- [ ] `omnix skill install <name>` from registry.
- [ ] Versioning + compatibility checks.
- [ ] Signing / integrity verification.

## Phase 6 — Higher-risk skills (v1.x)

Network / browser / write-heavy skills:

- [ ] `external-research-specialist` (network).
- [ ] `browser-automation-specialist` (Playwright).
- [ ] `release-manager` (writes CHANGELOG, version bumps, tags).
- [ ] `dependency-doctor` (auto-upgrade mode).

Each requires explicit user opt-in via `risk_level: high` confirmation.

## What we will NOT build

- **A general agent runtime.** Omnix orchestrates skills + memory; it does not host LLMs or be a chatbot.
- **A multi-tenant cloud service.** Skills run locally. Vault stays local.
- **A vector database.** Optional sidecar via skill if needed; not core.
- **Real-time multi-user collaboration.** Use git for that.

## Adoption signals to watch

- Skill validation pass rate across community PRs.
- Top-used skills (telemetry, opt-in).
- Issue count on adapter format drift (drives `adapter-compatibility-tester` priority).
- User-reported memory bloat (drives `memory-curator` + lifecycle work).

## Risk register

| Risk | Mitigation |
|---|---|
| Spec becomes too rigid, kills experimentation | Skills can be EXPERIMENTAL status; only STABLE gates apply strictly. |
| Marketplace becomes a security vector | Sign skills, require reviews, allowlist for `risk_level: high`. |
| Schema changes break community skills | Major version bumps + migration scripts. |
| Skill explosion (100s of overlapping skills) | Curation, deprecation policy, "official" tier. |

# Omnix Deep Audit

**Auditor mindset**: OSS maintainer, CLI publisher, reliability engineer, security reviewer.
**Bias**: brutal honesty. No hype. No defensive answers.

---

## 1. Product clarity

### What Omnix actually is (today, not aspirationally)

- A **scaffolding CLI** that copies markdown files into a project: adapter configs (CLAUDE.md, .cursor/rules), a structured Obsidian-compatible memory directory (`.obsidian-ai-memory/`), and a `.omnix/` settings directory.
- A **rule-based router** that maps plain English requests to workflow + agent role labels via keyword matching.
- A **collection of markdown standards and agent personas** that AI tools may or may not read.

### What Omnix is NOT (despite README claims)

- **Not a runtime.** Nothing executes "self-orchestration." The AI tool either reads the markdown or doesn't. Omnix has no hook into the AI tool's decision loop.
- **Not memory-aware.** Writing a `session-digest.md` requires the AI tool (or the user) to call `omnix session-digest`. Nothing forces it. Most sessions will silently skip.
- **Not a swarm/multi-agent system.** `team-plan` outputs a static table. There is no inter-agent communication. The name "swarm-coordination" oversells what is a single-session reasoning prompt.
- **Not token-optimized in any measurable way.** "Token optimization" is rule documentation telling the LLM to be terse. No actual measurement, no budget enforcement, no compression algorithm.
- **Not project-aware after init.** `scan` reads manifests once. The AI tool never re-runs scan during a session.

### Who it is actually for

- Developers who use Claude Code or Cursor and want a **shared starter pack** of AI rules across projects.
- Teams that want a **convention** for where AI-related markdown lives.
- Power users who already use Obsidian for engineering notes and want a structured vault layout.

### Who it is NOT for (yet)

- Beginners — value isn't visible without prior pain.
- Teams using only ChatGPT / web interfaces — adapters don't apply.
- Anyone expecting an autonomous agent — there is none.

### The real "aha moment"

> "Oh, I can stop pasting the same 'always check existing patterns' instructions into every new project. And the AI in tool A and tool B both read the same rules."

That's it. Cross-tool consistency + scaffolding. Not magic.

### What will confuse users

- **"Universal AI engineering runtime"** in the README implies runtime behavior. There isn't one. Rename or qualify.
- **`.omnix/` vs `.obsidian-ai-memory/`** — two config directories with overlapping purposes. New users won't know which is which.
- **17 agents** — sounds impressive, but they're just role definitions the AI may or may not honor. They don't run as separate processes.
- **"Memory loop is mandatory"** — there's no enforcement. The AI can ignore it. Saying "mandatory" misleads.

---

## 2. Reliability audit

| Issue | Severity | Why it matters | Fix | File(s) |
|---|---|---|---|---|
| Memory vault grows unbounded | 🔴 High | After 30+ sessions retrieval becomes slow and noisy | Auto-compress after 7 days (partially built); enforce a hard cap per folder | `apps/cli/src/commands/sync-memory.ts` |
| AI tools may silently ignore adapter rules | 🔴 High | Whole premise depends on the AI reading CLAUDE.md / .cursor/rules. No verification. | Add `omnix verify-adapter` that prints what the AI *should* know and lets user spot-check | NEW: `apps/cli/src/commands/verify.ts` |
| `parallel team mode` reads as fake swarm | 🟡 Medium | Misleads users into thinking multiple agents run | Rename to "multi-role review checklist"; remove "swarm" language | `packages/core/workflows/parallel-team-mode.md`, `swarm-coordination.md` |
| Token optimization is unmeasured | 🟡 Medium | Claims without numbers are hype | Either ship a real `omnix tokens` command that measures vault size, or rename to "context discipline rules" | `packages/core/standards/token-optimization.md` |
| 17 agents = noise | 🟡 Medium | The AI doesn't know which agent to "be" in any given moment. Most are unused. | Keep 6 core: architect, fullstack, security, qa, debugger, reviewer. Move the rest to `agents/specialized/` | `packages/core/agents/` |
| Session digest fatigue | 🔴 High | If every session must write a digest, users will stop. Most fixes are 5 minutes. | Auto-write a minimal digest from git diff + chat title; don't require manual fields | `apps/cli/src/commands/session-digest.ts` |
| File overwrite risk | 🟢 Low | Already protected by `--force`, prompts default to skip | Add `--diff` flag to show what changed before overwrite | `apps/cli/src/utils/copy-template.ts` |
| npm install/template path risk | 🟡 Medium | Templates resolved via `__dirname` walk-up — works in tests but brittle | Test with global npm install + npx + pnpm dlx on Windows/macOS/Linux | `apps/cli/src/utils/paths.ts` |
| Stale memory contradicts current code | 🔴 High | A 6-month-old "decision" in vault may contradict current state. AI may trust it. | Every memory file gets a `last-verified` date. Auto-flag entries > 90 days untouched. | NEW: `packages/skills/memory-curator/` |
| Hallucinated context | 🟡 Medium | AI may invent files that *should* exist based on adapter rules | Mitigated by retrieve-context — but only if AI calls it. Document explicit retrieval check in CLAUDE.md | `apps/cli/templates/adapters/claude/CLAUDE.md` |
| Scraping low-quality docs | 🟢 Low | Spec only; no actual scraping yet. Safe. | Keep marked SPEC until real implementation | `packages/core/skills/web-scraping/SKILL.md` |
| MCP server access (security) | 🔴 High | If user installs Omnix MCP servers in future, filesystem access = breach surface | Define MCP permission boundary spec NOW even if no MCP servers yet | NEW: `docs/security/mcp-permissions.md` |
| Secrets in session digests | 🔴 High | "Commands run" field can contain API keys from terminal history | Sanitization pass before write | NEW: skill `memory-curator` |
| Filesystem command suggestions (rm -rf etc.) | 🟡 Medium | AI may suggest destructive commands in vault as "recovery procedure" | Add explicit "no destructive commands in markdown" rule | `packages/core/standards/agent-hardening.md` |
| Adapter format drift | 🔴 High | Cursor's `.mdc` format changes; Cline's filename changes. Templates go stale. | Add CI check that fetches current adapter format spec quarterly | `.github/workflows/` (FUTURE) |

---

## 3. Skill/Plugin gap analysis

Current state: 7 core skills + 3 design skills = 10 skill markdown files. None has runtime behavior — they're documents the AI is expected to read.

Missing skills with concrete justification:

### Context Manager (P0)
- **Purpose**: Decide what memory to load before the AI acts.
- **Why it matters**: Already exists conceptually in `context-engineering.md` but no actionable artifact — just rules.
- **Activates**: Every session start.
- **Inputs**: Task description, vault state.
- **Outputs**: A "context pack" — flat list of file paths + summaries to load.
- **Reads**: project-context, active-goals, error-memory, anti-patterns, recent sessions.
- **Writes**: nothing during retrieval; logs retrieval decision in digest.
- **Failure modes**: Returns too many files (over budget), returns stale files.
- **Priority**: P0.

### Token Optimizer (P1)
- **Purpose**: Measure vault size, compress oversized files, prune dead content.
- **Why it matters**: Vault grows unbounded today. No tooling addresses this.
- **Activates**: On `omnix sync-memory --optimize` or weekly cron.
- **Inputs**: Vault path, budget config.
- **Outputs**: Size report, list of files to compress/archive.
- **Reads**: All vault files.
- **Writes**: Compressed summaries, archives stale files.
- **Failure modes**: Compresses something user wanted intact.
- **Priority**: P1.

### Memory Curator (P0)
- **Purpose**: Sanitize secrets, deduplicate entries, mark stale entries, resolve conflicts.
- **Why it matters**: Without this, vault becomes a garbage pile of contradictions and possibly secrets.
- **Activates**: On `omnix sync-memory --curate` or pre-commit hook.
- **Inputs**: Vault path.
- **Outputs**: Sanitization report + curated files.
- **Reads**: All vault files.
- **Writes**: Updates files in place, archives duplicates.
- **Failure modes**: Misses a secret pattern, removes a genuine entry.
- **Priority**: P0.

### Repo Scanner (P1)
- **Purpose**: Beyond stack detection — analyze code organization, identify hot paths, count files per module.
- **Why it matters**: `scan` only detects manifests. Real onboarding needs the AI to know the *shape* of the codebase.
- **Activates**: `omnix scan --deep`.
- **Inputs**: Project root.
- **Outputs**: Module map, top 20 files by churn, entry points, test coverage by area.
- **Reads**: Filesystem, git log.
- **Writes**: `05-ARCHITECTURE/module-map.md`.
- **Failure modes**: Slow on huge repos.
- **Priority**: P1.

### Error Intelligence (P1)
- **Purpose**: Match new errors against known errors in `error-memory.md`, find similar past fixes.
- **Why it matters**: The whole point of error memory is to avoid re-debugging. Today there's no matcher.
- **Activates**: When user pastes an error, or `omnix error <text>`.
- **Inputs**: Error message/stack.
- **Outputs**: Top 3 similar past errors with their fixes.
- **Reads**: `03-ERRORS/error-memory.md`, `03-ERRORS/anti-patterns.md`.
- **Writes**: New entry if no match.
- **Failure modes**: False positive matches.
- **Priority**: P1.

### Dependency Doctor (P2)
- **Purpose**: Audit `package.json` / `pyproject.toml` for outdated, vulnerable, redundant deps.
- **Why it matters**: AI agents often suggest adding libraries; we need a record of what to use.
- **Activates**: `omnix deps audit`.
- **Inputs**: Manifest files.
- **Outputs**: List of issues + recommendations.
- **Reads**: Manifest files, lockfiles.
- **Writes**: nothing automatically; produces a report.
- **Failure modes**: Wrong advisory data (offline).
- **Priority**: P2.

### Test Architect (P1)
- **Purpose**: Generate test scaffolds matching project conventions; identify coverage gaps.
- **Why it matters**: One of the most-used AI tasks. Today it's just a markdown rule.
- **Activates**: User requests "add tests for X".
- **Inputs**: File to test, existing test patterns.
- **Outputs**: Test file scaffold + missing-case checklist.
- **Reads**: Existing tests for pattern, `04-DECISIONS/` for test strategy.
- **Writes**: nothing (AI uses the scaffold).
- **Priority**: P1.

### API Contract Reviewer (P2)
- **Purpose**: Detect breaking changes vs prior OpenAPI/tRPC schema.
- **Why it matters**: Breaking change without bump = production bug.
- **Activates**: PR touching `openapi.*` or router files.
- **Inputs**: Current + previous schema.
- **Outputs**: Diff report classified as breaking / non-breaking.
- **Reads**: Schema files, git history.
- **Writes**: nothing automatically.
- **Priority**: P2.

### Database Migration Guard (P1)
- **Purpose**: Statically check migrations for unsafe operations on large tables.
- **Why it matters**: One bad migration = downtime.
- **Activates**: Migration file created/modified.
- **Inputs**: Migration SQL or ORM migration.
- **Outputs**: Risk classification + suggested safer form.
- **Reads**: Schema, existing migrations.
- **Writes**: nothing.
- **Priority**: P1.

### Security Threat Modeler (P2)
- **Purpose**: Apply STRIDE to a feature description, surface threats.
- **Why it matters**: Security-by-checklist beats security-by-vibes.
- **Activates**: Feature design / architecture discussion.
- **Inputs**: Feature description.
- **Outputs**: Threat list + mitigations.
- **Reads**: `03-ERRORS/anti-patterns.md` (security area).
- **Writes**: ADR if architectural threat identified.
- **Priority**: P2.

### Release Manager (P2)
- **Purpose**: Coordinate version bumps, changelog entries, tag creation, release notes.
- **Why it matters**: Every project does this differently and badly.
- **Activates**: `omnix release` or PR merged to main.
- **Inputs**: Commits since last release.
- **Outputs**: Changelog entry draft + version bump suggestion.
- **Reads**: git log, CHANGELOG.md.
- **Writes**: CHANGELOG.md update.
- **Priority**: P2.

### Docs Maintainer (P2)
- **Purpose**: Find drift between code and docs; flag stale docs.
- **Why it matters**: Docs rot is invisible until users complain.
- **Activates**: PR includes code change without doc change.
- **Inputs**: Diff, doc files.
- **Outputs**: List of docs that may need updates.
- **Priority**: P2.

### Browser Automation Specialist (P3)
- **Purpose**: Wraps dev-browser-style Playwright sessions.
- **Status**: SPEC ONLY today.
- **Priority**: P3.

### External Research Specialist (P2)
- **Purpose**: Fetch and summarize docs/changelogs from authoritative sources, cache in vault.
- **Status**: SPEC ONLY today.
- **Priority**: P2.

### Prompt/Instruction Linter (P1)
- **Purpose**: Lint CLAUDE.md / AGENTS.md for known anti-patterns ("you are an expert", contradictions, length).
- **Why it matters**: AI rule files rot fast. Linter catches it.
- **Activates**: `omnix lint adapters` or pre-commit.
- **Inputs**: Adapter files.
- **Outputs**: Issues list.
- **Priority**: P1.

### Adapter Compatibility Tester (P1)
- **Purpose**: Verify each adapter file's syntax is current for that tool.
- **Why it matters**: Cursor format changes. Cline filenames change. We need to know when our templates break.
- **Activates**: CI weekly.
- **Inputs**: Adapter file + upstream spec.
- **Outputs**: Compatibility report.
- **Priority**: P1.

### Project Onboarder (P0)
- **Purpose**: First-run experience that produces a usable project-context.md.
- **Why it matters**: Today, init writes a template with empty fields. The AI has nothing real to read.
- **Activates**: `omnix init` first-run, or `omnix onboard`.
- **Inputs**: Project state + 3-5 interactive questions.
- **Outputs**: Populated `project-context.md`, `active-goals.md`.
- **Priority**: P0.

---

## 4. Adapter reality check

| Adapter | Reliability | Reality | Recommendation |
|---|---|---|---|
| Claude Code | 🟢 Likely reliable | `CLAUDE.md` is officially supported; Claude reads it | Keep as primary. Note that user-level `~/.claude/CLAUDE.md` takes precedence. |
| Cursor | 🟢 Likely reliable | `.cursor/rules/*.mdc` is the current official format | Keep, but warn that format has changed twice in 12 months. Mark `alwaysApply: true` files as such. |
| Generic (`AGENTS.md`) | 🟢 Reliable | Many tools now read AGENTS.md as a convention | Promote this as the **primary** target. Tool-specific files should be thin pointers. |
| Aider | 🟡 Speculative | `CONVENTIONS.md` works if user runs `aider --read CONVENTIONS.md` or sets it in `.aider.conf.yml`. Not automatic. | Mark as TEMPLATE. Document the manual setup step in install output. |
| Windsurf | 🟡 Speculative | Format is `.windsurfrules` per current docs but undocumented details | Mark as TEMPLATE. Verify against current Windsurf docs in CI. |
| Cline | 🟡 Speculative | `.clinerules` was the format but Cline keeps changing this | Mark as TEMPLATE with date stamp. Verify quarterly. |
| Roo Code | 🟡 Speculative | Fork of Cline. Same caveats. | Mark as TEMPLATE. |
| Continue | 🟡 Speculative | Continue uses `config.json/yaml/ts` — not a markdown file. Our `config.md` is documentation only. | Rename to `continue-system-message.md`. Make clear it's content to paste, not a config file. |
| OpenHands | 🟡 Speculative | OpenHands uses `.openhands/microagents/` structure | Verify path. Mark as TEMPLATE until verified. |

**Recommendation**: Make `AGENTS.md` the source of truth. Every tool-specific adapter is a 20-line pointer:

```markdown
# Cursor adapter — Omnix
This project follows AGENTS.md. Cursor-specific globs and triggers below.
See AGENTS.md for all rules.
```

No duplication. Currently rules are duplicated across adapters → drift risk.

---

## 5. Obsidian memory architecture audit

### Current design

11 folders (`00-INBOX` through `10-DAILY-DIGESTS`) + 9 templates. Comprehensive but heavy.

### Problems

- **Too many folders for a starter vault.** A new user sees 11 folders and freezes. Most will only use 3.
- **No memory lifecycle.** All memory is treated as "active." Nothing moves to cold storage.
- **Every-session digest is unrealistic.** A 30-second fix doesn't deserve a digest. Users will resent it.
- **No conflict resolution.** Two sessions can write contradictory decisions; no surfacing.
- **No index files.** Retrieving relevant memory means reading whole files. Should be: index of one-liners → load full entry only if needed.
- **Human-readable vs AI-readable not separated.** AI wants compact bullet lists; humans want prose. Today they share files.

### Recommended lifecycle

```
hot (active)        — last 7 days; project-context, active-goals, current-state, recent sessions
warm (referenceable) — 7-30 days; recent decisions, recent errors
cold (archived)      — 30+ days; weekly summaries replace raw sessions
indexed              — one-liner indexes for fast lookup (error index, decision index)
```

### Concrete recommendations

1. **Reduce default vault to 5 folders** for new users: `INBOX`, `SESSIONS`, `PROJECT`, `ERRORS`, `ARCHIVE`. Add more as needed.
2. **Generate index files** (`03-ERRORS/INDEX.md`, `04-DECISIONS/INDEX.md`) — one line per entry. AI loads index first, full entry on demand.
3. **`active-context.md`** — single file that lives in `02-PROJECTS/`, updated every session. The *only* file an AI loads at session start to know "where things stand right now."
4. **Auto-archive sessions > 7 days** with a weekly summary file.
5. **Mark conflicts**: when two decisions disagree, surface them with `⚠ CONFLICT` markers. Don't silently overwrite.
6. **Date stamps everywhere**: every entry has `last-verified: YYYY-MM-DD`. Anything > 90 days stale gets re-verification before AI trusts it.

---

## 6. Token optimization audit

### Current state (honest)

`packages/core/standards/token-optimization.md` is **prose advice**, not enforced behavior. It tells the LLM "prefer summaries over raw files." There is no measurement, no budget enforcement, no compression schedule.

### Gaps

| Gap | Impact |
|---|---|
| No concrete token budgets per task | AI can't comply with what it can't measure |
| No retrieval scoring algorithm | `retrieve-context` does keyword frequency only |
| No memory compression schedule | Sessions never auto-compress |
| No context-pack format | Each retrieval is ad-hoc |
| No cache/invalidation strategy | Same file may be loaded multiple times |
| No "minimum context needed" rule | AI loads everything to be safe |
| No active context pruning | Once loaded, stays loaded |

### Recommended concrete artifacts

- **`context-pack.md`** template — a fixed format for "here is what to load for task X"
- **`retrieval-policy.md`** standard — which files to load when, in priority order
- **`token-budget.md`** standard — concrete numbers per retrieval mode
- **`memory-compression.md`** workflow — schedule + algorithm
- **`active-context.md`** template — the single living "what's the current state" file

These exist as recommendations now; they will be created in Part 4 of this audit.

---

## 7. CLI / npm audit

### What works (verified)

- `pnpm build` → 426 KB CJS bundle, clean.
- `pnpm typecheck` → 0 errors.
- `pnpm test` → 50/50 passing.
- `npm pack --dry-run` → 58 files, 254 KB. Templates present.
- `bin/omnix.js` has shebang and works on Windows.
- Three bin aliases work: `omnix`, `create-omnix`, plus the entry script.

### What's broken or risky

| Issue | Severity | Fix |
|---|---|---|
| Package name `omnix` not verified available on npm | 🔴 Block | Run `npm view omnix` before claiming. Fallback name needed. |
| `author`, `repository.url`, `homepage`, `bugs.url` still `TODO` in `apps/cli/package.json` | 🔴 Block | Fill before publish. |
| No `LICENSE` file at root (only `LICENSE_NOTES.md`) | 🔴 Block | Add MIT LICENSE. |
| Windows path test on `paths.ts` only run in our test env — not against actual `npx omnix init` from a global install | 🟡 Medium | Add e2e test that runs the published tarball |
| `omnix update` writes settings.json without merging user customizations carefully | 🟡 Medium | Currently uses key-add-only merge — verify in tests |
| No semantic versioning policy documented | 🟢 Low | Document in `RELEASE_CHECKLIST.md` |
| Monorepo publish strategy unclear | 🟡 Medium | Only `apps/cli` is published. Make this explicit. |
| `npm pack` output size 254 KB — bundled commander/fs-extra adds 380 KB to dist/index.js | 🟢 Low | Acceptable, but consider externalizing in v0.2 |

---

## 8. Security audit

| Risk | Severity | Mitigation |
|---|---|---|
| Session digests can leak secrets via "Commands Run" field | 🔴 High | Sanitization pass: redact patterns matching API keys, tokens, .env values |
| Obsidian vault committed to git may leak project intelligence | 🟡 Medium | Document in QUICKSTART — recommend vault be gitignored OR sanitized |
| `omnix init` writes to `process.cwd()` — could be wrong dir if run from monorepo subdir | 🟡 Medium | Already mitigated by confirmation prompts; add `--cwd` flag |
| MCP/filesystem access (future) | 🔴 High preemptive | Write MCP permission boundary spec before adding any MCP server integration |
| Scraping skill could fetch from malicious URLs | 🟢 Low (no impl yet) | Mark SPEC, require allowlist when implemented |
| AI suggests destructive commands in session-digest | 🟡 Medium | Add rule: digests never contain executable command strings, only descriptions |
| Adapter templates have no integrity check | 🟢 Low | If `omnix init` ever runs over the network, verify checksum. Today it's bundled. |
| Default `.gitignore` doesn't include `.omnix/memory/` or session-scoped state | 🔴 High | Auto-add to project `.gitignore` during init |

### Recommended `.gitignore` additions (auto-add by init)

```
# Omnix runtime cache
.omnix/memory/
.omnix/cache/

# Vault — uncomment if you want vault private
# .obsidian-ai-memory/
```

### Memory sanitization rules (MUST implement)

- Regex redaction of: API keys (sk-, ghp_, AKIA, etc.), JWTs, .env values, password fields.
- Refuse to write digests containing > N lines from terminal output (likely paste of sensitive data).
- Optional: encrypt sensitive vault folders at rest via `omnix vault encrypt`.

---

## 9. Developer experience audit

### Install flow (today)

```
npx omnix init
→ 3 interactive questions
→ Creates 30+ files
→ Prints "Done. Next steps: omnix scan, omnix doctor..."
```

**Problem**: User created 30 files but doesn't know which 3 actually matter. No demo. No "open this file first."

### First-run experience score: 4/10

Reasons:
- No `omnix demo` to show value before commitment.
- Init creates too many empty template files. New user can't tell what to fill.
- Next steps list is generic, not personalized to their stack.
- No explanation of why CLAUDE.md exists vs AGENTS.md vs AI_RULES.md (overlap).

### Docs clarity score: 6/10

- README is 8 KB — too long for first-impression.
- ROADMAP, QUICKSTART, PUBLISHING, RELEASE_CHECKLIST all at root — cluttered.
- No "I have 60 seconds, what is this?" section.

### Recommended fixes

- **`omnix demo`** command: runs init in a temp dir, shows what would be installed in your project, then prints "If this looks useful, run `omnix init`."
- **`omnix explain <file>`**: AI-tool-friendly explanation of any installed file. E.g. `omnix explain CLAUDE.md` → "This file is read by Claude Code at session start. It contains..."
- **Simplified `omnix init`**: 1 question only ("Which AI tool? [Claude/Cursor/Both/Other]"). Everything else inferred.
- **README rewrite**: 60-second pitch at top. Move details to QUICKSTART.
- **Move root `.md` files to `docs/`**: only README.md, LICENSE, CHANGELOG at root.
- **Sample project**: `examples/fullstack-saas/` should be a real cloneable starter, not an empty README.

---

## 10. OSS readiness audit

| File | Present | Recommendation |
|---|---|---|
| `README.md` | ✅ | Trim to under 200 lines |
| `LICENSE` | ❌ | **BLOCKS RELEASE** — Add MIT |
| `CHANGELOG.md` | ✅ | Good |
| `CONTRIBUTING.md` | ❌ | Add minimal version |
| `CODE_OF_CONDUCT.md` | ❌ | Add Contributor Covenant 2.1 |
| `SECURITY.md` | ❌ | Add basic disclosure policy |
| `.github/ISSUE_TEMPLATE/` | ❌ | Add bug + feature templates |
| `.github/PULL_REQUEST_TEMPLATE.md` | ❌ | Add minimal version |
| `.github/workflows/publish-dry-run.yml` | ✅ | Verify it passes |
| `.github/workflows/release.yml` | ✅ | Verify on actual release |
| `ROADMAP.md` | ✅ | Update to match this audit's improvement plan |
| `PUBLISHING.md` | ✅ | Good |
| `RELEASE_CHECKLIST.md` | ✅ | Good |

### Versioning

- Currently 0.1.0 — appropriate for pre-release.
- Document semantic versioning policy in CHANGELOG.
- Major version bumps for: template path changes, settings.json schema changes, vault folder structure changes.

---

## Summary table

| Area | Score | Notes |
|---|---|---|
| Product clarity | 5/10 | Real value is narrower than marketed |
| Reliability | 5/10 | Memory lifecycle missing; AI compliance not verifiable |
| Skill coverage | 4/10 | 10 skill docs, 0 with runtime behavior |
| Adapter reality | 6/10 | 2 reliable, 7 speculative |
| Memory architecture | 6/10 | Comprehensive but heavy |
| Token optimization | 3/10 | Mostly prose, no enforcement |
| CLI / npm | 8/10 | Solid build, missing LICENSE + metadata |
| Security | 5/10 | Right concerns identified, mitigations missing |
| Developer experience | 5/10 | Install works, value unclear in first 2 minutes |
| OSS readiness | 5/10 | Half the standard files present |

**Overall maturity: pre-MVP. Functional CLI, comprehensive specs, gaps in enforcement and DX.**

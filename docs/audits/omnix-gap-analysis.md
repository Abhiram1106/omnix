# Omnix — Gap Analysis
> Phase 2. Brutal internal audit. Every real gap documented with root cause + fix path.

---

## G-01: Context retrieval scoring is shallow keyword matching

**Severity:** High  
**Why it matters:** The core premise of Omnix is memory-first AI. If retrieval returns wrong files, the AI builds on incorrect context — worse than no context.  
**Root cause:** `retrieve-context.ts` uses regex-based frontmatter parsing + keyword frequency matching. No semantic understanding, no position-aware ranking, no attention mechanics.  
**Current behavior:** `omnix retrieve-context --task "fix auth bug"` matches files containing "auth" by frequency. Returns architecture docs when error logs would be more useful. Misses synonyms. No relevance ordering.  
**Recommended fix:** Implement progressive disclosure retrieval: (1) load file index always, (2) load summaries for candidate files, (3) load full content only for top-N. Add task-type-aware priority rules (debug → error memory first; feature → project context first).  
**Better implementation:** Agent-Skills-for-Context-Engineering `context-fundamentals/SKILL.md` — position-aware placement, U-shaped attention, progressive disclosure with explicit budget allocation.  
**Exact files to study:** `Agent-Skills-for-Context-Engineering/skills/context-fundamentals/SKILL.md`, `skills/context-compression/SKILL.md`  
**Implementation strategy:** Rewrite `retrieve-context.ts` with a 5-tier priority system (active goals → task-type-specific files → recent sessions → errors → architecture). Add explicit token budget enforcement (minimal: 500 tokens, balanced: 1500, deep: 3000).

---

## G-02: No token budget enforcement anywhere

**Severity:** High  
**Why it matters:** Omnix claims token optimization but has zero measurement, zero budget enforcement, zero compression algorithm. It's prose rules, not behavior.  
**Root cause:** `packages/core/standards/token-optimization.md` lists rules like "be terse" but no CLI command measures vault size, no budget is enforced at retrieval time, no compaction is triggered at thresholds.  
**Current behavior:** A vault with 500 session digests and 2MB of content gets loaded the same way as a fresh vault. No warning. No compaction. AI context window degrades silently.  
**Recommended fix:** (1) `omnix sync-memory --stats` already added — good start. (2) Add vault size warning at 50 files / 500KB. (3) Add token budget to retrieval: count estimated tokens of selected files, stop at budget. (4) Add per-mode budgets (minimal: 500 tokens of context, balanced: 1500, deep: 3000).  
**Better implementation:** Agent-Skills-for-Context-Engineering: "60–70% effective capacity", "70–80% trigger compaction". Prompt-master: "every word must change the output."  
**Exact files to study:** `Agent-Skills-for-Context-Engineering/skills/context-compression/SKILL.md`  
**Implementation strategy:** Add `estimateTokens(text: string): number` util (chars/4 heuristic). Enforce per-mode budget in `retrieve-context.ts`. Warn when vault exceeds 100 files.

---

## G-03: Session digest fatigue will kill adoption

**Severity:** High  
**Why it matters:** Mandating a digest after every session causes abandonment within 1–2 weeks. Every AI productivity tool that mandates overhead loses. The memory loop only works if it's actually used.  
**Root cause:** AGENTS.md originally said "every AI interaction must end with a digest." Even after the fix (changed to "write when meaningful"), the digest format has 17 fields — too many for a quick session.  
**Current behavior:** `omnix session-digest` produces a blank 17-field template. `--auto` mode uses git diff and is a good start. But there's no "minimal" mode (just 3 fields: what changed, what broke, what's next).  
**Recommended fix:** Add `--minimal` mode (3 fields only: files-changed, fixed-errors, next-step). Make `--auto` the default for sessions under 30 minutes. Reserve full 17-field digest for major sessions.  
**Better implementation:** gstack `/retro` skill — brief, consistent retrospective that takes under 2 minutes.  
**Exact files to study:** `gstack/` retro skill structure  
**Implementation strategy:** Add `SessionDigestMode: "minimal" | "standard" | "full"`. Minimal = 3 fields from git diff. Auto-select based on files-changed count.

---

## G-04: Vault grows unbounded with no intelligent archival

**Severity:** High  
**Why it matters:** After 30–90 days of active use, `01-SESSIONS/` has 100+ files. Retrieval degrades. Obsidian graph view becomes noise. `--prune` and `--compress` exist but are untested on real-world vault growth.  
**Root cause:** Compression logic (`compressSessions`) exists but is opt-in with no auto-trigger. Prune logic exists but threshold is manual. No lifecycle management.  
**Current behavior:** Sessions accumulate indefinitely. `--compress` is flagged as EXPERIMENTAL. `--prune` is untested. No auto-trigger on vault size.  
**Recommended fix:** Add auto-compress trigger: when `01-SESSIONS/` exceeds 30 date directories, auto-compress oldest 50% to weekly summaries. Add lifecycle states: hot (< 7 days), warm (7–30), cold (30–90), archive (> 90). Only hot/warm loaded by default retrieval.  
**Better implementation:** Agent-Skills-for-Context-Engineering `memory-systems/SKILL.md` — memory bank with lightweight identifiers, hot/warm/cold/archive lifecycle.  
**Implementation strategy:** Add `VaultLifecycle` class. Auto-trigger at 30 dirs. Compress to weekly summaries. Archive > 90 days to `10-DAILY-DIGESTS/archive/`. Keep index of archived sessions for search.

---

## G-05: Stale vault entries silently override current code

**Severity:** High  
**Why it matters:** A 6-month-old decision in `04-DECISIONS/` may contradict current code. The AI trusts it. No last-verified timestamp. No staleness signal. This is a silent correctness failure.  
**Root cause:** Vault templates don't include `last-verified` or `status` fields. `omnix verify` doesn't check vault entry freshness. No mechanism to flag entries that conflict with current code state.  
**Current behavior:** `project-context.md` is written at `omnix init` time and never auto-updated unless user runs `omnix scan --write`. Error entries have no expiry. Decisions have no review dates.  
**Recommended fix:** Add `last-verified: YYYY-MM-DD` and `status: active|stale|superseded` fields to all vault templates. `omnix sync-memory` should flag entries > 90 days old as potentially stale. Add `omnix verify --vault-freshness` check.  
**Implementation strategy:** Update vault templates. Add staleness check in `sync-memory.ts`. Emit warning when AI retrieves entries > 90 days old.

---

## G-06: Speculative adapters (6 of 9) are untested templates

**Severity:** High  
**Why it matters:** Windsurf, Cline, Roo, Continue, Aider, OpenHands adapters are templates that may not match current tool specs. Users who install them may find they don't work — or worse, silently fail without knowing.  
**Root cause:** Adapters were written based on docs-at-time without ongoing verification. No CI check. No last-verified date. File paths may have changed in the actual tools.  
**Current behavior:** All 6 now have `Status: TEMPLATE` labels (fixed). But there's no mechanism to verify them, no CI test, no community reporting channel.  
**Recommended fix:** Add `last-verified` date to each speculative adapter header. Add `omnix verify --adapters` check that tests each adapter's file path against known current paths. Add GitHub issue template specifically for "adapter path broken."  
**Better implementation:** open-design — each adapter has explicit version + docs-url so users can self-verify.  
**Implementation strategy:** Add adapter metadata file per speculative adapter. CI runs quarterly verification check (just a GitHub Action that warns when the adapter hasn't been verified in > 90 days).

---

## G-07: Rule duplication across adapters — AGENTS.md not enforced as source of truth

**Severity:** Medium  
**Why it matters:** Memory loop rules exist in AGENTS.md, CLAUDE.md, cursor/project-rules.mdc, and `ai-collaboration.md`. When one changes, others drift. Drift = AI tools following conflicting instructions.  
**Root cause:** Each adapter was hand-written with a copy of the rules instead of referencing a canonical source. Claude can read `@AGENTS.md` imports via CLAUDE.md, but this isn't implemented.  
**Current behavior:** 6 speculative adapters are now thin pointers (fixed). But CLAUDE.md still contains its own memory loop section instead of importing from AGENTS.md. Cursor rules still have partial duplication.  
**Recommended fix:** CLAUDE.md should have: `@AGENTS.md` import at top, then only Claude Code-specific settings. Cursor rules: project-rules.mdc should be 1 line pointing to AGENTS.md + Cursor syntax note. All rule logic lives in AGENTS.md only.  
**Implementation strategy:** Update CLAUDE.md template to use `@AGENTS.md` import. Update cursor/project-rules.mdc to reference only.

---

## G-08: No error intelligence — error memory is write-only

**Severity:** Medium  
**Why it matters:** Error memory exists (`03-ERRORS/error-memory.md`) but there's no tool to match a new error against past fixes. User sees the same error again and has to manually search the vault.  
**Root cause:** `error-memory.md` is a markdown file. No index. No search. No similarity matching. No CLI command to query it.  
**Current behavior:** `omnix session-digest` writes errors to the vault. Nothing reads them back in a structured way. `omnix retrieve-context` might surface them if the keywords match.  
**Recommended fix:** Add `omnix error-match <error-text>` command that searches error-memory.md for similar past errors + returns the fix applied. Add similarity matching (BM25 or simple term frequency).  
**Better implementation:** gstack `/investigate` skill — explicitly searches past error patterns before diagnosing.  
**Implementation strategy:** Add `errorMatch(errorText: string): ErrorEntry[]` to `retrieve-context.ts`. Use term frequency on error descriptions. Return top 3 matches with their fixes.

---

## G-09: Repo scanner is surface-level (stack detection only)

**Severity:** Medium  
**Why it matters:** Omnix claims to understand repositories. Currently it detects framework/language via manifest files. It doesn't understand module structure, hot files, coupling, code quality, or architectural risks.  
**Root cause:** `scan.ts` checks for presence of config files (package.json, requirements.txt, Dockerfile, etc.) and infers frameworks. No actual code analysis.  
**Current behavior:** `omnix scan` outputs: detected stack, vault health, adapter status. Nothing about code organization, complexity, or coupling.  
**Recommended fix:** Add code intelligence layer: detect entry points, find largest files (hotspots), detect monorepo sub-packages, identify test gaps (src files without corresponding test files), flag circular imports.  
**Better implementation:** gstack `/investigate` — deep codebase analysis before any changes; everything-claude-code `/repo-scan` skill.  
**Implementation strategy:** Add `scanCodeStructure(cwd: string)` to scan.ts. Count files per directory, find entry points (main/index files), detect test gap ratio.

---

## G-10: Skill system has no activation mechanism

**Severity:** Medium  
**Why it matters:** 10 skill specs exist as markdown. No mechanism for an AI tool to know *when* to activate a skill or *how* to load it on demand. Skills are documents the user manually invokes, not an activation system.  
**Root cause:** Skills are SKILL.md files with frontmatter. There's no harness integration that scans SKILL.md files and activates them based on triggers. No `omnix skills activate <name>` command.  
**Current behavior:** `omnix skills --filter debugging` lists skills. User then manually copies the skill path into their AI tool. Nothing is automatic.  
**Recommended fix:** Implement skill activation via CLAUDE.md import. When Claude Code starts, it reads CLAUDE.md which imports active skills via `@packages/core/skills/debugging/SKILL.md`. User activates by uncommenting.  
**Better implementation:** everything-claude-code: skills directory is auto-scanned by the harness. Plugin manifest lists available skills. Progressive disclosure: harness loads skill names, activates content on demand.  
**Implementation strategy:** Update CLAUDE.md template to include `@skills` import section. Add `omnix skills activate <name>` that adds skill to CLAUDE.md imports. Skills auto-loaded on session start.

---

## G-11: First-run experience: too many files, value invisible

**Severity:** High  
**Why it matters:** `omnix init` creates vault directories + templates + adapter files + .omnix runtime dir. User opens the project and sees 20+ files/folders. The immediate reaction is "what is all this?" — not "this is useful."  
**Root cause:** Init tries to be comprehensive upfront. Every vault folder gets created. Every .omnix subdirectory gets created. All templates get copied.  
**Current behavior (after recent fix):** Still creates all 11 vault folders + templates dir + .omnix (5 subdirs) + adapter files. Minimum ~20 new entries for a fresh project.  
**Recommended fix:** Minimal init: create only (1) .obsidian-ai-memory/ with 02-PROJECTS/project-context.md, 03-ERRORS/error-memory.md, and templates/, (2) one adapter file (the one the user actually chose), (3) .omnix/settings/omnix.json. Total: ~6 files. Opt-in for full structure via `--full` flag.  
**Better implementation:** gstack — only creates what's needed for the current sprint, nothing more.  
**Implementation strategy:** Add `--minimal` flag to init (default). `--full` creates everything. Minimal creates: vault/02-PROJECTS/project-context.md, vault/03-ERRORS/error-memory.md, vault/templates/, chosen adapter only, .omnix/settings/omnix.json.

---

## G-12: CLI description still oversells ("orchestration system")

**Severity:** Medium  
**Why it matters:** `package.json` description was fixed to "scaffolding + convention system" but CLI banner still says "AI engineering scaffolding: adapters, memory vault, agents, and conventions" which is good, but `team-plan` description still implies something it isn't.  
**Root cause:** Multiple places had "runtime/orchestration" language; not all caught in the rename.  
**Recommended fix:** Audit all user-facing strings for execution claims. Be consistent: "scaffolding," "conventions," "prompts," "templates."

---

## G-13: No plugin/skill versioning or deprecation system

**Severity:** Medium  
**Why it matters:** As Omnix evolves, skills will be updated. Users who installed Omnix 3 months ago won't know their skills are outdated. No version field in SKILL.md frontmatter. No deprecation path.  
**Root cause:** SKILL.md frontmatter has `name` and `description` but no `version`, `status`, `deprecated`, `replaces` fields.  
**Recommended fix:** Add `version`, `status` (stable/experimental/deprecated), and `replaces` to SKILL.md schema. `omnix update` should diff skill versions and warn on breaking changes.  
**Implementation strategy:** Update skill frontmatter schema. Add version comparison in `update.ts`.

---

## G-14: No testing for memory operations at scale

**Severity:** Medium  
**Why it matters:** Core claim is memory-first AI. But tests don't cover: vault growth beyond 30 sessions, compression correctness, retrieval relevance quality, staleness detection.  
**Root cause:** Tests focus on CLI commands and routing logic. Memory system tests are shallow (write one digest, read it back). No simulation of 100-session vault.  
**Recommended fix:** Add `tests/memory-scale.test.ts` that creates 50+ session digests and tests: compression produces correct summaries, retrieval returns relevant files, prune correctly archives old sessions, stats are accurate.

---

## G-15: No observability — nothing to measure if Omnix is working

**Severity:** Medium  
**Why it matters:** "Is Omnix actually helping?" — currently unanswerable. No metrics, no session quality scores, no measurement of whether the AI followed the conventions.  
**Root cause:** Omnix writes files. There's no telemetry, no quality scoring, no way to know if the digest was useful or the error memory was consulted.  
**Recommended fix:** Add `omnix stats` command: session count per week, vault growth rate, most-retrieved files, adapter health. Local only, no external telemetry.  
**Implementation strategy:** Add lightweight SQLite-based local stats tracking. `omnix stats` reads and displays. No external services.

---

## Gap Severity Matrix

| ID | Issue | Severity | Effort | Priority |
|----|-------|----------|--------|----------|
| G-01 | Retrieval scoring shallow | High | Medium | P0 |
| G-02 | No token budget enforcement | High | Medium | P0 |
| G-03 | Digest fatigue | High | Low | P0 |
| G-04 | Vault grows unbounded | High | Medium | P0 |
| G-05 | Stale vault entries | High | Low | P1 |
| G-06 | Speculative adapters untested | High | Low | P1 |
| G-07 | Rule duplication in adapters | Medium | Low | P1 |
| G-08 | Error memory write-only | Medium | Medium | P1 |
| G-09 | Repo scanner surface-level | Medium | High | P2 |
| G-10 | No skill activation mechanism | Medium | Medium | P1 |
| G-11 | First-run too many files | High | Low | P0 |
| G-12 | CLI still oversells | Medium | Low | P1 |
| G-13 | No skill versioning | Medium | Low | P2 |
| G-14 | Memory tests shallow | Medium | Medium | P2 |
| G-15 | No observability | Medium | High | P2 |

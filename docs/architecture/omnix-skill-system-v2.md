# Omnix Skill System v2
> Phase 4. Complete redesign of the skill architecture based on deep audit of 14 reference repos.
> Ground truth sources: everything-claude-code, Agent-Skills-for-Context-Engineering, gstack, prompt-master, open-design.

---

## What a Proper Omnix Skill Must Be

A skill is a **self-contained unit of AI engineering intelligence** that:
1. Activates based on explicit triggers (not "use whenever")
2. Declares what it reads from the vault (memory_reads)
3. Declares what it writes to the vault (memory_writes)
4. Has an explicit token budget (doesn't blow up context)
5. Verifies its own output (verification_required)
6. Chains with other skills via requires/produces contracts
7. Has a lifecycle (stable/experimental/deprecated)
8. Has version history (so users can upgrade safely)

A skill is **NOT**:
- A giant markdown dump to read start-to-finish
- A vague "use this skill when things go wrong" guide
- A copy of the standards file renamed as a skill
- A skill without actionable triggers
- A skill that reads the whole vault

---

## SKILL.md v2 Schema

```yaml
---
# Required fields
name: skill-name-kebab-case
version: 1.0.0
status: stable | experimental | deprecated
description: One sentence. What this skill does. Not marketing.

# Activation
triggers:
  - "exact phrase or pattern that activates this skill"
  - "another trigger"
auto_activate: false  # If true, always included in context

# Skill chain contracts
requires: []           # List of skill names that must run before this
produces: []           # What this skill writes to vault or returns

# Memory policy
memory_reads:
  - path: 02-PROJECTS/project-context.md
    priority: high
  - path: 03-ERRORS/error-memory.md
    priority: medium
memory_writes:
  - path: 03-ERRORS/error-memory.md
    condition: "when a bug was fixed"
  - path: 07-LESSONS/debugging-lessons.md
    condition: "when a novel technique was used"

# Token budget
token_budget:
  self: 800            # Max tokens this skill file should use in context
  context_reads: 2000  # Max tokens allowed for memory_reads
  total: 2800

# Safety
verification_required: false  # If true, skill must verify output before claiming done
destructive: false             # If true, requires explicit user confirmation

# Metadata
author: omnix-core
tags: [debugging, errors, root-cause]
replaces: null         # Previous skill this replaces
deprecated_by: null    # Skill that replaces this one
---
```

---

## Skill Registry

Skills are discovered by scanning `packages/core/skills/*/SKILL.md`. The registry is built at `omnix skills` invocation from frontmatter only — progressive disclosure, no skill content loaded until activation.

```
packages/core/skills/
├── context-manager/
│   └── SKILL.md
├── token-optimizer/
│   └── SKILL.md
├── memory-curator/
│   └── SKILL.md
├── repo-scanner/
│   └── SKILL.md
├── workflow-router/
│   └── SKILL.md
├── dependency-doctor/
│   └── SKILL.md
├── debugging-specialist/
│   └── SKILL.md
├── test-architect/
│   └── SKILL.md
├── release-manager/
│   └── SKILL.md
├── security-threat-modeler/
│   └── SKILL.md
├── browser-automation-specialist/
│   └── SKILL.md
├── external-research-specialist/
│   └── SKILL.md
├── docs-maintainer/
│   └── SKILL.md
├── adapter-compatibility-checker/
│   └── SKILL.md
└── project-onboarder/
    └── SKILL.md
```

---

## Activation System

### Manual Activation (CLAUDE.md imports)
User activates a skill by adding it to the `## Active Skills` section in CLAUDE.md:

```markdown
## Active Skills
<!-- Uncomment to activate: -->
@packages/core/skills/debugging-specialist/SKILL.md
<!-- @packages/core/skills/test-architect/SKILL.md -->
```

`omnix skills activate debugging-specialist` automates this.

### Trigger-Based Activation (AI decision)
When the AI detects a trigger phrase in the user's request, it should load the relevant skill:

```
User: "why is this test failing?"
→ Trigger: "test failing" → Load debugging-specialist + test-architect skills
→ Memory: Load error-memory.md first (debugging priority)
→ Token budget: 2800 tokens total
```

### Auto-Activation (always-on skills)
Skills with `auto_activate: true` are always loaded. Currently only: `context-manager`.

---

## Retrieval Policy per Skill

Each skill declares its memory reads with priorities. The retrieval system respects skill-declared priorities.

**Priority levels:**
- `critical`: Always loaded (counts against token budget)
- `high`: Loaded if budget allows
- `medium`: Loaded if budget has room
- `low`: Loaded on explicit request only

**Progressive disclosure order:**
1. Load skill file (counts against `self` budget)
2. Load `critical` memory_reads
3. Load `high` memory_reads if budget allows
4. Load `medium` if room remains
5. Never auto-load `low` priority

---

## Verification Policy

Skills with `verification_required: true` must run a verification step before reporting completion:
- Run tests (if applicable)
- Check output against success criteria
- Confirm no regressions
- Report specific pass/fail signal (not "looks good")

Verification checklist is embedded in the skill file under `## Verification` section.

---

## Memory Policy

**Reads:** Skill reads only files listed in `memory_reads`. Never reads the entire vault.  
**Writes:** Skill writes only to files listed in `memory_writes`, and only when the condition is met.  
**Sanitization:** All writes pass through `sanitize()` before hitting disk.  
**Staleness:** When reading a file, check `last-verified` field. If > 90 days, emit warning.

---

## Plugin Lifecycle

```
draft → experimental → stable → deprecated
```

- **draft**: Not in registry. Work in progress.
- **experimental**: In registry with warning. May change. Not for production use.
- **stable**: Fully tested. Safe to activate.
- **deprecated**: Skill still works but `deprecated_by` points to replacement. Warn on activation.

Lifecycle transitions require:
- draft → experimental: SKILL.md frontmatter exists, triggers defined, token_budget set
- experimental → stable: Tests pass, real-world validation, no breaking changes in 2 weeks
- stable → deprecated: `deprecated_by` set, migration guide written

---

## Skill Composition (Chain Contracts)

Skills can declare `requires` and `produces` to form pipelines:

```
project-onboarder
  └── produces: ["02-PROJECTS/project-context.md", "03-ERRORS/error-memory.md"]

debugging-specialist
  └── requires: ["02-PROJECTS/project-context.md"]  ← reads onboarder output
  └── produces: ["03-ERRORS/error-memory.md"]

test-architect
  └── requires: ["debugging-specialist output"]
  └── produces: ["test plan in 07-LESSONS/"]
```

The skill runner validates: if skill B requires skill A's output, skill A must have run in this session (or its output must exist in vault).

---

## Workflow Integration

Skills integrate into workflows via activation tags in workflow files:

```markdown
## Step 2: Diagnose Root Cause
<!-- skill: debugging-specialist -->
[Debugging specialist skill activates here if installed]
...
```

When the AI reads the workflow and encounters a `<!-- skill: -->` comment, it activates the referenced skill and applies its guidance for that step.

---

## Adapter Compatibility

Skills are consumed by adapter templates via CLAUDE.md imports. The adapter must:
1. Include the skill path in CLAUDE.md `## Active Skills` section
2. Respect the skill's token budget (not load additional context)
3. Follow the skill's verification policy if `verification_required: true`

Cursor adapters: import via `.cursor/rules/skills.mdc` pointing to the SKILL.md file.

---

## Versioning

Skills use semantic versioning:
- **MAJOR**: Breaking change (different output format, removed functionality)
- **MINOR**: New functionality, backward compatible
- **PATCH**: Bug fix, clarification

`omnix update` diffs skill versions by comparing `version` fields. On MAJOR version change: show diff, require user confirmation before updating.

---

## Testing

Each stable skill should have:
- At least 3 trigger examples (inputs that activate it)
- At least 1 negative trigger (input that should NOT activate it)
- At least 1 output example (what the skill produces)
- Token budget validation (self + context_reads ≤ total)

---

## Deprecation

When a skill is deprecated:
1. Set `status: deprecated` and `deprecated_by: new-skill-name`
2. Add migration note in skill file under `## Migration`
3. `omnix skills` shows deprecated badge
4. `omnix skills activate deprecated-skill` prompts: "This skill is deprecated. Use `new-skill-name` instead. Continue anyway? [y/N]"
5. Remove from registry after 2 major Omnix releases

---

## Discovery/Indexing

`omnix skills` reads only frontmatter (progressive disclosure). Full content loaded only on `omnix skills show <name>` or activation. Registry output:

```
$ omnix skills
📦 15 skills available

STABLE
  ✓ context-manager        v1.2.0  Auto-loads relevant vault context for any task
  ✓ debugging-specialist   v1.1.0  Root cause analysis with error memory
  ✓ workflow-router        v1.0.0  Routes requests to correct workflow + agents

EXPERIMENTAL
  ⚠ token-optimizer        v0.3.0  Measures + enforces vault token budgets
  ⚠ repo-scanner           v0.2.0  Deep repository structure analysis
  ⚠ external-research      v0.1.0  Researches external docs + APIs

DEPRECATED
  ✗ context-loader         v0.8.0  → replaced by context-manager
```

---

## 15 Skill Specifications

---

### 1. context-manager

```yaml
name: context-manager
version: 1.0.0
status: stable
description: Loads relevant vault context before any task using progressive disclosure and task-type-aware retrieval.
triggers:
  - "before any session starts"
  - "starting work on"
  - "help me with"
auto_activate: true
requires: []
produces:
  - "context-pack for current session"
memory_reads:
  - { path: "02-PROJECTS/project-context.md", priority: critical }
  - { path: "02-PROJECTS/active-goals.md", priority: critical }
  - { path: "02-PROJECTS/vault-index.md", priority: high }
  - { path: "03-ERRORS/error-memory.md", priority: high }
  - { path: "04-DECISIONS/decisions.md", priority: medium }
memory_writes:
  - { path: "02-PROJECTS/vault-index.md", condition: "when index is stale" }
token_budget: { self: 600, context_reads: 2000, total: 2600 }
verification_required: false
destructive: false
tags: [context, retrieval, memory]
```

**When to activate:** Every session. Auto-activated.

**Core execution:**
1. Detect task type from request (debug/feature/review/architecture/deployment)
2. Select retrieval mode (minimal/balanced/deep based on task complexity)
3. Load files in priority order, stopping at token budget
4. Emit compact startup block: `[context loaded: project-context ✓ | errors: 3 known | last session: 2 days ago]`
5. Proceed with task

**Token budgets by mode:**
- minimal: 500 tokens total (one-liner answers, quick questions)
- balanced: 1500 tokens (standard work)
- deep: 3000 tokens (architecture, complex debugging)
- debugging: error-memory first, then project context

**Output format:**
```
Context: [project-name] | Stack: [detected] | Mode: [balanced]
Loaded: project-context, active-goals, 3 recent sessions, error-memory
Budget used: 1,240 / 1,500 tokens
```

---

### 2. token-optimizer

```yaml
name: token-optimizer
version: 0.3.0
status: experimental
description: Measures vault token usage, enforces per-mode budgets, and triggers compression when thresholds are exceeded.
triggers:
  - "context is getting large"
  - "optimize token usage"
  - "vault is slow"
  - "running out of context"
auto_activate: false
requires: []
produces:
  - "vault-stats report"
  - "compression candidates list"
memory_reads:
  - { path: "01-SESSIONS/", priority: high }
  - { path: "02-PROJECTS/vault-index.md", priority: critical }
memory_writes:
  - { path: "10-DAILY-DIGESTS/", condition: "when compression runs" }
token_budget: { self: 500, context_reads: 500, total: 1000 }
verification_required: false
destructive: false
tags: [tokens, optimization, compression, vault]
```

**Core execution:**
1. Scan vault: count files per folder, estimate tokens (chars/4)
2. Identify bloat: sessions > 30 dirs, files > 500 tokens each, duplicated content
3. Report: top-5 largest files, growth rate, budget status per retrieval mode
4. Recommend: compress X sessions (saves Y tokens), archive Z files, summarize W files
5. On user approval: trigger `omnix sync-memory --compress`

**Warning thresholds:**
- 50 files: yellow — vault growing
- 100 files: orange — approaching bloat
- 200 files: red — retrieval will degrade

---

### 3. memory-curator

```yaml
name: memory-curator
version: 0.8.0
status: stable
description: Sanitizes secrets from vault, deduplicates entries, flags stale decisions, and maintains vault health.
triggers:
  - "clean up vault"
  - "vault maintenance"
  - "memory hygiene"
  - "stale entries"
auto_activate: false
requires: []
produces:
  - "vault health report"
  - "sanitized vault entries"
memory_reads:
  - { path: "02-PROJECTS/", priority: high }
  - { path: "03-ERRORS/error-memory.md", priority: high }
  - { path: "04-DECISIONS/", priority: medium }
memory_writes:
  - { path: "03-ERRORS/error-memory.md", condition: "when duplicates found" }
  - { path: "04-DECISIONS/", condition: "when stale entries flagged" }
token_budget: { self: 600, context_reads: 1500, total: 2100 }
verification_required: true
destructive: false
tags: [memory, sanitization, vault-health, staleness]
```

**Core execution:**
1. Scan vault for secret patterns (API keys, JWTs, DB URLs) — redact and warn
2. Check `last-verified` dates — flag entries > 90 days old
3. Find duplicate error entries (same root cause, different dates) — suggest merge
4. Find superseded decisions (later decision contradicts earlier) — flag for review
5. Check vault structure health (missing folders, malformed filenames)
6. Produce health report with specific actions

**Verification:** After curation, run `omnix verify --vault-freshness` and confirm 0 critical issues.

---

### 4. repo-scanner

```yaml
name: repo-scanner
version: 0.2.0
status: experimental
description: Deep repository analysis beyond stack detection — module structure, hotspots, test gaps, coupling, anti-patterns.
triggers:
  - "analyze this codebase"
  - "what's the architecture"
  - "find issues in the repo"
  - "understand this project"
auto_activate: false
requires: []
produces:
  - "05-ARCHITECTURE/repo-scan.md"
  - "07-LESSONS/codebase-notes.md"
memory_reads:
  - { path: "02-PROJECTS/project-context.md", priority: critical }
  - { path: "05-ARCHITECTURE/", priority: high }
memory_writes:
  - { path: "05-ARCHITECTURE/repo-scan.md", condition: "always" }
token_budget: { self: 800, context_reads: 1000, total: 1800 }
verification_required: false
destructive: false
tags: [scanning, architecture, codebase-analysis, hotspots]
```

**Core execution:**
1. Map entry points (main/index files, bin scripts)
2. Find hotspots (top-10 largest files by lines)
3. Detect test gap: src files without corresponding test files
4. Find coupling: files imported by > 5 other files (high coupling)
5. Detect monorepo structure (apps/, packages/, services/)
6. Flag anti-patterns: deeply nested directories, giant files (> 500 lines), circular imports
7. Write structured report to `05-ARCHITECTURE/repo-scan.md`

---

### 5. workflow-router

```yaml
name: workflow-router
version: 1.1.0
status: stable
description: Routes any user request to the correct workflow + agent roles using rule-based matching. No LLM required.
triggers:
  - "what should I do to"
  - "help me"
  - "how do I"
auto_activate: false
requires: []
produces:
  - "workflow recommendation"
  - "agent role list"
  - "retrieval mode"
memory_reads:
  - { path: "06-WORKFLOWS/", priority: medium }
token_budget: { self: 400, context_reads: 200, total: 600 }
verification_required: false
destructive: false
tags: [routing, workflows, agents, orchestration]
```

**Routing table** (deterministic, no LLM):

| Signal | Workflow | Agents | Mode |
|--------|----------|--------|------|
| build/add/implement | feature-build | architect + fullstack + reviewer | balanced |
| error/broken/crash/failing | debugging → bug-fix | debugger + security | debugging |
| test failing | bug-fix + testing | debugger + qa | debugging |
| review/audit/check | code-review | reviewer + security | balanced |
| refactor/clean/improve | refactor | architect + reviewer | balanced |
| deploy/ship/release | deployment | devops (specialized) | minimal |
| slow/performance | debugging + performance | debugger + performance (specialized) | deep |
| docs/readme/document | docs-update | docs (specialized) | minimal |
| security/auth/cve | code-review + security | security + reviewer | deep |
| schema/migration/database | feature-build + database | architect + database (specialized) | deep |
| first run / empty vault | project-onboarding | fullstack | deep |

---

### 6. dependency-doctor

```yaml
name: dependency-doctor
version: 0.5.0
status: experimental
description: Audits project dependencies for vulnerabilities, outdated packages, unused deps, and license conflicts.
triggers:
  - "check dependencies"
  - "audit packages"
  - "update dependencies"
  - "vulnerability scan"
  - "npm audit"
auto_activate: false
requires: []
produces:
  - "dependency health report"
  - "07-LESSONS/dependency-notes.md"
memory_reads:
  - { path: "02-PROJECTS/project-context.md", priority: high }
memory_writes:
  - { path: "07-LESSONS/dependency-notes.md", condition: "when issues found" }
token_budget: { self: 700, context_reads: 300, total: 1000 }
verification_required: true
destructive: false
tags: [dependencies, security, audit, packages]
```

**Core execution:**
1. Read package manifests (package.json, requirements.txt, pyproject.toml, go.mod, Cargo.toml)
2. Run `npm audit --json` / `pip audit` / `cargo audit` — parse output
3. Classify issues: critical CVE / high / medium / low / informational
4. Find outdated: check latest vs installed for direct dependencies only
5. Find unused: grep for imports, flag packages in manifest but not imported
6. Check licenses: flag GPL in commercial projects, restrictive licenses
7. Produce prioritized fix list

**Verification:** After fixes applied, re-run audit and confirm zero critical/high CVEs.

---

### 7. debugging-specialist

```yaml
name: debugging-specialist
version: 1.1.0
status: stable
description: Hypothesis-driven root cause analysis using error memory. Finds similar past errors before diagnosing.
triggers:
  - "why is this failing"
  - "error:"
  - "exception:"
  - "unexpected behavior"
  - "this broke"
  - "debug this"
auto_activate: false
requires: []
produces:
  - "root cause analysis"
  - "03-ERRORS/error-memory.md update"
memory_reads:
  - { path: "03-ERRORS/error-memory.md", priority: critical }
  - { path: "03-ERRORS/anti-patterns.md", priority: high }
  - { path: "02-PROJECTS/project-context.md", priority: high }
  - { path: "01-SESSIONS/", priority: medium }
memory_writes:
  - { path: "03-ERRORS/error-memory.md", condition: "when root cause found" }
  - { path: "03-ERRORS/anti-patterns.md", condition: "when error appears 3+ times" }
token_budget: { self: 900, context_reads: 2000, total: 2900 }
verification_required: true
destructive: false
tags: [debugging, errors, root-cause, hypothesis]
```

**Core execution:**
1. **Search error memory first** — find similar past errors (term frequency match). Return top-3 if found.
2. **Hypothesis formation** — state exactly ONE hypothesis as the most likely cause
3. **Cheapest test first** — identify the smallest test that could falsify the hypothesis
4. **Observe** — run test, observe actual vs expected
5. **Bisect if needed** — narrow to smallest reproducing case
6. **Fix** — apply minimal fix
7. **Write regression test** — before claiming done
8. **Update error memory** — root cause + fix + prevention rule

**Verification:** Run test suite. Confirm error no longer reproducible. Confirm regression test exists.

---

### 8. test-architect

```yaml
name: test-architect
version: 0.7.0
status: experimental
description: Designs test strategy for features/components. Finds test gaps. Writes tests from specs.
triggers:
  - "write tests for"
  - "test strategy"
  - "coverage gaps"
  - "add tests"
  - "test this"
auto_activate: false
requires: []
produces:
  - "test plan"
  - "test files"
memory_reads:
  - { path: "02-PROJECTS/project-context.md", priority: high }
  - { path: "07-LESSONS/", priority: medium }
memory_writes:
  - { path: "07-LESSONS/test-patterns.md", condition: "when novel test pattern used" }
token_budget: { self: 800, context_reads: 1000, total: 1800 }
verification_required: true
destructive: false
tags: [testing, coverage, tdd, test-strategy]
```

**Core execution:**
1. Identify what needs testing (unit / integration / e2e based on component type)
2. Find existing test gaps (src files without corresponding test files)
3. Write test plan: test names, happy path, edge cases, error cases
4. Implement: write tests before implementation (TDD) or alongside
5. Verify coverage meets targets (unit: 80%, integration: 60%, e2e: critical paths only)

**Test priority order:** regression tests > happy path > edge cases > performance > accessibility

---

### 9. release-manager

```yaml
name: release-manager
version: 0.4.0
status: experimental
description: Manages release flow: version bump, changelog, build verification, tag, publish.
triggers:
  - "release"
  - "publish"
  - "ship version"
  - "create release"
auto_activate: false
requires: ["test-architect"]
produces:
  - "release tag"
  - "CHANGELOG.md update"
  - "npm publish"
memory_reads:
  - { path: "02-PROJECTS/project-context.md", priority: critical }
  - { path: "04-DECISIONS/", priority: medium }
memory_writes:
  - { path: "04-DECISIONS/decisions.md", condition: "when version strategy decided" }
token_budget: { self: 700, context_reads: 500, total: 1200 }
verification_required: true
destructive: true
tags: [release, publish, versioning, changelog]
```

**Core execution:**
1. Run test suite — abort if any failures
2. Determine version bump (patch/minor/major) based on commit history
3. Update version in package.json / pyproject.toml
4. Generate CHANGELOG entry from commits since last tag
5. Build: verify clean build
6. Typecheck: verify 0 errors
7. Tag: `git tag v{version}`
8. Publish: `npm publish --access public` (with dry-run preview)

**Verification:** After publish, `npm view {package}@{version}` confirms live. Health check passes.

---

### 10. security-threat-modeler

```yaml
name: security-threat-modeler
version: 0.6.0
status: experimental
description: STRIDE threat model for any component. Finds attack surfaces. Generates mitigations.
triggers:
  - "security review"
  - "threat model"
  - "attack surface"
  - "auth review"
  - "is this secure"
auto_activate: false
requires: []
produces:
  - "threat model report"
  - "07-LESSONS/security-notes.md"
memory_reads:
  - { path: "02-PROJECTS/project-context.md", priority: critical }
  - { path: "05-ARCHITECTURE/", priority: high }
memory_writes:
  - { path: "07-LESSONS/security-notes.md", condition: "always" }
token_budget: { self: 1000, context_reads: 1500, total: 2500 }
verification_required: false
destructive: false
tags: [security, STRIDE, threat-modeling, auth, CVE]
```

**STRIDE checklist:**
- **S**poofing: Can an attacker impersonate a user/service?
- **T**ampering: Can data be modified in transit or at rest?
- **R**epudiation: Can actions be denied? Is there audit logging?
- **I**nformation disclosure: What data could leak? Where?
- **D**enial of service: What can be exhausted (rate limits, memory, CPU)?
- **E**levation of privilege: Can a user gain higher permissions than intended?

**Output format:** STRIDE matrix + top-5 mitigations ranked by severity × ease.

---

### 11. browser-automation-specialist

```yaml
name: browser-automation-specialist
version: 0.3.0
status: experimental
description: Browser automation for UI testing, web research, and visual verification. Uses dev-browser if available.
triggers:
  - "open browser"
  - "click on"
  - "fill in form"
  - "scrape this page"
  - "visual test"
  - "check this URL"
auto_activate: false
requires: []
produces:
  - "browser session results"
  - "screenshots"
memory_reads:
  - { path: "02-PROJECTS/project-context.md", priority: high }
memory_writes:
  - { path: "07-LESSONS/ui-notes.md", condition: "when visual bugs found" }
token_budget: { self: 600, context_reads: 300, total: 900 }
verification_required: true
destructive: false
tags: [browser, automation, UI-testing, web, Playwright]
```

**Core execution:**
1. Check if dev-browser is available: `npx dev-browser --version`
2. If available: use QuickJS WASM sandbox for safe execution
3. If not available: recommend installation with `npm install -g dev-browser`
4. Execute Playwright script in sandbox: navigate → interact → screenshot → extract
5. Return structured results (text content + screenshot path)

---

### 12. external-research-specialist

```yaml
name: external-research-specialist
version: 0.2.0
status: experimental
description: Researches external documentation, APIs, and changelogs. Stores findings in vault to avoid re-fetching.
triggers:
  - "look up"
  - "research"
  - "find documentation for"
  - "what does the X API do"
  - "check the changelog"
auto_activate: false
requires: []
produces:
  - "07-LESSONS/external-research.md"
memory_reads:
  - { path: "07-LESSONS/external-research.md", priority: critical }
memory_writes:
  - { path: "07-LESSONS/external-research.md", condition: "when new findings" }
token_budget: { self: 600, context_reads: 500, total: 1100 }
verification_required: false
destructive: false
tags: [research, external-docs, web, scraping, RAG]
```

**Core execution:**
1. Check vault first: search `07-LESSONS/external-research.md` for cached findings
2. If cached and < 7 days old: return cached result (no re-fetch)
3. If stale or missing: fetch from authoritative source
4. Summarize: extract relevant sections only (not full page)
5. Store: write to vault with `fetched_at` timestamp and source URL
6. Return summary to current session

**Fetch pipeline:**
- Attempt 1: Direct HTTP fetch + extract content
- Attempt 2: If blocked → use dev-browser (if installed)
- Attempt 3: If still blocked → report failure, suggest manual research

**Quality rules:** Only authoritative sources (official docs, GitHub, npm registry). Never cite Medium/dev.to for technical specs.

---

### 13. docs-maintainer

```yaml
name: docs-maintainer
version: 0.9.0
status: stable
description: Keeps project documentation synchronized with code changes. Detects doc drift. Updates README, API docs, runbooks.
triggers:
  - "update docs"
  - "docs are out of date"
  - "update README"
  - "document this"
  - "write runbook"
auto_activate: false
requires: []
produces:
  - "updated documentation files"
memory_reads:
  - { path: "02-PROJECTS/project-context.md", priority: critical }
  - { path: "04-DECISIONS/", priority: medium }
memory_writes:
  - { path: "04-DECISIONS/decisions.md", condition: "when doc structure decision made" }
token_budget: { self: 700, context_reads: 800, total: 1500 }
verification_required: false
destructive: false
tags: [docs, README, runbook, API-docs, drift]
```

**Core execution:**
1. Detect what changed (git diff --name-only since last doc update)
2. Map changed files to affected docs (API change → API docs, config change → README)
3. Check doc freshness: compare code behavior vs doc description
4. Update: change only affected sections (not full rewrite unless necessary)
5. Verify: read updated doc — does it accurately describe current behavior?

**Doc drift signals:** function signature changed, env var renamed, command flag added/removed, error message changed.

---

### 14. adapter-compatibility-checker

```yaml
name: adapter-compatibility-checker
version: 0.3.0
status: experimental
description: Verifies that Omnix adapter files match current tool specifications. Flags stale paths and broken configurations.
triggers:
  - "check adapters"
  - "adapter broken"
  - "cursor not reading rules"
  - "CLAUDE.md not working"
  - "verify compatibility"
auto_activate: false
requires: []
produces:
  - "adapter compatibility report"
memory_reads:
  - { path: "02-PROJECTS/project-context.md", priority: high }
memory_writes: []
token_budget: { self: 600, context_reads: 200, total: 800 }
verification_required: false
destructive: false
tags: [adapters, compatibility, claude-code, cursor, verification]
```

**Core execution:**
1. Detect which AI tool is being used (check for .cursor/, .claude/, .windsurf/, etc.)
2. Verify adapter file exists at expected path
3. Check adapter file contains required elements (memory loop reference, STARTUP_PROTOCOL reference)
4. Check `last-verified` date in adapter metadata — flag if > 90 days
5. Check adapter file is non-empty and non-corrupt
6. For Claude Code: verify CLAUDE.md imports AGENTS.md correctly
7. Report: pass/fail per adapter with specific remediation steps

---

### 15. project-onboarder

```yaml
name: project-onboarder
version: 1.0.0
status: stable
description: Full project onboarding sequence for new repositories. Scans, seeds vault, installs adapters, writes first digest.
triggers:
  - "set up omnix for this project"
  - "initialize project"
  - "first time setup"
  - "empty vault"
auto_activate: false
requires: []
produces:
  - "02-PROJECTS/project-context.md"
  - "03-ERRORS/error-memory.md"
  - "adapter files"
  - "first session digest"
memory_reads: []
memory_writes:
  - { path: "02-PROJECTS/project-context.md", condition: "always" }
  - { path: "02-PROJECTS/active-goals.md", condition: "always" }
  - { path: "03-ERRORS/error-memory.md", condition: "always" }
  - { path: "01-SESSIONS/", condition: "first digest" }
token_budget: { self: 800, context_reads: 0, total: 800 }
verification_required: true
destructive: false
tags: [onboarding, init, setup, first-run]
```

**Core execution:**
1. Detect project stack (frameworks, languages, package manager)
2. Ask 5 forcing questions (discovery form): What are we building? For whom? Stack? Constraints? Success criteria?
3. Write `project-context.md` with detected info + answers
4. Ask which AI tool (select adapter)
5. Install adapter file
6. Run `omnix verify` — confirm all checks pass
7. Write first session digest

**Verification:** `omnix verify` passes all 8 checks. project-context.md has no TODO markers.

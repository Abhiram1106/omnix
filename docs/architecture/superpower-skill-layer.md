# Omnix Superpower Skill Layer
> Architecture document. Defines how skills become superpowers, not just documents.

---

## What a Superpower Is (vs a Skill Document)

A **document skill** says: "Here is guidance. Follow it if you like."  
A **superpower skill** says: "Here is the exact execution pattern. When triggered, follow these steps precisely. Here is what you will read, write, and verify."

The difference is **specificity + enforcement + memory integration**:
- Specific triggers (not "use when relevant")
- Specific execution steps (not "consider the tradeoffs")
- Specific memory reads (declared in frontmatter)
- Specific memory writes (with conditions)
- Specific token budget (not unlimited)
- Specific verification (pass/fail, not "looks good")

Every Omnix superpower has all six properties.

---

## The 12 Superpower Principles

### 1. Memory-First Execution

Before any task begins, context is loaded from vault using task-type-aware retrieval. The retrieval mode determines which files are loaded first:

```
debug task    → error-memory first → project-context → sessions
feature task  → project-context + active-goals → errors → architecture
arch task     → 05-ARCHITECTURE → decisions → project-context
quick query   → project-context only (minimal mode, 500 tokens)
```

**Why it works:** The AI sees the most relevant context first. Position encoding means critical info at the start has 85-95% recall; if error memory is loaded first for debugging, the AI is far more likely to catch repeat mistakes.

**Implementation:** `context-manager` skill is `auto_activate: true`. Fires before every task.

---

### 2. Retrieval-First Context (Progressive Disclosure)

Context is loaded in three tiers, never dumped all at once:

```
Tier 1 (always):  vault-index.md + active-goals (~100-200 tokens)
Tier 2 (on match): summaries of candidate files (~300-500 tokens)
Tier 3 (selected): full content of top-N files (up to budget)
```

**Why it works:** Prevents context window bloat. A vault with 100 session files doesn't dump all 100 files — it loads a one-line index, then full content only for the 3 most relevant.

**Token savings:** Reduces average retrieval context by ~60% vs loading full files.

---

### 3. Token-Minimized Planning

Every skill declares its own token budget. The retrieval system enforces it.

```yaml
token_budget:
  self: 600          # This skill's content
  context_reads: 1500  # Memory files loaded
  total: 2100        # Hard cap
```

**Budgets by mode:**
- minimal:      500 total  (one-liner answers)
- balanced:    1500 total  (standard work)
- deep:        3000 total  (complex features)
- architecture: 4000 total (system design)
- debugging:   2000 total  (error investigation)

**Why it works:** Without budgets, context windows fill silently. With budgets, every skill knows its cost upfront.

---

### 4. Auto Workflow Routing

Every request is routed to a workflow before any work begins. No LLM — pure rule-based matching:

```
"error" / "crash" / "failing"    → debugging workflow → debugger + security agents
"build" / "implement" / "add"    → feature-build → architect + fullstack + reviewer
"review" / "audit"               → code-review → reviewer + security
"deploy" / "ship"                → deployment → devops (specialized)
"security" / "CVE" / "auth"      → code-review + security → security + reviewer
```

**Why it works:** Deterministic, fast, no API cost. The right workflow fires every time without relying on model judgment.

**Implementation:** `workflow-router` skill, `omnix route` CLI command.

---

### 5. Parallel Team Reasoning

For cross-domain tasks, the AI reasons from multiple specialist perspectives before acting. This is single-session reasoning — not concurrent processes.

```
User: "Add OAuth login and update the database schema"

Roles activated: architect + security + database + fullstack + reviewer

Each role contributes:
  Architect:  module boundaries, auth layer placement
  Security:   OAuth token storage, PKCE flow, session management
  Database:   schema changes, migration safety, index strategy
  Fullstack:  frontend auth flow, error states, loading states
  Reviewer:   code quality, convention adherence, edge cases
```

**Why it works:** Forces comprehensive thinking before any code is written. Prevents half-implementations that miss security or database concerns.

---

### 6. Error-to-Memory Learning

Every fixed bug becomes future prevention knowledge. This is enforced, not optional:

```
Bug fixed → Write to 03-ERRORS/error-memory.md:
  - Symptom: [what the error looked like]
  - Root cause: [why it happened]
  - Fix: [what was done]
  - Prevention rule: [how to never repeat this]
  - Regression test: [test that catches this]

3rd occurrence of same error type → promote to 03-ERRORS/anti-patterns.md
```

**Why it works:** Error memory becomes a searchable database. `omnix error-match "cannot read property"` finds similar past errors + their fixes before any diagnosis begins.

**Implementation:** `debugging-specialist` skill, `error-match` command, error-memory vault template.

---

### 7. Repo Intelligence Scanning

Omnix understands repositories deeply, not just their tech stack. The repo-scanner skill produces:

```
Entry points:     src/index.ts, bin/omnix.js
Hotspots:        apps/cli/src/commands/init.ts (847 lines ⚠), ...
Test gaps:       src/commands/update.ts (no test file)
Coupling:        src/utils/logger.ts (imported by 11 files — high coupling)
Risks:           .env not in .gitignore, 2 files >500 lines
Engineering score: 73/100
```

**Why it works:** Before writing any code, the AI understands the project's actual structure, risks, and conventions. This prevents adding code that breaks existing patterns.

**Tools integrated:** Repomix (codebase ingestion), custom code intelligence scanner.

---

### 8. External Research with Source Discipline

When the AI needs external information, it follows a strict pipeline:

```
1. Check vault first:  07-LESSONS/external-research.md (cached < 7 days?)
2. If fresh cache:     Return cached result immediately (0 tokens fetched)
3. If stale/missing:   Fetch from authoritative source only
4. Summarize:          Extract relevant sections only (not full page)
5. Store:              Write to vault with fetched_at + source URL
6. Return:             Summary to current session
```

**Source quality rules:** Official docs only. No Medium, dev.to for technical specs. No unverified claims.

**Tools integrated:** Crawl4AI (LLM-ready output), browser-use (for JS-heavy sites), dev-browser (sandboxed).

---

### 9. Skill/Plugin Activation

Skills are activated based on triggers, not manual invocation:

```
Activation layers (in order):
  1. auto_activate: true → always loaded (context-manager only)
  2. Trigger match → AI detects trigger phrase, activates skill
  3. CLAUDE.md import → user uncomments @skills/ line
  4. omnix skills activate <name> → adds to CLAUDE.md automatically
```

**Progressive disclosure:**
```
1. Skill registry: names + descriptions (100 tokens total)
2. On trigger match: load full SKILL.md content (~600 tokens)
3. Execute skill: load declared memory_reads (up to context budget)
```

---

### 10. Adapter Compatibility

Every adapter points to skills. Skills work across all adapters.

```
CLAUDE.md:  @packages/skills/{skill}/SKILL.md
Cursor:     References in .cursor/rules/skills.mdc
Generic:    AGENTS.md "check packages/skills/ for relevant skills"
```

Skills declare `compatible_adapters: [claude-code, cursor, generic]`. If a skill requires Claude Code-specific features (like @imports), it notes this. Cursor users get a simplified version.

---

### 11. Safety-First Command Execution

Before any destructive operation, stop and confirm:

```
Destructive commands requiring confirmation:
  rm / rm -rf (except node_modules, dist, .next)
  DROP TABLE / TRUNCATE
  git push --force / git push --force-with-lease
  git reset --hard
  kubectl delete
  Database migrations against production
  npm publish / cargo publish (without dry-run first)
```

**Implementation:** `careful` pattern from gstack. Hook-based governance: PreToolUse hook runs `check-careful.sh` before every Bash invocation.

---

### 12. Verification-Before-Completion

No task is done until verification passes. Every skill defines its verification:

```yaml
verification_required: true
```

Verification checklist (minimum):
- [ ] Changed files are correct and match intent
- [ ] Tests/typecheck ran (state result or reason skipped)
- [ ] Docs updated if behavior changed
- [ ] No secrets in written files
- [ ] Session digest written (skip for read-only sessions)
- [ ] Error memory updated if bug fixed
- [ ] Open risks listed if any remain

---

## Skill Activation Flow (Full)

```
User request received
        ↓
[1] context-manager fires (auto_activate)
    → detect task type → select retrieval mode
    → load vault in priority order → emit startup block
        ↓
[2] workflow-router determines workflow + agents
    → rule-based matching → no LLM cost
        ↓
[3] Skill trigger detection
    → scan request for trigger phrases
    → activate matching skill (if any)
    → load skill content into context
        ↓
[4] Skill execution
    → skill declares memory_reads → retrieval system loads them
    → AI follows skill's step-by-step execution
    → AI writes to declared memory_writes when conditions met
        ↓
[5] Verification
    → if verification_required: run checklist
    → if destructive: confirm with user first
        ↓
[6] Memory update
    → session digest (if meaningful work)
    → error memory (if bug fixed)
    → decision memory (if non-trivial choice)
    → vault-index regenerated on next sync-memory
```

---

## Skill Quality Matrix

Every skill in Omnix must meet these thresholds before becoming `stable`:

| Criterion | Requirement |
|-----------|-------------|
| Triggers | ≥3 specific trigger phrases |
| When NOT to activate | Explicit scope boundary defined |
| Execution steps | Numbered, actionable, ≤12 steps |
| Code examples | At least 1 PASS + 1 FAIL example |
| Token budget | Declared and respects mode budgets |
| Memory reads | Listed with priority levels |
| Memory writes | Listed with conditions |
| Verification | Checklist or explicit "not required" |
| Status | stable / experimental / deprecated |
| Version | Semantic version declared |

Skills that don't meet this bar are `experimental`. Skills in development are `draft` (not in registry).

---

## The Omnix Skill Registry (Current State)

```
packages/skills/                          STATUS
├── context-manager/       SKILL.md       stable
├── token-optimizer/       SKILL.md       experimental
├── memory-curator/        SKILL.md       stable
├── repo-scanner/          SKILL.md       experimental
├── workflow-router/       SKILL.md       stable
├── project-onboarder/     SKILL.md       stable
├── error-intelligence/    SKILL.md       stable
├── dependency-doctor/     SKILL.md       experimental
├── debugging-specialist/  SKILL.md       stable
├── test-architect/        SKILL.md       experimental
├── api-contract-reviewer/ SKILL.md       experimental
├── database-migration-guard/ SKILL.md   experimental
├── security-threat-modeler/ SKILL.md    experimental
├── devops-orchestrator/   SKILL.md       experimental
├── kubernetes-operator/   SKILL.md       experimental
├── docker-specialist/     SKILL.md       experimental
├── ci-cd-engineer/        SKILL.md       experimental
├── performance-profiler/  SKILL.md       experimental
├── observability-engineer/ SKILL.md     experimental
├── frontend-architect/    SKILL.md       experimental
├── ui-ux-enhancer/        SKILL.md       experimental
├── design-system-builder/ SKILL.md       experimental
├── accessibility-reviewer/ SKILL.md     experimental
├── external-research-specialist/ SKILL.md experimental
├── browser-automation-specialist/ SKILL.md experimental
├── scraping-specialist/   SKILL.md       experimental
├── documentation-maintainer/ SKILL.md   stable
├── release-manager/       SKILL.md       experimental
├── adapter-compatibility-tester/ SKILL.md experimental
└── prompt-instruction-linter/ SKILL.md  experimental
```

---

## What Makes This Different from Existing Skill Libraries

Most skill libraries (alirezarezvani/claude-skills, ComposioHQ/awesome-claude-skills) are collections of prompts with minimal structure. They're useful as starting points but don't have:

- Token budgets (they load everything)
- Memory policies (they don't read/write vault)
- Verification requirements (they trust the AI)
- Scope boundaries (they don't say when NOT to use them)
- Version history (no upgrade path)
- Staleness detection (no last-verified dates)

Omnix skills have all of these. They're not better prompts — they're better systems.

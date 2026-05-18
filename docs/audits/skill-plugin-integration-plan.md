# Omnix — Skill + Plugin Integration Plan
> Every skill: source, priority, status, memory integration, CLI integration, acceptance criteria.

---

## Skill Registry (30 skills)

### Tier 1: Stable (use now)

| Skill | Source | Priority | Memory | CLI | Status |
|-------|--------|----------|--------|-----|--------|
| context-manager | Agent-Skills-for-Context-Engineering | P0 | reads: project-context, goals, errors; writes: vault-index | auto_activate | stable |
| error-intelligence | ECC four-phase loop + gstack investigate | P0 | reads: error-memory (critical), anti-patterns; writes: error-memory | `omnix error-match` | stable |
| workflow-router | existing omnix route | P0 | reads: workflows; no writes | `omnix route` | stable |
| memory-curator | Agent-Skills + gap analysis | P1 | reads: all vault dirs; writes: corrected vault | `omnix sync-memory` | stable |
| project-onboarder | open-design discovery form | P0 | reads: nothing; writes: project-context, goals, errors | `omnix init` | stable |
| documentation-maintainer | gstack /retro + gap analysis | P1 | reads: project-context, decisions; writes: decisions | `omnix skills activate docs` | stable |
| debugging-specialist | ECC agent-introspection + gstack | P0 | reads: error-memory (crit), anti-patterns; writes: error-memory | `omnix error-match` | stable |

### Tier 2: Experimental (ready but needs validation)

| Skill | Source | Priority | Key Feature | Status |
|-------|--------|----------|-------------|--------|
| token-optimizer | Agent-Skills + LLMLingua patterns | P1 | vault size warnings, budget enforcement | experimental |
| repo-scanner | gstack + repomix patterns | P1 | hotspots, test gaps, entry points | experimental |
| dependency-doctor | Trivy + npm audit patterns | P1 | CVE detection, license audit | experimental |
| test-architect | Playwright + Vitest + Testcontainers | P1 | 70/20/10 pyramid, real DB tests | experimental |
| api-contract-reviewer | OpenAPI patterns | P1 | breaking change detection, HTTP codes | experimental |
| database-migration-guard | migration safety patterns | P1 | rollback plan, lock risk | experimental |
| security-threat-modeler | STRIDE + Semgrep + OWASP | P1 | STRIDE matrix, OWASP checklist | experimental |
| devops-orchestrator | Helm + Kustomize + GH Actions | P2 | pipeline templates, safety-first | experimental |
| kubernetes-operator | K8s best practices | P2 | manifest review, pod debugging | experimental |
| docker-specialist | Docker best practices | P2 | multi-stage, non-root, compose | experimental |
| ci-cd-engineer | GitHub Actions patterns | P2 | SHA pinning, security scanning | experimental |
| performance-profiler | py-spy + pprof + Lighthouse | P2 | language-specific profiling | experimental |
| observability-engineer | OTel + Prometheus + Grafana | P2 | SLOs, alert rules, dashboards | experimental |
| frontend-architect | Next.js + React patterns | P2 | component hierarchy, state mgmt | experimental |
| ui-ux-enhancer | shadcn/ui + Tailwind patterns | P2 | 5 states, loading/error/empty | experimental |
| design-system-builder | DESIGN.md + Tailwind tokens | P3 | token architecture, DESIGN.md | experimental |
| accessibility-reviewer | WCAG 2.1 AA patterns | P2 | color contrast, keyboard nav | experimental |
| external-research-specialist | Crawl4AI + vault caching | P2 | source discipline, cache-first | experimental |
| browser-automation-specialist | Playwright + browser-use | P2 | tool hierarchy, data-testid | experimental |
| scraping-specialist | Crawl4AI + Scrapling | P2 | tool selection, vault caching | experimental |
| release-manager | npm publish + semver patterns | P2 | dry-run, changelog, verify | experimental |
| adapter-compatibility-tester | gap analysis | P1 | staleness detection, format check | experimental |
| prompt-instruction-linter | prompt-master 37 patterns | P1 | tool routing, intent extraction | experimental |

---

## CLI Integration

### New commands to add

```bash
omnix skills list                    # list all skills with status
omnix skills inspect <name>          # show full SKILL.md for a skill
omnix skills activate <name>         # add to CLAUDE.md active skills
omnix skills deactivate <name>       # remove from CLAUDE.md active skills
omnix skills doctor                  # check all skill files for schema compliance
omnix skills route "fix login bug"   # route request through skills + workflow

omnix research "best testing setup for Next.js"  # external research skill
omnix context pack                               # generate context-pack.md
omnix memory compact                             # compact old sessions
```

### Implementation approach

`omnix skills list` — reads frontmatter from all `packages/skills/*/SKILL.md` + `.omnix/skills/*/SKILL.md` (user-installed skills). Progressive disclosure: shows name + description + status only.

`omnix skills inspect <name>` — outputs full SKILL.md content to stdout.

`omnix skills activate <name>` — finds CLAUDE.md in cwd, adds `@packages/skills/<name>/SKILL.md` import line to `## Active Skills` section.

`omnix research <query>` — delegates to `external-research-specialist` skill logic: check vault cache, fetch if stale, summarize, store.

`omnix context pack` — generates a bounded context pack (< 3000 tokens) of the most relevant vault content for the current task. Writes to `02-PROJECTS/active-context.md`.

`omnix memory compact` — alias for `omnix sync-memory --compress --prune 90 --update-index`.

---

## Adapter Integration

Every adapter must be updated to:

1. Announce skills are available
2. Tell the AI to check for relevant skills before acting
3. Point to the skills directory

### CLAUDE.md update (already done)

```markdown
**Active skills** (uncomment to activate):
<!-- @packages/skills/context-manager/SKILL.md -->
<!-- @packages/skills/debugging-specialist/SKILL.md -->
<!-- @packages/skills/test-architect/SKILL.md -->
<!-- @packages/skills/security-threat-modeler/SKILL.md -->
```

### AGENTS.md update (generic adapter)

Add to AGENTS.md:
```markdown
## Skill discovery

Before acting on any task, check if a relevant skill exists:
- Skills in `packages/skills/` cover: debugging, testing, security, database, DevOps, K8s, Docker, frontend, documentation, research, and more.
- Activate the relevant skill: its SKILL.md file defines exact steps, memory reads/writes, and verification.
- Don't activate skills that don't match the task — irrelevant skills waste context tokens.

Example: For a debugging task → activate `debugging-specialist`. For a release → activate `release-manager`.
```

---

## Memory Integration Rules (per skill tier)

### Tier 1 skills (stable) — enforced memory rules
- Must declare memory_reads with priority levels
- Must declare memory_writes with conditions
- Must respect token_budget in all modes
- Must write to vault after meaningful work (no optional memory writes)

### Tier 2 skills (experimental) — advisory memory rules
- Should declare memory reads/writes
- Should respect token budgets
- Memory writes are conditional (user confirms before writing)

### Tier 3 skills (draft) — no memory enforcement
- May use vault, not required
- Must not write to vault without explicit user consent

---

## Acceptance Criteria per Skill

### Stable promotion requirements
1. Triggers: ≥3 specific trigger phrases defined
2. Scope: "When NOT to activate" documented
3. Steps: numbered execution steps (not vague guidance)
4. Examples: ≥1 PASS + ≥1 FAIL code example
5. Token budget: declared and within mode budgets
6. Memory: reads + writes declared with conditions
7. Verification: checklist or explicit "not required"
8. Version: semantic version in frontmatter
9. Real-world use: at least 1 real project validated
10. No hallucinated tool recommendations

### Experimental promotion criteria
1. Triggers defined
2. Execution steps present
3. At least 1 example
4. Memory declared
5. Status = experimental (not claiming stability)

---

## Risks and Mitigations

| Risk | Severity | Mitigation |
|------|----------|------------|
| Skills proliferate without quality gate | High | Require PASS/FAIL examples + scope boundary for any merge |
| Skills contradict each other | Medium | Each skill defines its domain boundary; skills don't overlap |
| Skills become outdated as tools evolve | Medium | `last-verified` field in frontmatter; quarterly review |
| Too many skills overwhelm users | High | `omnix skills list` shows stable first, experimental collapsed |
| Skill activates in wrong context | Medium | "When NOT to activate" section is mandatory |
| Memory writes conflict between skills | Low | Each skill writes to distinct vault sections |
| CLI gets too many commands | Medium | Group related commands: `omnix skills *`, `omnix memory *` |

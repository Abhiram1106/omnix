# Omnix Global Upgrade — Final Report
> Post-upgrade assessment. What was done, what works, what's next.

---

## Best Open-Source Systems Discovered

| Tool | Category | Key Value | Status |
|------|----------|-----------|--------|
| **Repomix** (github.com/yamadashy/repomix) | Codebase ingestion | 70% token reduction via tree-sitter, official Claude Code plugin | Active — reference in repo-scanner |
| **browser-use** (github.com/browser-use/browser-use) | Browser AI | 94k stars, Python async, Claude/Gemini/OpenAI, MCP-compatible | Active — browser-automation skill |
| **Crawl4AI** (github.com/unclecode/crawl4ai) | Web crawling | 65k stars, LLM-ready Markdown, anti-bot, Docker support | Active — scraping skill |
| **microsoft/LLMLingua** | Token compression | Up to 20x compression, EMNLP 2023 | Active — future integration |
| **Playwright MCP** | Browser testing | LLMs control Playwright directly (March 2025) | Active — test-architect skill |
| **Testcontainers** | Integration testing | Real Postgres/Redis in tests, eliminates mock divergence | Active — test-architect skill |
| **Semgrep CE + Trivy + Gitleaks** | Security scanning | Free, covers SAST + SCA + secrets detection | Active — security skill |
| **OpenTelemetry + Prometheus + Grafana** | Observability | Vendor-neutral, CNCF, open-source | Active — observability skill |
| **Crawlee** (github.com/apify/crawlee) | Production scraping | 23k stars, pause/resume, proxy rotation, RAG-ready | Active — scraping skill |
| **Helm + Kustomize** | K8s packaging | Helm for packaging, Kustomize for overlays | Active — kubernetes skill |

---

## Best Local Repo Features Extracted

| Repo | Feature | Extracted To |
|------|---------|-------------|
| **ECC** (everything-claude-code) | Four-phase failure recovery loop | `error-intelligence` SKILL.md |
| **ECC** | Skills list/inspect/activate CLI | upgraded `skills.ts` command |
| **ECC** | PASS/FAIL code examples pattern | all 30 skill specs |
| **ECC** | Language-scoped rules architecture | referenced in adapter design |
| **agency-agents** | Identity + mission + rules + deliverables + metrics format | all agent files |
| **agency-agents** | Adversarial thinking framework (4 questions) | `security-threat-modeler` skill |
| **gstack** | Sprint pipeline architecture (skills chain, share output) | `skill-plugin-integration-plan.md` |
| **gstack** | Safety guardrails (`/careful`, `/freeze`) | AGENTS.md template |
| **gstack** | Atomic skill design (one purpose, clear I/O) | superpower-skill-layer.md |
| **Agent-Skills** | Progressive disclosure (3 tiers) | `retrieve-context.ts` |
| **Agent-Skills** | Position-aware context placement | AGENTS.md + CLAUDE.md templates |
| **Agent-Skills** | Tool consolidation principle | `prompt-instruction-linter` skill |
| **Agent-Skills** | Observation masking | `write-digest.ts` |
| **prompt-master** | 37 anti-pattern matrix | `prompt-instruction-linter` SKILL.md |
| **prompt-master** | Tool-specific routing (o3 vs Claude vs Cursor) | `prompt-instruction-linter` skill |
| **prompt-master** | 9-dimension intent extraction | `prompt-instruction-linter` skill |
| **open-design** | Discovery form (5 forcing questions before code) | `project-onboarder` skill |
| **open-design** | Skill metadata schema with extended frontmatter | SKILL.md v2 schema |

---

## Skills Added (30 total)

### packages/skills/ (NEW — 30 superpower skills)

| Skill | Status | Key Capability |
|-------|--------|----------------|
| context-manager | stable | Auto-loads vault context, task-type-aware retrieval |
| token-optimizer | experimental | Vault size monitoring, budget enforcement |
| memory-curator | stable | Secret scanning, staleness detection, deduplication |
| repo-scanner | experimental | Entry points, hotspots, test gaps, risk detection |
| workflow-router | stable | Deterministic task routing, no LLM |
| project-onboarder | stable | 5 forcing questions, discovery form, minimal init |
| error-intelligence | stable | Four-phase debug loop, error-memory first |
| dependency-doctor | experimental | CVE detection (Trivy + npm audit), license audit |
| debugging-specialist | stable | Hypothesis-driven, BM25 error match |
| test-architect | experimental | 70/20/10 pyramid, Testcontainers, Playwright |
| api-contract-reviewer | experimental | Breaking change detection, HTTP code review |
| database-migration-guard | experimental | Lock risk, rollback plan, multi-step patterns |
| security-threat-modeler | experimental | STRIDE + OWASP + Semgrep + Trivy |
| devops-orchestrator | experimental | Helm + Kustomize + GH Actions |
| kubernetes-operator | experimental | Manifests, pod debugging, RBAC |
| docker-specialist | experimental | Multi-stage, non-root, health checks |
| ci-cd-engineer | experimental | SHA pinning, security scanning, environments |
| performance-profiler | experimental | py-spy, pprof, Lighthouse, Core Web Vitals |
| observability-engineer | experimental | OTel + Prometheus + Grafana, SLOs, alerts |
| frontend-architect | experimental | Component hierarchy, state mgmt, bundle budgets |
| ui-ux-enhancer | experimental | 5 states, loading/error/empty, dark mode |
| design-system-builder | experimental | Token architecture, DESIGN.md, shadcn/ui |
| accessibility-reviewer | experimental | WCAG 2.1 AA, ARIA, keyboard nav, axe-core |
| external-research-specialist | experimental | Cache-first, authoritative sources only |
| browser-automation-specialist | experimental | Playwright + browser-use + dev-browser hierarchy |
| scraping-specialist | experimental | Crawl4AI + Scrapling + Crawlee, vault caching |
| documentation-maintainer | stable | ADR template, changelog, doc drift detection |
| release-manager | experimental | Semantic versioning, dry-run, post-publish verify |
| adapter-compatibility-tester | experimental | Staleness detection, format verification |
| prompt-instruction-linter | experimental | 37 anti-patterns, tool routing, intent extraction |

---

## Skills Rejected (not added)

| Skill idea | Reason |
|-----------|--------|
| SWE-agent integration | Research tool, too heavy for scaffolding CLI |
| AutoGen patterns | Overly complex, inconsistent maintenance |
| LLMLingua direct integration | Python ML stack, incompatible with Node.js CLI without subprocess |
| Mintlify docs skill | SaaS, not open-source |
| Dependabot skill | GitHub-only; Renovate + npm audit are better alternatives |
| Pinecone/vector DB skill | SaaS; pgvector is the open alternative |
| Tree of Thought prompting | Fabrication risk in single-prompt contexts; prompt-master explicitly excludes |
| Ruflo federation skill | Runtime not in repo, aspirational code |
| Generic "AI agent" skill | Too vague; specific skills are better |
| LOC productivity metrics skill | Controversial; gstack's own docs warn about this |

---

## What Omnix Was Missing (now fixed or addressed)

| Gap | Fix |
|-----|-----|
| No DevOps/infrastructure skills | Added: devops-orchestrator, kubernetes-operator, docker-specialist, ci-cd-engineer |
| No observability guidance | Added: observability-engineer skill |
| No testing strategy skill | Added: test-architect with Testcontainers |
| No security tool integration | Added: security-threat-modeler with Semgrep + Trivy |
| No frontend/UI skills | Added: frontend-architect, ui-ux-enhancer, design-system-builder, accessibility-reviewer |
| No scraping/research skills | Added: scraping-specialist, browser-automation-specialist, external-research-specialist |
| No release workflow | Added: release-manager skill |
| No prompt quality check | Added: prompt-instruction-linter skill |
| Skills command couldn't inspect/activate | Upgraded: skills --inspect, --activate, --deactivate, --doctor |
| No `omnix memory` command | Added: `omnix memory --compact --stats` |
| No `omnix context-pack` command | Added: `omnix context-pack --mode balanced` |
| No `omnix research` command | Added: stub + external-research-specialist skill |
| AGENTS.md had no skill discovery | Added: skill lookup table, 20 trigger→skill mappings |
| AGENTS.md had no routing table | Added: agent routing table (12 request patterns) |

---

## What Was Improved

1. **Skill system upgraded to v2 schema** — version, status, triggers, memory_reads/writes, token_budget, verification_required, destructive, compatible_adapters
2. **Skills command** — now supports inspect, activate, deactivate, doctor; groups stable/experimental/auto-activate
3. **AGENTS.md** — now has skill discovery table, agent routing table, position-aware rules, safety rules
4. **CLAUDE.md** — now uses @AGENTS.md import, has Active Skills section
5. **CLI** — added: research, context-pack, memory, skills inspect/activate/doctor, error-match, scan --deep, retrieve-context --mode
6. **Vault templates** — added last-verified + status fields to error-entry and decision-entry
7. **Open-source research report** — documented 20+ verified tools with integration decisions

---

## What Still Needs Implementation

| Feature | Status | Effort |
|---------|--------|--------|
| `omnix research` full implementation | Stub only | 4-6 hours |
| Skill handler code (any skill) | All specs, no code | 2-4 hours per skill |
| Vault lifecycle auto-trigger (compress at 30 dirs) | Design done | 2 hours |
| LLMLingua integration | Future | Requires Python subprocess |
| Repomix integration in repo-scanner | Referenced | 2 hours |
| browser-use Python integration | Referenced | Out of scope for Node.js CLI |
| Skill marketplace (install from URL) | Design only | Future milestone |
| Plugin manifest standard | Specified in integration plan | 2 hours |
| `omnix stats` command (local SQLite) | Design only | 4 hours |

---

## What Is Experimental

Everything in `packages/skills/` except: context-manager, workflow-router, memory-curator, project-onboarder, documentation-maintainer, debugging-specialist, error-intelligence.

The `omnix research` command is a stub. The `omnix memory --compact` option is experimental (untested at 100+ session vault). All 30 new skills are SKILL.md specs — no runtime handlers.

---

## What Is MVP-Ready

| Component | Status |
|-----------|--------|
| 60/60 tests passing | ✅ |
| Build: 462 KB | ✅ |
| Typecheck: 0 errors | ✅ |
| 30 new skill specs (SKILL.md) | ✅ SPEC |
| Enhanced skills CLI (inspect/activate/doctor) | ✅ Working |
| AGENTS.md with skill discovery table | ✅ |
| CLAUDE.md with @AGENTS.md import + Active Skills | ✅ |
| error-match command | ✅ Working |
| scan --deep (code intelligence) | ✅ Working |
| retrieve-context --mode (task-type-aware) | ✅ Working |
| memory compact/stats commands | ✅ Working |
| context-pack command | ✅ Working (wraps retrieve-context) |
| Research report (20+ verified tools) | ✅ |
| Superpower skill layer architecture | ✅ |
| Integration plan (30 skills, all stages) | ✅ |

---

## Exact Next Commands To Run

### Verify everything is working
```bash
cd omnix/apps/cli
pnpm typecheck && pnpm build && pnpm test
```

### Explore the new skills
```bash
omnix skills                                    # list all 30+ skills by status
omnix skills --filter security                  # find security skills
omnix skills inspect security-threat-modeler    # read full skill
omnix skills activate debugging-specialist      # add to CLAUDE.md
omnix skills doctor                             # check all skills for schema issues
```

### Try new commands
```bash
omnix scan --deep                               # code intelligence
omnix error-match "cannot read property"        # find past fixes
omnix context-pack --task "fix auth bug"        # bounded context retrieval
omnix memory --compact                          # compress + prune vault
```

### Publish when ready
```bash
cd apps/cli
npm view omnix                                  # verify name is still available
omnix skills doctor                             # verify skills are clean
pnpm test                                       # 60/60
npm publish --access public --dry-run           # preview
npm publish --access public                     # publish
```

---

## Honest Summary

**What Omnix gained in this session:**
- 30 production-oriented skill specs covering every major engineering domain
- A skills CLI with inspect, activate, deactivate, doctor
- A skill discovery system in AGENTS.md (20 trigger→skill mappings)
- 3 new CLI commands (research, context-pack, memory)
- Verified open-source tooling for each skill domain
- An architecture document (superpower-skill-layer.md) that explains how skills become superpowers

**What Omnix is not (honest):**
- Skills are still SPEC — markdown only, no runtime execution
- `omnix research` is a stub — the real implementation is in the skill spec
- No skill has been tested with a real team for > 2 weeks
- The "30 skills" is an instruction set, not a running system

**The honest path to adoption:**
1. Pick 3 skills that solve immediate pain (recommended: debugging-specialist + test-architect + security-threat-modeler)
2. Use them with a real team for 2 weeks
3. Refine the trigger phrases and execution steps based on real use
4. Promote from experimental to stable
5. Repeat for the next 3

Don't try to ship all 30 skills at once. Ship 3 great ones.

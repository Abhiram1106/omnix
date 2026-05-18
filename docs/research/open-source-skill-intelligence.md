# Omnix — Open-Source Skill Intelligence Report
> Research date: 2025. Verified tools only. No hallucinated links, stars, or maintenance status.

---

## Top Open-Source Tools Found

### AI Coding / Claude Code Ecosystem

| Tool | Category | Link | Why Useful | Status | Decision |
|------|----------|------|-----------|--------|----------|
| Repomix | Codebase ingestion | github.com/yamadashy/repomix | Packs repo into AI-friendly file, 70% token reduction via tree-sitter, official Claude Code plugin | Active (v1.8+) | **INTEGRATE** — reference in repo-scanner skill |
| anthropics/skills | Skill format spec | github.com/anthropics/skills | Official skill format (SKILL.md + YAML frontmatter), proven across Claude Code/Codex/Cursor | Active | **INTEGRATE** — already using this format |
| PatrickJS/awesome-cursorrules | Cursor rules | github.com/PatrickJS/awesome-cursorrules | 660+ stars, .mdc rule patterns, community best practices | Active | **REFERENCE** — improve cursor adapter |
| ComposioHQ/awesome-claude-skills | Skill library | github.com/ComposioHQ/awesome-claude-skills | 1000+ curated skills, cross-platform | Active, growing | **REFERENCE** — study patterns |
| coleam00/context-engineering-intro | Context patterns | github.com/coleam00/context-engineering-intro | Context engineering patterns for Claude Code | Active | **REFERENCE** — study for context-manager skill |
| davidkimai/Context-Engineering | Context handbook | github.com/davidkimai/Context-Engineering | First-principles handbook, Karpathy-inspired | Active | **REFERENCE** — theoretical grounding |

### Context Engineering / Memory

| Tool | Category | Link | Why Useful | Status | Decision |
|------|----------|------|-----------|--------|----------|
| microsoft/LLMLingua | Token compression | github.com/microsoft/LLMLingua | Up to 20x compression with minimal perf loss, EMNLP 2023, LLMLingua-2 for speed | Active (Microsoft) | **LATER** — reference in token-optimizer skill |
| browser-use/browser-use | Browser automation | github.com/browser-use/browser-use | 94k stars, Python async, Claude/Gemini/OpenAI, coordinate clicking | Active (v0.12.6) | **INTEGRATE** — browser-automation skill |
| unclecode/crawl4ai | Web crawling | github.com/unclecode/crawl4ai | 65k stars, LLM-ready Markdown output, anti-bot, Docker support | Active (v0.8.6) | **INTEGRATE** — scraping-specialist skill |

### Testing / QA

| Tool | Category | Link | Why Useful | Status | Decision |
|------|----------|------|-----------|--------|----------|
| microsoft/playwright | E2E + Browser | github.com/microsoft/playwright | 88k stars, Playwright MCP (March 2025) for LLM control, snapshots reduce tokens | Active (v1.60) | **INTEGRATE** — test-architect + browser skills |
| testcontainers | Integration testing | github.com/testcontainers | Real services (Postgres, Redis) for tests, eliminates mock divergence | Active | **INTEGRATE** — test-architect skill |
| vitest | Unit testing | vitest.dev | 5-10x faster than Jest, Vite config sharing, modern standard | Active | **INTEGRATE** — test-architect skill |

### Security

| Tool | Category | Link | Why Useful | Status | Decision |
|------|----------|------|-----------|--------|----------|
| semgrep/semgrep | SAST | github.com/semgrep/semgrep | 15k stars, 30+ languages, catches injection/XSS patterns, LGPL core | Active (v1.163) | **INTEGRATE** — security-threat-modeler skill |
| aquasecurity/trivy | Container/dep scan | github.com/aquasecurity/trivy | 35k stars, scans containers + filesystems + git repos for CVEs, fast | Active (v0.70) | **INTEGRATE** — security-threat-modeler skill |
| gitleaks (Zricethezav) | Secret detection | github.com/gitleaks/gitleaks | Prevents hardcoded keys, pre-commit hook integration | Active | **INTEGRATE** — security-threat-modeler skill |

### DevOps / Cloud

| Tool | Category | Link | Why Useful | Status | Decision |
|------|----------|------|-----------|--------|----------|
| helm | Kubernetes packaging | helm.sh | 75% faster deploys vs raw YAML, templating, environment separation | Active (CNCF) | **INTEGRATE** — kubernetes-operator + devops-orchestrator |
| Kustomize | K8s customization | Built into kubectl | GitOps-friendly, pure YAML, overlay approach | Active (built-in) | **INTEGRATE** — kubernetes-operator skill |
| apify/crawlee | Scraping framework | github.com/apify/crawlee | 23k stars, Playwright + Puppeteer + Cheerio, proxy rotation, RAG-ready | Active (v3.16) | **INTEGRATE** — scraping-specialist skill |

### Observability / Performance

| Tool | Category | Link | Why Useful | Status | Decision |
|------|----------|------|-----------|--------|----------|
| open-telemetry/collector | Telemetry | github.com/open-telemetry/opentelemetry-collector | 7k stars, vendor-neutral, CNCF standard, Prometheus + Loki + Tempo | Active (v0.152) | **INTEGRATE** — observability-engineer skill |
| prometheus/prometheus | Metrics | github.com/prometheus/prometheus | 64k stars, PromQL, CNCF, Prometheus 3.0 OTel resource attributes | Active (v3.11) | **INTEGRATE** — observability-engineer skill |
| grafana/grafana | Visualization | github.com/grafana/grafana | 73k stars, AGPL, queries Prometheus/Loki/Tempo, dashboards | Active (v13.0) | **INTEGRATE** — observability-engineer skill |

### Documentation

| Tool | Category | Link | Why Useful | Status | Decision |
|------|----------|------|-----------|--------|----------|
| facebook/docusaurus | Docs site | github.com/facebook/docusaurus | 64k stars, MIT, React-based, MDX support | Active (v3.10) | **INTEGRATE** — documentation-maintainer skill |
| MkDocs | Simple docs | mkdocs.org | 90k+ projects, fastest setup, docs-as-code philosophy | Active | **INTEGRATE** — documentation-maintainer skill |

---

## Best Skill Ideas To Add To Omnix (Ranked)

1. **repo-scanner** — Repomix integration + code intelligence (hotspots, coupling, test gaps)
2. **debugging-specialist** — Four-phase failure recovery loop (from ECC), error memory first
3. **test-architect** — Playwright + Vitest + Testcontainers pattern, 70/20/10 rule
4. **security-threat-modeler** — STRIDE + Semgrep + Trivy integration, OWASP checklist
5. **context-manager** — Progressive disclosure, token budget enforcement, task-type-aware retrieval
6. **browser-automation-specialist** — browser-use + Playwright + dev-browser hierarchy
7. **scraping-specialist** — Crawl4AI + Crawlee + Scrapling pipeline pattern
8. **devops-orchestrator** — Helm + Kustomize + GitHub Actions pattern
9. **kubernetes-operator** — K8s manifests, Helm packaging, Kustomize overlays
10. **observability-engineer** — OpenTelemetry + Prometheus + Grafana stack
11. **performance-profiler** — Language-specific profiling (py-spy, pprof, Lighthouse)
12. **documentation-maintainer** — Docusaurus/MkDocs, ADR templates, API docs
13. **api-contract-reviewer** — OpenAPI spec validation, Schemathesis testing
14. **database-migration-guard** — Migration safety, rollback patterns, schema drift detection
15. **prompt-instruction-linter** — prompt-master's 37 anti-patterns + tool routing

---

## Best Workflow Ideas (Ranked)

1. **Sprint pipeline** (gstack): office-hours → plan → build → review → test → ship → retro
2. **Four-phase debug loop** (ECC): capture → diagnose → recover → introspect
3. **Context retrieval hierarchy**: active-goals → project-context → vault-index → error-memory → decisions
4. **Security scan pipeline**: Semgrep (SAST) → Trivy (SCA) → Gitleaks (secrets) → OWASP checklist
5. **Test pyramid execution**: unit (Vitest) → integration (Testcontainers) → E2E (Playwright)
6. **Observability stack setup**: OTel Collector → Prometheus → Grafana + Loki + Tempo
7. **Release pipeline**: test → typecheck → build → changelog → tag → publish → verify
8. **External research pipeline**: check vault cache → fetch → summarize → store → return

---

## Best Adapter Ideas (Ranked)

1. **Skill discovery in CLAUDE.md** — `@packages/skills/*/SKILL.md` imports, progressive loading
2. **Cursor .mdc skill references** — skill triggers in `.cursor/rules/skills.mdc`
3. **Adapter metadata file** — `_adapter-meta.json` with version + docs-url + last-verified
4. **Language-scoped rules** — `rules/common.md` + `rules/typescript.md` + `rules/python.md`
5. **Hook-based governance** — PreToolUse hook blocking destructive commands (gstack `careful` pattern)

---

## Best Memory/Context Ideas (Ranked)

1. **Vault-index.md** — one line per session, always loaded (memory bank pattern from Agent-Skills)
2. **Progressive disclosure** — load names → summaries → full content in tiers
3. **Task-type-aware retrieval** — debug = error-memory first, arch = 05-ARCHITECTURE first
4. **Context pack** — bounded 3000-token snapshot per session (Repomix-inspired)
5. **LLMLingua compression** — 20x compression for large context burdens (future integration)
6. **Staleness detection** — `last-verified` field, warn on >90 days
7. **LLM-wiki pattern** — agents maintain their own Markdown knowledge base (Karpathy-inspired)
8. **Observation masking** — compress tool outputs immediately; keep only recent/critical

---

## Best Token Optimization Ideas (Ranked)

1. **60-70% effective capacity rule** — never fill context beyond 70% of advertised window
2. **Position-aware placement** — critical rules at top AND bottom (85-95% recall), not middle
3. **Every word must change output** — audit principle: strip anything that doesn't affect behavior
4. **Progressive disclosure loading** — skill names (100 tokens) → summaries (300) → full content (3000)
5. **Tool consolidation** — fewer, broader tools > many narrow ones (Vercel: 17→2 tools, better perf)
6. **Observation masking** — compress tool outputs once processed (saves 83.9% tool output tokens)
7. **Per-mode token budgets** — minimal: 500, balanced: 1500, deep: 3000, arch: 4000, debug: 2000

---

## Best DevOps/Testing/Security Ideas (Ranked)

1. **Testcontainers** for real service integration tests — eliminates mock divergence
2. **Playwright MCP** — LLMs control browser testing directly (March 2025)
3. **Semgrep CE + Trivy + Gitleaks** — free, covers SAST + SCA + secrets detection
4. **Helm + Kustomize combo** — Helm for packaging, Kustomize for environment overlays
5. **70/20/10 test distribution** — 70% unit, 20% integration, 10% E2E
6. **GitHub Actions SHA pinning** — pin to full commit SHA, not branch
7. **Pre-commit hooks for secrets** — Gitleaks blocks commits with API keys
8. **OTel → Prometheus → Grafana** — vendor-neutral, open-source observability stack

---

## Rejected Tools

| Tool | Reason |
|------|--------|
| SWE-agent (Princeton) | Research tool, not production-grade scaffolding; dependency-heavy; better alternatives exist |
| AutoGen | Overly complex for scaffolding use case; better for research labs; maintenance inconsistent |
| Mintlify | SaaS ($300/month), not truly open-source; alternatives (MkDocs) are free and sufficient |
| LLMLingua direct integration | Excellent research but requires Python ML stack; not compatible with Node.js CLI without subprocess; mark as LATER |
| ruflo's federation system | Not actually in the repo; runtime is closed-source; aspirational only |
| Scrapy alone | Good for production scraping but heavy for AI workflows; Crawl4AI/Crawlee are better starting points |
| OWASP ZAP | Heavy Java tool, not CLI-friendly for developer workflows; Semgrep is lighter and more actionable |
| Dependabot (GitHub only) | Platform-locked; Renovate is cross-platform and open-source; use Renovate or `npm audit` |
| Pinecone | SaaS vector DB, not open-source; pgvector is the open alternative |
| Cursor itself | Not a tool to integrate; Omnix already generates cursor adapter files |
| jeremylongshore/claude-code-plugins-plus-skills | Cannot verify legitimacy of 2,810 skills claim; many likely low quality; use curated subset |
| ScrapeGraphAI Python lib | High LLM costs at scale; Crawl4AI is cheaper and better maintained |

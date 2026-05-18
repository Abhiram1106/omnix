# Source Repo Analysis

Inspection of the 13 workspace repos at `C:\Users\ADMIN\Desktop\Jarvis\`. Light-to-medium pass (README + structure + 1-2 standout files per repo). **No code was copied.** Patterns only.

Rating scale: 1 (low practical fit) — 5 (high practical fit) for the omnix goal.

| Repo | Found | Rating | What we extracted |
|---|---|---|---|
| prompt-master | yes | 5 | Dimensional intent extraction (audit a request across N dimensions before routing). Anti-pattern registry (catalogue bad prompts/practices with corrected counterparts). Both inspired `standards/ai-collaboration.md` and `03-ERRORS/anti-patterns.md`. |
| Agent-Skills-for-Context-Engineering | yes | 5 | Progressive disclosure (index/metadata loaded eagerly, full content on demand). Skill-as-module with triggers. Informs how `packages/core/agents/*.md` are kept compact and how memory retrieval is layered. |
| agency-agents | yes | 5 | Division-by-role folder taxonomy (engineering / design / etc). Minimal 1-2KB persona files. Generator script that fans one source out to multiple tool adapters. Directly shapes `packages/core/agents/` and `packages/adapters/` design. |
| gstack | yes | 5 | Sprint-ordered workflows (think → plan → build → review → test → ship → reflect). Decision principles for routine calls. Informs naming and ordering of `packages/core/workflows/*`. |
| ui-ux-pro-max-skill | yes | 4 | CLI installer (`uipro init --ai claude\|cursor\|...`) copying tool-specific templates from one source. Data-as-CSV with code separation. Inspired `apps/cli` shape. |
| everything-claude-code | yes | 5 | Per-harness config directories (`.claude-*/`, `.cursor/`, `.codex/`) with a central `AGENTS.md` bridge. Skill/agent/command hierarchy. Directly mirrored in `packages/adapters/`. |
| ruflo | yes | 4 | Plugin-centric monorepo with per-plugin hooks. Centralized MCP registration. Pattern applicable if we later add per-tool plugins. |
| open-design | yes | 4 | Multi-CLI daemon abstraction (one interface, N agents). Parameterized skills with bounded outputs vs freestyle. Reinforces "adapters are thin, core is bounded." |
| awesome-design-md | yes | 3 | Domain specs as structured markdown (LLM-ingestible). Pattern reused for ADRs, runbooks, memory schemas. |
| Scrapegraph-ai | yes | 4 | Config-driven graph abstraction; one base + N specializations. Cross-applicable to workflow definitions (one core workflow shape, parameterized per project). |
| Scrapling | yes | 3 | Fetcher escalation tower (simple → stealthy → headless). Translates to "adapter levels" — generic → tool-specific → tool+version-specific. Not implemented in v0.1 but noted. |
| dev-browser | yes | 3 | Sandbox-first design + named-resource persistence. Influences how future CLI commands isolate side effects. |
| deploy-your-own-saas | yes | 2 | Curated taxonomy + staleness badges. Useful inspiration for `docs/mcp-servers.md` and `docs/recommended-stack.md` table layouts. |

## What we did NOT copy

- No code from any repo.
- No license-protected templates verbatim.
- No vendor branding.
- No claims of features we didn't verify (e.g., "240x productivity" — referenced as marketing claim, not extracted as fact).

## What we deliberately rejected

- **Massive agent-swarm orchestration.** Some repos lean on swarm/consensus claims. Our `agents/` are role specs, not orchestrated personas.
- **Hype-driven framing.** Several READMEs use star counts and bold productivity numbers. Our docs stay practical.
- **Tool lock-in.** Several frameworks are Claude-only or Cursor-only. We are tool-agnostic by construction.

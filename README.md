<div align="center">

<img src="docs/assets/omnix-banner.png" alt="Omnix" width="100%" />

# Omnix

**Universal AI Engineering Runtime**

Give every AI coding tool a persistent memory vault, monorepo-aware conventions, and a live skill engine — in under 60 seconds.

[![npm version](https://img.shields.io/npm/v/omnix?color=6c63ff&style=flat-square&logo=npm)](https://www.npmjs.com/package/omnix)
[![license](https://img.shields.io/npm/l/omnix?color=10b981&style=flat-square)](LICENSE)
![tests](https://img.shields.io/badge/tests-126%20passing-10b981?style=flat-square)
[![node](https://img.shields.io/badge/node-%3E%3D18-brightgreen?style=flat-square&logo=node.js)](package.json)
[![pnpm](https://img.shields.io/badge/pnpm-9.x-f69220?style=flat-square&logo=pnpm)](package.json)

[**Quickstart**](#quickstart) · [**Commands**](#commands) · [**Memory System**](#memory-system) · [**Skill Engine**](#skill-engine) · [**Adapters**](#adapters) · [**Monorepo**](#monorepo-support) · [**Contributing**](#contributing)

</div>

---

## What is Omnix?

Omnix is a **CLI that installs structured convention files into your project**. These files tell your AI coding tool:

- **Where memory lives** — `.obsidian-ai-memory/` — 11 Obsidian-compatible markdown folders, fully local, zero cloud
- **Which conventions to follow** — adapter files per tool (`CLAUDE.md`, `.cursor/rules/`, `AGENTS.md`, `.claude/`)
- **Which workflow applies** — deterministic routing: "fix auth bug" → debugging workflow + security agent
- **Which skills to activate** — 10 live runtime handlers that analyze your actual codebase

> **No AI API. No cloud. No accounts.** Omnix writes files. Your AI tool reads them.

### Who is it for?

| Role | Problem Omnix solves |
|------|----------------------|
| **Monorepo engineers** | Per-package `.claude/rules/`, workspace health scoring, cross-package scan |
| **Solo developers** | AI never forgets your past fixes — `error-match` retrieves past solutions |
| **Teams** | Shared conventions via committed adapter files, `.claude/settings.json` for permissions |
| **Tool-agnostic shops** | Works across Claude Code, Cursor, Windsurf, Cline, Roo, Continue, Aider, OpenHands simultaneously |

---

## Quickstart

**Node.js 18+ required. No API keys. No accounts. No cloud.**

```bash
# Run once in any project — interactive setup
npx create-omnix

# Or install globally
npm install -g omnix && omnix init
pnpm add -g omnix  && omnix init
```

### First-time setup (under 60 seconds)

```bash
npx create-omnix           # 1. Answer 3 prompts — vault + adapters installed
omnix tutorial             # 2. 5-step interactive walkthrough
omnix status               # 3. Health score: A–F grade + next steps
omnix hooks --install all  # 4. Git hooks: block secrets on commit, auto-digest after
```

### What gets created

```
your-project/
├── .obsidian-ai-memory/          Memory vault (11 folders, plain markdown)
│   ├── 00-INBOX/
│   ├── 01-SESSIONS/              Session digests (YYYY-MM-DD/session-HHMM-<tool>.md)
│   ├── 02-PROJECTS/              Project context, goals, current state
│   ├── 03-ERRORS/                Error memory — BM25 searchable
│   ├── 04-DECISIONS/             Architecture Decision Records (ADR index)
│   ├── 05-ARCHITECTURE/          System overview, threat model, repo scan
│   ├── 06-WORKFLOWS/
│   ├── 07-LESSONS/               Lessons learned, research cache
│   ├── 08-PROMPTS/
│   ├── 09-AGENTS/
│   ├── 10-DAILY-DIGESTS/
│   └── templates/                Session, error, decision, project templates
│
├── .omnix/                       Omnix runtime config
│   ├── settings/omnix.json
│   └── .omnix-vault-version      Schema version — drives migrations
│
├── .claude/                      Claude Code project structure (full)
│   ├── CLAUDE.md                 Project instructions (committed)
│   ├── CLAUDE.local.md           Personal notes (gitignored)
│   ├── settings.json             Team permissions — all cmds allowed (committed)
│   ├── settings.local.json       Personal overrides (gitignored)
│   ├── .mcp.json                 MCP server stubs
│   ├── agents/README.md          Project subagent definitions
│   ├── skills/README.md          Project slash command skills
│   └── rules/
│       ├── code-style.md         TypeScript + commit conventions
│       ├── frontend/react.md     React conventions
│       └── packages/             Per-package rules (monorepos)
│           └── <pkg-name>.md
│
├── CLAUDE.md                     Claude Code root adapter
├── AGENTS.md                     Universal adapter (all tools)
├── AI_RULES.md                   Shared engineering rules
├── STARTUP_PROTOCOL.md           Session startup contract
└── .cursor/rules/                Cursor adapter (5 .mdc files)
    ├── project-rules.mdc
    ├── frontend.mdc
    ├── backend.mdc
    ├── testing.mdc
    └── security.mdc
```

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│         Your AI Coding Tool                                  │
│  Claude Code · Cursor · Windsurf · Cline · Roo · Continue   │
└───────────────────┬─────────────────────────────────────────┘
                    │ reads convention files
                    ▼
┌─────────────────────────────────────────────────────────────┐
│  Adapter Layer                                               │
│  CLAUDE.md + .claude/  ·  .cursor/rules/  ·  AGENTS.md      │
│  CONVENTIONS.md  ·  .windsurf/  ·  .cline/  ·  .roo/        │
└───────────────────┬─────────────────────────────────────────┘
                    │ follows rules from
                    ▼
┌─────────────────────────────────────────────────────────────┐
│  Workflow Router                                              │
│  "fix login bug" → debugging workflow + security agent       │
│  "add payments" → feature-build workflow + fullstack agent   │
└───────────────────┬─────────────────────────────────────────┘
                    │ activates
                    ▼
┌─────────────────────────────────────────────────────────────┐
│  Skill Engine (10 live handlers)                             │
│  debug · test · security · devops · release · docs + more   │
└───────────────────┬─────────────────────────────────────────┘
                    │ queries / writes
                    ▼
┌─────────────────────────────────────────────────────────────┐
│  Obsidian Memory Vault  (.obsidian-ai-memory/)               │
│  11 folders · plain markdown · local · portable · no cloud   │
│  retrieve → work → digest loop · BM25 error search           │
└─────────────────────────────────────────────────────────────┘
                    │ lives inside
                    ▼
              Your Codebase
```

---

## Commands

### Setup & inspection

| Command | Description |
|---------|-------------|
| `omnix init` | Interactive full setup — vault + adapters + `.claude/` structure |
| `omnix init --yes` | Non-interactive (accepts all defaults) |
| `omnix init --dry-run` | Preview all writes without touching disk |
| `omnix init --adapters claude,cursor` | Install specific adapters only |
| `omnix tutorial` | 5-step first-run walkthrough |
| `omnix status` | Health score (A–F) + vault stats + next steps |
| `omnix detect` | List all installed Omnix files |
| `omnix doctor` | Health check: adapters, vault, cross-refs |
| `omnix verify` | Confirm convention files are readable by AI tools |
| `omnix scan` | Detect project stack, frameworks, and AI tools |
| `omnix scan --write` | Write detection results into vault |
| `omnix scan --deep` | Code intelligence: entry points, hotspots, test gaps, risks |
| `omnix workspace` | List all monorepo packages with health scores |
| `omnix workspace --health` | Per-package breakdown: tests, typecheck, lint, readme |
| `omnix install-adapters --adapters <list>` | Add adapter files after init |
| `omnix update` | Update adapter files to latest installed version |

### Memory

| Command | Description |
|---------|-------------|
| `omnix retrieve-context --task "<task>"` | Task-type-aware vault retrieval with token budget |
| `omnix retrieve-context --mode debugging` | Force retrieval mode (minimal/balanced/deep/architecture/debugging) |
| `omnix context-pack --mode balanced` | Bounded ≤3000-token snapshot |
| `omnix session-digest --tool claude-code` | Write session digest to vault |
| `omnix session-digest --auto` | Auto-generate digest from git diff (no prompts) |
| `omnix diff` | Show changed files since last recorded session digest |
| `omnix memory --compact` | Compress sessions + prune old entries + update index |
| `omnix memory --stats` | Vault size report per folder |
| `omnix sync-memory --compress` | Compress sessions older than 7 days |
| `omnix sync-memory --prune 90` | Archive sessions older than 90 days |
| `omnix error-match "<error text>"` | BM25 search error memory for past fixes |
| `omnix vault validate` | Schema validation (use in CI: exits 1 on errors) |
| `omnix vault streak` | ASCII activity heatmap + streak stats |
| `omnix vault migrate` | Upgrade vault schema version (1.0 → 1.1 etc.) |
| `omnix vault self-test` | Verify adapters reference vault correctly |
| `omnix check-secrets` | Scan vault for leaked API keys, tokens, passwords |
| `omnix check-secrets --json` | Machine-readable output (CI-safe) |

### Skills

| Command | Description |
|---------|-------------|
| `omnix skills` | List all skills with handler status |
| `omnix skills --filter <keyword>` | Search skills by name, description, or trigger |
| `omnix skills --inspect <name>` | Read full SKILL.md instructions |
| `omnix skills --activate <name>` | Add skill to `CLAUDE.md` active skills section |
| `omnix skills --run <name>` | Execute a live skill runtime handler |
| `omnix skills --run <name> --input "<text>"` | Pass context to skill handler |
| `omnix skills --run <name> --dry-run` | Preview vault writes without committing |
| `omnix skills doctor` | Schema compliance check all skill files |

### Routing, research & hooks

| Command | Description |
|---------|-------------|
| `omnix route "<request>"` | Deterministic routing → workflow + agents |
| `omnix team-plan "<request>"` | Multi-role reasoning checklist (no LLM required) |
| `omnix research "<query>"` | Cached npm/GitHub/Node.js lookup |
| `omnix hooks --list` | Show installed git hooks |
| `omnix hooks --install all` | Install pre-commit (secrets) + post-commit (digest) |
| `omnix hooks --install pre-commit` | Block commits containing detected secrets |
| `omnix hooks --install post-commit` | Auto-write session digest after each commit |
| `omnix hooks --uninstall <hook>` | Remove a git hook |

---

## Memory System

Omnix uses a **retrieve → work → digest** loop that makes your AI tool retain knowledge across sessions.

### The loop

```bash
# 1. Before starting any task
omnix retrieve-context --task "add Stripe payment flow"
# → Loads relevant vault content: project context, past decisions, related errors

# 2. Do your work with your AI tool normally

# 3. After finishing (or omnix hooks --install post-commit for automation)
omnix session-digest --auto
# → Writes YYYY-MM-DD/session-HHMM-claude-code.md to 01-SESSIONS/
```

### Error memory — never repeat a bug

```bash
# After fixing a bug — record it
omnix skills --run error-intelligence \
  --input "TypeError: Cannot read property 'id' of null | user.id was undefined on logout | added null guard before access"

# Before diagnosing a new bug — search past fixes
omnix error-match "cannot read property of null"
# → Returns ranked matches from 03-ERRORS/ using BM25 scoring
```

### Retrieval modes

| Mode | Token budget | Prioritizes |
|------|-------------|-------------|
| `minimal` | 500 | Project context only |
| `balanced` *(default)* | 1 500 | Project context + recent sessions |
| `deep` | 3 000 | Full relevant vault scan |
| `architecture` | 4 000 | Architecture files + decision records first |
| `debugging` | 2 000 | Error memory + anti-patterns first |

Mode is **auto-detected** from the task description. Override with `--mode <mode>`.

### Vault folders

| Folder | Purpose |
|--------|---------|
| `00-INBOX/` | Unsorted notes, quick captures |
| `01-SESSIONS/` | Per-session digests (auto-written) |
| `02-PROJECTS/` | Project context, goals, current state |
| `03-ERRORS/` | Error memory with BM25 search |
| `04-DECISIONS/` | ADR index + decision entries |
| `05-ARCHITECTURE/` | System overview, repo scan, threat model |
| `06-WORKFLOWS/` | Custom workflow notes |
| `07-LESSONS/` | Lessons learned + research cache |
| `08-PROMPTS/` | Prompt library |
| `09-AGENTS/` | Agent notes |
| `10-DAILY-DIGESTS/` | Daily summary entries |

### Vault lifecycle

```bash
omnix vault validate           # CI-safe schema check (exits 1 on errors)
omnix vault validate --json    # Machine-readable findings
omnix vault streak             # ASCII heatmap + streak stats
omnix vault migrate            # Upgrade vault schema version
omnix vault migrate --dry-run  # Preview migration
omnix vault self-test          # Verify adapter → vault references
omnix memory --compact         # Compress + prune + rebuild index
omnix memory --stats           # Size report per folder
```

---

## Skill Engine

10 skills have **live runtime handlers** — they read your codebase and produce real output.

| Skill | Handler | What it does |
|-------|---------|-------------|
| `debugging-specialist` | ✅ Live | 4-phase debug loop · BM25 error search · hypothesis generator |
| `error-intelligence` | ✅ Live | Record a fixed bug to error memory with dedup check |
| `context-manager` | ✅ Live | Task-type-aware context snapshot with token budget enforcement |
| `workflow-router` | ✅ Live | Deterministic task → workflow + agents + skills mapping |
| `repo-scanner` | ✅ Live | Entry points · hotspots >200 lines · test gaps · 0–100 risk score |
| `dependency-doctor` | ✅ Live | npm audit + outdated packages + license count (cross-platform) |
| `documentation-maintainer` | ✅ Live | Doc drift detection · README/CHANGELOG health |
| `test-architect` | ✅ Live | Test gap analysis · framework detection · test plan generator |
| `security-threat-modeler` | ✅ Live | STRIDE + OWASP pattern scan · secrets check · dep audit |
| `release-manager` | ✅ Live | Pre-release checklist · version bump detection · release commands |

```bash
# Run any live skill
omnix skills --run debugging-specialist --input "TypeError: null at auth.ts:42"
omnix skills --run security-threat-modeler
omnix skills --run test-architect
omnix skills --run repo-scanner
omnix skills --run release-manager --input "0.2.0"
```

### 20 additional skill specs

Spec-only skills (instructions + triggers, no runtime handler yet):

`kubernetes-operator` · `docker-expert` · `cicd-engineer` · `performance-profiler` · `observability-engineer` · `api-contract-guardian` · `database-migration-specialist` · `ui-ux-reviewer` · `accessibility-auditor` · `design-system-maintainer` · `web-scraping-architect` · `browser-automation-specialist` · `ml-engineer` · `data-pipeline-engineer` · `agent-orchestration` · `context-engineering` · `prompt-engineering` · `session-memory` · `code-review` · `web-scraping`

---

## Adapters

Each adapter is a **thin convention file** that points to `AGENTS.md` and the memory vault. Zero rule duplication — all rules live in one place.

| Tool | Files installed | Status |
|------|----------------|--------|
| **Claude Code** | `CLAUDE.md` · `.claude/` (full folder structure) | ✅ Stable |
| **Generic** | `AGENTS.md` · `AI_RULES.md` · `STARTUP_PROTOCOL.md` | ✅ Always installed |
| **Cursor** | `.cursor/rules/*.mdc` (5 files) | ✅ Stable |
| **Aider** | `CONVENTIONS.md` | ✅ Stable |
| **Windsurf** | `.windsurf/rules.md` | ⚠️ Verify path against current docs |
| **Cline** | `.cline/instructions.md` | ⚠️ Verify path against current docs |
| **Roo Code** | `.roo/instructions.md` | ⚠️ Verify path against current docs |
| **Continue** | `.continue/config.md` | ⚠️ Verify path against current docs |
| **OpenHands** | `.openhands/instructions.md` | ⚠️ Verify path against current docs |

> Windsurf, Cline, Roo, Continue, and OpenHands are **template adapters** — file paths vary by version. Verify against each tool's current documentation.

### Claude Code `.claude/` structure

When `--adapters claude` is included (the default), Omnix creates the full Claude Code project structure:

```
.claude/
├── CLAUDE.md               Project instructions — committed to git
├── CLAUDE.local.md         Personal overrides — gitignored
├── settings.json           Team permissions (all commands allowed) — committed
├── settings.local.json     Personal permission overrides — gitignored
├── .mcp.json               MCP server configuration stubs
├── agents/README.md        How to define project-specific subagents
├── skills/README.md        How to add project slash commands
└── rules/
    ├── code-style.md       TypeScript + commit message conventions
    ├── frontend/
    │   └── react.md        React component conventions
    └── packages/           Auto-generated per-package rules (monorepos)
        ├── README.md
        └── <pkg-name>.md   Generated by omnix init in monorepos
```

---

## Monorepo Support

Omnix has first-class support for monorepos. It detects **Turborepo, Nx, Lerna, and pnpm workspaces** and adapts accordingly.

### Detection

Omnix detects a monorepo when any of these are present:

- `turbo.json` — Turborepo
- `nx.json` — Nx
- `lerna.json` — Lerna
- `pnpm-workspace.yaml` — pnpm workspaces

It enumerates packages from: `apps/` · `packages/` · `libs/` · `services/` · `tools/`

### What changes in a monorepo

**On `omnix init`:**
- Creates root-level vault + adapters as usual
- Generates `.claude/rules/packages/<name>.md` for every detected workspace package
- Each package rule file is pre-filled with the package path, type, and boundary stubs

**On `omnix scan --deep`:**
- Traverses every workspace package separately
- Reports entry points, hotspots, and test gaps prefixed with the package path (`apps/web/src/...`)
- Aggregates risks across all packages

**On `omnix skills --run repo-scanner`:**
- Scans each package independently
- Averages health scores across packages
- Labels all paths with their package prefix

**`omnix workspace` command:**

```bash
omnix workspace            # List all packages with A–F health grades
omnix workspace --health   # Per-package breakdown
omnix workspace --json     # Machine-readable output
```

Example output:

```
── apps/ ──────────────────────────────────────────
  A  ██████████  apps/web      (node)
  B  ████████░░  apps/api      (node)
  C  ██████░░░░  apps/mobile   (node)

── packages/ ──────────────────────────────────────
  A  ██████████  packages/ui       (node)
  B  ████████░░  packages/shared   (node)

Overall workspace health: B (72/100)
```

### Package health scoring

Each package is scored on 5 dimensions (0–100):

| Dimension | Points | Check |
|-----------|--------|-------|
| Tests | 30 | `tests/`, `__tests__/`, or co-located `.test.ts` files |
| Typecheck script | 25 | `"typecheck"` or `"tsc"` in `package.json` scripts |
| Lint script | 20 | `"lint"`, `"eslint"`, or `"biome"` in `package.json` scripts |
| README | 15 | `README.md` present in package root |
| Omnix rule | 10 | `.claude/rules/packages/<name>.md` exists and is filled |

---

## Security

Omnix is built with a defense-in-depth approach to secret safety.

### Secret sanitization

Before every vault write, content is sanitized for:

| Pattern | Example |
|---------|---------|
| OpenAI API keys | `sk-...` |
| GitHub tokens | `ghp_...` · `ghx_...` |
| AWS access keys | `AKIA...` |
| JWT tokens | `eyJ...` three-segment format |
| Stripe keys | `sk_live_...` · `sk_test_...` |
| Slack bot tokens | `xoxb-...` |
| Postgres connection strings | `postgres://user:pass@...` |
| `.env` secret values | `DATABASE_PASSWORD=...` |

### Hardened file operations

- **Path traversal prevention** — all file paths are validated to stay within the project root. Any path escaping the project directory throws immediately.
- **`.gitignore` auto-update** — `omnix init` appends `.omnix/memory/`, `.omnix/cache/`, `.claude/settings.local.json`, and `.claude/CLAUDE.local.md` to prevent accidental commits.
- **Pre-commit hook** — `omnix hooks --install pre-commit` blocks any commit containing detected secret patterns.
- **On-demand scan** — `omnix check-secrets --json` for CI pipelines (exits with code 1 if findings exist).

---

## Agent Personas

6 core personas are installed by default and referenced from `AGENTS.md`:

| Persona | Domain | Use when |
|---------|--------|----------|
| `architect` | System design, ADRs, trade-offs | Adding new services, changing data models |
| `fullstack` | Cross-layer feature work | Building features that span frontend + backend |
| `security` | Threat modeling, auth, secrets | Touching auth, payment flows, user data |
| `qa` | Test design, coverage gaps | Adding tests, reviewing coverage |
| `debugger` | Root cause analysis, error patterns | Diagnosing bugs, investigating failures |
| `reviewer` | Code quality, convention adherence | Pre-PR review, refactoring |

17 additional specialized personas are available in the `packages/core/agents/specialized/` directory.

---

## Development Status

| Component | Status | Notes |
|-----------|--------|-------|
| CLI — 23 commands | ✅ Working | 126/126 tests passing |
| 10 skill runtime handlers | ✅ Working | debug · test · security · devops · release · docs |
| Vault scaffolding (11 folders) | ✅ Working | |
| `.claude/` full folder structure | ✅ Working | agents/ · skills/ · rules/ · settings |
| Adapters: Claude Code, Cursor, Generic, Aider | ✅ Stable | |
| Adapters: Windsurf, Cline, Roo, Continue, OpenHands | ⚠️ Template | Verify file paths against current tool docs |
| Secret sanitization (12 patterns) | ✅ Working | Redacts before every vault write |
| Vault migration system | ✅ Working | v1.0 → v1.1 |
| Git hooks (cross-platform) | ✅ Working | Windows + Unix |
| Monorepo detection + workspace command | ✅ Working | turbo · nx · lerna · pnpm workspaces |
| Per-package `.claude/rules/` generation | ✅ Working | Auto-generated on monorepo init |
| Activity heatmap | ✅ Working | `omnix vault streak` |
| BM25 error search | ✅ Working | `omnix error-match` |
| 20 remaining skill specs | 📋 Spec | Instructions only — no runtime handler yet |
| `omnix research` | ⚠️ Limited | npm + GitHub + Node.js only |
| Parallel team mode / swarm | 📋 Docs only | Single-session reasoning checklist |

---

## Contributing

```bash
git clone https://github.com/Abhiram1106/omnix.git
cd omnix
pnpm install
pnpm build        # → dist/index.js (593 KB)
pnpm test         # → 126/126 tests pass
pnpm typecheck    # → 0 errors
```

### Project layout

```
omnix/
├── apps/cli/
│   ├── src/
│   │   ├── commands/     22 CLI commands
│   │   ├── skills/       10 live skill handlers + skill runner
│   │   └── utils/        detect-stack · paths · logger · sanitize · vault
│   ├── templates/
│   │   ├── adapters/     claude · cursor · windsurf · cline · roo · continue · aider · openhands · generic
│   │   ├── skills/       30 SKILL.md files
│   │   └── vault/        11 folder READMEs + 10 template files
│   └── tests/            16 test files, 126 tests
├── packages/             (future: shared types, validator)
├── docs/                 Documentation site (index.html)
└── turbo.json
```

### What we welcome

- Adapter file path fixes when tools release new versions
- New skill runtime handlers for any of the 20 spec-only skills
- Real-world feedback: "I tried Omnix on my project and X was confusing"
- Monorepo edge cases (Nx with libs/, Rush, Yarn Berry workspaces)
- Windows compatibility issues

### What we are not adding yet

- New autonomous/swarm features
- New agent personas (23 already defined)
- LLM-dependent commands without an offline fallback
- Cloud sync or remote vault storage

Issues: [github.com/Abhiram1106/omnix/issues](https://github.com/Abhiram1106/omnix/issues)

---

## License

MIT — see [LICENSE](LICENSE).

---

<div align="center">

**Files, not magic.** Your AI tool reads the files Omnix writes.

*Built for engineers who work in monorepos, use multiple AI tools, and need memory that outlasts a context window.*

</div>

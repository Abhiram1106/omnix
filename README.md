# Omnix

> Context-aware AI engineering runtime. Memory vault. Workflow conventions. 10 live skill engines.

[![npm version](https://img.shields.io/npm/v/omnix?color=6c63ff&style=flat-square)](https://www.npmjs.com/package/omnix)
[![license](https://img.shields.io/npm/l/omnix?color=10b981&style=flat-square)](LICENSE)
![tests](https://img.shields.io/badge/tests-126%20passing-10b981?style=flat-square)
[![node](https://img.shields.io/node/v/omnix?style=flat-square)](package.json)

**Omnix gives every AI coding tool a persistent memory vault, workflow conventions, and a live skill engine.**  
Works with Claude Code · Cursor · Windsurf · Cline · Roo · Continue · Aider · OpenHands.

```bash
npx create-omnix
```

---

## What Omnix is

Omnix is a **CLI that writes structured files into your project**. Those files tell your AI tool:

- Where to store and retrieve memory (`.obsidian-ai-memory/` vault — 11 folders of plain markdown)
- Which conventions to follow (adapter files: `CLAUDE.md`, `.cursor/rules/`, `AGENTS.md`, etc.)
- Which workflows to activate for different task types
- Which agent personas to apply for different domains

> **Omnix is scaffolding and convention.** It does not run autonomously, does not call any AI API, and requires no internet connection. Your AI tool reads the files Omnix writes.

---

## Architecture

```
Your AI Coding Tool (Claude Code / Cursor / Cline / …)
        ↓ reads
   Adapter Layer      CLAUDE.md · .cursor/rules/ · AGENTS.md
        ↓ follows
  Workflow Router     "fix login bug" → debugging workflow + agents
        ↓ activates
   Skill Engine       10 live handlers: debug · test · security · devops · release
        ↓ queries
Context Retrieval     task-type-aware vault load, token budget enforced
        ↓ reads/writes
Obsidian Memory Vault .obsidian-ai-memory/ (11 folders, plain markdown)
        ↓ lives in
    Your Codebase     local · portable · no cloud
```

---

## Quick start

```bash
# Initialize (interactive)
npx create-omnix

# Run the tutorial (5-step walkthrough)
omnix tutorial

# See your health score
omnix status

# Install git hooks (optional, recommended)
omnix hooks --install all
```

After `init`, your project has:

```
.obsidian-ai-memory/     Memory vault (11 folders + templates)
  00-INBOX/
  01-SESSIONS/           ← session digests (YYYY-MM-DD/session-HHMM-<tool>.md)
  02-PROJECTS/           ← project context, goals, current state
  03-ERRORS/             ← error memory — BM25 searchable ⭐
  04-DECISIONS/          ← ADR index
  05-ARCHITECTURE/       ← system overview, threat model
  06-WORKFLOWS/
  07-LESSONS/            ← lessons learned, external research cache
  08-PROMPTS/
  09-AGENTS/
  10-DAILY-DIGESTS/
  templates/

.omnix/                  Runtime config
  settings/omnix.json
  .omnix-vault-version   ← schema version for migrations

CLAUDE.md                Claude Code adapter
AGENTS.md                Universal adapter (always installed)
AI_RULES.md              Shared engineering rules
STARTUP_PROTOCOL.md      Session startup contract
.cursor/rules/           Cursor adapter (5 .mdc files)
```

---

## All commands

### Setup & inspection

```bash
omnix init                           # Interactive full setup
omnix init --yes                     # Non-interactive (accept all defaults)
omnix init --dry-run                 # Preview without writing
omnix tutorial                       # 5-step first-run walkthrough
omnix tutorial --step 3              # Jump to a specific step
omnix status                         # Health score + vault stats + next steps
omnix detect                         # List all installed Omnix files
omnix doctor                         # Health check: adapters, vault, cross-refs
omnix verify                         # Confirm convention files are AI-readable
omnix scan                           # Detect project stack and frameworks
omnix scan --write                   # Write detection results to vault
omnix scan --deep                    # Code intelligence: hotspots, test gaps, risks
omnix install-adapters --adapters claude,cursor,generic
omnix update                         # Update adapter files to latest version
```

### Memory

```bash
omnix retrieve-context --task "fix login bug"
omnix retrieve-context --mode debugging      # Force retrieval mode
omnix context-pack --mode balanced           # Bounded ≤3000-token snapshot
omnix session-digest --tool claude-code      # Write session digest
omnix session-digest --auto                  # Auto-generate from git diff
omnix diff                                   # Changed files since last digest
omnix memory --compact                       # Compress + prune + update index
omnix memory --stats                         # Vault size report
omnix sync-memory --compress                 # Compress sessions > 7 days old
omnix sync-memory --prune 90                 # Archive sessions > 90 days old
omnix error-match "TypeError cannot read"    # Search error memory (BM25)
omnix vault validate                         # Schema validation
omnix vault streak                           # Activity heatmap + streak stats
omnix vault migrate                          # Upgrade vault schema version
omnix vault self-test                        # Verify adapters reference vault
omnix check-secrets                          # Scan vault for leaked secrets
omnix check-secrets --json                   # Machine-readable output for CI
```

### Skills

```bash
omnix skills                                    # List all by status
omnix skills --filter security                  # Search by keyword
omnix skills inspect test-architect             # Read full skill instructions
omnix skills activate debugging-specialist      # Add to CLAUDE.md
omnix skills --run debugging-specialist --input "TypeError: null"
omnix skills --run security-threat-modeler      # STRIDE scan
omnix skills --run test-architect               # Test gap analysis
omnix skills --run release-manager --input "0.2.0"
omnix skills doctor                             # Schema check all skill files
```

### Routing & hooks

```bash
omnix route "fix the auth bug"           # Deterministic workflow + agent routing
omnix team-plan "add payment system"     # Multi-role reasoning checklist
omnix hooks --list                       # Show installed git hooks
omnix hooks --install pre-commit         # Block commits with secrets
omnix hooks --install post-commit        # Auto-write digest after commits
omnix hooks --install all
omnix hooks --uninstall pre-commit
omnix research "npm vitest"              # Cached npm/GitHub/Node.js lookup
```

---

## The memory loop

Every session follows three steps:

```
1. RETRIEVE  →  omnix retrieve-context --task "<your task>"
2. WORK      →  use your AI tool normally
3. DIGEST    →  omnix session-digest --auto
```

**After fixing a bug** — record it:
```bash
omnix skills --run error-intelligence \
  --input "TypeError: null | user.createdAt was undefined | added null guard"
```

**Search past fixes** before diagnosing:
```bash
omnix error-match "cannot read property of null"
# → finds past error entries ranked by relevance
```

**Automate with git hooks:**
```bash
omnix hooks --install all
# pre-commit: blocks if secrets detected
# post-commit: auto-writes session digest
```

---

## Skill Engine

10 skills have live runtime handlers. They analyse your actual project:

| Skill | What it does |
|-------|-------------|
| `debugging-specialist` | 4-phase debug loop + error-memory BM25 search + hypothesis generator |
| `error-intelligence` | Record a fixed bug to error-memory.md with dedup check |
| `context-manager` | Task-type-aware context snapshot respecting token budget |
| `workflow-router` | Deterministic task → workflow + agents + skills mapping |
| `repo-scanner` | Entry points, hotspots >200 lines, test gaps, 0–100 risk score |
| `dependency-doctor` | npm audit + outdated packages + license check (cross-platform) |
| `documentation-maintainer` | Doc drift detection + README/CHANGELOG health |
| `test-architect` | Test gap analysis + framework detection + test plan generator |
| `security-threat-modeler` | STRIDE + OWASP pattern scan + secrets check + dep audit |
| `release-manager` | Pre-release checklist + bump detection + release commands |

```bash
# Run any skill
omnix skills --run <name> [--input "<context>"] [--dry-run]
```

20 additional skill specs cover: Kubernetes, Docker, CI/CD, performance profiling, observability, API contracts, database migrations, UI/UX, accessibility, design systems, scraping, browser automation.

---

## Adapters

Each adapter is a thin file that points to `AGENTS.md` and the memory vault. No rule duplication.

| Tool | File(s) | Status |
|------|---------|--------|
| Claude Code | `CLAUDE.md`, `.claude/settings.json` | Stable |
| Generic | `AGENTS.md`, `AI_RULES.md`, `STARTUP_PROTOCOL.md` | Always installed |
| Cursor | `.cursor/rules/*.mdc` (5 files) | Stable |
| Aider | `CONVENTIONS.md` | Stable |
| Windsurf | `.windsurf/rules.md` | **Verify path** against current Windsurf docs |
| Cline | `.cline/instructions.md` | **Verify path** against current Cline docs |
| Roo Code | `.roo/instructions.md` | **Verify path** against current Roo docs |
| Continue | `.continue/config.md` | **Verify path** against current Continue docs |
| OpenHands | `.openhands/instructions.md` | **Verify path** against current OpenHands docs |

> Windsurf, Cline, Roo, Continue, and OpenHands are **TEMPLATE** adapters — their file paths may have changed. Verify against each tool's current documentation before relying on them.

---

## Retrieval modes

`omnix retrieve-context` and `omnix context-pack` load the vault intelligently:

| Mode | Budget | Loads first |
|------|--------|-------------|
| `minimal` | 500 tokens | Project context only |
| `balanced` (default) | 1 500 tokens | Project context + recent sessions |
| `deep` | 3 000 tokens | Full relevant vault |
| `architecture` | 4 000 tokens | Architecture + decisions first |
| `debugging` | 2 000 tokens | Error memory + anti-patterns first |

Mode is auto-detected from the task description. Override with `--mode <mode>`.

---

## Vault lifecycle

```bash
# Validate schema (use in CI)
omnix vault validate
omnix vault validate --json   # exits 1 if errors found

# Activity tracking
omnix vault streak             # ASCII heatmap + streak stats

# Migrate schema version
omnix vault migrate            # upgrades vault from 1.0 → 1.1 etc.
omnix vault migrate --dry-run  # preview without writing

# Adapter self-test
omnix vault self-test          # verify adapters reference vault correctly
```

---

## Secret safety

- **Before every vault write**: session digests are sanitized (API keys, JWTs, PEM keys, DB URLs, `.env` values)
- **`.gitignore`**: init auto-adds `.omnix/memory/` and `.omnix/cache/`
- **Pre-commit hook**: `omnix hooks --install pre-commit` blocks commits with detected secrets
- **Scheduled scan**: `omnix check-secrets` scans the vault on demand (use in CI with `--json`)
- **Path traversal**: all file paths are validated to stay within the project directory

---

## Agent personas

6 core personas installed by default:

| Persona | Focus |
|---------|-------|
| `architect` | System design, trade-offs, ADRs |
| `fullstack` | Cross-layer feature work |
| `security` | Threat modeling, auth, secrets |
| `qa` | Test design, coverage gaps |
| `debugger` | Root cause analysis, error patterns |
| `reviewer` | Code quality, convention adherence |

17 additional specialized personas in `packages/core/agents/specialized/`.

---

## Development status

| Component | Status | Notes |
|-----------|--------|-------|
| CLI (22 commands) | **Working** | 126/126 tests pass |
| 10 skill runtime handlers | **Working** | debug, test, security, devops, release, docs |
| Vault scaffolding | **Working** | |
| Adapters: Claude Code, Cursor, Generic, Aider | **Working** | Stable |
| Adapters: Windsurf, Cline, Roo, Continue, OpenHands | **TEMPLATE** | Verify file paths |
| Secret sanitization | **Working** | Redacts before every vault write |
| Vault migration system | **Working** | v1.0 → v1.1 |
| Git hooks | **Working** | Cross-platform (Windows + Unix) |
| Activity heatmap | **Working** | ASCII streak in `omnix vault streak` |
| 20 remaining skill specs | **SPEC** | Instructions only, no runtime handler |
| `omnix research` (general) | **Limited** | npm + GitHub + Node.js only |
| Parallel team mode / swarm | **Docs only** | Single-session reasoning checklist |

---

## Installation

**Node.js 18+ required. No API keys. No accounts. No cloud.**

```bash
# npx (no install)
npx create-omnix

# npm global
npm install -g omnix
omnix init

# pnpm global
pnpm add -g omnix
omnix init
```

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) and [CHANGELOG.md](CHANGELOG.md).

Issues: [github.com/Abhiram1106/omnix/issues](https://github.com/Abhiram1106/omnix/issues)

```bash
git clone https://github.com/Abhiram1106/omnix.git
cd omnix
pnpm install
pnpm build
pnpm test        # 126 tests
pnpm typecheck   # 0 errors
```

**What we welcome:** adapter fixes for format drift, skill handler implementations, real-world feedback ("I tried Omnix on my project and X was confusing").

**What we don't want yet:** new swarm/autonomous features, new agent personas (we have 23), LLM-dependent commands without offline fallback.

---

## License

MIT — see [LICENSE](LICENSE).

---

> Files, not magic. Your AI tool reads the files Omnix writes.

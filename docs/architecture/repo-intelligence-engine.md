# Omnix — Repo Intelligence Engine
> Phase 5. Architecture design for deep repository understanding.
> Inspired by: gstack, Agent-Skills-for-Context-Engineering, everything-claude-code, Scrapegraph-ai.

---

## Purpose

Most AI tools understand syntax. Omnix should understand *repositories* — their architecture, patterns, risks, and opportunities. The Repo Intelligence Engine is the layer that turns raw code into actionable engineering context.

This is different from what `omnix scan` does today (stack detection via manifest parsing). The engine goes deeper: it understands *how* the project is organized, *what* the hot paths are, *where* the risks are, and *what* Omnix should do about them.

---

## What the Engine Produces

For any repository, the engine produces a **Context Pack** — a structured summary that:
1. Fits in a bounded token budget (max 3,000 tokens)
2. Gets written to `05-ARCHITECTURE/repo-scan.md`
3. Gets referenced by context-manager for retrieval
4. Gets updated automatically on significant changes

---

## Engine Architecture

```
Input: project directory (cwd)
       ↓
┌─────────────────────────────┐
│  1. Structure Scanner        │  file tree, entry points, module map
│  2. Stack Inference          │  frameworks, languages, tools, CI
│  3. Dependency Grapher       │  import graph, coupling analysis
│  4. Workflow Detector        │  git patterns, CI/CD, deployment triggers
│  5. Pattern Discovery        │  coding conventions, style, anti-patterns
│  6. Risk Detector            │  security smells, test gaps, complexity hotspots
│  7. Memory Extractor         │  existing docs, comments, TODOs
│  8. Context Pack Generator   │  structured output, token-budgeted
└─────────────────────────────┘
       ↓
Output: context-pack (05-ARCHITECTURE/repo-scan.md)
        + vault updates (structured sections)
        + integration recommendations
```

---

## 1. Structure Scanner

**Purpose:** Build a mental map of the repository.

**Inputs:** File tree (all files, no content)  
**Outputs:** Entry points, module map, size distribution

**What it detects:**
```
Entry points:
  - apps/cli/src/index.ts    (bin script)
  - apps/web/src/main.tsx    (React entry)
  - api/server.py            (API server)

Module map (detected from directory patterns):
  - apps/          → deployable applications
  - packages/      → shared libraries
  - services/      → microservices
  - lib/           → utilities
  - tests/         → test suites

Hotspot files (top-10 by size):
  - src/commands/init.ts      2,847 lines  ← likely needs splitting
  - src/utils/detect-stack.ts 1,203 lines
  - ...

Directory depth: max 6 levels deep ← flag if > 8
Orphan files: 3 files at root level with no clear owner
```

**Implementation:**
```typescript
interface StructureScan {
  entryPoints: string[]
  moduleMap: Record<string, string[]>  // module type → directories
  hotspots: Array<{ path: string; lines: number; warning?: string }>
  orphans: string[]
  maxDepth: number
  totalFiles: number
  totalLines: number
}
```

---

## 2. Stack Inference

**Purpose:** Understand the full technology stack, not just "it has package.json."

**Inputs:** Manifest files, config files, import patterns  
**Outputs:** Comprehensive stack profile

**What it detects (beyond current `detect-stack.ts`):**

| Category | How detected |
|----------|-------------|
| Languages | File extensions, shebangs, manifest keys |
| Frameworks | Config files (next.config.js, nuxt.config.ts, etc.) |
| Build tools | tsup, vite, webpack, esbuild, turbo, nx |
| Package manager | lockfile (pnpm-lock, yarn.lock, package-lock.json) |
| Database | ORM configs (prisma.schema, drizzle.config.ts, alembic.ini) |
| Auth | Packages (next-auth, lucia, clerk, supabase-auth) |
| CSS system | Tailwind, CSS modules, styled-components |
| State management | Redux, Zustand, Jotai, React Query |
| Testing | vitest, jest, pytest, go test |
| CI/CD | .github/workflows/, .gitlab-ci.yml, Jenkinsfile |
| Deployment | Dockerfile, docker-compose.yml, fly.toml, vercel.json, render.yaml |
| Observability | Sentry, Datadog, Prometheus configs |
| API style | REST (Express/FastAPI), GraphQL (schema.graphql), gRPC (.proto) |

**Output format:** scored confidence per detection (certain/probable/possible)

---

## 3. Dependency Grapher

**Purpose:** Understand module coupling without running the full compiler.

**Approach:** Static import analysis (TypeScript/JavaScript/Python AST-free regex scan for imports)

**What it produces:**

```
Import graph (top-level only):
  src/commands/init.ts  →  src/utils/paths.ts
                         →  src/utils/detect-stack.ts
                         →  src/utils/write-digest.ts
  
Coupling scores (files imported by N others):
  src/utils/logger.ts   → imported by 11 files  ← HIGH coupling (safe, it's a utility)
  src/utils/paths.ts    → imported by 8 files   ← HIGH coupling (worth stabilizing)
  src/commands/init.ts  → imported by 2 files   ← LOW coupling (normal for commands)

Circular imports: NONE detected
  (if found: flag with exact cycle path)

Abstraction inversions:
  NONE detected
  (if found: low-level module importing high-level module = flag)
```

**Implementation:** Regex scan for `import ... from '...'` and `require('...')` patterns. Build adjacency map. Count in-degree per node.

---

## 4. Workflow Detector

**Purpose:** Understand how the project actually ships code.

**Inputs:** .github/workflows/, git history patterns, Makefile, package.json scripts  
**Outputs:** Workflow map

**What it detects:**

```
Detected workflows:
  Build:      pnpm build → tsup → dist/index.js
  Test:       pnpm test → vitest run
  Typecheck:  pnpm typecheck → tsc --noEmit
  Lint:       pnpm lint → eslint (if configured)
  Release:    npm publish (from publish:dry script)

CI/CD:
  Trigger: push to main
  Steps: typecheck → build → test → publish:dry
  Missing: no deploy step (manual?)

Git patterns:
  Branching: direct commits to main (no branch pattern detected)
  Commit style: conventional commits (feat/fix/chore/docs pattern found)
  Release tagging: no recent tags found
```

---

## 5. Pattern Discovery

**Purpose:** Understand project conventions so future code follows them.

**Inputs:** Sample of source files (representative, not exhaustive)  
**Outputs:** Convention fingerprint

**What it detects:**
- Error handling style (throw vs return error objects vs Result type)
- Async style (async/await vs .then() vs callbacks)
- Type patterns (typed vs untyped, inference vs explicit)
- File naming conventions (camelCase vs kebab-case vs PascalCase)
- Test patterns (vitest describe/it vs jest test() vs inline)
- Import style (named vs default exports)
- Logging pattern (console.log vs logger vs structured)

**Output:** Convention doc added to `05-ARCHITECTURE/conventions.md`

---

## 6. Risk Detector

**Purpose:** Flag issues before they become problems.

**Risk categories:**

| Risk | Detection Method | Severity |
|------|-----------------|----------|
| Large files (> 500 lines) | Line count scan | Medium |
| No test files | Test coverage gap | High |
| Sensitive files in wrong place | .env, secrets, private keys not in .gitignore | Critical |
| Missing .gitignore entries | Check Omnix dirs, .env files | High |
| Outdated dependencies | package.json engines vs installed | Medium |
| No error handling in async | `async function` without try/catch | Medium |
| Hardcoded values | IPs, URLs, credentials in source | High |
| TODO/FIXME count | Grep count | Low |
| Missing README | No README.md | Low |
| Unhandled promise rejections | `.then()` without `.catch()` | Medium |
| Git history missing | No commits | Low |

**Output:** Risk matrix with severity + specific file/line + recommended fix

---

## 7. Memory Extractor

**Purpose:** Extract existing project intelligence that should be in the vault.

**Sources:**
- README.md sections (architecture, setup, known issues)
- Code comments (especially FIXME, HACK, NOTE, TODO with context)
- Package.json description, scripts section
- CHANGELOG.md (recent changes = recent context)
- Existing ADRs (docs/adr/, DECISIONS.md)
- OpenAPI/GraphQL schemas (API surface)

**What it extracts → where it goes:**

| Source | Extract | Vault location |
|--------|---------|----------------|
| README architecture section | System overview | 05-ARCHITECTURE/ |
| Known issues section | Known bugs | 03-ERRORS/error-memory.md |
| CHANGELOG recent entries | Recent changes | 01-SESSIONS/ (backfill) |
| TODO/FIXME comments | Open work | 02-PROJECTS/open-questions.md |
| ADR files | Decisions | 04-DECISIONS/ |

---

## 8. Context Pack Generator

**Purpose:** Produce a bounded, actionable summary for use in AI sessions.

**Token budget:** max 3,000 tokens total

**Output structure (`05-ARCHITECTURE/repo-scan.md`):**

```markdown
# Repo Scan — [Project Name]
> Generated: [date] | Stack: [stack] | Files: [N] | Lines: [N]

## Architecture (500 tokens max)
[Module map, entry points, key abstractions]

## Stack (300 tokens max)
[Technologies, frameworks, tools — one line each]

## Hotspots (200 tokens max)
[Top-5 largest/most-coupled files]

## Workflows (200 tokens max)
[How to build, test, deploy]

## Conventions (300 tokens max)
[Error handling, async style, naming, testing]

## Risks (400 tokens max)
[Critical and high severity issues only]

## Recent Changes (300 tokens max)
[Last 5 git commits or CHANGELOG entries]

## Integration Recommendations (500 tokens max)
[What Omnix should do differently for this project]
```

---

## Integration Recommendation System

The engine produces specific recommendations based on what it finds:

```
Detected: Next.js + Prisma + tRPC
→ Recommend: Install database agent (specialized), API agent (specialized)
→ Recommend: Add prisma migration safety rules to AGENTS.md
→ Suggest: Use architecture retrieval mode for database changes

Detected: Python FastAPI + pytest
→ Recommend: Install debugging-specialist with Python error patterns
→ Recommend: Add pytest.ini to vault-ignore (generated, not authored)
→ Suggest: Use minimal digest for quick API endpoint additions

Detected: No CI/CD found
→ Alert: No CI detected — manual deploys are risky
→ Recommend: Add deployment workflow template
→ Suggest: Add deployment checklist to STARTUP_PROTOCOL.md

Detected: 47 TODO comments
→ Alert: Technical debt signal — 47 TODO comments found
→ Recommend: Run memory-curator to extract TODOs to vault
→ Suggest: Add debt-tracking to weekly sync-memory
```

---

## CLI Integration

```bash
# Run full repo intelligence scan
omnix scan --deep

# Run specific analysis
omnix scan --structure        # Structure scan only
omnix scan --risks            # Risk detection only
omnix scan --patterns         # Convention discovery
omnix scan --extract-memory   # Memory extraction to vault

# Update context pack
omnix scan --write --deep     # Full scan + write to vault
```

**Auto-trigger:** `omnix init` runs `omnix scan --deep` as part of onboarding. Subsequent runs are manual or triggered by `omnix sync-memory`.

---

## Engineering Scoring

The engine produces an **Engineering Score** — a rough signal of project maturity:

```
Engineering Score: 73/100

Test Coverage:        18/25  (test gap: 8 src files without tests)
Documentation:        14/20  (README good, API docs missing)
Security:             12/20  (no auth review, .env in gitignore ✓)
Code Quality:          9/15  (2 files > 500 lines, 47 TODOs)
CI/CD:                 8/10  (CI exists, no deploy automation)
Dependencies:         12/10  (all up to date, 0 critical CVEs)

Recommendations:
→ Add tests for: src/commands/sync-memory.ts, src/commands/update.ts
→ Document: API surface for CLI commands
→ Review: security in memory sanitization path
→ Split: src/commands/init.ts (2,847 lines)
```

---

## How This Helps Omnix

The Repo Intelligence Engine enables Omnix to:

1. **Understand projects automatically** — no manual project-context.md filling
2. **Suggest integrations intelligently** — "this project needs the database agent"
3. **Avoid duplicate systems** — "you already have error handling here, don't add another"
4. **Avoid weak patterns** — "this project has no tests, add them before adding features"
5. **Route better** — routing knows the project's architecture, not just keywords
6. **Retrieve better** — context manager knows which files are hot paths
7. **Warn about risks** — before the AI does something dangerous

---

## Implementation Plan

**Phase 1 (P1):** Structure Scanner + Stack Inference (extend current `scan.ts`)
- Add entry point detection
- Add hotspot detection (top-10 by line count)
- Add test gap detection
- Estimated effort: 4 hours

**Phase 2 (P2):** Risk Detector + Memory Extractor
- Add risk scanning (sensitive files, missing .gitignore, hardcoded values)
- Add README/CHANGELOG extraction to vault
- Estimated effort: 6 hours

**Phase 3 (P3):** Dependency Grapher + Pattern Discovery + Scoring
- Add import graph via regex scan
- Add convention fingerprinting
- Add engineering score
- Estimated effort: 8 hours

**Phase 4 (Future):** Integration Recommendation System
- Map detected stack to agent/skill recommendations
- Personalized setup per project type
- Estimated effort: 4 hours

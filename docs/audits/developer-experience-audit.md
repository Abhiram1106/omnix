# Omnix — Developer Experience Audit
> Phase 7. Honest DX assessment with actionable improvements.

---

## Install Flow Audit

### Current state

```bash
npx omnix init
```

**What happens:**
1. CLI prompts for project name, adapters, yes/no questions
2. Creates vault (11 directories), adapter files, .omnix/ (5 subdirs), templates
3. Prints "Done" with next steps

**What users experience:**
- 20+ new files/folders appear in their project root and subdirectories
- Many files have `(fill in)` placeholders that never get filled
- No immediate visible value — it's structure, not working software
- Users don't know what to do next or which AI tool will "use" these files

**Rating: 4/10** — Works, but value is invisible on first run.

### Recommended improvements

**1. Show value immediately on init:**
```
✓ CLAUDE.md installed — Claude Code will now read project rules
✓ Memory vault created — session digests will be stored here
✓ project-context.md created — fill in your project goals

Next: Open your AI tool and start working. Omnix will activate automatically.
Run `omnix doctor` if nothing seems different.
```

**2. Minimal mode by default (already partially implemented):**
Create 6 files, not 20. Users can opt into more via `--full`.

**3. "What was created" summary:**
After init, print a 2-column table:
```
File                                Purpose
─────────────────────────────────── ──────────────────────────────────
AGENTS.md                           Rules your AI tool will follow
CLAUDE.md                           Claude Code-specific config
.obsidian-ai-memory/project-context.md  Fill this in with your project goals
.obsidian-ai-memory/templates/      Templates for session digests
.omnix/settings/omnix.json          Omnix config (rarely needs editing)
```

---

## npm/npx UX Audit

### Current state

```bash
npx omnix init           # Works
npx create-omnix         # Works (alias)
npm install -g omnix     # Works
omnix --help             # Works, good output
omnix --version          # Works
```

**Issues:**
- `npx omnix` without a subcommand exits silently (should suggest `init`)
- `omnix` with no args triggers `init` automatically — correct behavior but undocumented
- Binary name `omnix` conflicts if user has another package with that name globally

**Rating: 7/10** — Functional, minor UX gaps.

### Recommended improvements

```bash
# Current: npx omnix (no args) → triggers init (silent redirect)
# Better: show brief explanation first

npx omnix

  Omnix — AI engineering scaffolding for your project.

  Quick start:  omnix init         → initialize vault + adapters
  Verify:       omnix doctor        → check installation health
  Help:         omnix --help        → all commands

  Running `omnix init`...
```

---

## CLI UX Audit

### Current 15 commands (after this session's additions)

| Command | UX Grade | Notes |
|---------|----------|-------|
| `omnix init` | B+ | Good prompts, dry-run works, too many files |
| `omnix scan` | A- | Clear output, new --deep flag adds real value |
| `omnix detect` | B | Useful, not very discoverable |
| `omnix doctor` | A | Best command in CLI — 30+ checks, clear output |
| `omnix verify` | A- | New, very useful for debugging "why isn't this working" |
| `omnix route "request"` | A | Excellent — no LLM, fast, deterministic |
| `omnix team-plan "request"` | B | Useful but overlaps with route |
| `omnix skills` | B+ | Good listing, new --filter is useful |
| `omnix retrieve-context` | A- | Now has mode + token budget — much better |
| `omnix session-digest` | B | --auto is good, --minimal needed |
| `omnix sync-memory` | B+ | Good flags, new vault-index is useful |
| `omnix error-match "error"` | A | New, solves a real pain point |
| `omnix install-adapters` | B | Works, unclear when to re-run |
| `omnix update` | C+ | Experimental, settings merge untested |
| `omnix help` | B | Standard help, could be more example-driven |

### Pain points

1. **Too many commands to discover.** 15 commands is a lot. New users don't know where to start. Solution: group by intent in `--help` output.

2. **`team-plan` and `route` overlap.** Both route requests. `route` is cleaner (returns decision tree). `team-plan` returns a checklist. Consider merging.

3. **`install-adapters` vs `init`.** Not clear when to use each. `init` installs adapters during setup. `install-adapters` reinstalls. Add `--reinstall` to init instead.

4. **No `omnix explain <file>` command.** Users get `.obsidian-ai-memory/04-DECISIONS/` and don't know what it's for.

5. **Error messages are generic.** When vault is missing: "No memory vault found. Run `omnix init` first." — this is good. But vault errors elsewhere just say "not found."

### Better `--help` structure

```
OMNIX — AI engineering scaffolding

SETUP
  omnix init              Initialize vault + adapters in this project
  omnix scan --deep       Scan project stack + code intelligence
  omnix verify            Check all convention files are readable

DAILY USE
  omnix route "task"      Get workflow + agents for any task
  omnix retrieve-context  Load relevant vault context for a task
  omnix session-digest    Write session digest to vault
  omnix error-match "err" Find similar past errors + fixes

MAINTENANCE
  omnix sync-memory       Validate + repair vault
  omnix sync-memory --compress   Compress old sessions
  omnix sync-memory --prune 90   Archive sessions > 90 days
  omnix sync-memory --stats      Show vault size

ADVANCED
  omnix skills            List available skills
  omnix doctor            Detailed installation health check
  omnix update            Update adapter files
  omnix team-plan "task"  Multi-role reasoning plan
```

---

## Onboarding UX Audit

### First 5 minutes experience

**Current flow:**
1. `npx omnix init` — prompts, creates files
2. User opens project, sees many new files
3. User opens AI tool (Claude Code), starts working
4. Nothing visibly different unless user reads CLAUDE.md
5. No feedback loop — does omnix work?

**What's broken:**
- No "omnix is working" signal in the AI session
- User can't tell if Claude Code read the CLAUDE.md
- No demo or example session to show what good looks like
- `omnix doctor` exists but users don't know to run it

**Recommended first-5-minutes flow:**
```
1. npx omnix init --yes                     (auto mode, 6 files, 30 seconds)
2. Claude Code shows startup block:          (proof it's working)
   [Omnix] project: myapp | mode: balanced
   Loaded: project-context, error-memory
3. User asks Claude Code a question
4. Claude Code uses memory, writes digest
5. User runs `omnix sync-memory --stats`    (sees vault growing)
```

This flow proves value in under 5 minutes.

---

## Plugin/Skill Discovery Audit

### Current state

```bash
omnix skills                        # Lists all 22 skills with name + description
omnix skills --filter debugging     # Filters by keyword
omnix skills --json                 # Machine-readable
```

**Issues:**
- Skills are listed but there's no "how to activate" guidance in the listing
- Users don't know if a skill is active or not
- No skill marketplace or external skill install

### Recommended improvements

```bash
$ omnix skills

ACTIVE (auto-activated)
  ✓ context-manager     v1.0.0  [stable]   Loads vault context every session

AVAILABLE (activate with: omnix skills activate <name>)
  ○ debugging-specialist  v1.1.0  [stable]   Hypothesis-driven debugging with error memory
  ○ test-architect        v0.7.0  [exp]      Test strategy and coverage gaps
  ○ security-threat-modeler v0.6.0 [exp]    STRIDE threat modeling
  ...

$ omnix skills activate debugging-specialist
✓ Added to CLAUDE.md active skills section
  → @packages/core/skills/debugging-specialist/SKILL.md
  Reload Claude Code to apply.
```

---

## Adapter Install Flow Audit

### Current state

```bash
omnix init --adapters generic,claude,cursor
omnix install-adapters --adapters windsurf
```

**Issues:**
- Users don't know which adapter to pick if they don't know tool names
- No detection of currently active AI tool (cursor is running, but user picks wrong adapter)
- No verification after install that the adapter file is actually in the right place
- Speculative adapters (windsurf, cline, etc.) don't warn about their template status prominently enough

### Recommended improvements

```bash
$ omnix install-adapters

Detected AI tools: claude-code (CLAUDE.md present), cursor (.cursor/ found)

Install adapters for:
  ✓ claude-code   [installed — CLAUDE.md found]
  ✓ cursor        [installed — .cursor/rules/ found]
  ○ generic       [not installed — adds AGENTS.md]
  ○ windsurf      [TEMPLATE — verify path before use]

Which to install/update? (space to toggle, enter to confirm)
```

---

## Memory Setup Flow Audit

### Current state

1. `omnix init` creates vault structure
2. User sees empty markdown files
3. No guidance on what to fill in first
4. `omnix scan --write` updates project-context.md

**What's unclear to new users:**
- "What goes in `02-PROJECTS/project-context.md`?"
- "When do I actually write a session digest?"
- "How does this connect to my AI tool?"

### Recommended improvements

After init, print a one-time onboarding tip:

```
Vault created. Three things to do:

1. Edit .obsidian-ai-memory/02-PROJECTS/project-context.md
   → Add your project goals and constraints (takes 5 min)

2. Run: omnix session-digest --auto --tool claude-code
   → Writes your first session digest after each coding session

3. Run: omnix sync-memory
   → Check vault health any time

That's it. Your AI tool reads the vault automatically.
```

---

## Context Retrieval UX Audit

### Current state (after improvements)

```bash
omnix retrieve-context --task "fix auth bug" --mode debugging
```

**Output:**
```
Retrieved Context
Task: "fix auth bug"
Mode: debugging | Budget: 2000 tokens | Used: ~1,240 tokens

── [error-memory] 03-ERRORS/error-memory.md (~340 tokens) ──
...

── [project-context] 02-PROJECTS/project-context.md (~520 tokens) ──
...
```

**Rating: B+** — Much better after task-type-aware retrieval. Token budget display is useful.

**Still needed:**
- Way to see what mode was auto-detected and why
- Way to add custom files to retrieval priority
- Interactive mode: "add this file to high priority for this session"

---

## Recommended Priority Improvements

### P0 (immediate, low effort)

1. **Print "What was created" summary after init** — 2-column table, purpose for each file
2. **Group `--help` by intent** (Setup / Daily Use / Maintenance / Advanced)
3. **Print startup tip after first init** — 3 steps to get value in 5 minutes
4. **`omnix skills activate <name>`** — auto-adds to CLAUDE.md imports

### P1 (next sprint)

5. **Auto-detect active AI tool in install-adapters** — show which tools are running
6. **Better `omnix skills` listing** — show active vs available, activate command
7. **`omnix explain <file>`** — explains any Omnix file's purpose
8. **`omnix scan --deep` output** — show in more human-readable format

### P2 (later)

9. **`omnix demo`** — shows an example session using the vault and adapters
10. **Interactive init** — guided walkthrough vs current prompt-and-go
11. **`omnix status`** — single-command health overview (vault, adapters, recent sessions, skills)
12. **Merge `team-plan` into `route --verbose`** — reduce command count

---

## DX Scorecard (Current)

| Area | Score | Notes |
|------|-------|-------|
| Install speed | 9/10 | npx works, fast |
| Install safety | 7/10 | --dry-run exists, no --diff |
| First-run value | 4/10 | Too many files, value invisible |
| CLI help | 6/10 | Too flat, no grouping |
| Error messages | 7/10 | Good for vault-missing, generic elsewhere |
| Command discoverability | 5/10 | 15 commands, no grouping |
| Skill discovery | 5/10 | List exists, no activate flow |
| Adapter install | 6/10 | Works, speculative adapters unclear |
| Memory setup | 5/10 | No guidance on what to fill in |
| Context retrieval | 8/10 | Much better with mode + budget |
| **Overall** | **6.2/10** | Good foundation, DX polish needed |

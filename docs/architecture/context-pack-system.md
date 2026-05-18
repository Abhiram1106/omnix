# Context Pack System

The unit of memory retrieval. A context pack is a structured list of files (with summaries and token estimates) handed to the AI tool at session start.

## Why

Today AI tools either:
- Get nothing about the project (cold start, hallucination risk).
- Get told to "read CLAUDE.md and other relevant files" (vague, the AI guesses).
- Get a big dump of everything (token waste, lost-in-middle).

A context pack is a **deterministic answer** to "what should this AI tool read right now."

## Anatomy

```yaml
type: context-pack
generated_by: omnix retrieve-context
generated_at: 2026-05-16T14:30:00Z
task: fix the login bug
mode: debugging
budget: 2000

files:
  - path: .obsidian-ai-memory/02-PROJECTS/active-context.md
    tokens_est: 120
    priority: 1
    reason: always-loaded
  - path: .obsidian-ai-memory/02-PROJECTS/project-context.md
    tokens_est: 320
    priority: 2
  - path: .obsidian-ai-memory/03-ERRORS/INDEX.md
    tokens_est: 180
    priority: 3
    filter: area=auth
    matched_entries: 4
  - path: .obsidian-ai-memory/01-SESSIONS/2026-05-15/session-1430-claude.md
    tokens_est: 240
    priority: 4
    reason: same-area recent

total_tokens_est: 860
budget_used_pct: 43%

skipped:
  - path: .obsidian-ai-memory/01-SESSIONS/2025-09-12/...
    reason: older than 7 days; weekly summary used instead

stale_warnings:
  - path: .obsidian-ai-memory/04-DECISIONS/2025-08-15-jwt-refresh.md
    last_verified: 2025-08-15
    age_days: 274
    note: verify against current code before trusting
```

## Generation flow

```
omnix retrieve-context --task "..." --mode debugging
  ↓
[context-manager skill]
  - Read retrieval-policy.md
  - Build candidate list
  - Estimate tokens
  - Apply budget
  - Apply date filters
  ↓
context-pack (markdown or JSON)
  ↓
[AI tool reads the pack]
  - Knows exactly which files to load
  - Knows skipped files and reasons
  - Knows stale warnings
```

## Pack formats

### Markdown (default — for human + AI reading)

See `apps/cli/templates/vault/templates/context-pack.md`.

### JSON (machine consumption)

`omnix retrieve-context --json` emits the structured form above.

## How AI tools use a pack

In `CLAUDE.md` / `AGENTS.md`:

```markdown
## Context retrieval

Before any meaningful task, generate a context pack:

  omnix retrieve-context --task "<the user's request>"

Load the files listed in the pack. Note stale warnings.
Emit a [Memory] block showing what was loaded.
```

## Caching

Within a single AI session:
- The pack is generated once per "meaningful turn" (new task, not follow-up).
- Files already in context (per pack manifest) are not reloaded.

Across sessions:
- Packs are NOT cached on disk by default — they reflect current vault state.
- `omnix retrieve-context --cache <id>` (FUTURE) stores a pack for reuse.

## Anti-patterns

- **Generating a pack but not following it** — load all the listed files, not just the first one.
- **Loading files not in the pack** — defeats the budget purpose. If you think a file is missing, regenerate with `--top N+1`.
- **Caching packs across sessions** — vault state changes; cached packs go stale.

## Implementation status

- `omnix retrieve-context` exists, outputs ranked file list. **EXPERIMENTAL**.
- JSON output format: partial.
- Token estimation: rough (4 chars ≈ 1 token).
- Stale warning detection: TODO.
- AI tool compliance: relies on adapter rules in CLAUDE.md / AGENTS.md.

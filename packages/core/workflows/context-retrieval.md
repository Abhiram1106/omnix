# Workflow: Context Retrieval

The exact procedure an AI tool (or `omnix retrieve-context`) follows to load memory before acting.

## Inputs
- `task`: plain-language description of what the user wants.
- `mode`: minimal | balanced | deep | architecture | debugging | emergency (default: balanced).
- `vault`: path to `.obsidian-ai-memory/`.

## Procedure

```
1. Detect mode (if not provided):
   - "outage", "production down"          → emergency
   - "redesign", "architect"              → architecture
   - "error", "broken", "failing"         → debugging
   - "deploy", "ship"                     → deployment
   - 1-3 word request                     → minimal
   - 4+ word, single area                 → balanced
   - 4+ word, 3+ areas                    → deep

2. Identify task area(s):
   - Match against keyword sets in standards/retrieval-policy.md
   - Areas: frontend, backend, auth, db, devops, api, ai, architecture

3. Build candidate file list (in priority order):
   a. 02-PROJECTS/active-context.md      [ALWAYS]
   b. 02-PROJECTS/active-goals.md        [ALWAYS]
   c. 02-PROJECTS/project-context.md     [ALWAYS]
   d. 03-ERRORS/INDEX.md                 [ALWAYS, filter by area]
   e. 04-DECISIONS/INDEX.md              [ALWAYS, filter by area]
   f. 01-SESSIONS/(last 2 in last 7 days)
   g. 03-ERRORS/anti-patterns.md         [filter by area]
   h. 05-ARCHITECTURE/summary.md         [deep+architecture only]
   i. 07-LESSONS/lessons-learned.md      [deep+debugging only]

4. Estimate tokens per candidate (4 chars ≈ 1 token).

5. Apply budget (see retrieval-policy.md):
   - Sum estimated tokens.
   - If over 80% of budget: drop lowest-priority files,
     try summary versions for medium-priority files,
     truncate session digests to key fields only.

6. Date filter:
   - Mark entries > 90 days old (no last-verified update) as [STALE].
   - Mark sessions > 7 days old → load from weekly-summary instead.

7. Emit context pack (see templates/context-pack.md).
```

## Output
A `context-pack` (see `templates/context-pack.md` in vault templates). Contains:
- File paths loaded
- Token estimate
- Skipped files with reasons
- Stale warnings

## Failure modes
- **Vault not initialized** → output empty pack with warning; suggest `omnix init`.
- **Budget exhausted by mandatory files alone** → drop session digests first.
- **INDEX.md missing** → fall back to scanning full files (slower).

## CLI invocation
```bash
omnix retrieve-context --task "fix the login bug" --mode debugging --top 8 --json
```

## AI tool usage
When the AI receives a user request:
1. Run this workflow (mentally or via `omnix retrieve-context`).
2. Emit the `[Memory]` startup block.
3. Only THEN begin the task.

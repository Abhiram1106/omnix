# context-manager — Instructions

## Activate when

- `load context`
- `context retrieval`
- `what should I read first`

## Procedure

1. Verify required context is present (see `inputs.md`).
2. Read declared memory paths (see `memory-policy.md`).
3. Apply skill-specific logic (see decision logic below).
4. Produce output matching the contract in `outputs.md`.
5. If output triggers a memory write, follow `memory-policy.md` rules.

## Decision logic

Specific to this skill — refine over time as edge cases are discovered.

For `context-manager`:
- Primary purpose: Decides what memory to load before the AI acts. Produces a context pack bounded by a token budget. Implements retrieval-policy.

## Do not

- Modify files outside declared `writes_memory` paths.
- Make external network calls (unless category is `external` AND user consented).
- Suggest destructive shell commands.
- Skip verification steps.

## Failure modes

- Vault not initialized → returns empty pack with warning
- Budget exhausted by mandatory files → drops session digests first
- INDEX.md missing → falls back to scanning full files

## Verification

See `checklists.md`.

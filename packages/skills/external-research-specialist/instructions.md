# external-research-specialist — Instructions

## Activate when

- `check docs`
- `look this up`
- `what does the spec say`

## Procedure

1. Verify required context is present (see `inputs.md`).
2. Read declared memory paths (see `memory-policy.md`).
3. Apply skill-specific logic (see decision logic below).
4. Produce output matching the contract in `outputs.md`.
5. If output triggers a memory write, follow `memory-policy.md` rules.

## Decision logic

Specific to this skill — refine over time as edge cases are discovered.

For `external-research-specialist`:
- Primary purpose: Fetches authoritative external documentation and summarizes into vault entries. Cache-aware, deduplicates retrievals.

## Do not

- Modify files outside declared `writes_memory` paths.
- Make external network calls (unless category is `external` AND user consented).
- Suggest destructive shell commands.
- Skip verification steps.

## Failure modes

- Site blocks scraping → user provides content manually
- Content > 6 months old → flag staleness, suggest re-fetch
- Multiple conflicting sources → surface conflict, let user choose

## Verification

See `checklists.md`.

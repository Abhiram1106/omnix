# memory-curator — Instructions

## Activate when

- `clean memory`
- `sanitize vault`
- `remove duplicates`

## Procedure

1. Verify required context is present (see `inputs.md`).
2. Read declared memory paths (see `memory-policy.md`).
3. Apply skill-specific logic (see decision logic below).
4. Produce output matching the contract in `outputs.md`.
5. If output triggers a memory write, follow `memory-policy.md` rules.

## Decision logic

Specific to this skill — refine over time as edge cases are discovered.

For `memory-curator`:
- Primary purpose: Sanitizes secrets, deduplicates entries, marks stale entries, surfaces conflicts. Memory hygiene maintenance.

## Do not

- Modify files outside declared `writes_memory` paths.
- Make external network calls (unless category is `external` AND user consented).
- Suggest destructive shell commands.
- Skip verification steps.

## Failure modes

- Unredactable secret detected → refuse to write, alert user
- Custom secret pattern missed → user must add to sanitize patterns

## Verification

See `checklists.md`.

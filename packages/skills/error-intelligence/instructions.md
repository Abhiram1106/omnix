# error-intelligence — Instructions

## Activate when

- `error`
- `exception`
- `stack trace`
- `did we see this before`

## Procedure

1. Verify required context is present (see `inputs.md`).
2. Read declared memory paths (see `memory-policy.md`).
3. Apply skill-specific logic (see decision logic below).
4. Produce output matching the contract in `outputs.md`.
5. If output triggers a memory write, follow `memory-policy.md` rules.

## Decision logic

Specific to this skill — refine over time as edge cases are discovered.

For `error-intelligence`:
- Primary purpose: Matches new errors against past entries in error-memory. Finds similar root causes and known fixes.

## Do not

- Modify files outside declared `writes_memory` paths.
- Make external network calls (unless category is `external` AND user consented).
- Suggest destructive shell commands.
- Skip verification steps.

## Failure modes

- Empty error-memory → suggest fresh investigation
- Generic error message → many false-positive matches; require area hint

## Verification

See `checklists.md`.

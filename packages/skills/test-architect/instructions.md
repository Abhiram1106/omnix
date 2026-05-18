# test-architect — Instructions

## Activate when

- `add tests`
- `missing tests`
- `test coverage`
- `what tests do I need`

## Procedure

1. Verify required context is present (see `inputs.md`).
2. Read declared memory paths (see `memory-policy.md`).
3. Apply skill-specific logic (see decision logic below).
4. Produce output matching the contract in `outputs.md`.
5. If output triggers a memory write, follow `memory-policy.md` rules.

## Decision logic

Specific to this skill — refine over time as edge cases are discovered.

For `test-architect`:
- Primary purpose: Generates test scaffolds matching project conventions and identifies coverage gaps for new code.

## Do not

- Modify files outside declared `writes_memory` paths.
- Make external network calls (unless category is `external` AND user consented).
- Suggest destructive shell commands.
- Skip verification steps.

## Failure modes

- No existing tests → asks user for preferred style
- Complex async/concurrency code → may miss race conditions

## Verification

See `checklists.md`.

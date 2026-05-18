# adapter-compatibility-tester — Instructions

## Activate when

- `check adapters`
- `adapter test`
- `is my CLAUDE.md valid`

## Procedure

1. Verify required context is present (see `inputs.md`).
2. Read declared memory paths (see `memory-policy.md`).
3. Apply skill-specific logic (see decision logic below).
4. Produce output matching the contract in `outputs.md`.
5. If output triggers a memory write, follow `memory-policy.md` rules.

## Decision logic

Specific to this skill — refine over time as edge cases are discovered.

For `adapter-compatibility-tester`:
- Primary purpose: Verifies each adapter file matches the current upstream tool spec. Flags drift before users encounter it.

## Do not

- Modify files outside declared `writes_memory` paths.
- Make external network calls (unless category is `external` AND user consented).
- Suggest destructive shell commands.
- Skip verification steps.

## Failure modes

- Upstream spec unavailable (offline) → use last-known cached spec
- New tool not in tester → report 'unknown', user updates manually

## Verification

See `checklists.md`.

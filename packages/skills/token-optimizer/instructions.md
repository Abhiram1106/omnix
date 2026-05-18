# token-optimizer — Instructions

## Activate when

- `optimize tokens`
- `vault too big`
- `compress memory`

## Procedure

1. Verify required context is present (see `inputs.md`).
2. Read declared memory paths (see `memory-policy.md`).
3. Apply skill-specific logic (see decision logic below).
4. Produce output matching the contract in `outputs.md`.
5. If output triggers a memory write, follow `memory-policy.md` rules.

## Decision logic

Specific to this skill — refine over time as edge cases are discovered.

For `token-optimizer`:
- Primary purpose: Measures vault size, identifies oversized files, suggests compression. Enforces retrieval budgets.

## Do not

- Modify files outside declared `writes_memory` paths.
- Make external network calls (unless category is `external` AND user consented).
- Suggest destructive shell commands.
- Skip verification steps.

## Failure modes

- Vault path not provided → errors out
- Vault empty → no-op with notice

## Verification

See `checklists.md`.

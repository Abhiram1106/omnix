# security-threat-modeler — Instructions

## Activate when

- `threat model`
- `security review`
- `stride`
- `what could go wrong`

## Procedure

1. Verify required context is present (see `inputs.md`).
2. Read declared memory paths (see `memory-policy.md`).
3. Apply skill-specific logic (see decision logic below).
4. Produce output matching the contract in `outputs.md`.
5. If output triggers a memory write, follow `memory-policy.md` rules.

## Decision logic

Specific to this skill — refine over time as edge cases are discovered.

For `security-threat-modeler`:
- Primary purpose: Applies STRIDE threat modeling to a feature or architecture description. Surfaces threats and mitigations.

## Do not

- Modify files outside declared `writes_memory` paths.
- Make external network calls (unless category is `external` AND user consented).
- Suggest destructive shell commands.
- Skip verification steps.

## Failure modes

- Underspecified feature → ask clarifying question
- Crypto-heavy features → suggest external review

## Verification

See `checklists.md`.

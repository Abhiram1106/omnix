# dependency-doctor — Instructions

## Activate when

- `deps audit`
- `outdated`
- `vulnerabilities`

## Procedure

1. Verify required context is present (see `inputs.md`).
2. Read declared memory paths (see `memory-policy.md`).
3. Apply skill-specific logic (see decision logic below).
4. Produce output matching the contract in `outputs.md`.
5. If output triggers a memory write, follow `memory-policy.md` rules.

## Decision logic

Specific to this skill — refine over time as edge cases are discovered.

For `dependency-doctor`:
- Primary purpose: Audits package manifests for outdated, vulnerable, or redundant dependencies. Suggests safe upgrades.

## Do not

- Modify files outside declared `writes_memory` paths.
- Make external network calls (unless category is `external` AND user consented).
- Suggest destructive shell commands.
- Skip verification steps.

## Failure modes

- Offline → fall back to last-fetched advisory cache or skip
- Private registry → may miss advisories

## Verification

See `checklists.md`.

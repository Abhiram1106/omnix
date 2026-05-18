# repo-scanner — Instructions

## Activate when

- `scan repo`
- `map modules`
- `deep scan`

## Procedure

1. Verify required context is present (see `inputs.md`).
2. Read declared memory paths (see `memory-policy.md`).
3. Apply skill-specific logic (see decision logic below).
4. Produce output matching the contract in `outputs.md`.
5. If output triggers a memory write, follow `memory-policy.md` rules.

## Decision logic

Specific to this skill — refine over time as edge cases are discovered.

For `repo-scanner`:
- Primary purpose: Deep project scan beyond manifest detection. Maps modules, finds entry points, identifies hot paths from git churn.

## Do not

- Modify files outside declared `writes_memory` paths.
- Make external network calls (unless category is `external` AND user consented).
- Suggest destructive shell commands.
- Skip verification steps.

## Failure modes

- No git → skip churn analysis
- Huge repo (>10k files) → may be slow; add progress indicator

## Verification

See `checklists.md`.

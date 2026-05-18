# Verification Checklists — token-optimizer

## Output verification

- [ ] Reports total vault size in tokens
- [ ] Lists files exceeding 500 lines
- [ ] Suggests compression candidates with rationale
- [ ] Does not modify files (read-only)

## Failure-mode handling

- [ ] Vault path not provided → errors out
- [ ] Vault empty → no-op with notice

## Pre-merge review (when this skill becomes EXPERIMENTAL)

- [ ] `skill.yaml` validates against schema
- [ ] All 8 required files present (README, instructions, inputs, outputs, memory-policy, examples, checklists, skill.yaml)
- [ ] `risk_level` matches actual operations
- [ ] No path traversal in declared memory paths
- [ ] `examples.md` has at least 2 examples (typical + empty/failure)
- [ ] `instructions.md` under 500 lines
- [ ] `compatible_adapters` listed adapters exist

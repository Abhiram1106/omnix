# Verification Checklists — context-manager

## Output verification

- [ ] Pack stays under declared token budget
- [ ] All listed files exist
- [ ] No duplicate file paths
- [ ] Date-stale files marked
- [ ] active-context.md is always included

## Failure-mode handling

- [ ] Vault not initialized → returns empty pack with warning
- [ ] Budget exhausted by mandatory files → drops session digests first
- [ ] INDEX.md missing → falls back to scanning full files

## Pre-merge review (when this skill becomes EXPERIMENTAL)

- [ ] `skill.yaml` validates against schema
- [ ] All 8 required files present (README, instructions, inputs, outputs, memory-policy, examples, checklists, skill.yaml)
- [ ] `risk_level` matches actual operations
- [ ] No path traversal in declared memory paths
- [ ] `examples.md` has at least 2 examples (typical + empty/failure)
- [ ] `instructions.md` under 500 lines
- [ ] `compatible_adapters` listed adapters exist

# Verification Checklists — memory-curator

## Output verification

- [ ] All known secret patterns scanned
- [ ] Redactions applied or flagged
- [ ] Duplicates identified by content hash
- [ ] Stale entries marked last-verified-needed
- [ ] Backup created before in-place edits

## Failure-mode handling

- [ ] Unredactable secret detected → refuse to write, alert user
- [ ] Custom secret pattern missed → user must add to sanitize patterns

## Pre-merge review (when this skill becomes EXPERIMENTAL)

- [ ] `skill.yaml` validates against schema
- [ ] All 8 required files present (README, instructions, inputs, outputs, memory-policy, examples, checklists, skill.yaml)
- [ ] `risk_level` matches actual operations
- [ ] No path traversal in declared memory paths
- [ ] `examples.md` has at least 2 examples (typical + empty/failure)
- [ ] `instructions.md` under 500 lines
- [ ] `compatible_adapters` listed adapters exist

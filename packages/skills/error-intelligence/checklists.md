# Verification Checklists — error-intelligence

## Output verification

- [ ] Normalizes error (strips paths, line numbers, IDs)
- [ ] Searches index first, full entries second
- [ ] Returns top-3 matches with confidence
- [ ] Suggests writing new entry if no match

## Failure-mode handling

- [ ] Empty error-memory → suggest fresh investigation
- [ ] Generic error message → many false-positive matches; require area hint

## Pre-merge review (when this skill becomes EXPERIMENTAL)

- [ ] `skill.yaml` validates against schema
- [ ] All 8 required files present (README, instructions, inputs, outputs, memory-policy, examples, checklists, skill.yaml)
- [ ] `risk_level` matches actual operations
- [ ] No path traversal in declared memory paths
- [ ] `examples.md` has at least 2 examples (typical + empty/failure)
- [ ] `instructions.md` under 500 lines
- [ ] `compatible_adapters` listed adapters exist

# Verification Checklists — test-architect

## Output verification

- [ ] Detects test runner from package.json / pyproject.toml
- [ ] Looks at existing tests for pattern (naming, structure)
- [ ] Suggests test cases by category: happy path, error path, edge cases, regression
- [ ] Output includes scaffold code in detected style

## Failure-mode handling

- [ ] No existing tests → asks user for preferred style
- [ ] Complex async/concurrency code → may miss race conditions

## Pre-merge review (when this skill becomes EXPERIMENTAL)

- [ ] `skill.yaml` validates against schema
- [ ] All 8 required files present (README, instructions, inputs, outputs, memory-policy, examples, checklists, skill.yaml)
- [ ] `risk_level` matches actual operations
- [ ] No path traversal in declared memory paths
- [ ] `examples.md` has at least 2 examples (typical + empty/failure)
- [ ] `instructions.md` under 500 lines
- [ ] `compatible_adapters` listed adapters exist

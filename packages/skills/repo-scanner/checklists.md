# Verification Checklists — repo-scanner

## Output verification

- [ ] Top-level modules enumerated
- [ ] Entry points identified (bin/, main.*, index.*)
- [ ] Test coverage detected per module
- [ ] Top 20 files by git churn listed
- [ ] Output file under 200 lines

## Failure-mode handling

- [ ] No git → skip churn analysis
- [ ] Huge repo (>10k files) → may be slow; add progress indicator

## Pre-merge review (when this skill becomes EXPERIMENTAL)

- [ ] `skill.yaml` validates against schema
- [ ] All 8 required files present (README, instructions, inputs, outputs, memory-policy, examples, checklists, skill.yaml)
- [ ] `risk_level` matches actual operations
- [ ] No path traversal in declared memory paths
- [ ] `examples.md` has at least 2 examples (typical + empty/failure)
- [ ] `instructions.md` under 500 lines
- [ ] `compatible_adapters` listed adapters exist

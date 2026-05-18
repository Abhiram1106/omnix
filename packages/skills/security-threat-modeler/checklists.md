# Verification Checklists — security-threat-modeler

## Output verification

- [ ] All 6 STRIDE categories applied
- [ ] Each threat has at least one mitigation
- [ ] Mitigations reference existing project standards where possible
- [ ] OWASP Top 10 checklist applied if web feature
- [ ] Output ranks threats by severity

## Failure-mode handling

- [ ] Underspecified feature → ask clarifying question
- [ ] Crypto-heavy features → suggest external review

## Pre-merge review (when this skill becomes EXPERIMENTAL)

- [ ] `skill.yaml` validates against schema
- [ ] All 8 required files present (README, instructions, inputs, outputs, memory-policy, examples, checklists, skill.yaml)
- [ ] `risk_level` matches actual operations
- [ ] No path traversal in declared memory paths
- [ ] `examples.md` has at least 2 examples (typical + empty/failure)
- [ ] `instructions.md` under 500 lines
- [ ] `compatible_adapters` listed adapters exist

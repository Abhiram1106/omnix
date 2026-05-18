# Verification Checklists — adapter-compatibility-tester

## Output verification

- [ ] Each adapter file present
- [ ] Required sections present (per upstream spec)
- [ ] No deprecated syntax
- [ ] References to STARTUP_PROTOCOL.md and AGENTS.md present
- [ ] Filename matches current upstream convention

## Failure-mode handling

- [ ] Upstream spec unavailable (offline) → use last-known cached spec
- [ ] New tool not in tester → report 'unknown', user updates manually

## Pre-merge review (when this skill becomes EXPERIMENTAL)

- [ ] `skill.yaml` validates against schema
- [ ] All 8 required files present (README, instructions, inputs, outputs, memory-policy, examples, checklists, skill.yaml)
- [ ] `risk_level` matches actual operations
- [ ] No path traversal in declared memory paths
- [ ] `examples.md` has at least 2 examples (typical + empty/failure)
- [ ] `instructions.md` under 500 lines
- [ ] `compatible_adapters` listed adapters exist

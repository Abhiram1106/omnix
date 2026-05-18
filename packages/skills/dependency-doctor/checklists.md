# Verification Checklists — dependency-doctor

## Output verification

- [ ] Reads package.json / pyproject.toml / go.mod / Cargo.toml
- [ ] Cross-references with known vulnerability data
- [ ] Flags major version drift
- [ ] Identifies redundant deps (e.g. lodash + utility library)
- [ ] Suggests upgrade order based on dependency graph

## Failure-mode handling

- [ ] Offline → fall back to last-fetched advisory cache or skip
- [ ] Private registry → may miss advisories

## Pre-merge review (when this skill becomes EXPERIMENTAL)

- [ ] `skill.yaml` validates against schema
- [ ] All 8 required files present (README, instructions, inputs, outputs, memory-policy, examples, checklists, skill.yaml)
- [ ] `risk_level` matches actual operations
- [ ] No path traversal in declared memory paths
- [ ] `examples.md` has at least 2 examples (typical + empty/failure)
- [ ] `instructions.md` under 500 lines
- [ ] `compatible_adapters` listed adapters exist

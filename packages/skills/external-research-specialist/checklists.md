# Verification Checklists — external-research-specialist

## Output verification

- [ ] Source must be on allowlist (framework docs, GitHub, official changelogs)
- [ ] Respect robots.txt
- [ ] Output stored with source URL + fetch date
- [ ] Dedupe: check vault for prior retrieval of same source
- [ ] Summarize before injecting into context

## Failure-mode handling

- [ ] Site blocks scraping → user provides content manually
- [ ] Content > 6 months old → flag staleness, suggest re-fetch
- [ ] Multiple conflicting sources → surface conflict, let user choose

## Pre-merge review (when this skill becomes EXPERIMENTAL)

- [ ] `skill.yaml` validates against schema
- [ ] All 8 required files present (README, instructions, inputs, outputs, memory-policy, examples, checklists, skill.yaml)
- [ ] `risk_level` matches actual operations
- [ ] No path traversal in declared memory paths
- [ ] `examples.md` has at least 2 examples (typical + empty/failure)
- [ ] `instructions.md` under 500 lines
- [ ] `compatible_adapters` listed adapters exist

# Skill Design Standard

Rules for designing skills that other developers can rely on.
See `docs/architecture/skill-plugin-system.md` for the system spec.

## A good skill

- **Has a single purpose** expressible in one sentence.
- **Declares its scope** — files it reads, files it writes, tools it needs.
- **States its risk level honestly** (low / medium / high).
- **Has concrete examples** with input → output pairs.
- **Lists failure modes** — "this fails when X."
- **Provides verification steps** — how to know it worked.
- **Stays under 500 lines** of instructions.

## A bad skill

- "Helps with X, Y, Z" — three purposes.
- Reads/writes anywhere on disk.
- Claims "always works."
- No example.
- No checklist.
- 2000 lines of theory with no operational guidance.

## Naming

- `kebab-case` for the folder and `name` field.
- Verb-noun structure preferred: `audit-dependencies`, `compress-sessions`.
- Avoid generic names: `helper`, `assistant`, `tool`.

## Frontmatter must include

```yaml
---
name: <kebab-case>
description: <1-3 sentences, third person, present tense>
status: SPEC | EXPERIMENTAL | STABLE | DEPRECATED
version: 0.x.x
category: memory | context | review | scan | safety | external
risk_level: low | medium | high
---
```

## Required files

| File | Purpose |
|---|---|
| `skill.yaml` | Machine-readable manifest |
| `README.md` | Human overview, install/use, examples |
| `instructions.md` | AI-readable activation rules and procedures |
| `inputs.md` | What the skill expects (with types and examples) |
| `outputs.md` | What the skill produces (with schema) |
| `memory-policy.md` | Memory reads and writes (paths) |
| `examples.md` | At least 2 input → output examples |
| `checklists.md` | Verification steps, at least 3 |

## instructions.md template

```markdown
# <Skill Name> — Instructions

## Activate when
- <Concrete trigger>
- <Concrete trigger>

## Do
1. <Action>
2. <Action>

## Do not
- <Anti-pattern>
- <Anti-pattern>

## Decision logic
<If / else flow chart in prose>

## Output
<Reference output_contract in skill.yaml>
```

## memory-policy.md template

```markdown
# Memory Policy — <Skill Name>

## Reads
- `02-PROJECTS/project-context.md` — for stack info
- `03-ERRORS/INDEX.md` — for relevant errors

## Writes
- `03-ERRORS/error-memory.md` — appends new entries
- Does NOT modify session digests

## Refuses to read
- Anywhere outside `.obsidian-ai-memory/`
- Files matching `*.env*`, `*secret*`, `*credential*`
```

## Skill review checklist (before merging)

- [ ] `skill.yaml` validates against schema.
- [ ] All 8 required files present.
- [ ] `risk_level` matches actual operations.
- [ ] No path traversal in `reads_memory` / `writes_memory`.
- [ ] `examples.md` has ≥ 2 examples.
- [ ] `checklists.md` has ≥ 3 verification steps.
- [ ] `instructions.md` under 500 lines.
- [ ] Failure modes documented.
- [ ] Compatible adapters tested (or marked `generic` only).

## Versioning

- Patch bump: typo, wording fix in instructions.
- Minor bump: new input field, new output field.
- Major bump: change in `reads_memory` / `writes_memory` / `output_contract`.

## Deprecation policy

- Mark `status: DEPRECATED` in `skill.yaml`.
- README explains: "Replaced by X. Will be removed in v2.0."
- Keep for 1 major version after deprecation.

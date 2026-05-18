# security-threat-modeler

**Status**: SPEC (manifest + docs only, no handler yet)
**Category**: review
**Risk level**: low

## Purpose

Applies STRIDE threat modeling to a feature or architecture description. Surfaces threats and mitigations.

## When it activates

Triggers: `threat model, security review, stride, what could go wrong`

## What it does

See `instructions.md` for full activation logic.
See `inputs.md` and `outputs.md` for contract.
See `memory-policy.md` for vault paths it touches.
See `examples.md` for input → output examples.
See `checklists.md` for verification steps.

## CLI invocation (FUTURE — v0.3)

```bash
omnix skill run security-threat-modeler
```

Until then, this skill is documentation that AI tools should read when triggered.

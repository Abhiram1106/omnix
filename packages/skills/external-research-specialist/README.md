# external-research-specialist

**Status**: SPEC (manifest + docs only, no handler yet)
**Category**: external
**Risk level**: high

## Purpose

Fetches authoritative external documentation and summarizes into vault entries. Cache-aware, deduplicates retrievals.

## When it activates

Triggers: `check docs, look this up, what does the spec say`

## What it does

See `instructions.md` for full activation logic.
See `inputs.md` and `outputs.md` for contract.
See `memory-policy.md` for vault paths it touches.
See `examples.md` for input → output examples.
See `checklists.md` for verification steps.

## CLI invocation (FUTURE — v0.3)

```bash
omnix skill run external-research-specialist
```

Until then, this skill is documentation that AI tools should read when triggered.

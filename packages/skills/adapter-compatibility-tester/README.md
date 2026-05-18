# adapter-compatibility-tester

**Status**: SPEC (manifest + docs only, no handler yet)
**Category**: safety
**Risk level**: low

## Purpose

Verifies each adapter file matches the current upstream tool spec. Flags drift before users encounter it.

## When it activates

Triggers: `check adapters, adapter test, is my CLAUDE.md valid`

## What it does

See `instructions.md` for full activation logic.
See `inputs.md` and `outputs.md` for contract.
See `memory-policy.md` for vault paths it touches.
See `examples.md` for input → output examples.
See `checklists.md` for verification steps.

## CLI invocation (FUTURE — v0.3)

```bash
omnix skill run adapter-compatibility-tester
```

Until then, this skill is documentation that AI tools should read when triggered.

# error-intelligence

**Status**: SPEC (manifest + docs only, no handler yet)
**Category**: memory
**Risk level**: low

## Purpose

Matches new errors against past entries in error-memory. Finds similar root causes and known fixes.

## When it activates

Triggers: `error, exception, stack trace, did we see this before`

## What it does

See `instructions.md` for full activation logic.
See `inputs.md` and `outputs.md` for contract.
See `memory-policy.md` for vault paths it touches.
See `examples.md` for input → output examples.
See `checklists.md` for verification steps.

## CLI invocation (FUTURE — v0.3)

```bash
omnix skill run error-intelligence
```

Until then, this skill is documentation that AI tools should read when triggered.

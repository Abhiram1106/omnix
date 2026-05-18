# token-optimizer

**Status**: SPEC (manifest + docs only, no handler yet)
**Category**: memory
**Risk level**: low

## Purpose

Measures vault size, identifies oversized files, suggests compression. Enforces retrieval budgets.

## When it activates

Triggers: `optimize tokens, vault too big, compress memory`

## What it does

See `instructions.md` for full activation logic.
See `inputs.md` and `outputs.md` for contract.
See `memory-policy.md` for vault paths it touches.
See `examples.md` for input → output examples.
See `checklists.md` for verification steps.

## CLI invocation (FUTURE — v0.3)

```bash
omnix skill run token-optimizer
```

Until then, this skill is documentation that AI tools should read when triggered.

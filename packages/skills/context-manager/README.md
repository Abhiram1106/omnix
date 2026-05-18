# context-manager

**Status**: SPEC (manifest + docs only, no handler yet)
**Category**: memory
**Risk level**: low

## Purpose

Decides what memory to load before the AI acts. Produces a context pack bounded by a token budget. Implements retrieval-policy.

## When it activates

Triggers: `load context, context retrieval, what should I read first`

## What it does

See `instructions.md` for full activation logic.
See `inputs.md` and `outputs.md` for contract.
See `memory-policy.md` for vault paths it touches.
See `examples.md` for input → output examples.
See `checklists.md` for verification steps.

## CLI invocation (FUTURE — v0.3)

```bash
omnix skill run context-manager
```

Until then, this skill is documentation that AI tools should read when triggered.

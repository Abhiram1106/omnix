# test-architect

**Status**: SPEC (manifest + docs only, no handler yet)
**Category**: review
**Risk level**: low

## Purpose

Generates test scaffolds matching project conventions and identifies coverage gaps for new code.

## When it activates

Triggers: `add tests, missing tests, test coverage, what tests do I need`

## What it does

See `instructions.md` for full activation logic.
See `inputs.md` and `outputs.md` for contract.
See `memory-policy.md` for vault paths it touches.
See `examples.md` for input → output examples.
See `checklists.md` for verification steps.

## CLI invocation (FUTURE — v0.3)

```bash
omnix skill run test-architect
```

Until then, this skill is documentation that AI tools should read when triggered.

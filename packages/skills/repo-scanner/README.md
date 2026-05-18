# repo-scanner

**Status**: SPEC (manifest + docs only, no handler yet)
**Category**: context
**Risk level**: low

## Purpose

Deep project scan beyond manifest detection. Maps modules, finds entry points, identifies hot paths from git churn.

## When it activates

Triggers: `scan repo, map modules, deep scan`

## What it does

See `instructions.md` for full activation logic.
See `inputs.md` and `outputs.md` for contract.
See `memory-policy.md` for vault paths it touches.
See `examples.md` for input → output examples.
See `checklists.md` for verification steps.

## CLI invocation (FUTURE — v0.3)

```bash
omnix skill run repo-scanner
```

Until then, this skill is documentation that AI tools should read when triggered.

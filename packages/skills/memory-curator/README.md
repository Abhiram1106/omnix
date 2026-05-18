# memory-curator

**Status**: SPEC (manifest + docs only, no handler yet)
**Category**: safety
**Risk level**: medium

## Purpose

Sanitizes secrets, deduplicates entries, marks stale entries, surfaces conflicts. Memory hygiene maintenance.

## When it activates

Triggers: `clean memory, sanitize vault, remove duplicates`

## What it does

See `instructions.md` for full activation logic.
See `inputs.md` and `outputs.md` for contract.
See `memory-policy.md` for vault paths it touches.
See `examples.md` for input → output examples.
See `checklists.md` for verification steps.

## CLI invocation (FUTURE — v0.3)

```bash
omnix skill run memory-curator
```

Until then, this skill is documentation that AI tools should read when triggered.

# dependency-doctor

**Status**: SPEC (manifest + docs only, no handler yet)
**Category**: scan
**Risk level**: low

## Purpose

Audits package manifests for outdated, vulnerable, or redundant dependencies. Suggests safe upgrades.

## When it activates

Triggers: `deps audit, outdated, vulnerabilities`

## What it does

See `instructions.md` for full activation logic.
See `inputs.md` and `outputs.md` for contract.
See `memory-policy.md` for vault paths it touches.
See `examples.md` for input → output examples.
See `checklists.md` for verification steps.

## CLI invocation (FUTURE — v0.3)

```bash
omnix skill run dependency-doctor
```

Until then, this skill is documentation that AI tools should read when triggered.

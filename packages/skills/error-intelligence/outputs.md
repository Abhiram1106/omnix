# Outputs — error-intelligence

## Contract type

`report`

See `docs/architecture/skill-plugin-system.md` for full contract shapes.

## Example output

```
match found in error-memory: 2026-04-22 entry, same root cause, fix at src/auth.ts:38
```

## Output destination

- **stdout**: when invoked as `omnix skill run`
- **file**: when contract is `file-write`, paths declared in `writes_memory`
- **return value**: when invoked programmatically (FUTURE — v0.3 SDK)

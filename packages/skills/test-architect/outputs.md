# Outputs — test-architect

## Contract type

`report`

See `docs/architecture/skill-plugin-system.md` for full contract shapes.

## Example output

```
scaffold src/auth/refresh-token.test.ts using vitest with 5 cases (valid, expired, invalid, network error, race)
```

## Output destination

- **stdout**: when invoked as `omnix skill run`
- **file**: when contract is `file-write`, paths declared in `writes_memory`
- **return value**: when invoked programmatically (FUTURE — v0.3 SDK)

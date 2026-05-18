# Outputs — dependency-doctor

## Contract type

`report`

See `docs/architecture/skill-plugin-system.md` for full contract shapes.

## Example output

```
report: react@17 has security advisory, suggest react@18; next@14 → 15 has migration guide
```

## Output destination

- **stdout**: when invoked as `omnix skill run`
- **file**: when contract is `file-write`, paths declared in `writes_memory`
- **return value**: when invoked programmatically (FUTURE — v0.3 SDK)

# Outputs — repo-scanner

## Contract type

`file-write`

See `docs/architecture/skill-plugin-system.md` for full contract shapes.

## Example output

```
module-map.md listing each app/package with type, dep count, last commit
```

## Output destination

- **stdout**: when invoked as `omnix skill run`
- **file**: when contract is `file-write`, paths declared in `writes_memory`
- **return value**: when invoked programmatically (FUTURE — v0.3 SDK)

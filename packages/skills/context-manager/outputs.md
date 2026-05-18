# Outputs — context-manager

## Contract type

`context-pack`

See `docs/architecture/skill-plugin-system.md` for full contract shapes.

## Example output

```
context-pack with project-context.md + 2 recent sessions + error-memory entries filtered to auth area
```

## Output destination

- **stdout**: when invoked as `omnix skill run`
- **file**: when contract is `file-write`, paths declared in `writes_memory`
- **return value**: when invoked programmatically (FUTURE — v0.3 SDK)

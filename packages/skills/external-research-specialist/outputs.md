# Outputs — external-research-specialist

## Contract type

`report`

See `docs/architecture/skill-plugin-system.md` for full contract shapes.

## Example output

```
summary from stripe.com/docs/webhooks#verify with code example + saved to vault
```

## Output destination

- **stdout**: when invoked as `omnix skill run`
- **file**: when contract is `file-write`, paths declared in `writes_memory`
- **return value**: when invoked programmatically (FUTURE — v0.3 SDK)

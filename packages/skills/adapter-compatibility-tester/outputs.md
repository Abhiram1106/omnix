# Outputs — adapter-compatibility-tester

## Contract type

`report`

See `docs/architecture/skill-plugin-system.md` for full contract shapes.

## Example output

```
report: CLAUDE.md ok, cursor .mdc frontmatter missing `alwaysApply`, aider CONVENTIONS.md ok
```

## Output destination

- **stdout**: when invoked as `omnix skill run`
- **file**: when contract is `file-write`, paths declared in `writes_memory`
- **return value**: when invoked programmatically (FUTURE — v0.3 SDK)

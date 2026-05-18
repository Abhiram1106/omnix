# Examples — adapter-compatibility-tester

## Example 1: typical case

**Input**:
```
current installed adapters: claude, cursor, aider
```

**Output**:
```
report: CLAUDE.md ok, cursor .mdc frontmatter missing `alwaysApply`, aider CONVENTIONS.md ok
```

## Example 2: empty / no-op case

**Input**: vault uninitialized or empty.

**Output**: report indicating skill cannot proceed; suggest `omnix init` if vault missing.

## Example 3: failure case

**Input**: invalid path or permissions error.

**Output**: error result with cause + remediation; non-zero exit code.

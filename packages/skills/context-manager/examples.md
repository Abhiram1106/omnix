# Examples — context-manager

## Example 1: typical case

**Input**:
```
task: fix the auth login bug, mode: debugging
```

**Output**:
```
context-pack with project-context.md + 2 recent sessions + error-memory entries filtered to auth area
```

## Example 2: empty / no-op case

**Input**: vault uninitialized or empty.

**Output**: report indicating skill cannot proceed; suggest `omnix init` if vault missing.

## Example 3: failure case

**Input**: invalid path or permissions error.

**Output**: error result with cause + remediation; non-zero exit code.

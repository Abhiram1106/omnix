# Examples — repo-scanner

## Example 1: typical case

**Input**:
```
monorepo with apps/ + packages/
```

**Output**:
```
module-map.md listing each app/package with type, dep count, last commit
```

## Example 2: empty / no-op case

**Input**: vault uninitialized or empty.

**Output**: report indicating skill cannot proceed; suggest `omnix init` if vault missing.

## Example 3: failure case

**Input**: invalid path or permissions error.

**Output**: error result with cause + remediation; non-zero exit code.

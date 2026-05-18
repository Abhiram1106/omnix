# Examples — dependency-doctor

## Example 1: typical case

**Input**:
```
package.json with next@14, react@17
```

**Output**:
```
report: react@17 has security advisory, suggest react@18; next@14 → 15 has migration guide
```

## Example 2: empty / no-op case

**Input**: vault uninitialized or empty.

**Output**: report indicating skill cannot proceed; suggest `omnix init` if vault missing.

## Example 3: failure case

**Input**: invalid path or permissions error.

**Output**: error result with cause + remediation; non-zero exit code.

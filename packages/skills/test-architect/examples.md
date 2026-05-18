# Examples — test-architect

## Example 1: typical case

**Input**:
```
src/auth/refresh-token.ts with no test file
```

**Output**:
```
scaffold src/auth/refresh-token.test.ts using vitest with 5 cases (valid, expired, invalid, network error, race)
```

## Example 2: empty / no-op case

**Input**: vault uninitialized or empty.

**Output**: report indicating skill cannot proceed; suggest `omnix init` if vault missing.

## Example 3: failure case

**Input**: invalid path or permissions error.

**Output**: error result with cause + remediation; non-zero exit code.

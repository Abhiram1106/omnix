# Examples — error-intelligence

## Example 1: typical case

**Input**:
```
TypeError: Cannot read property 'userId' of undefined at auth.ts:42
```

**Output**:
```
match found in error-memory: 2026-04-22 entry, same root cause, fix at src/auth.ts:38
```

## Example 2: empty / no-op case

**Input**: vault uninitialized or empty.

**Output**: report indicating skill cannot proceed; suggest `omnix init` if vault missing.

## Example 3: failure case

**Input**: invalid path or permissions error.

**Output**: error result with cause + remediation; non-zero exit code.

# Examples — token-optimizer

## Example 1: typical case

**Input**:
```
vault state: 47 sessions, 12 errors, 5 ADRs
```

**Output**:
```
report flagging 3 sessions > 1500 tokens, suggesting weekly summary
```

## Example 2: empty / no-op case

**Input**: vault uninitialized or empty.

**Output**: report indicating skill cannot proceed; suggest `omnix init` if vault missing.

## Example 3: failure case

**Input**: invalid path or permissions error.

**Output**: error result with cause + remediation; non-zero exit code.

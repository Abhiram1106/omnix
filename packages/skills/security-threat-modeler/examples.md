# Examples — security-threat-modeler

## Example 1: typical case

**Input**:
```
feature: user can export account data as CSV
```

**Output**:
```
threats: information disclosure (PII in export), DoS (large exports block worker), elevation (admin export of others). Mitigations: auth check, rate limit, queue with size cap.
```

## Example 2: empty / no-op case

**Input**: vault uninitialized or empty.

**Output**: report indicating skill cannot proceed; suggest `omnix init` if vault missing.

## Example 3: failure case

**Input**: invalid path or permissions error.

**Output**: error result with cause + remediation; non-zero exit code.

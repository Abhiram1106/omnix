# Examples — memory-curator

## Example 1: typical case

**Input**:
```
vault containing session digest with `API_KEY=sk-abc123`
```

**Output**:
```
report flagging the line; auto-redacts to `API_KEY=[REDACTED:openai-key]`
```

## Example 2: empty / no-op case

**Input**: vault uninitialized or empty.

**Output**: report indicating skill cannot proceed; suggest `omnix init` if vault missing.

## Example 3: failure case

**Input**: invalid path or permissions error.

**Output**: error result with cause + remediation; non-zero exit code.

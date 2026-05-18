# Examples — external-research-specialist

## Example 1: typical case

**Input**:
```
what is the current Stripe webhook signature verification API?
```

**Output**:
```
summary from stripe.com/docs/webhooks#verify with code example + saved to vault
```

## Example 2: empty / no-op case

**Input**: vault uninitialized or empty.

**Output**: report indicating skill cannot proceed; suggest `omnix init` if vault missing.

## Example 3: failure case

**Input**: invalid path or permissions error.

**Output**: error result with cause + remediation; non-zero exit code.

# Error Memory — Schema

One entry per fixed error. Lives appended to `03-ERRORS/error-memory.md` (or as separate `error-NNNN.md` files for projects with high volume).

## Fields

| Field | Required | Type | Notes |
|---|---|---|---|
| Date | yes | YYYY-MM-DD | |
| Project | yes | string | |
| Area | yes | string | module / subsystem |
| Symptom | yes | text | what was observed |
| Root Cause | yes | text | what was actually wrong |
| Fix | yes | text | what was changed |
| Prevention Rule | yes | text | a rule for future sessions — phrased as "always" or "never" |
| Do Not Repeat | yes | text | the specific anti-pattern; can be cross-linked to `anti-patterns.md` |
| Regression Test Added | yes | path | file:test name |
| Related Files | yes | list of paths | code touched |
| Related Session Digest | yes | link | `[[session-HHMM-<tool>]]` |

## Promotion

If multiple errors share the same prevention rule, promote it to `03-ERRORS/anti-patterns.md` and reference it.

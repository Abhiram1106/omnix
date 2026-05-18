---
name: memory-curator
version: 0.8.0
status: stable
description: >
  Sanitizes secrets from vault, deduplicates entries, flags stale decisions,
  and maintains vault health. Run weekly or when vault feels noisy.
triggers:
  - "clean up vault"
  - "vault maintenance"
  - "memory hygiene"
  - "stale entries"
  - "vault is noisy"
auto_activate: false
memory_reads:
  - { path: "02-PROJECTS/", priority: high }
  - { path: "03-ERRORS/error-memory.md", priority: high }
  - { path: "04-DECISIONS/", priority: medium }
memory_writes:
  - { path: "03-ERRORS/error-memory.md", condition: "when duplicates found" }
  - { path: "04-DECISIONS/", condition: "when stale entries flagged" }
token_budget: { self: 600, context_reads: 1500, total: 2100 }
verification_required: true
destructive: false
tags: [memory, sanitization, vault-health, staleness, deduplication]
---

## When to activate

Weekly, or when vault has > 50 session files, or when entries feel contradictory.

## Core execution

1. **Secret scan** — check all vault files for patterns: `sk-`, `ghp_`, `AKIA`, JWTs, DB connection strings with passwords. Redact and warn user for each found.

2. **Staleness check** — flag any entry where `last-verified` is missing or > 90 days old.
   - Decisions: "Is this decision still in effect? Or has the code moved on?"
   - Errors: "Is this error still possible, or was it fixed at a system level?"

3. **Duplicate detection** — find error entries with similar root causes (same error message pattern). Suggest merge.

4. **Superseded decision detection** — find decision entries where a later decision contradicts an earlier one. Flag for user review.

5. **Vault structure health** — check for: missing required folders, malformed filenames in sessions/, entries without required fields.

6. **Report** — list all issues found with specific file + line. Prioritize by: critical (secrets) → high (stale) → medium (duplicates) → low (structure).

## Verification

After curation: run `omnix verify --vault-freshness`. Confirm 0 critical issues (secrets exposed or structurally broken vault).

## Output

```
Vault Curation Report
─────────────────────
Secrets found:    0  ✓
Stale entries:    3  ⚠ (review recommended)
Duplicates:       1  (merge suggested)
Structure issues: 0  ✓

Action items:
- 04-DECISIONS/decisions.md:L42 — last-verified 2024-08-01 (>90 days ago)
- ...
```

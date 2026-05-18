# Memory Safety Standard

Rules for what is safe to write to memory and what must be redacted, sanitized, or refused.

## What memory MUST NOT contain

| Category | Pattern | Example | Action |
|---|---|---|---|
| API keys | `sk-`, `pk_`, `ghp_`, `AKIA`, `xoxb-` | OpenAI/Stripe/GitHub/AWS/Slack tokens | Redact to `[REDACTED:key]` |
| JWTs | `ey...` 3 base64 segments | Auth tokens | Redact to `[REDACTED:jwt]` |
| Private keys | `BEGIN .* PRIVATE KEY` | RSA/EC keys | Redact to `[REDACTED:private-key]` |
| Database URLs | `postgres://user:pass@`, `mysql://user:pass@` | Connection strings | Redact password segment |
| `.env` literal content | Lines starting with secret-shaped keys | API_KEY=... | Redact value |
| Personally identifiable info | Emails, phone numbers, SSNs in user data | john@example.com | Redact unless project-context (where user is consenting) |
| Production hostnames | `*.prod.*`, internal IPs | api.prod.internal | Tokenize to `<prod-host>` |

## Redaction implementation

`apps/cli/src/utils/sanitize.ts` (TODO) provides:

```typescript
sanitize(text: string, opts?: { aggressive?: boolean }): {
  redacted: string;
  findings: { category: string; count: number }[];
}
```

Called by:
- `writeDigest` before file write.
- `omnix memory curate` for whole-vault scan.
- Optional pre-commit hook (`omnix install-hooks`).

## What memory MAY contain

- File paths (absolute paths are OK; they're project-internal info).
- Code snippets (verify no inline secrets).
- Error messages (redact paths to secret files; keep error shape).
- Decisions and their rationale.
- External public docs URLs.
- Tool/version info.

## Public vs private vault

Recommended layout for teams:

```
.obsidian-ai-memory/          # gitignored OR private repo only
.obsidian-ai-memory-public/   # committed, shareable; contains:
  02-PROJECTS/project-context.md (sanitized)
  04-DECISIONS/                  (ADRs, public)
  05-ARCHITECTURE/               (public diagrams)
```

By default Omnix uses the single private vault. Split is opt-in.

## Refusal cases

The CLI must **refuse to write** if:

1. Digest contains a credential pattern that sanitize() flagged but couldn't safely redact.
2. Notes file contains > 100 lines of unidentified terminal output (likely a paste of sensitive data).
3. The vault path is inside a known sensitive directory (`~/.ssh`, `~/.aws`, `/etc`).

Refusal output:

```
✗ Refused to write digest: detected unredacted credential pattern.
  See: docs/security/memory-security.md
  Override: --force-write (NOT recommended)
```

## Audit log

`omnix memory audit` (TODO) scans all vault files and reports:
- Files containing redaction-needed patterns.
- Files larger than 200 lines (compression candidates).
- Files older than 90 days without `last-verified` update.
- Files referenced nowhere in INDEX.md (orphaned).

## Pre-commit hook (recommended)

```bash
omnix install-hooks
```

Installs a git pre-commit hook that:
1. Runs `omnix memory audit` on staged vault files.
2. Blocks commit if unredacted secrets detected.
3. Suggests `omnix memory curate` to fix.

## Encryption (optional, P2)

For high-sensitivity projects:

```bash
omnix vault encrypt --key-id <gpg-key>
# Encrypts sensitive folders (03-ERRORS, 04-DECISIONS) at rest.
omnix vault decrypt --key-id <gpg-key>
```

Implementation: TODO. Status: SPEC.

## Compliance posture

Omnix is **not** a compliance product. It provides primitives:
- Redaction patterns.
- Audit logs.
- Pre-commit checks.

You are responsible for your project's compliance requirements (GDPR, HIPAA, SOC 2, etc.). Memory safety rules reduce common leakage paths but don't replace your security review.

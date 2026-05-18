# Memory Security

How Omnix protects the project's intellectual property and credentials that may end up in vault files.

## Threat model

| Threat | Vector | Mitigation |
|---|---|---|
| Secrets pasted into session notes | User pastes terminal output | Sanitization at write time |
| Vault committed to public repo | git add . | `.gitignore` auto-update on init |
| AI suggests destructive commands stored in vault as "fix" | AI completion in error-memory | Rule: no executable command strings in vault |
| Insider exfil via vault read | Repo cloned by ex-employee | Encryption at rest (FUTURE) + access controls on git |
| Vault leaked via cloud sync (Dropbox/iCloud) | Cloud sync of project dir | Document: prefer git or local-only |
| Pasted JWT in error memory enables prod access | User debugging auth | Sanitization redacts JWTs |

## Sanitization rules

Documented in `packages/core/standards/memory-safety.md`.

Implementation status:
- Sanitize utility: TODO (`apps/cli/src/utils/sanitize.ts`)
- Called by `writeDigest`: TODO
- Called by `omnix memory curate`: TODO

## Public vs private vault

Default: single private vault, gitignored if user opts in.

Recommended for teams:
- **Private vault**: full memory, gitignored.
- **Public memory**: a curated subset — published ADRs, post-mortems, project-context — checked into repo for team consumption.

Tooling for the split: TODO.

## Pre-commit hook

`omnix install-hooks` (FUTURE) installs a git pre-commit hook that:
1. Scans staged vault files for redaction-needed patterns.
2. Blocks commit on unredacted secrets.
3. Suggests `omnix memory curate` to fix.

## Encryption (FUTURE)

For high-sensitivity projects:
```bash
omnix vault encrypt --key-id <gpg-key> --folders 03-ERRORS,04-DECISIONS
omnix vault decrypt --key-id <gpg-key>
```

Implementation: SPEC only.

## MCP / external tool access

Omnix does NOT currently integrate MCP servers. When (if) it does:

- Each MCP integration must declare required filesystem scope.
- Default deny: only declared paths are exposed.
- User confirmation required for first-use of any MCP server.
- Audit log: every MCP call logged to `.omnix/audit.log`.

## Reporting security issues

See `SECURITY.md` at repo root for disclosure policy.

## What memory security does NOT cover

- **Your project's own security.** Omnix vault is a memory layer; your app's auth, secrets, and infrastructure are your concern.
- **Compliance certifications.** No SOC 2 / HIPAA / GDPR certification.
- **End-to-end encryption of git history.** If you commit a secret and rotate the key, the secret is in git history; use BFG or git-filter-repo to scrub.

## Audit checklist (run before any vault publication)

- [ ] `omnix memory audit` reports zero unredacted patterns
- [ ] All filenames OK (no `client-x-private-roadmap.md`)
- [ ] No internal hostnames in `05-ARCHITECTURE/`
- [ ] No customer data in `00-INBOX/`
- [ ] Session digests > 100 lines reviewed manually (likely pasted output)
- [ ] `.gitignore` includes `.omnix/memory/` and `.omnix/cache/`

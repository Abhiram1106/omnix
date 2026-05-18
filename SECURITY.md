# Security Policy

## Reporting a vulnerability

If you discover a security issue in Omnix, please **do not file a public issue**.

Email: abhiram.j2006@gmail.com
or open a private security advisory on GitHub.

Include:
- Description of the issue
- Steps to reproduce
- Affected versions
- Suggested mitigation if known

You will receive an acknowledgement within 72 hours.

## Supported versions

| Version | Supported |
|---|---|
| 0.1.x | ✅ active development |
| < 0.1.0 | ❌ pre-release, not supported |

## Vulnerability categories we care about

| Category | Severity |
|---|---|
| Memory sanitization fails to redact a documented secret pattern | High |
| Template injection from `omnix init` (writing outside cwd) | High |
| `omnix update` overwrites files it shouldn't | High |
| Adapter file causes AI tool to execute arbitrary code | Critical (escalate to AI tool vendor) |
| Vault leaks via cloud sync due to missing default `.gitignore` | Medium |
| Path traversal in skill `reads_memory` / `writes_memory` declarations | Medium |
| CLI command injection from user input | High |

## Out of scope

- Issues in the AI tool itself (report to Anthropic / Cursor / etc.).
- Issues in dependencies — report upstream first, then to us so we can pin.
- Vault content quality (that's a user-curation concern, not security).

## Disclosure timeline

We aim for:
- Acknowledgement: 72 hours
- Fix or workaround: 14 days for High/Critical, 30 days for Medium
- Public disclosure: after fix is released

## Hall of fame

Contributors who report security issues responsibly will be credited (with their permission).

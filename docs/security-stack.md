# Security Stack

## Defaults

| Concern | Default |
|---|---|
| Secrets manager | 1Password CLI / Doppler / HashiCorp Vault / platform secret store |
| SAST | Semgrep |
| Dependency scan | `npm audit`, `pip-audit`, `cargo audit`, GitHub Dependabot |
| Container scan | Trivy |
| IaC scan | tfsec / Checkov |
| Auth | OAuth2/OIDC for users; mTLS or signed JWT for services |
| Password hashing | Argon2id |
| Schema validation | Zod / Pydantic / equivalent |
| WAF / bot mgmt | Cloudflare / platform-native (e.g., Vercel BotID) |

## Headers

CSP, HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy on every response.

## Logging

- Structured logs.
- Mask PII and secrets.
- Retention per data class.

## Reviews

- Threat-model new external surfaces.
- Security review on PRs touching auth, payments, or PII.

## Memory integration

- Postmortem for every incident.
- New prevention rule in `03-ERRORS/anti-patterns.md`.

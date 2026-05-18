# Security Standards

## Baseline

- Never commit secrets. Use a secrets manager (1Password CLI, Doppler, Vault, AWS/GCP/Azure secret store).
- `.env.example` documents shape; `.env` is gitignored.
- Rotate any secret that has touched a repo, log, or chat — even if reverted.

## Input

- Validate every input at the boundary with a schema.
- Reject unknown fields by default.
- Length limits on every string field.
- Treat all client input as hostile.

## Auth

- Hashed passwords with Argon2id (or bcrypt with cost ≥ 12).
- Sessions: HttpOnly, Secure, SameSite cookies. Or short-lived JWT + refresh.
- MFA available for any account with elevated privileges.
- Authorization on every endpoint — not just the gateway.

## OWASP Top 10 hygiene

- Parameterized queries always. No string concatenation into SQL/shell/HTML/etc.
- CSRF tokens on state-changing form submissions (or SameSite=strict + Origin checks).
- CSP, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy set.
- HTTPS only; HSTS in production.

## Dependencies

- `npm audit` / `pip-audit` / `cargo audit` in CI.
- Pin top-level deps; allow ranges only for trusted internal packages.
- Renovate / Dependabot enabled.

## Logging

- Never log secrets, full PII, or full request bodies of sensitive endpoints.
- Mask: emails (partial), card numbers, tokens.

## Reviews

- Threat-model new external surfaces (auth changes, new public endpoints, file uploads).
- Security review on PRs touching auth, payments, or PII.

## Memory

- Every security incident: postmortem in vault + prevention rule in `03-ERRORS/anti-patterns.md`.

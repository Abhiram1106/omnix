---
name: security-threat-modeler
version: 0.6.0
status: experimental
description: >
  STRIDE threat model for any component. Finds attack surfaces. Generates prioritized
  mitigations. Use for auth flows, API endpoints, data storage, and deployment configs.
triggers:
  - "security review"
  - "threat model"
  - "attack surface"
  - "auth review"
  - "is this secure"
  - "security audit"
  - "CVE"
  - "vulnerability"
auto_activate: false
memory_reads:
  - { path: "02-PROJECTS/project-context.md", priority: critical }
  - { path: "05-ARCHITECTURE/", priority: high }
  - { path: "07-LESSONS/security-notes.md", priority: medium }
memory_writes:
  - { path: "07-LESSONS/security-notes.md", condition: "always after review" }
token_budget: { self: 1000, context_reads: 1500, total: 2500 }
verification_required: false
destructive: false
tags: [security, STRIDE, threat-modeling, auth, CVE, OWASP]
---

## When to activate

Any time a user asks about security, auth, data handling, or wants to review a component for vulnerabilities.

## STRIDE framework

Apply systematically to the target component:

| Threat | Question to ask | Common mitigations |
|--------|----------------|-------------------|
| **S**poofing | Can an attacker impersonate a user or service? | MFA, signed tokens, certificate pinning |
| **T**ampering | Can data be modified in transit or at rest? | HTTPS, integrity checks, signed payloads |
| **R**epudiation | Can actions be denied? Is there audit logging? | Audit log, signed events, non-repudiation tokens |
| **I**nformation disclosure | What data could leak? Where? | Encryption at rest/transit, PII minimization, secret management |
| **D**enial of service | What can be exhausted (rate, memory, CPU)? | Rate limiting, circuit breakers, resource quotas |
| **E**levation of privilege | Can a user gain higher permissions? | RBAC/ABAC, principle of least privilege, explicit authz checks |

## OWASP Top 10 checklist

- [ ] A01: Broken Access Control — check every endpoint for authorization
- [ ] A02: Cryptographic Failures — no weak algorithms, no plaintext secrets
- [ ] A03: Injection — SQL, command, LDAP injection risks
- [ ] A04: Insecure Design — missing security controls at design level
- [ ] A05: Security Misconfiguration — default credentials, open ports, verbose errors
- [ ] A06: Vulnerable Components — outdated deps with known CVEs
- [ ] A07: Auth Failures — session management, password policies, MFA
- [ ] A08: Software/Data Integrity — dependency integrity, CI/CD pipeline security
- [ ] A09: Logging/Monitoring — insufficient logging for incident detection
- [ ] A10: Server-Side Request Forgery — SSRF in any URL-fetching code

## Output format

```
STRIDE Analysis: {component}
─────────────────────────────
[S] Spoofing:   LOW  — JWT validation present, short expiry configured
[T] Tampering:  MED  — API responses unsigned, could be MITM'd on HTTP
[R] Repudiation: LOW — audit log exists
[I] Info Disc:  HIGH — error messages include stack traces in production
[D] DoS:        MED  — no rate limiting on /auth/login endpoint
[E] Elevation:  LOW  — RBAC implemented, checked in middleware

Top mitigations (by severity × effort):
1. HIGH:  Disable stack traces in production error responses
2. MED:   Add rate limiting to /auth/login (5 req/min per IP)
3. MED:   Force HTTPS redirect, add HSTS header
```

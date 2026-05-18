# DevOps Standards

## Environments

- `local` → `preview` (per-PR) → `staging` → `production`.
- Production data never flows backwards. Use synthetic / anonymized data in lower environments.

## CI

- One workflow file per concern (test, lint, build, deploy).
- Fast feedback: lint + typecheck + unit < 5 min.
- All checks required to merge.

## CD

- Trunk-based. Main is always shippable.
- Deploys are automated from main. Tags trigger production deploys, or main auto-deploys with a gate.
- Rollback is a one-command operation.

## Infrastructure as code

- Terraform / Pulumi / OpenTofu / CDK — pick one per project.
- State in remote backend with locking.
- Never click-ops in production. Every change goes through code review.

## Containers

- Multi-stage Dockerfiles. Distroless or Alpine base for production images.
- Non-root user. Read-only filesystem where possible.
- Pin base image digests for production builds.

## Secrets

- Pulled from the platform's secret store at runtime, not baked into images.

## Observability hooks in deploy

- Every deploy emits an event to the metrics platform with version + commit SHA.
- Synthetic checks confirm `/healthz` and a critical user flow post-deploy.

## Runbooks

- Every on-call alert has a runbook (`templates/runbook-template.md`).
- Runbooks live in the repo or the memory vault, linked from the alert.

## Memory

- Significant deploy incidents → `03-ERRORS/error-memory.md` + postmortem.

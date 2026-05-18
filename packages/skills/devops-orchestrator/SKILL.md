---
name: devops-orchestrator
version: 0.6.0
status: experimental
description: >
  Orchestrates deployment pipelines, infrastructure provisioning, and release workflows.
  Helm + Kustomize + GitHub Actions. Safety-first with rollback plans.
triggers:
  - "deploy"
  - "deployment pipeline"
  - "CI/CD"
  - "infrastructure"
  - "provision"
  - "terraform"
  - "github actions"
  - "pipeline"
  - "release pipeline"
  - "rollback"
auto_activate: false
requires: []
produces:
  - "deployment plan"
  - "pipeline config"
  - "04-DECISIONS/deployment-decisions.md"
memory_reads:
  - { path: "02-PROJECTS/project-context.md", priority: critical }
  - { path: "05-ARCHITECTURE/system-overview.md", priority: high }
  - { path: "04-DECISIONS/decisions.md", priority: medium }
memory_writes:
  - { path: "04-DECISIONS/decisions.md", condition: "when deployment decision made" }
token_budget: { self: 900, context_reads: 1000, total: 1900 }
verification_required: true
destructive: true
tags: [devops, deployment, CI-CD, helm, kustomize, github-actions, infrastructure]
compatible_adapters: [claude-code, cursor, generic]
---

## When to activate

Planning deployments, setting up pipelines, writing infrastructure code, troubleshooting CI/CD.

## When NOT to activate

- Pure code changes with no deployment impact
- Database-only changes (use database-migration-guard)
- Testing strategy (use test-architect)

## ⚠ SAFETY RULE

This skill has `destructive: true`. Before any production deployment:
1. Verify rollback plan exists
2. Run pipeline in dry-run mode first
3. Check health checks are configured
4. Confirm deployment window is acceptable

## GitHub Actions Pipeline Template

**PASS: Pinned, safe, structured pipeline**
```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11  # pin to SHA
      - uses: actions/setup-node@60edb5dd545a775178f52524783378180af0d1f8  # pin to SHA
        with: { node-version: '20', cache: 'pnpm' }
      - run: pnpm install --frozen-lockfile
      - run: pnpm typecheck
      - run: pnpm test
      - run: pnpm build

  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11
      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@6e7b7d1fd3e4fef0c5fa8cce1229c54b2c9bd0d8
        with:
          scan-type: 'fs'
          severity: 'CRITICAL,HIGH'
          exit-code: '1'
```

**FAIL: Unpinned, no security, no structure**
```yaml
- uses: actions/checkout@main     # NEVER use branch ref
- uses: actions/setup-node@latest  # NEVER use latest
```

## Helm + Kustomize pattern

```
infra/
├── helm/
│   └── myapp/              # Helm chart for packaging
│       ├── Chart.yaml
│       ├── values.yaml     # Defaults
│       └── templates/
└── kustomize/
    ├── base/               # Generated via helm template
    └── overlays/
        ├── dev/            # Dev overrides
        ├── staging/        # Staging overrides
        └── production/     # Prod overrides
```

**Generate base from Helm:**
```bash
helm template myapp ./infra/helm/myapp \
  --set image.tag=latest \
  > infra/kustomize/base/manifests.yaml
```

**Kustomize overlay (production):**
```yaml
# infra/kustomize/overlays/production/kustomization.yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
resources: [../../base]
patches:
  - patch: |-
      apiVersion: apps/v1
      kind: Deployment
      metadata: { name: myapp }
      spec:
        replicas: 5
        resources:
          limits: { cpu: "500m", memory: "512Mi" }
```

## Deployment checklist (pre-flight)

- [ ] All tests pass in CI
- [ ] Docker image built and pushed
- [ ] Health check endpoint exists (`GET /health` returns 200)
- [ ] Rollback plan documented
- [ ] Database migrations safe to run (if any)
- [ ] Secrets not hardcoded (use secrets manager)
- [ ] Resource limits set (CPU + memory)
- [ ] Horizontal pod autoscaling configured
- [ ] Alert rules defined for error rate + latency

## Rollback plan

**PASS: Deployment with rollback**
```bash
# Deploy
helm upgrade myapp ./chart --set image.tag=$NEW_TAG --wait --timeout 5m

# If health check fails:
helm rollback myapp 0  # rollback to previous release
```

## Verification

- [ ] Pipeline runs in < 10 minutes
- [ ] Pipeline fails fast on typecheck/test failures
- [ ] Secrets are masked in logs
- [ ] Health check passes after deploy
- [ ] Rollback tested

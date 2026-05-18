---
name: ci-cd-engineer
version: 0.6.0
status: experimental
description: >
  Designs and implements CI/CD pipelines. GitHub Actions templates, reusable workflows,
  SHA-pinned actions, security scanning integration, environment promotion.
triggers:
  - "github actions"
  - "CI pipeline"
  - "CD pipeline"
  - "automated deployment"
  - "workflow file"
  - "pipeline fails"
  - "ci is broken"
  - "reusable workflow"
  - ".github/workflows"
auto_activate: false
requires: []
produces:
  - ".github/workflows/ files"
  - "pipeline documentation"
memory_reads:
  - { path: "02-PROJECTS/project-context.md", priority: critical }
  - { path: "05-ARCHITECTURE/system-overview.md", priority: medium }
memory_writes: []
token_budget: { self: 800, context_reads: 600, total: 1400 }
verification_required: true
destructive: false
tags: [CI-CD, github-actions, pipeline, automation, security, deployment]
compatible_adapters: [claude-code, cursor, generic]
---

## When to activate

Writing GitHub Actions workflows, debugging CI failures, setting up automated releases.

## When NOT to activate

- Kubernetes deployment (use kubernetes-operator)
- Docker builds (use docker-specialist)
- Infrastructure provisioning (use devops-orchestrator)

## Pipeline architecture (stages)

```
PR opened
  → validate: typecheck + lint + test
  → security: Trivy + Semgrep + Gitleaks
  → build: Docker image

Merge to main
  → validate + security + build (same)
  → publish: push image to registry
  → deploy: deploy to staging
  → smoke-test: verify staging
  → (manual approval)
  → deploy-prod: deploy to production
```

## Reusable workflow pattern

```yaml
# .github/workflows/_validate.yml (reusable)
name: Validate
on:
  workflow_call:
    inputs:
      node-version: { type: string, default: '20' }
    secrets:
      NPM_TOKEN: { required: false }

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11
      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - uses: actions/setup-node@60edb5dd545a775178f52524783378180af0d1f8
        with: { node-version: ${{ inputs.node-version }}, cache: 'pnpm' }
      - run: pnpm install --frozen-lockfile
      - run: pnpm typecheck
      - run: pnpm test --coverage
      - run: pnpm build

# .github/workflows/ci.yml (caller)
name: CI
on: [push, pull_request]
jobs:
  validate:
    uses: ./.github/workflows/_validate.yml
    with: { node-version: '20' }
```

## Security scanning (required in every pipeline)

```yaml
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11

      # Secrets detection
      - name: Gitleaks
        uses: gitleaks/gitleaks-action@v2

      # Dependency vulnerabilities
      - name: Trivy
        uses: aquasecurity/trivy-action@6e7b7d1fd3e4fef0c5fa8cce1229c54b2c9bd0d8
        with:
          scan-type: 'fs'
          severity: 'CRITICAL,HIGH'
          exit-code: '1'

      # SAST
      - name: Semgrep
        uses: semgrep/semgrep-action@v1
        with:
          config: "p/security-audit p/owasp-top-ten"
```

## Action pinning rules

**PASS: Pinned to full commit SHA**
```yaml
uses: actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11  # v4.1.1
uses: actions/setup-node@60edb5dd545a775178f52524783378180af0d1f8  # v4.0.2
```

**FAIL: Pinned to tag or branch**
```yaml
uses: actions/checkout@v4     # can be moved (supply chain risk)
uses: actions/checkout@main   # can change any time
```

## Environment promotion

```yaml
  deploy-staging:
    environment: staging     # uses GitHub environment secrets
    runs-on: ubuntu-latest
    needs: [validate, security, build]
    steps:
      - name: Deploy to staging
        run: kubectl set image deployment/myapp myapp=$IMAGE_TAG
        env:
          KUBECONFIG: ${{ secrets.STAGING_KUBECONFIG }}

  deploy-prod:
    environment: production  # requires manual approval in GitHub UI
    runs-on: ubuntu-latest
    needs: [deploy-staging, smoke-test]
    steps:
      - name: Deploy to production
        run: kubectl set image deployment/myapp myapp=$IMAGE_TAG
```

## Debugging CI failures

```bash
# View workflow run
gh run list --limit 5
gh run view <run-id> --log

# Re-run failed jobs
gh run rerun <run-id> --failed-only

# Debug with tmate (SSH into runner — last resort)
- uses: mxschmitt/action-tmate@v3
  if: ${{ failure() }}
```

## Verification

- [ ] Pipeline runs on push + PR
- [ ] All actions pinned to full commit SHA
- [ ] Security scanning included (Trivy + Gitleaks minimum)
- [ ] Secrets not logged
- [ ] Pipeline fails fast (typecheck before test before build)
- [ ] Manual approval gate before production deploy

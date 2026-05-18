---
name: dependency-doctor
version: 0.7.0
status: experimental
description: >
  Audits project dependencies for CVEs, outdated packages, unused deps, and license conflicts.
  Integrates Trivy + npm audit + pip audit. Produces prioritized fix list.
triggers:
  - "check dependencies"
  - "audit packages"
  - "update dependencies"
  - "vulnerability scan"
  - "npm audit"
  - "security audit"
  - "outdated packages"
  - "CVE"
  - "supply chain"
auto_activate: false
requires: []
produces:
  - "dependency health report"
  - "07-LESSONS/dependency-notes.md"
memory_reads:
  - { path: "02-PROJECTS/project-context.md", priority: high }
  - { path: "07-LESSONS/dependency-notes.md", priority: medium }
memory_writes:
  - { path: "07-LESSONS/dependency-notes.md", condition: "when issues found" }
token_budget: { self: 700, context_reads: 300, total: 1000 }
verification_required: true
destructive: false
tags: [dependencies, security, audit, CVE, packages, supply-chain]
compatible_adapters: [claude-code, cursor, generic]
---

## When to activate

Before any release, after adding new packages, when CVE alerts appear, quarterly maintenance.

## When NOT to activate

- General code review (use reviewer agent)
- Single-package questions (just read the docs)
- Build errors (use error-intelligence)

## Execution steps

### Step 1: Detect manifest files

```bash
# Node.js / TypeScript
ls package.json pnpm-lock.yaml yarn.lock package-lock.json 2>/dev/null

# Python
ls requirements.txt pyproject.toml Pipfile 2>/dev/null

# Go
ls go.mod go.sum 2>/dev/null

# Rust
ls Cargo.toml Cargo.lock 2>/dev/null
```

### Step 2: Run security audit

**Node.js:**
```bash
npm audit --json 2>/dev/null | head -100
# or
pnpm audit --json 2>/dev/null | head -100
```

**Python:**
```bash
pip install pip-audit 2>/dev/null
pip-audit --format json 2>/dev/null | head -100
```

**Container/filesystem (Trivy — if installed):**
```bash
trivy fs . --format json --severity HIGH,CRITICAL 2>/dev/null | head -200
```

**Secret detection (Gitleaks — if installed):**
```bash
gitleaks detect --source . --no-git 2>/dev/null | head -50
```

### Step 3: Classify findings

| Severity | Action |
|----------|--------|
| CRITICAL CVE | Fix immediately — block release |
| HIGH CVE | Fix before next release |
| MEDIUM CVE | Fix within 2 weeks |
| LOW CVE | Track, fix at convenience |
| Outdated (direct dep) | Update and test |
| Outdated (transitive) | Update only if CVE |
| Unused dep | Remove |

### Step 4: Check for unused dependencies

**Node.js:**
```bash
# Simple grep approach
for pkg in $(cat package.json | grep -E '"[^"]+":' | grep -v dependencies | head -3); do
  grep -r "$pkg" src/ --include="*.ts" --include="*.js" -l 2>/dev/null || echo "UNUSED: $pkg"
done
```

### Step 5: License audit

Red flags:
- GPL-3.0 in commercial/closed-source project
- AGPL-3.0 (network copyleft)
- Non-commercial licenses in commercial context

```bash
# Node.js
npx license-checker --summary 2>/dev/null | head -30
```

### Step 6: Produce prioritized fix list

```markdown
## Dependency Health Report — YYYY-MM-DD

### CRITICAL (fix before release)
- lodash < 4.17.21: Prototype Pollution (CVE-2021-23337) — upgrade to 4.17.21

### HIGH (fix this week)
- axios < 1.6.0: SSRF vulnerability (CVE-2023-45857) — upgrade to 1.6.8

### OUTDATED (direct deps)
- typescript: 4.9.5 → 5.4.0 (test before upgrading — may have breaking changes)

### UNUSED
- @types/lodash — not imported anywhere in src/

### LICENSES
- All MIT/Apache-2.0/BSD. No GPL. ✓
```

## PASS/FAIL examples

**PASS: Upgrade with test**
```bash
pnpm update axios --latest
pnpm test  # verify nothing broke
```

**FAIL: Upgrade all at once without testing**
```bash
pnpm update  # upgrades everything simultaneously — can't tell what broke
```

## Verification

- [ ] Zero CRITICAL CVEs
- [ ] All HIGH CVEs have mitigation plan
- [ ] Tests pass after any upgrade
- [ ] Dependency notes updated in vault

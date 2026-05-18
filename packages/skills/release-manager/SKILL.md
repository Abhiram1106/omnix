---
name: release-manager
version: 0.5.0
status: experimental
description: >
  Manages the full release flow: version bump, changelog generation, build verification,
  git tag, npm/PyPI publish, post-publish verification. Safety-first with dry-run.
triggers:
  - "release"
  - "publish"
  - "ship version"
  - "create release"
  - "npm publish"
  - "new version"
  - "tag release"
  - "version bump"
auto_activate: false
requires: []
produces:
  - "release tag"
  - "CHANGELOG.md update"
  - "published package"
memory_reads:
  - { path: "02-PROJECTS/project-context.md", priority: critical }
  - { path: "04-DECISIONS/decisions.md", priority: medium }
memory_writes:
  - { path: "04-DECISIONS/decisions.md", condition: "when release decision made" }
token_budget: { self: 700, context_reads: 500, total: 1200 }
verification_required: true
destructive: true
tags: [release, publish, versioning, changelog, npm, semantic-versioning, tagging]
compatible_adapters: [claude-code, cursor, generic]
---

## When to activate

When the user explicitly asks to create a release. Not for development deploys.

## ⚠ SAFETY RULE

This skill has `destructive: true`. Always:
1. Run `--dry-run` first
2. Verify tests pass before any publish
3. Confirm version bump type with user before tagging

## Semantic versioning rules

| Change type | Version bump | Examples |
|------------|-------------|---------|
| Bug fix, documentation | PATCH (x.y.Z) | Fix null error in formatDate |
| New feature, backward-compatible | MINOR (x.Y.0) | Add `error-match` command |
| Breaking change | MAJOR (X.0.0) | Remove `omnix init --legacy` flag |

**Determine from git log:**
```bash
git log --oneline --no-merges v$(npm pkg get version | tr -d '"')..HEAD
# feat: → MINOR
# fix:  → PATCH
# BREAKING CHANGE: in body → MAJOR
```

## Release pipeline (step by step)

### Step 1: Pre-flight checks

```bash
# All tests must pass
pnpm test
# Typecheck must pass
pnpm typecheck
# Build must succeed
pnpm build

# Check for uncommitted changes
git status --short
# Must be clean before release
```

### Step 2: Determine version

```bash
# Current version
npm pkg get version

# Options:
npm version patch   # 0.1.0 → 0.1.1
npm version minor   # 0.1.0 → 0.2.0
npm version major   # 0.1.0 → 1.0.0
# --no-git-tag-version to update package.json only, tag manually
```

### Step 3: Update CHANGELOG.md

```markdown
## [0.2.0] - 2025-01-15

### Added
- `omnix error-match` command for searching error memory
- `omnix scan --deep` for code intelligence scanning

### Changed
- `retrieve-context` now uses task-type-aware retrieval modes
- Token budget enforcement in all retrieval operations

### Fixed
- Vault-index not regenerating after sync-memory
```

### Step 4: Dry-run publish

```bash
# npm
npm publish --dry-run --access public

# Inspect what will be published
npm pack --dry-run

# Verify package contents (should NOT include .env, secrets, tests)
npm pack && tar -tzf *.tgz | head -30
```

### Step 5: Tag and publish

```bash
# Commit version bump + changelog
git add package.json CHANGELOG.md
git commit -m "chore: release v0.2.0"

# Tag
git tag v0.2.0
git push origin main --tags

# Publish
npm publish --access public
```

### Step 6: Post-publish verification

```bash
# Verify package is live
npm view omnix@0.2.0

# Smoke test the published package
npx omnix@0.2.0 --version
npx omnix@0.2.0 --help
```

## Rollback (if publish fails)

```bash
# Unpublish within 72 hours (npm policy)
npm unpublish omnix@0.2.0

# Revert git tag
git tag -d v0.2.0
git push origin :refs/tags/v0.2.0

# Revert version commit
git revert HEAD
```

## Verification

- [ ] Tests pass with 0 failures
- [ ] Typecheck passes with 0 errors
- [ ] Build succeeds
- [ ] CHANGELOG.md updated with this version
- [ ] Dry-run showed correct files (no secrets, no test files)
- [ ] Post-publish `npm view` confirms version is live
- [ ] `npx omnix --version` returns new version

# Publishing Guide

How to publish `omnix` to npm.

## Before first publish

### 1. Choose and claim the package name

```bash
npm view omnix           # check if taken
npm view create-omnix    # check if taken (secondary alias)
```

If `omnix` is taken, edit `apps/cli/package.json` → `name` field before proceeding.

### 2. Create an npm account (if needed)

```
https://www.npmjs.com/signup
```

### 3. Set up GitHub secrets (for CI)

In your GitHub repo → Settings → Secrets and variables → Actions:

| Secret | Value |
|---|---|
| `NPM_TOKEN` | From npmjs.com → Access Tokens → Automation token |

### 4. Update TODO fields in apps/cli/package.json

```json
"author": "Your Name <your@email.com>",
"repository": { "url": "https://github.com/YOUR_ORG/omnix.git" },
"homepage": "https://github.com/YOUR_ORG/omnix#readme",
"bugs": { "url": "https://github.com/YOUR_ORG/omnix/issues" }
```

## Local publish workflow

```bash
# 1. Install deps
pnpm install

# 2. Typecheck
pnpm typecheck

# 3. Build
pnpm build

# 4. Dry-run pack (shows what would be published)
pnpm pack:dry
# or
cd apps/cli && npm pack --dry-run

# 5. Inspect the tarball contents
cd apps/cli && npm pack
tar -tzf omnix-0.1.0.tgz

# 6. Test locally before publishing
cd /tmp && mkdir test-proj && cd test-proj && npm init -y
npm install /path/to/omnix/apps/cli/omnix-0.1.0.tgz
npx omnix --help
npx omnix init --dry-run
omnix scan
omnix route "fix the login bug"

# 7. Publish (first time needs --access public)
cd apps/cli
npm login
npm whoami
npm publish --access public

# 8. Verify
npx omnix --version
npx omnix --help
npx create-omnix --help   # alias also works
```

## Subsequent releases

```bash
# Bump version (patch | minor | major)
cd apps/cli
npm version patch   # 0.1.0 → 0.1.1

# Build + publish
cd ../..
pnpm build
cd apps/cli
npm publish
```

Or trigger the GitHub Actions release workflow manually (workflow_dispatch).

## Scoped vs unscoped

- `omnix` — unscoped, clean and direct. `npx omnix` works naturally.
- `create-omnix` — the `npx create-*` convention alias (also registered as a bin).
- `@yourorg/omnix` — scoped; requires `--access public` every time.

**Recommendation:** publish as `omnix` (unscoped). Both `npx omnix` and `npx create-omnix` will work via the bin aliases.

## What gets published

Controlled by `files` in `apps/cli/package.json`:

```json
"files": ["dist", "bin", "templates", "README.md", "LICENSE"]
```

The `dist/index.js` bundle includes all runtime deps (tsup bundles them). Users do not need to install anything separately.

## Safety checks before publish

- [ ] `pnpm typecheck` passes.
- [ ] `pnpm build` completes cleanly.
- [ ] `npm pack --dry-run` shows `dist/`, `bin/`, `templates/`.
- [ ] `bin/omnix.js` starts with `#!/usr/bin/env node`.
- [ ] Templates are in the tarball: `tar -tzf *.tgz | grep templates`.
- [ ] No `.env`, `node_modules`, or Obsidian user data in the tarball.
- [ ] CHANGELOG.md updated.
- [ ] Version bumped in `apps/cli/package.json`.

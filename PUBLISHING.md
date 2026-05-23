# Publishing Guide

How to publish `omnix` to npm.

## Prerequisites

### npm login

```bash
npm whoami          # check if already logged in
npm login           # if not
```

### GitHub secret (for CI)

In your GitHub repo → Settings → Secrets and variables → Actions:

| Secret      | Value                                        |
|-------------|----------------------------------------------|
| `NPM_TOKEN` | npmjs.com → Access Tokens → Automation token |

## Release workflow (recommended)

```bash
cd apps/cli

# 1. Bump version
npm version patch   # 0.2.1 → 0.2.2  (bug fixes)
npm version minor   # 0.2.x → 0.3.0  (new features)
npm version major   # 0.x.x → 1.0.0  (breaking changes)

# 2. One-command release: build + typecheck + 126 tests + publish
pnpm run release
```

`pnpm run release` runs: `build → typecheck → test → npm publish --access public`

## Manual publish

```bash
cd apps/cli

pnpm run build
pnpm run typecheck
pnpm test

# Dry run — shows tarball contents without uploading
pnpm run publish:dry

# Publish
pnpm run publish:npm
# or
npm publish --access public
```

## Verify after publish

```bash
npm view omnix version          # registry shows new version
npm install -g omnix@latest     # update global install
omnix --version                 # binary reports correct version
npx omnix@latest --version      # npx also picks it up
```

## What gets published (90 files, ~1.8 MB unpacked)

Controlled by `files` in `apps/cli/package.json`:

```json
"files": ["dist", "bin", "templates", "README.md", "LICENSE"]
```

The `dist/index.js` bundle includes all runtime deps (tsup bundles them).
Users do not need to install anything separately — `npx omnix` works with zero deps.

Key tarball contents:

```text
dist/index.js                         # bundled CLI (~600 KB)
bin/omnix.js                          # entry shim
templates/adapters/generic/AGENTS.md  # universal contract
templates/adapters/claude/.claude/    # full .claude/ structure
templates/adapters/cursor/            # 15 files incl. context packs + runbooks
templates/adapters/windsurf/          # full rules
templates/adapters/cline/             # full instructions
templates/adapters/roo/               # full instructions + mode table
templates/adapters/continue/          # full config.yaml snippets
templates/vault/                      # 11 folders + protocol files + templates
```

## Scoped vs unscoped

- `omnix` — unscoped, `npx omnix` and `npx create-omnix` both work via bin aliases.
- `@yourorg/omnix` — scoped; requires `--access public` every time.

## Pre-publish checklist

Run through [RELEASE_CHECKLIST.md](./RELEASE_CHECKLIST.md) before every publish.

Key gates:

- [ ] `pnpm typecheck` — zero errors
- [ ] `pnpm test` — 126/126 passing
- [ ] `pnpm run publish:dry` — tarball contains `dist/`, `bin/`, `templates/`
- [ ] `omnix --version` matches `apps/cli/package.json` version after build
- [ ] CHANGELOG.md updated with the new version entry

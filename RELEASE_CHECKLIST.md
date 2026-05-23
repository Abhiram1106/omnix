# Release Checklist

Run through this before every publish.

## Code quality

- [ ] `pnpm typecheck` — zero errors
- [ ] `pnpm build` — clean build, no warnings
- [ ] `pnpm test` — 126/126 tests passing

## Version

- [ ] Version bumped in `apps/cli/package.json`
- [ ] `src/index.ts` VERSION reads from `package.json` — no manual update needed
- [ ] CHANGELOG.md entry added for the new version

## Package contents

- [ ] `cd apps/cli && pnpm run publish:dry` — review tarball output
- [ ] `dist/` present in tarball
- [ ] `templates/` present — all adapter and vault templates included
- [ ] `README.md` and `LICENSE` present
- [ ] No `.env`, `node_modules`, `.obsidian-ai-memory/`, or user data in tarball
- [ ] `bin/omnix.js` first line is `#!/usr/bin/env node`

## Local smoke test

```bash
node apps/cli/dist/index.js --version    # matches package.json version
node apps/cli/dist/index.js --help       # all commands listed
node apps/cli/dist/index.js init --dry-run
node apps/cli/dist/index.js scan
node apps/cli/dist/index.js detect
node apps/cli/dist/index.js route "add auth"
```

## Publish

```bash
cd apps/cli
npm whoami                   # logged in as correct account
pnpm run release             # build + typecheck + test + publish
```

## Post-publish verification

- [ ] `npm view omnix version` — shows new version
- [ ] `npm install -g omnix@latest && omnix --version` — binary version matches
- [ ] `npx omnix@latest --version` — npx also picks up new version
- [ ] GitHub release created with the CHANGELOG entry

## Git

- [ ] `git tag v0.x.x && git push --tags`

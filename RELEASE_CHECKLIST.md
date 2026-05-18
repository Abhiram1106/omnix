# Release Checklist

Run through this before every publish.

## Code quality

- [ ] `pnpm typecheck` — zero errors.
- [ ] `pnpm build` — clean build, no warnings.
- [ ] `pnpm lint` — clean (if linter configured).

## Package contents

- [ ] `cd apps/cli && npm pack --dry-run` — review output.
- [ ] `dist/` present in tarball.
- [ ] `templates/` present in tarball — all adapter and vault templates.
- [ ] `README.md` present.
- [ ] `LICENSE` present (add file if missing).
- [ ] No `.env`, `node_modules`, `.obsidian-ai-memory/`, or user data.
- [ ] `dist/index.js` first line is `#!/usr/bin/env node`.

## Functionality

- [ ] `node apps/cli/dist/index.js --help` works locally.
- [ ] `node apps/cli/dist/index.js init --dry-run` works.
- [ ] `node apps/cli/dist/index.js scan` works.
- [ ] `node apps/cli/dist/index.js detect` works.
- [ ] `node apps/cli/dist/index.js route "add auth"` works.

## Version and changelog

- [ ] Version bumped in `apps/cli/package.json`.
- [ ] `CHANGELOG.md` entry added.
- [ ] Git tag created: `git tag v0.x.x && git push --tags`.

## npm registry

- [ ] `npm whoami` — logged in as correct account.
- [ ] `npm view create-omnix` — correct latest version.
- [ ] `npx create-omnix --version` — matches.

## Post-publish

- [ ] `npx create-omnix init --dry-run` — works from npm.
- [ ] GitHub release created with changelog entry.

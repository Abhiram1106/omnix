# Contributing to Omnix

Thanks for considering a contribution. Omnix is small enough that contributions land fast.

## Quick start

```bash
git clone https://github.com/Abhiram1106/omnix.git
cd omnix
pnpm install
pnpm build
pnpm test
```

Open a PR against `main`.

## What we welcome

- **Adapter fixes**: format drift for Cursor `.mdc`, Cline rules, Windsurf, etc.
- **Skill specs**: any of the 10 SPEC-status skills can move to EXPERIMENTAL with a real handler.
- **Documentation improvements**: especially shortening docs.
- **Bug reports** with reproducible steps.
- **Real-world feedback**: "I tried Omnix on my project and X was confusing."

## What we do NOT want (yet)

- New agent personas. We have 17. Most are already noise. See `docs/audits/omnix-deep-audit.md`.
- New "swarm" or "autonomous agent" features. Omnix is convention + scaffolding, not a runtime.
- LLM-dependent commands without an offline fallback.

## Skill contributions

If adding a new skill:

1. Use the structure in `docs/architecture/skill-plugin-system.md`.
2. Status starts at `SPEC` (manifest + 7 markdown files; no handler).
3. Promote to `EXPERIMENTAL` once a handler exists + tests pass.
4. `STABLE` requires: handler + tests + 2 weeks of real use without bugs.

Run validation:
```bash
omnix skill validate <your-skill>   # FUTURE; manual checklist for now
```

## PR conventions

- Conventional commits: `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`.
- Tests required for any change to `apps/cli/src/`.
- README + CHANGELOG updates for user-facing changes.

## Pre-commit checklist

- [ ] `pnpm typecheck` passes
- [ ] `pnpm build` succeeds
- [ ] `pnpm test` 100%
- [ ] If you added a CLI command: `npm pack --dry-run` shows it in dist/

## Release process

See `RELEASE_CHECKLIST.md` and `PUBLISHING.md`.

## Code of conduct

By participating in this project, you agree to abide by the `CODE_OF_CONDUCT.md`.

## Maintainer touch points

- File issues for design proposals BEFORE writing code.
- Bikeshedding on names, markdown structure, etc. happens in PR comments — fine.
- Architecture changes (vault structure, skill schema) require maintainer sign-off.

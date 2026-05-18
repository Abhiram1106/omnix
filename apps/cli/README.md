# @omnix/cli

CLI for the omnix.

## Status

**Typed stubs.** Command contracts are defined; implementations are planned (see `ROADMAP.md` at the repo root).

## Commands

```bash
npx omnix init                # initialize .obsidian-ai-memory in cwd
npx omnix scan                # detect stack, seed project-context.md
npx omnix install-adapters    # copy adapter files for selected tools
npx omnix retrieve-context    # print top-N relevant memory files for a task
npx omnix session-digest      # generate a digest from notes or transcript
npx omnix sync-memory         # validate vault state, fix common drift
```

## Local dev

```bash
pnpm install
pnpm --filter @omnix/cli build
node apps/cli/dist/index.js --help
```

## Contracts

See `src/commands/*.ts`. Each command exports a function with typed args and a JSDoc describing intended behavior. Bodies are TODO blocks.

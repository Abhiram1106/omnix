# .claude/skills/

Place project-specific slash command skills here.

Each `.md` file becomes a `/command` available in this project's Claude Code sessions.

## Example

Create `deploy-check.md`:
```markdown
---
description: Pre-deployment checklist for this project
---

Run the following checks before marking a deployment ready:
1. `pnpm test` — all tests green
2. `pnpm typecheck` — no type errors
3. Check `.obsidian-ai-memory/03-ERRORS/` for any open unresolved errors
4. Confirm `.env.production` values are set in the deployment target
```

Then invoke with `/deploy-check` in any Claude Code session.

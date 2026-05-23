# CODEOWNERS AI Block

> Treat AI infrastructure as code — require review on changes.
> Copy the relevant lines into your `CODEOWNERS` file (or `.github/CODEOWNERS`).

```
# ── AI / IDE assistant configuration ──────────────────────────────────────────
# AI infrastructure is treated as code. Changes to conventions and memory
# rules require explicit review from the project owner.

/.claude/                @<your-github-username>
/.cursor/rules/          @<your-github-username>
/.cursor/agents/         @<your-github-username>
/.cursor/context/        @<your-github-username>
/.omnix/                 @<your-github-username>
/.obsidian-ai-memory/    @<your-github-username>
/AGENTS.md               @<your-github-username>
/CLAUDE.md               @<your-github-username>
```

**Why:** Without CODEOWNERS, a team member can silently change a rule in `.cursor/rules/backend.mdc` that takes effect immediately in everyone's Cursor sessions. CODEOWNERS enforces review on AI infrastructure the same way you would on CI/CD configuration.

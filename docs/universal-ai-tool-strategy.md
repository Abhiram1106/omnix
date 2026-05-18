# Universal AI Tool Strategy

## Why tool-agnostic

- Tools change quickly. The right tool for a task this quarter is different next quarter.
- Teams use different tools. Forcing one tool is friction.
- Project memory and standards outlive any single tool.

## How we stay agnostic

1. **Adapters are thin.** Each tool gets a small file that points to the core + memory.
2. **Core is plain markdown.** Every tool reads files.
3. **Memory is plain markdown.** Every tool reads files.
4. **No tool-specific abstractions leak into core.** No "skills," no "personas," no "modes" — just standards, workflows, agents (role specs), templates.

## Where tools differ (and how we handle it)

- **File location / name** — handled by the CLI's install step. Examples:
  - Claude Code: `CLAUDE.md` at root.
  - Cursor: `.cursor/rules/*.mdc`.
  - Aider: `CONVENTIONS.md`.
  - Cline / Roo / OpenHands: tool-specific instruction file location.
- **Rule syntax** — handled by the adapter file (e.g., Cursor's `.mdc` frontmatter). Cursor sees `.mdc`; Aider sees `CONVENTIONS.md`. Same underlying rule.
- **Command system** — Claude Code has slash commands; Cursor has prompts; Aider has CLI flags. Where commands are useful (e.g., `/retrieve-context`), we provide them per tool.

## Update strategy

When a tool changes its config format:
- Update only `packages/adapters/<tool>/`.
- Core stays the same.
- Bump adapter version.

## Anti-goals

- Don't write a wrapper that runs the tools for the user.
- Don't try to homogenize differences that genuinely matter (e.g., Aider's git workflow vs Cursor's IDE workflow).

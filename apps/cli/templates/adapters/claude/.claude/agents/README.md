# .claude/agents/

Place project-specific Claude Code subagent definitions here.

Each file defines one subagent with:
- `description:` — one-line trigger description (used by Claude for routing)
- Body: role, tools available, behavior constraints

## Example

```markdown
---
name: api-reviewer
description: Reviews REST/GraphQL API changes for consistency and security
---

You are an API review specialist. When reviewing API changes:
- Check for breaking changes
- Verify auth is enforced on all new endpoints
- Confirm error responses follow the project schema
```

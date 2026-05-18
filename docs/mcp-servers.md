# MCP Servers

Model Context Protocol (MCP) servers extend AI coding tools with tools/resources.

## Tools that support MCP

- Claude Code (first-class).
- Cursor (recent versions).
- Continue.
- Cline / Roo Code.
- Others rolling out.

## Useful MCP servers (verify availability)

| Server | What it gives the AI |
|---|---|
| filesystem | Sandboxed file access |
| git | git operations |
| github / gitlab | PR + issue interaction |
| postgres / sqlite | Read-only SQL queries |
| fetch / web | HTTP(S) fetches |
| search | Web search |
| memory / knowledge | A long-term store (overlaps with our Obsidian vault) |

> Names and capabilities change. Verify against each server's current README before relying on tool names.

## Integration with this OS

- The Obsidian vault is the **canonical** memory. MCP "memory" servers are optional accelerators (e.g., for semantic retrieval) but not the source of truth.
- Project-specific MCP server choices and configs live in `02-PROJECTS/project-context.md` or `05-ARCHITECTURE/stack.md`.

## Security note

MCP servers run with the credentials they're given. Don't grant an MCP server more access than the AI needs.

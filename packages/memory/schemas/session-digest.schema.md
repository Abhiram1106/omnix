# Session Digest — Schema

Plain-markdown record type. Lives in `01-SESSIONS/YYYY-MM-DD/session-HHMM-<tool>.md`.

## Fields

| Field | Required | Type | Notes |
|---|---|---|---|
| Date | yes | YYYY-MM-DD HH:MM (local or UTC, consistent per project) | |
| Tool | yes | string | e.g., `claude-code`, `cursor`, `aider` |
| Agent/Role | yes | string | e.g., `backend`, `debugger`, `ad-hoc` |
| Project | yes | string | project name |
| User Request | yes | text | what the user asked for |
| Context Retrieved | yes | list of vault file paths | what was read pre-work |
| Files Read | yes | list | source files read during work |
| Files Changed | yes | list with brief notes | |
| Commands Run | yes | list | shell/CLI commands |
| Decisions Made | conditional | list | non-trivial only; link to `04-DECISIONS/` |
| Errors Encountered | conditional | list | symptom + status |
| Fixes Applied | conditional | list | what changed to fix; link error-memory entry |
| Tests/Verification | yes | text | what was run, results |
| Docs Updated | conditional | list of doc paths | |
| Memory Updated | yes | list of vault file paths | which vault files were written/updated |
| Open Questions | conditional | list | anything unresolved |
| Next Recommended Step | yes | text | one or two concrete next actions |

## Naming

`session-HHMM-<tool>.md` — e.g., `session-1430-claude-code.md`.

## Linking

- Reference error entries via `[[error-memory#<anchor>]]`.
- Reference decisions via `[[decisions#<anchor>]]` or `[[adr-NNNN-...]]`.

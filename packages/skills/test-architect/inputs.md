# Inputs — test-architect

## Required

- **cwd**: project root path
- **vault**: path to `.obsidian-ai-memory/` (defaults to `<cwd>/.obsidian-ai-memory`)

## Optional

- **task**: plain-language description of the user's request
- **budget**: token budget (skills in `memory` category)
- **mode**: retrieval mode (skills in `memory` / `context` category)

## Example input

```
src/auth/refresh-token.ts with no test file
```

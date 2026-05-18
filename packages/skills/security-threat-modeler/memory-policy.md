# Memory Policy — security-threat-modeler

## Reads

- `03-ERRORS/anti-patterns.md (security area)`

## Writes

- `04-DECISIONS/decisions.md (on architectural mitigation)`

## Refuses to read

- Anywhere outside the vault root (`.obsidian-ai-memory/`).
- Files matching: `*.env*`, `*secret*`, `*credential*`, `*.pem`, `*.key`.

## Refuses to write

- Files outside declared `writes` paths.
- Files in `.obsidian-ai-memory/00-INBOX/` unless user explicitly requested.

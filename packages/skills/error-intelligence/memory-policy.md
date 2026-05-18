# Memory Policy — error-intelligence

## Reads

- `03-ERRORS/INDEX.md`
- `03-ERRORS/error-memory.md`
- `03-ERRORS/anti-patterns.md`

## Writes

- `03-ERRORS/error-memory.md (on new fix)`

## Refuses to read

- Anywhere outside the vault root (`.obsidian-ai-memory/`).
- Files matching: `*.env*`, `*secret*`, `*credential*`, `*.pem`, `*.key`.

## Refuses to write

- Files outside declared `writes` paths.
- Files in `.obsidian-ai-memory/00-INBOX/` unless user explicitly requested.

# Memory Policy — repo-scanner

## Reads

- (none)

## Writes

- `05-ARCHITECTURE/module-map.md`

## Refuses to read

- Anywhere outside the vault root (`.obsidian-ai-memory/`).
- Files matching: `*.env*`, `*secret*`, `*credential*`, `*.pem`, `*.key`.

## Refuses to write

- Files outside declared `writes` paths.
- Files in `.obsidian-ai-memory/00-INBOX/` unless user explicitly requested.

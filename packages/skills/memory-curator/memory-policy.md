# Memory Policy — memory-curator

## Reads

- `all vault files`

## Writes

- `all vault files (in-place edits with backup)`

## Refuses to read

- Anywhere outside the vault root (`.obsidian-ai-memory/`).
- Files matching: `*.env*`, `*secret*`, `*credential*`, `*.pem`, `*.key`.

## Refuses to write

- Files outside declared `writes` paths.
- Files in `.obsidian-ai-memory/00-INBOX/` unless user explicitly requested.

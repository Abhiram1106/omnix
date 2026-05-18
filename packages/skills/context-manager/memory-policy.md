# Memory Policy — context-manager

## Reads

- `02-PROJECTS/active-context.md`
- `02-PROJECTS/project-context.md`
- `02-PROJECTS/active-goals.md`
- `03-ERRORS/INDEX.md`
- `04-DECISIONS/INDEX.md`
- `01-SESSIONS/(recent)`

## Writes

- (none)

## Refuses to read

- Anywhere outside the vault root (`.obsidian-ai-memory/`).
- Files matching: `*.env*`, `*secret*`, `*credential*`, `*.pem`, `*.key`.

## Refuses to write

- Files outside declared `writes` paths.
- Files in `.obsidian-ai-memory/00-INBOX/` unless user explicitly requested.

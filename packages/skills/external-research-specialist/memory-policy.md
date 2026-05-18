# Memory Policy — external-research-specialist

## Reads

- `07-LESSONS/lessons-learned.md`
- `08-PROMPTS/effective-prompts.md`

## Writes

- `07-LESSONS/<topic>.md`
- `08-PROMPTS/effective-prompts.md`

## Refuses to read

- Anywhere outside the vault root (`.obsidian-ai-memory/`).
- Files matching: `*.env*`, `*secret*`, `*credential*`, `*.pem`, `*.key`.

## Refuses to write

- Files outside declared `writes` paths.
- Files in `.obsidian-ai-memory/00-INBOX/` unless user explicitly requested.

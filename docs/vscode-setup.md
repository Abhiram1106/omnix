# VS Code Setup

Minimal opinionated setup for projects using this OS.

## Extensions

- **Tailwind CSS IntelliSense** (if Tailwind).
- **ESLint** + your project's flat config.
- **Prettier** if used.
- **Error Lens** (inline diagnostics).
- **GitLens** (history navigation).
- **EditorConfig**.
- **Python** + **Pylance** (if Python).
- **Even Better TOML**, **YAML**.

Plus the AI tool of your choice (Cursor is a fork of VS Code; Continue / Claude Code / Cline / Roo are extensions).

## Workspace `.vscode/settings.json` baseline

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": { "source.fixAll.eslint": "explicit" },
  "files.eol": "\n",
  "files.insertFinalNewline": true,
  "files.trimTrailingWhitespace": true,
  "search.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/.turbo": true,
    "**/.obsidian-ai-memory": true
  }
}
```

## Tasks (`.vscode/tasks.json`)

Define `dev`, `test`, `typecheck`, `lint` tasks so they're one keystroke away.

## Memory vault access

If you keep `.obsidian-ai-memory/` inside the repo, exclude it from search (above) but keep it in the file tree so you can quickly open digests.

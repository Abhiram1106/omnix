# Terminal Setup

## Shell

- Linux/macOS: zsh or bash + starship/pure prompt.
- Windows: PowerShell 7+ or WSL2 (Ubuntu) — most CLIs work better in WSL.

## Multiplexer

- tmux or zellij. Helps when running AI tools, dev servers, and tests in parallel panes.

## Aliases (suggested)

```sh
alias g='git'
alias gs='git status'
alias gd='git diff'
alias gl='git log --oneline -20'
alias t='pnpm test'
alias d='pnpm dev'
alias l='pnpm lint'

# omnix
alias omnix='npx omnix'
alias omnix-init='npx omnix init'
alias omnix-digest='npx omnix session-digest'
```

## Tools worth having on PATH

- `gh` (GitHub CLI), `glab` (GitLab).
- `rg` (ripgrep), `fd`.
- `jq`, `yq`.
- `direnv` (per-project env vars).
- `mise` or `asdf` (toolchain versions).
- `pnpm`, `uv` (Python).

## Direnv pattern

`.envrc` per project loads project-specific env. Combined with `mise` you get reproducible tool + version setup.

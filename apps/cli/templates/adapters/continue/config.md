# Continue.dev Config — Omnix

> Continue uses `~/.continue/config.yaml` (global) or `.continue/config.yaml` (project-local).
> Add the system message snippet and context providers below to your Continue config.

---

## System message snippet

Add this to your model's `systemMessage` in `config.yaml`:

```yaml
systemMessage: |
  You are working inside a project that uses Omnix conventions.

  BEFORE every response or edit:
  1. Read {{VAULT_DIR}}/02-PROJECTS/session-continuity.md (rolling handoff)
  2. Read {{VAULT_DIR}}/02-PROJECTS/project-context.md (stack, constraints)
  3. Read {{VAULT_DIR}}/03-ERRORS/error-memory.md (known bugs — never repeat)
  4. Read {{VAULT_DIR}}/03-ERRORS/anti-patterns.md (prevention rules)

  AFTER every meaningful session:
  1. Write session digest to {{VAULT_DIR}}/01-SESSIONS/YYYY-MM-DD/session-HHMM-continue.md
  2. Overwrite {{VAULT_DIR}}/02-PROJECTS/session-continuity.md with next-session handoff
  3. Append to error-memory and decisions as applicable
  4. Two commits: code commit (feat:) + memory commit (memory: YYYY-MM-DD continue — ...)

  Full rules: AGENTS.md (single source of truth). Never expose secrets. Confirm before
  destructive operations. Verify (tests pass, typecheck clean) before claiming done.
```

---

## Context providers (config.yaml)

```yaml
contextProviders:
  - name: file
    params:
      # Always load session continuity and project context
  - name: directory
    params:
      directories:
        - "{{VAULT_DIR}}/02-PROJECTS"
        - "{{VAULT_DIR}}/03-ERRORS"
```

---

## Slash commands (optional)

Add to your `config.yaml` for quick vault access:

```yaml
slashCommands:
  - name: memory
    description: "Show session-continuity.md"
    prompt: "Read and display {{VAULT_DIR}}/02-PROJECTS/session-continuity.md"
  - name: digest
    description: "Write session digest"
    prompt: "Write a session digest to {{VAULT_DIR}}/01-SESSIONS/ following the template in {{VAULT_DIR}}/templates/session-digest.md"
  - name: errors
    description: "Show known errors"
    prompt: "Read and display {{VAULT_DIR}}/03-ERRORS/error-memory.md"
```

---

## Mandatory rules

1. **Retrieve memory before answering or editing** — prevents repeating known mistakes.
2. **Never repeat known errors** — check `error-memory.md` before diagnosing anything.
3. **Never expose secrets** — no API keys, tokens, passwords, DB URIs in any file.
4. **Confirm before destructive operations** — `rm`, `DROP TABLE`, force push, production migrations.
5. **Verify before claiming done** — tests pass, typecheck clean, no regressions.

---

## Agent routing

| Request signal | Route to |
|---------------|----------|
| build / add / implement | feature-build workflow |
| error / crash / failing | debugging → bug-fix workflow |
| review / audit | code-review workflow |
| refactor / clean | refactor workflow |
| deploy / ship / release | deployment workflow |
| security / auth / CVE | code-review + security workflow |

Full routing table: `AGENTS.md` § 3.

---

## Memory reference

| File | Purpose | Write mode |
|------|---------|-----------|
| `{{VAULT_DIR}}/02-PROJECTS/session-continuity.md` | Rolling handoff | Overwrite |
| `{{VAULT_DIR}}/03-ERRORS/error-memory.md` | Bug log | Append-only |
| `{{VAULT_DIR}}/04-DECISIONS/decisions.md` | Decision log | Append-only |
| `{{VAULT_DIR}}/01-SESSIONS/` | Session digests | New file each session |

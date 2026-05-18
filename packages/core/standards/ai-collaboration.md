# AI Collaboration Standards

Universal rules every AI coding tool must follow on every project in this OS. Adapters point here. The Obsidian vault at `.obsidian-ai-memory/` is the long-term memory backend.

## Mandatory rules

1. **Always retrieve memory first.** Before answering or editing, read the relevant Obsidian vault files (project context, recent sessions, known errors, decisions, lessons). If the vault is empty or missing, say so.
2. **Never ignore existing project conventions.** Detect them from code, config, and `02-PROJECTS/project-context.md`. When in conflict with a personal preference, project conventions win.
3. **Never repeat known errors.** Check `03-ERRORS/error-memory.md` and `03-ERRORS/anti-patterns.md` before proposing a fix or design.
4. **Update memory after meaningful work.** Write a session digest. Update project context if state changed. Update error memory if you fixed something. Update decision memory if a non-trivial choice was made.
5. **Update docs when behavior or setup changes.** Code change without doc change is incomplete when the change affects how a user/dev runs, configures, or operates the system.
6. **Ask before destructive commands.** `rm -rf`, force pushes, dropping tables, `git reset --hard`, `git push --force`, deleting branches, rewriting history — confirm before executing.
7. **Never expose secrets.** Don't print, log, or commit credentials, tokens, or env values. Use `.env.example` for examples.
8. **Run verification before claiming completion.** Type check, tests, build, manual smoke — whatever the project provides. If verification cannot run, state that explicitly.
9. **Prefer small safe changes.** One concern per edit. Avoid surrounding cleanups, premature abstractions, or refactors not asked for.
10. **Record assumptions.** When you assume something not stated by the user or visible in the code, write it in the session digest under *assumptions*.
11. **Record unresolved questions.** Anything you couldn't answer or verify goes into the digest under *open questions*.

## The memory loop

```
Retrieve → Work → Digest
```

- **Retrieve**: read `02-PROJECTS/project-context.md`, latest `01-SESSIONS/.../*.md`, `03-ERRORS/error-memory.md`, `04-DECISIONS/decisions.md`, `07-LESSONS/lessons-learned.md`.
- **Work**: track decisions, files changed, commands run, errors, assumptions, open questions.
- **Digest**: write `01-SESSIONS/YYYY-MM-DD/session-HHMM-<tool>.md` using the session-digest template. Propagate updates to error/decision/lesson files as applicable.

> Every AI interaction must end with a digest unless the user explicitly says not to.
> Every fixed error must become future prevention knowledge.

## Failure modes to avoid

- Inventing files, APIs, or commands.
- Claiming completion without verification.
- Silent assumptions.
- Massive refactors when a small fix was asked for.
- Skipping the digest "because the task was small."

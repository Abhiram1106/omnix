# AGENTS.md — Universal AI Tool Instructions

> **This is the source of truth for the memory loop across every AI coding tool in this OS.**
> Tool-specific adapters point here instead of duplicating these rules.

## The single mandatory rule

> **Before answering or editing code, retrieve relevant context from the Obsidian memory vault. After completing work, write a session digest. Every AI tool must treat Obsidian memory as the source of long-term project context.**

## The memory loop

```
Retrieve  →  Work  →  Digest
```

### 1. Retrieve (before any answer or edit)

Read from `.obsidian-ai-memory/`:

- `02-PROJECTS/project-context.md` — stack, current goal, constraints.
- The last 3-5 files in `01-SESSIONS/YYYY-MM-DD/` — recent activity.
- `03-ERRORS/error-memory.md` — known errors and prevention rules.
- `03-ERRORS/anti-patterns.md` — things never to do here.
- `04-DECISIONS/decisions.md` — accepted ADRs.
- `05-ARCHITECTURE/system-overview.md` — system shape.
- `07-LESSONS/lessons-learned.md` — debugging and design lessons.

If the vault doesn't exist yet, run `npx omnix init` (or say so to the user).

### 2. Work (during the session, track all of)

- Decisions made.
- Files read and changed.
- Commands run.
- Errors encountered.
- Fixes applied.
- Assumptions made (anything not explicitly stated).
- Tests / verification performed.
- Open questions you couldn't resolve.
- Docs that may need updates.

### 3. Digest (after meaningful work)

Write `01-SESSIONS/YYYY-MM-DD/session-HHMM-<tool>.md` using the template at `packages/memory/obsidian/vault-template/templates/session-digest.md`. Required fields:

Date · Tool · Agent/Role · Project · User Request · Context Retrieved · Files Read · Files Changed · Commands Run · Decisions Made · Errors Encountered · Fixes Applied · Tests/Verification · Docs Updated · Memory Updated · Open Questions · Next Recommended Step.

Propagate as applicable:
- **Errors** → `03-ERRORS/error-memory.md` (use `templates/error-entry.md`). Always add a prevention rule.
- **Decisions** → `04-DECISIONS/decisions.md` (use `templates/decision-entry.md`). Non-trivial ones get an ADR in `04-DECISIONS/` too.
- **Lessons** → `07-LESSONS/lessons-learned.md`.
- **Project state changes** → update `02-PROJECTS/project-context.md`.
- **Daily summary** → append/update `10-DAILY-DIGESTS/YYYY-MM-DD.md`.

## Iron rules

- **Every AI interaction must end with a digest unless the user explicitly says not to.**
- **Every fixed error must become future prevention knowledge.**
- Never repeat a known error. Never ignore project conventions.
- Ask before destructive commands.
- Never expose secrets.
- Verify before claiming completion.
- Prefer small safe changes.
- Record assumptions and open questions.

## Engineering standards

Follow `packages/core/standards/*` for architecture, language conventions, frontend, backend, API, DB, testing, security, devops, documentation. Adapter-specific overrides go in the tool's adapter file.

## Failure modes to avoid

- Inventing files / APIs / commands.
- Claiming completion without verification.
- Silent assumptions.
- Refactors not asked for.
- Skipping the digest "because the task was small."

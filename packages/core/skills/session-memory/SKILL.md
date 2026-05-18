---
name: session-memory
description: >
  Activate when the task involves writing a session digest, updating error memory,
  recording a decision, compressing old sessions, or managing the Obsidian vault.
  Also activate at the end of any meaningful work session.
triggers:
  - digest
  - session
  - memory
  - vault
  - obsidian
  - record
  - remember
  - decision
  - error memory
  - lessons
---

## When to activate

At the end of any session where something meaningful happened. Also at the start of a session to retrieve existing context. If in doubt — write the digest.

## The memory loop

```
Before work:  Retrieve → ranked by relevance → stop at budget
During work:  Track decisions, errors, assumptions, open questions
After work:   Write digest → update errors if fixed → update decisions if made
```

## What must go in every digest

Use the template at `.obsidian-ai-memory/templates/session-digest.md`. Required fields:

| Field | What to write |
|---|---|
| User Request | Exact goal, not a paraphrase |
| Files Changed | List of paths — not "several files" |
| Decisions Made | Non-trivial choices with *why* |
| Errors Encountered | Symptom + root cause if found |
| Fixes Applied | What changed + how it fixed the error |
| Open Questions | Anything unresolved — future sessions need this |
| Next Recommended Step | Single most important next action |

Leave fields empty rather than writing "N/A" or "none" — empty is honest, filler misleads future sessions.

## Error memory (mandatory after every fix)

Every fixed bug must become a prevention rule. File: `03-ERRORS/error-memory.md`.

Template fields: Date, Project, Area, Symptom, Root Cause, Fix, **Prevention Rule**, Do Not Repeat, Regression Test Added.

The `Prevention Rule` field is the most important — it's what future sessions retrieve and act on.

## Decision memory

Record non-trivial decisions in `04-DECISIONS/decisions.md`:
- Architecture choices (database, framework, pattern)
- Product decisions (scope, behavior, UX tradeoff)
- Process decisions (team, deploy, monitoring)

Not every decision needs an ADR. One-liners are fine for low-stakes calls. ADRs (`packages/core/templates/adr-template.md`) for anything hard to reverse.

## Compression rules

| Age | Action |
|---|---|
| 5+ digests in one week | Generate `weekly-summary.md`, compress digests to references |
| 30+ days old, resolved | Archive to `archived-errors.md`, keep prevention rule in `anti-patterns.md` |
| Architecture doc > 200 lines | Generate `05-ARCHITECTURE/summary.md`, use as primary retrieval target |

## Practical guidance

1. Write the digest *before* closing the session, not afterward from memory.
2. The digest for a 5-minute fix should take 2 minutes to write. It is not an essay.
3. The `Next Recommended Step` field is what the next AI session will read first. Make it actionable.
4. If you fixed a bug and don't have time to write a full error entry, at minimum add one line to `anti-patterns.md`.
5. Run `omnix session-digest --tool <name>` to scaffold the file; fill in fields manually or from notes.

## Gotchas

- Empty vault is not a failure state — it means this is the first session. Run first-run onboarding.
- Digests that describe *what* happened but not *why* decisions were made are useless for future context.
- "I'll write the digest next time" is how knowledge is lost. Do it now.

## Integration

- CLI: `omnix session-digest --tool <name> [--notes <file>]`
- Retrieval: `packages/core/skills/context-engineering/SKILL.md`
- Templates: `.obsidian-ai-memory/templates/`

# Context Engineering Standard

> "The Omnix Runtime is memory-first, retrieval-first, and context-optimized. Obsidian is the engineering brain. Every action should maximize context quality while minimizing token waste."

Context engineering is a **core architecture layer**, not an optional optimization.

## The goal

- Better context → fewer hallucinations, higher quality outputs.
- Fewer tokens → faster execution, lower cost, more work per window.
- Structured retrieval → less noise, more signal.
- Compressed memory → relevant history without bloat.

## Retrieval hierarchy

Always retrieve in this order. Stop when context budget is reached.

```
Priority  Source                                        Load when
────────  ─────────────────────────────────────────── ──────────────────────
1         02-PROJECTS/project-context.md               Always
2         02-PROJECTS/active-goals.md                  Always
3         02-PROJECTS/current-state.md                 Always
4         01-SESSIONS/ (last 3-5 digests)              Always
5         03-ERRORS/error-memory.md                    Always
6         03-ERRORS/anti-patterns.md                   Always
7         04-DECISIONS/decisions.md                    Architecture / design tasks
8         05-ARCHITECTURE/system-overview.md           Architecture / design tasks
9         07-LESSONS/lessons-learned.md                Debugging / refactor tasks
10        08-PROMPTS/effective-prompts.md              AI / prompt tasks
11        10-DAILY-DIGESTS/ (recent)                   Weekly review / planning
12        Archived / compressed summaries              Only if relevant + recent not enough
```

Never load all files. Never dump raw vault content into the context window.

## Token budgeting

| Context mode | Max tokens from memory | Use case |
|---|---|---|
| Minimal | ~500 | Simple Q&A, quick lookup |
| Balanced | ~1500 | Normal feature work, bug fix |
| Deep | ~3000 | Architecture review, large refactor |
| Architecture | ~4000 | System redesign |
| Debugging | ~2000 | Incident, hard bug |
| Deployment | ~1500 | Deploy + infra work |
| Emergency | ~1000 | Outage — fast, focused |

These are memory-retrieval budgets, not total context limits. The user's request and code files consume separate budget.

## Summarization rules

- Session digests older than **7 days** with no linked open issues → compress to one-liner or weekly-summary entry.
- Session digests older than **30 days** → archive into monthly summary.
- `error-memory.md` entries with a valid regression test + 30 days no recurrence → move to `archived-errors.md` (keep prevention rule active in `anti-patterns.md`).
- Architecture docs that haven't changed in **90 days** → generate an architecture-summary snapshot. Keep the original.

## Context compression rules

1. **Prefer summaries over raw files** when the raw file is > 200 lines.
2. **Prefer the last N digests** over the full session archive.
3. **Prefer one-liner errors** in the prompt; link to full entry only if needed.
4. **Do not re-read the same file twice** in one session.
5. **Strip boilerplate** from retrieved content before embedding in context.
6. **Prioritize errors and goals** over decisions and architecture for routine work.

## Relevance scoring (qualitative, no ML needed)

Rate each candidate memory file before loading:

- **High** (always load): touches the exact module/function/error being worked on.
- **Medium** (load if budget allows): touches adjacent modules or related past work.
- **Low** (skip unless deep mode): general architecture, unrelated sessions.

## Anti-context-bloat rules

- Never paste an entire `error-memory.md` file when a 3-line summary of the relevant entry suffices.
- Never repeat project context across multiple messages in the same session.
- Never load the full architecture doc when only one service boundary is relevant.
- Never include resolved/archived decisions in active retrieval.
- Never load prompts-library when doing non-AI tasks.

## Efficient AI communication rules

- **Engineering-grade language.** Precise, technical, no filler.
- **Lead with the result.** Code, answer, or decision — then explanation.
- **One response covers one concern.** Don't pad.
- **Ask at most 1 clarifying question.** Then proceed with reasonable assumptions + record them.
- **State what was NOT verified.** Don't silently skip.

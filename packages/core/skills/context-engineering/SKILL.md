---
name: context-engineering
description: >
  Activate when user asks about context windows, token budgets, memory retrieval,
  context compression, RAG quality, or reducing hallucinations. Use for tasks
  involving how to load, rank, and trim information before an AI acts.
triggers:
  - context
  - tokens
  - retrieval
  - memory
  - hallucination
  - compress
  - context window
  - RAG
---

## When to activate

When the task is about *what information the AI should read* before acting — not the action itself. Also activate when outputs are poor quality and the likely cause is missing or noisy context.

## Core concepts

**U-shaped attention**: LLMs attend strongly to the beginning and end of context; middle content loses 10-20% accuracy. Put critical rules at the top and key examples at the bottom.

**Retrieval > generation**: A well-retrieved 500-token context beats a 4000-token dump. Fetch only what is relevant to the current task area.

**Three disclosure levels**:
1. Skill/file names (index) — always loaded, near-zero tokens.
2. Skill content — loaded when triggered, 200-500 tokens.
3. Referenced data — loaded only when the skill explicitly needs it.

## Practical guidance

1. **Identify the task area first** — auth bug? Load auth error entries only. Not all errors.
2. **Load in priority order**: active goals → current state → recent sessions → errors → decisions → architecture. Stop when budget is hit.
3. **Summarize before loading**: if a file is > 200 lines, load a summary version unless the full file is directly needed.
4. **Never re-read** a file already in context during the same session.
5. **Strip boilerplate**: remove headers, footers, and repeated preambles before embedding retrieved content.
6. **Use retrieval modes** (from `workflows/retrieval-modes.md`): minimal (300 tokens), balanced (1500), deep (3000), architecture (4000), debugging (2000), emergency (800).
7. **Compress old sessions**: digests older than 7 days → one-liner. Older than 30 days → monthly summary.

## Gotchas

- Loading everything "to be safe" is the most common failure mode. It fills the window with noise and pushes useful content into the attention dead zone.
- Session digests are only valuable if they contain *decisions* and *errors*, not just what files were changed. Files changed is in git; decisions are not.
- Stale architecture docs mislead more than no context at all. Date-check before loading.
- LLM recall of the 3rd item in a bulleted list in the middle of a long context is unreliable. Put it first or last, or split it into its own message.

## Integration

- Works with `session-memory` skill — that skill handles *writing* memory; this one handles *reading* it.
- The context-manager agent (`packages/core/agents/context-manager.md`) runs this skill automatically at session start.
- Retrieval modes are defined in `packages/core/workflows/retrieval-modes.md`.

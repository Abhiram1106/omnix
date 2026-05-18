# AI Workflows

How to actually work *with* the AI tools, given the rules in this OS.

## The loop, restated

```
Retrieve  →  Work  →  Digest
```

Every session. Every tool.

## Modes of work

| Mode | When | How |
|---|---|---|
| **Ask** | Quick Q&A | Read code/memory, answer, no digest unless the answer changed your plan. |
| **Plan** | Designing a feature | Retrieve heavily. Write a draft plan (ADR or feature notes). Confirm with user. |
| **Edit** | Implementing | Small commits. Tests as you go. Verify. Digest at end. |
| **Debug** | Investigating | One hypothesis at a time. Memorize each step in the digest. |
| **Refactor** | No behavior change | Tests first. Mechanical → structural. Digest with before/after. |
| **Review** | Pre-merge | Use `workflows/code-review.md`. Surface recurring issues to lessons. |

## Multi-tool handoff

- Tool A ends with a digest.
- Tool B begins by reading that digest + standard pre-work set.
- The user does not have to re-explain context.

## Subagents

When a tool supports subagents (e.g., Claude Code's Task tool), use them for:
- Parallel reads.
- Isolated long-running work.
- Specialized roles (reviewer, debugger).

Each subagent ends with its own short report; the orchestrator decides what to digest at the session level.

## When the AI is wrong

- Push back. The AI defers to user instructions.
- Save the corrected approach as feedback in `09-AGENTS/agent-behavior-notes.md` if it's a recurring pattern.

## When the user is wrong

- Say so, with evidence. Don't just go along.
- If overruled, record the dissent in the digest under *Open Questions*.

## Anti-patterns to avoid

- Treating the AI as autonomous when the task needs you in the loop.
- Skipping retrieval because "I know this codebase."
- Skipping digests because "this was small."
- Letting the AI invent files / commands rather than verifying.

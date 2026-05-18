---
name: prompt-engineering
description: >
  Activate when user needs to write or improve AI prompts, system messages,
  agent instructions, or tool definitions. Also activate for LLM app development,
  evals, or when AI output quality is poor and the likely cause is the prompt.
triggers:
  - prompt
  - system message
  - instruction
  - LLM
  - AI output
  - hallucination
  - eval
  - few-shot
  - chain of thought
---

## When to activate

When the artifact being built is an AI instruction, not application code. Or when application code calls an LLM and the output quality needs to improve.

## Core concepts

**Intent algebra** — every effective prompt has 9 dimensions: task (verb), target tool, output format, constraints, context, audience, success criteria, examples, and input. Missing any → degraded output. Silent audit these before writing.

**Tool-specific syntax** — prompting Claude is not the same as prompting GPT-4 or Gemini. Route to tool-specific techniques:
- Claude: XML tags, `<thinking>`, constitutional AI, tool definitions.
- GPT-4o: JSON mode, function calling, seed.
- Gemini: structured output, grounding, system instruction placement.
- Open-source (Llama, Mistral): chat template format, repetition penalty, temperature.

**Bounded techniques only** — use: role assignment, few-shot examples, XML tags, grounding anchors, chain-of-thought. Avoid: tree-of-thought, graph-of-thought, prompt chaining (high hallucination risk without rigorous evals).

## Practical guidance

1. **State the task verb precisely** — "extract", "classify", "rewrite", "compare", not "help me with" or "analyze".
2. **One task per prompt** — compound prompts ("summarize AND translate AND format") degrade quality on each dimension.
3. **Specify output format explicitly** — JSON schema, markdown headers, word count, tone. Don't let the model guess.
4. **Give a success criterion** — "output is correct if it contains these 3 fields with these constraints."
5. **Few-shot > zero-shot for structured output** — 2-3 examples of input→output pairs outperform long instructions.
6. **Put constraints in negative form too** — "Do not include prices" is clearer than "only include product names."
7. **Test with adversarial inputs** — empty input, very long input, input in the wrong language, input that looks like instructions.

## Anti-patterns (credit-killers)

| Pattern | Problem | Fix |
|---|---|---|
| Vague task verb ("help with", "think about") | Model guesses the task | Use precise verbs |
| Two tasks in one prompt | One degrades the other | Split into two calls |
| Missing success criteria | No way to eval correctness | Add explicit criteria |
| Over-permissive agent | Model does unexpected things | Scope with explicit constraints |
| Emotional language ("you're an expert") | Doesn't improve output | Remove — it wastes tokens |
| No output format | Inconsistent structure | Specify format explicitly |
| Asking for "best practices" | Produces generic text | Ask for specific decisions |

## Evals

Don't ship an LLM feature without at least one eval:
- **Unit eval**: fixed input → assert output matches expected pattern or schema.
- **Regression eval**: run on 10-20 representative inputs, score with rubric, track drift over model upgrades.
- **Adversarial eval**: injection attempts, out-of-distribution inputs, edge cases.

## Gotchas

- Prompt tuning for one model version often degrades on the next. Pin evals to model version.
- Long system messages get truncated or ignored in middle position. Put critical rules in first 100 and last 50 tokens.
- "The model didn't follow my instructions" is usually a constraint conflict, not a capability gap. Check for contradictions.

## Integration

- AI engineering standards: `packages/core/standards/ai-collaboration.md`.
- Agent definitions are prompts: apply all rules here to `packages/core/agents/*.md`.
- Relevant agent: `ai-engineer`.

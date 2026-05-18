# Omnix Skill / Plugin System (Architecture Spec)

> Status: **SPEC**. Reference implementation will land in v0.3.

## What is a Skill?

A **Skill** is a reusable, scoped capability that can be:
1. Read by an AI tool as guidance (today's markdown skills).
2. Invoked by the Omnix CLI as a deterministic operation (future).
3. Composed with other skills via workflows (future).

A skill is NOT:
- An autonomous agent.
- A long-running process.
- An LLM in itself.

A skill is a **specification + optional CLI handler**. The handler is pure code; no LLM dependencies unless the skill explicitly opts in.

## Skill folder structure

```
packages/skills/<skill-name>/
  skill.yaml          # manifest (required)
  README.md           # human overview (required)
  instructions.md     # AI-readable rules / decision logic (required)
  inputs.md           # what the skill expects (required)
  outputs.md          # what the skill produces (required)
  memory-policy.md    # what memory it reads + writes (required)
  examples.md         # input/output pairs (required)
  checklists.md       # verification steps (required)
  handler.ts          # optional: deterministic CLI handler (TypeScript)
  tests/              # optional: tests for the handler
```

## skill.yaml schema

```yaml
name: context-manager          # required, kebab-case
description: |                 # required, 1-3 sentences
  Decides what memory to load before the AI acts on a task.
  Produces a context pack — a flat list of files and summaries
  bounded by a token budget.
version: 0.1.0                 # required, semver
category: memory               # required: memory | context | review | scan | safety | external
triggers:                      # optional: keyword triggers for AI activation
  - context
  - memory retrieval
  - load context
required_context:              # optional: what must be available
  - vault_present              # ".obsidian-ai-memory/ exists"
reads_memory:                  # required: vault paths read (relative to vault root)
  - 02-PROJECTS/project-context.md
  - 02-PROJECTS/active-goals.md
  - 02-PROJECTS/active-context.md
  - 01-SESSIONS/(recent)
  - 03-ERRORS/INDEX.md
  - 04-DECISIONS/INDEX.md
writes_memory: []              # required: vault paths written; [] if none
tools_needed:                  # optional: external tools
  - fs                         # filesystem access
  # - browser                  # if it uses dev-browser
  # - mcp:<server>             # if it uses an MCP server
risk_level: low                # required: low | medium | high
                               # low    = read-only or scoped writes
                               # medium = writes user-facing files
                               # high   = destructive or network calls
output_contract:               # required: shape of output
  type: context-pack           # or: report, file-write, diff, exit-code
  schema: ../schemas/context-pack.schema.md
verification_steps:            # required: how to verify it worked
  - "Pack stays under declared token budget"
  - "All listed files exist"
  - "No duplicates"
compatible_adapters:           # required: which AI tools can use this
  - claude-code
  - cursor
  - aider
  - generic                    # generic = any tool that reads AGENTS.md
maintainer: omnix-core         # optional: who owns it
license: MIT                   # optional: defaults to repo license
```

## Skill categories

| Category | Examples | Risk profile |
|---|---|---|
| `memory` | context-manager, memory-curator, token-optimizer | low-medium |
| `context` | repo-scanner, project-onboarder | low |
| `review` | api-contract-reviewer, security-threat-modeler | low |
| `scan` | dependency-doctor, prompt-instruction-linter | low |
| `safety` | memory-curator (sanitization), adapter-compatibility-tester | medium |
| `external` | external-research-specialist, browser-automation-specialist | high |

## Skill discovery and invocation

### Phase 1 (today) — markdown skills

The AI tool reads `packages/skills/<name>/instructions.md` when triggered by a keyword in the user request. No CLI invocation.

### Phase 2 (v0.3) — CLI invocation

```bash
omnix skill run context-manager --task "fix the auth bug"
# → outputs JSON context pack to stdout
```

The handler is a TypeScript file:

```typescript
// packages/skills/context-manager/handler.ts
import type { SkillContext, SkillResult } from "@omnix/skill-sdk";

export async function handler(ctx: SkillContext): Promise<SkillResult> {
  // ctx.cwd, ctx.vault, ctx.task, ctx.budget
  // returns { type: "context-pack", files: [...], tokens: 1200 }
}
```

### Phase 3 (future) — composable workflows

```yaml
# workflows/feature-build.workflow.yaml
steps:
  - skill: repo-scanner
  - skill: context-manager
    inputs: { task: "{{ user_request }}" }
  - skill: test-architect
    when: "test file changed"
  - skill: memory-curator
    when: "session ended"
```

## Skill validation

Every skill must pass these checks before merging:

1. `skill.yaml` is valid YAML and matches schema.
2. All required `.md` files exist with required sections.
3. `reads_memory` / `writes_memory` paths don't traverse upward (`../`).
4. `risk_level` matches actual operations (high if any network call).
5. `compatible_adapters` listed adapters exist.
6. If `handler.ts` exists: tsc passes, tests pass.
7. README has ≥ 1 example.
8. `checklists.md` has ≥ 3 verification steps.

Implementation: `apps/cli/src/commands/skill.ts validate <name>` (FUTURE).

## Skill output contracts

Skills return one of these shapes:

### `context-pack`
```json
{
  "type": "context-pack",
  "task": "...",
  "files": [
    { "path": "02-PROJECTS/project-context.md", "tokens": 320, "summary": "..." },
    { "path": "01-SESSIONS/2026-05-15/session-1430-claude.md", "tokens": 180 }
  ],
  "total_tokens": 1450,
  "budget": 1500,
  "skipped": [
    { "path": "...", "reason": "stale, last verified 2025-08-01" }
  ]
}
```

### `report`
```json
{
  "type": "report",
  "skill": "memory-curator",
  "findings": [
    { "level": "warn", "path": "...", "issue": "stale", "suggestion": "..." }
  ],
  "summary": { "warnings": 2, "errors": 0 }
}
```

### `file-write`
```json
{
  "type": "file-write",
  "writes": [{ "path": "...", "bytes": 1024, "action": "create|update" }]
}
```

### `diff`
```json
{
  "type": "diff",
  "before": "...",
  "after": "...",
  "rationale": "..."
}
```

## Skill lifecycle states

| State | Meaning |
|---|---|
| `SPEC` | Manifest + docs only, no handler |
| `EXPERIMENTAL` | Handler exists, may break |
| `STABLE` | Handler + tests, semver-tracked |
| `DEPRECATED` | Marked for removal in next major |

Every skill's `skill.yaml` includes:
```yaml
status: SPEC | EXPERIMENTAL | STABLE | DEPRECATED
```

## Skill SDK (FUTURE — v0.3)

```typescript
// @omnix/skill-sdk
export interface SkillContext {
  cwd: string;
  vaultPath: string;
  task?: string;
  budget?: number;
  reads: (path: string) => Promise<string>;
  writes: (path: string, content: string) => Promise<void>;
  log: { info: (msg: string) => void; warn: (msg: string) => void };
}

export type SkillResult =
  | { type: "context-pack"; files: PackFile[]; total_tokens: number; budget: number; skipped?: SkippedFile[] }
  | { type: "report"; findings: Finding[]; summary: { warnings: number; errors: number } }
  | { type: "file-write"; writes: { path: string; bytes: number; action: "create" | "update" }[] }
  | { type: "diff"; before: string; after: string; rationale: string };
```

## Compatibility with Anthropic Agent Skills

The skill manifest is intentionally similar to Anthropic Agent Skills:
- `name`, `description` map directly.
- `triggers` map to Agent Skills' trigger keywords.
- `instructions.md` content is what Anthropic loads on activation.

Omnix skills can therefore be **dual-published** as Agent Skills for Claude Code use, or invoked via Omnix CLI for tool-agnostic use.

## Anti-patterns (do not do)

- **Skill calls another skill directly.** Composition happens at workflow level.
- **Skill writes outside the vault or its declared paths.** Validation will reject.
- **Skill imports `commander` or CLI args directly.** Handlers receive `SkillContext` only.
- **Skill has > 500 lines of `instructions.md`.** Split into multiple skills.
- **Skill claims to "always" produce X.** Document failure modes honestly.

## Initial skill set (Part 4)

See `packages/skills/` after this audit lands. 10 skills will have full spec structure:

1. context-manager
2. token-optimizer
3. memory-curator
4. repo-scanner
5. error-intelligence
6. dependency-doctor
7. test-architect
8. security-threat-modeler
9. external-research-specialist
10. adapter-compatibility-tester

All ship at status `SPEC`. None have handlers yet.

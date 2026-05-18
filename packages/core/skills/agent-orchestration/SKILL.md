---
name: agent-orchestration
description: >
  Activate when the task spans multiple engineering domains and requires
  coordinating multiple specialist perspectives before acting. Use for
  cross-cutting features, architecture reviews, incident response, and
  any request touching 3+ engineering areas simultaneously.
triggers:
  - parallel
  - team
  - agents
  - roles
  - orchestrat
  - multi-agent
  - coordinate
  - swarm
---

## When to activate

When a single-perspective answer would be incomplete. Signs: the request touches both frontend and backend, or API and database, or security and deployment. More than 3 engineering areas → parallel team mode.

## Core concepts

**Not autonomous agents** — "parallel team mode" means the AI internally reasons from multiple specialist perspectives before producing one response. No separate processes, no fake swarm.

**Role activation matrix** — each domain triggers specific roles:

| Domain touched | Roles activated |
|---|---|
| UI / frontend | frontend, product-engineer |
| API contract | api, backend, qa |
| Auth / payments | backend, security |
| DB schema / migration | database, backend |
| Docker / K8s / CI | devops, sre |
| Architecture boundary | architect, reviewer |
| LLM / AI features | ai-engineer, security |
| Cross-cutting | fullstack + all relevant |

**gstack-inspired pipeline** — Think → Plan → Build → Review → Test → Ship → Reflect. Each phase has a designated role owner. Don't skip phases for complex tasks.

**Feed-forward context** — each phase passes its output as structured context to the next. `/office-hours`-style forcing questions produce a design doc → CEO/Eng review reads it → implementation proceeds with constraints already resolved.

## Practical guidance

1. **Classify complexity first**: 1 domain → single agent. 2-3 domains → dual perspective. 4+ domains → full parallel team mode.
2. **Surface conflicts before coding**: architect and security checks happen before implementation, not after.
3. **Structure output in parallel mode**:
   ```
   [Plan] 2-3 sentence description
   [Architecture check] ok | <issue>
   [Security check] ok | <issue>
   [DB impact] none | <migration needed>
   [Execution] <actual code/changes>
   [Verification] <what was tested>
   [Memory] digest written · decisions updated
   ```
4. **One coherent response** — don't simulate turn-taking between agents. Synthesize.
5. **Assign a lead role** — for each task, one role owns the response. Others contribute perspectives. The lead is whoever owns the core change area.

## Gotchas

- Activating all 16 roles for a simple bug fix is wasteful and produces unfocused output. Match role count to actual complexity.
- "I'll check with the security agent" followed by a separate message is fake orchestration. Do the check internally, state the result.
- Role conflicts (architect says refactor, QA says don't touch it) are real. Name the conflict and propose a resolution — don't silently pick one.
- Parallel team mode is not a substitute for domain expertise. If you don't know the database answer, say so.

## Integration

- Role definitions: `packages/core/agents/*.md`
- Workflow: `packages/core/workflows/parallel-team-mode.md`
- Routing: `packages/adapters/generic/STARTUP_PROTOCOL.md` Step 5-6

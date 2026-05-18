# Workflow: Swarm Coordination

Multi-agent coordination patterns for tasks that genuinely require parallel execution across isolated contexts. Extracted patterns from ruflo v3.

> **Important**: This is NOT fake autonomous swarm behavior. This describes how to orchestrate real parallel AI sessions (e.g. multiple Claude Code windows, multiple API calls) where each session is genuinely isolated and works independently.

## When swarm coordination applies

Single-session parallel team mode (see `parallel-team-mode.md`) covers 90% of cases where you just need multiple perspectives. Swarm coordination applies when:

- The task is too large for one context window.
- Subtasks are fully independent (no shared state during execution).
- You have access to multiple AI tool sessions simultaneously.
- The work benefits from genuine parallelism (e.g. test 10 endpoints simultaneously).

## Architecture

```
User goal
    ↓
[Router] — classify task, identify independent subtasks
    ↓
[Orchestrator] — assign subtasks to agents, track status
    ↙     ↓      ↘
[Agent A] [Agent B] [Agent C]   ← isolated contexts
    ↓         ↓        ↓
[Memory] — each agent writes to shared vault on completion
    ↓
[Reviewer] — aggregates outputs, checks consistency
    ↓
[Memory System] — final digest, decision log
```

## Agent configuration (ruflo-style YAML spec)

When defining a swarm agent for a specific role:

```yaml
type: architect | frontend | backend | qa | security | devops | docs
capabilities:
  - system-design | component-build | api-build | test-generation | security-audit | ...
context_mode: minimal | balanced | deep | architecture
memory_mode: read-only | write-digest | full
vault_path: .obsidian-ai-memory/
task_scope: <specific bounded task description>
output_target: <file or vault path where result goes>
```

## MCP tool groups (ruflo pattern)

Organize agent capabilities into groups, enable only what each agent needs:

| Group | Tools | Use for |
|---|---|---|
| `core` | file read/write, shell | All agents |
| `intelligence` | memory retrieval, context ranking | Context-heavy agents |
| `agents` | task routing, workflow management | Orchestrator only |
| `memory` | vault read/write, digest creation | Memory system agent |
| `devtools` | lint, test, build | QA, backend agents |
| `security` | audit, dependency scan | Security agent only |
| `browser` | browser automation, scraping | Data and QA agents |

## Coordination protocol

### Phase 1 — Decompose
- Identify subtasks that are truly independent (no shared write to same files).
- Assign a clear, bounded `task_scope` to each agent.
- Assign a unique output target to each agent to avoid conflicts.

### Phase 2 — Distribute
- Start each agent with identical memory snapshot (same vault state).
- Each agent reads but does not write to the vault during execution.
- Each agent writes results to its dedicated output target.

### Phase 3 — Aggregate (Reviewer role)
- Read all agent outputs.
- Check for conflicts (e.g. agent A and B both modified the same interface).
- Merge non-conflicting outputs.
- Flag conflicts for human resolution.

### Phase 4 — Commit
- Write final merged output.
- Write one consolidated session digest covering all agent work.
- Update error memory, decision memory as applicable.

## Learning loop

After a swarm run, capture:
- Which subtask decomposition worked / didn't.
- Which agent context modes were appropriate.
- Which conflicts arose and how they were resolved.

Write to `07-LESSONS/lessons-learned.md` under "swarm-coordination" tag.

## Anti-patterns

- **Shared write targets** — two agents writing the same file = conflict. Assign exclusive targets.
- **Over-decomposition** — 10 agents for a 200-line feature. Use parallel team mode instead.
- **No aggregation step** — agents produce outputs that are never reviewed for consistency.
- **Swarm as complexity theater** — using swarm language to describe a single-session task.

## When NOT to use swarm

- Task fits in one context window → use parallel team mode.
- Subtasks have shared state → single session with role coordination.
- Only 1-2 areas touched → single agent or dual-perspective.

# Workflow: Role Orchestration

Inspired by gstack's 23-role engineering pipeline. Defines how specialist roles hand off to each other through a feature's lifecycle.

## The pipeline

```
Think → Plan → Build → Review → Test → Ship → Reflect
```

Each phase has a designated role owner. Phases are sequential for the *decision chain* but can run in parallel for independent concerns.

## Phase definitions

### 1. Think (Office Hours)
**Owner**: Product Engineer + Architect  
**Purpose**: Force the hardest questions before any code is written.  
**Forcing questions**:
- What problem does this actually solve?
- What is the simplest version that proves the hypothesis?
- What decision, once made, is hard to reverse?
- What would make this wrong in 6 months?

**Output**: A short design brief (not a spec) answering the forcing questions. Goes into `04-DECISIONS/` or `00-INBOX/` for routing.

### 2. Plan (Engineering Review)
**Owner**: Architect + relevant specialists  
**Purpose**: Turn the design brief into a concrete implementation plan with known constraints.  
**Checklist**:
- Module boundaries identified and respected.
- Data model changes planned (schema + migration).
- API contracts defined before implementation starts.
- Test plan outlined (what will prove this works?).
- Security surface identified (auth, input validation, secrets).

**Output**: Implementation plan with explicit constraints. Block implementation until this is done for any multi-domain feature.

### 3. Build
**Owner**: Fullstack / Frontend / Backend / Database (as needed)  
**Purpose**: Implement against the plan.  
**Rules**:
- Follow the plan. Deviations go back to Plan phase, not forward to Build.
- Implement the error path before the happy path.
- Write tests as you go — not after.
- Commit in logical units; each commit should pass tests.

### 4. Review
**Owner**: Reviewer + Security (auto-activated on auth/payment/secrets)  
**Purpose**: Catch what the builder missed.  
**Uses**: `packages/core/skills/code-review/SKILL.md`  
**Non-negotiables**:
- Blockers stop the PR. Not suggestions — stops.
- Security agent always reviews if any of: auth, payment, secrets, public input touched.
- Architecture agent reviews if module boundaries crossed.

### 5. Test
**Owner**: QA  
**Purpose**: Adversarial user perspective. Find the edge cases the builder and reviewer both missed.  
**Minimum bar**:
- Primary flow works end-to-end.
- Error paths are exercised and handled gracefully.
- Regression test covers any bug that was found and fixed.

### 6. Ship
**Owner**: DevOps / SRE  
**Purpose**: Safe deployment with rollback plan.  
**Checklist**:
- CI passes (all phases).
- DB migrations are forward-only and tested on staging.
- Rollback procedure documented or reversible.
- Monitoring/alerting updated if new surface area added.

### 7. Reflect
**Owner**: Memory System (context-manager agent)  
**Purpose**: Capture what was learned so the next feature starts smarter.  
**Output**:
- Session digest written.
- Error memory updated for any bug fixed.
- Decision memory updated for any architectural choice made.
- Lessons learned updated if a repeatable pattern was discovered.

## Parallel sprints (multi-feature)

When running multiple features simultaneously:

- Each feature follows the full pipeline independently.
- **CEO review** (Think phase) is shared — one forcing-questions session covers multiple features and explicitly prioritizes.
- **Reviewer** is the integration point — they check for cross-feature conflicts before either feature ships.
- Session digests are tagged by feature so context retrieval stays clean.

## Role ownership matrix

| Phase | Primary | Supporting | Auto-activated |
|---|---|---|---|
| Think | product-engineer | architect | — |
| Plan | architect | backend, database, security | security if auth/payment |
| Build | fullstack / fe / be | — | database if schema change |
| Review | reviewer | — | security if auth/payment/secrets |
| Test | qa | — | — |
| Ship | devops, sre | — | — |
| Reflect | context-manager | — | — |

## What this is NOT

- Not a strict sequential waterfall — small changes skip phases that don't apply.
- Not fake autonomous agents — the AI internally coordinates these perspectives in one response.
- Not mandatory overhead for a 5-line bug fix — use judgment on phase skip.

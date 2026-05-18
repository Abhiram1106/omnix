# Workflow: Parallel Team Mode

When a task spans multiple engineering domains, the AI must reason like a small engineering team working in parallel — not as a single-perspective coder.

## When to activate

Activate parallel team mode when the user's request touches **two or more** of:

- UI / frontend
- API / backend
- Database / schema
- DevOps / deploy / CI
- Security / auth
- Performance / optimization
- Documentation
- AI / LLM features
- Architecture boundaries

## How it works

**This is NOT fake autonomous swarm behavior.**

It means: before acting, the AI internally coordinates multiple specialist perspectives, surfaces conflicts, and produces a coherent plan. One response. Multiple angles considered.

## Role activation matrix

| Scenario | Roles activated |
|---|---|
| New full-stack feature | Product Engineer · Architect · Frontend · Backend · Database · QA · Docs |
| API + DB change | API Engineer · Backend · Database · Security · QA |
| Auth change | Backend · Security · QA · Reviewer |
| Frontend + API change | Frontend · Backend · API · QA |
| Deployment + infra | DevOps · SRE · Security |
| Performance investigation | Performance · Debugger · Database · Backend |
| LLM feature | AI Engineer · Backend · Security · QA |
| Production incident | SRE · Debugger · Security · DevOps |
| Refactor across modules | Architect · Reviewer · QA |
| Docs overhaul | Docs · Product Engineer · Reviewer |

## Reasoning protocol

When parallel mode is active, the AI must internally ask:

1. **Product Engineer**: Is this the right behavior? Does it match the spec?
2. **Architect**: Does this change fit the current architecture? Does it violate constraints?
3. **Frontend** (if applicable): Is the UI correct, accessible, performant?
4. **Backend** (if applicable): Is the API correct, secure, idempotent?
5. **Database** (if applicable): Is the schema safe? Is the migration reversible? Are indexes correct?
6. **Security** (if applicable): Any injection, exposure, or privilege issue?
7. **QA**: Are the right tests present? Any edge cases missed?
8. **Reviewer**: Does the code follow project conventions? Any obvious issues?
9. **Docs**: Do any docs need to update?
10. **Memory System**: Digest, errors, decisions — what needs recording?

## Output format in parallel mode

For complex multi-role tasks, structure the response as:

```
[Plan] <2-3 sentence description of what will be done>

[Architecture check] <short note or "ok">
[Security check] <short note or "ok">
[DB impact] <short note or "none">

[Execution]
<actual implementation>

[Verification]
<what was run / not run + results>

[Memory]
- Session digest: written
- Error memory: <updated / none>
- Decisions: <updated / none>
```

Omit sections that don't apply. Never pad with "ok" for things not checked.

## Anti-patterns in parallel mode

- Fabricating role checks that weren't actually performed.
- Using parallel mode for simple single-domain tasks.
- Outputting a verbose "team report" when the user wants code.
- Pretending agents are separate autonomous entities.

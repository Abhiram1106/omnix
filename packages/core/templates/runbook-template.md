# Runbook: <Alert / Failure Mode>

- **Alert**: <alert name>
- **Severity**: …
- **Owner**: <team>
- **Last reviewed**: YYYY-MM-DD

## What this alert means

Plain English. What is failing, why we care, who is affected.

## Diagnose

1. Check <dashboard link>.
2. Check <logs query>.
3. Check <traces query>.
4. Identify scope: single host? region? all?

## Mitigate (in order of preference)

1. **Quick mitigation** — feature flag, restart, drain a host.
2. **Targeted rollback** — revert deploy <link to deploy>.
3. **Manual workaround** — <steps>.

## Escalate

- If the above doesn't resolve in <N> minutes, page <team / on-call>.
- For data-loss risk, page <security/data on-call> immediately.

## After

- Postmortem if user-facing impact ≥ <threshold>.
- Update this runbook if a step was wrong or missing.

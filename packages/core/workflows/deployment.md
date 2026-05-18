# Workflow: Deployment

## Pre-deploy

- All CI checks green on the commit being deployed.
- Migrations reviewed; tested on a production-shaped DB.
- Feature flags configured for new behavior.
- Rollback plan stated in the PR description.

## Deploy

- Automated via CI/CD. No manual SSH-and-restart.
- Strategy: rolling, blue/green, or canary depending on platform.
- Emit a deploy event with version + commit SHA to metrics.

## Post-deploy verification

- `/healthz` and `/readyz` pass.
- Synthetic check on a critical user flow.
- Error rate and latency dashboards watched for the next N minutes (project-defined).

## Rollback

- One-command rollback. Practiced on staging quarterly.
- If a forward fix is faster and safer, prefer it — but rollback is always an option.

## Incident

If something breaks:
1. Roll back or mitigate (feature flag off).
2. Restore service first; root-cause after.
3. Postmortem within 48h using `templates/postmortem-template.md`.

## Memory

- Postmortem → `03-ERRORS/error-memory.md` + new prevention rule.
- Deploy mishaps → `07-LESSONS/lessons-learned.md`.

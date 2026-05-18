# Project Context — Schema

Single living document at `02-PROJECTS/project-context.md`. Updated whenever the project state changes meaningfully.

## Fields

| Field | Required | Type | Notes |
|---|---|---|---|
| Project Name | yes | string | |
| Current Goal | yes | text | one-line + bullets |
| Stack | yes | structured list | language, framework, DB, infra, package manager, test runner |
| Architecture | yes | text | high-level shape; reference `05-ARCHITECTURE/system-overview.md` |
| Important Constraints | yes | list | perf, compliance, team, deadlines |
| Current Priorities | yes | ordered list | |
| Known Risks | yes | list | |
| Active Decisions | yes | list of ADR/decision links | |
| Known Errors | yes | list of error-memory links | |
| Do Not Repeat | yes | list | concrete anti-patterns |
| Next Steps | yes | ordered list | concrete |

## Update cadence

- After every major feature, error, or decision.
- At least weekly during active development.
- Pre-handover (human or AI changes).

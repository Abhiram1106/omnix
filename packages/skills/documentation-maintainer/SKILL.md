---
name: documentation-maintainer
version: 0.9.0
status: stable
description: >
  Keeps project documentation synchronized with code changes. Detects doc drift.
  Updates README, API docs, ADRs, runbooks. Generates changelogs from git history.
triggers:
  - "update docs"
  - "documentation"
  - "README out of date"
  - "update README"
  - "write runbook"
  - "document this"
  - "changelog"
  - "API docs"
  - "doc drift"
  - "ADR"
auto_activate: false
requires: []
produces:
  - "updated documentation"
  - "CHANGELOG.md update"
  - "ADR entry"
memory_reads:
  - { path: "02-PROJECTS/project-context.md", priority: critical }
  - { path: "04-DECISIONS/decisions.md", priority: high }
memory_writes:
  - { path: "04-DECISIONS/decisions.md", condition: "when documentation decision made" }
token_budget: { self: 700, context_reads: 800, total: 1500 }
verification_required: false
destructive: false
tags: [documentation, README, ADR, runbook, changelog, API-docs, doc-drift]
compatible_adapters: [claude-code, cursor, generic]
---

## When to activate

After API changes, when behavior changes, when someone says "the docs are wrong", before releases.

## When NOT to activate

- Code-only changes with no external behavior change
- Comments in code (write them inline, not here)

## Doc drift detection

Signs of doc drift:
- Function signature in README doesn't match code
- Example code in docs fails to run
- ENV vars listed in docs don't match `.env.example`
- CLI commands in docs produce different output
- API response shape changed but docs show old format

```bash
# Find potentially stale documentation
git log --all --oneline --diff-filter=M -- src/ | head -20
# Then check if matching docs were updated in the same commit
```

## README structure (minimal but complete)

```markdown
# [Project Name]

One sentence: what this does and why it exists.

## Quick start

\`\`\`bash
npm install -g myapp
myapp init --yes
myapp --help
\`\`\`

## Installation

## Usage (with real examples, not pseudocode)

## Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| DATABASE_URL | yes | — | PostgreSQL connection string |
| PORT | no | 3000 | HTTP server port |

## API Reference (link to full docs or include here)

## Contributing

## License
```

**FAIL: Placeholder README**
```markdown
# MyProject
This project does amazing things!
## Features
- Feature 1
- Feature 2
## Usage
See the docs for more information.
```

## ADR (Architecture Decision Record) template

```markdown
# ADR-NNN: [Decision title]

**Date:** YYYY-MM-DD  
**Status:** accepted | proposed | deprecated | superseded by ADR-NNN  
**Deciders:** [names]

## Context
[What is the problem or situation that prompted this decision?]

## Decision
[What was decided?]

## Rationale
[Why was this decided? What alternatives were considered?]

## Consequences
**Positive:**
- [Effect 1]

**Negative:**
- [Effect 1]

## References
- [Links to discussions, related issues, external resources]
```

## Changelog from git (keep-a-changelog format)

```markdown
# Changelog

## [Unreleased]
### Added
### Changed
### Deprecated
### Removed
### Fixed
### Security

## [1.2.0] - 2025-01-15
### Added
- `omnix error-match` command for finding past error fixes
### Changed
- `retrieve-context` now uses task-type-aware retrieval modes
### Fixed
- Token budget enforcement now works correctly in debugging mode
```

```bash
# Generate from git history
git log --oneline --no-merges v1.1.0..HEAD --pretty=format:"- %s"
```

## API documentation (OpenAPI auto-generation)

```typescript
// Example: Hono + Zod + OpenAPI
import { swaggerUI } from '@hono/swagger-ui';
import { z } from 'zod';

app.openapi(
  createRoute({
    method: 'get',
    path: '/users/{id}',
    request: { params: z.object({ id: z.string() }) },
    responses: {
      200: { content: { 'application/json': { schema: UserSchema } } },
      404: { content: { 'application/json': { schema: ErrorSchema } } },
    },
  }),
  (c) => { ... }
);
app.get('/docs', swaggerUI({ url: '/doc' }));
```

## Runbook template

```markdown
# Runbook: [Service/Operation Name]

**Last updated:** YYYY-MM-DD  
**On-call contact:** [name/channel]

## Service overview
[1-2 sentences: what this service does, why it's critical]

## Common alerts and responses

### Alert: HighErrorRate
**Trigger:** Error rate > 5% for 5 minutes  
**Steps:**
1. Check logs: `kubectl logs -l app=myapp --tail=100`
2. Check recent deploys: `helm history myapp`
3. If recent deploy: `helm rollback myapp 0`
4. Escalate if not resolved in 15 minutes

## Deployment
[Step-by-step deploy instructions]

## Rollback
[Step-by-step rollback instructions]
```

## Verification

- [ ] All code examples in docs actually run
- [ ] ENV vars in docs match `.env.example`
- [ ] API docs match actual API responses
- [ ] Changelog updated for user-visible changes
- [ ] ADR written for significant architecture decisions

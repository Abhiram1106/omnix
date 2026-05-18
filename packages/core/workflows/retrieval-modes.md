# Workflow: Retrieval Modes

Different tasks need different amounts of context. Loading too much wastes tokens. Loading too little causes hallucinations and missed conventions.

## Modes

### minimal

- **When**: simple Q&A, quick lookup, one-liner change.
- **Memory budget**: ~300-500 tokens.
- **Load**: project-context (first 20 lines) + last 1 session digest + error index.
- **Skip**: decisions, architecture, lessons, prompts.

### balanced (default)

- **When**: normal feature work, single-file bug fix, standard code review.
- **Memory budget**: ~1000-1500 tokens.
- **Load**: project-context + active-goals + last 3 digests + errors + anti-patterns.
- **Skip**: full architecture, archived summaries.

### deep

- **When**: large feature, multi-module refactor, complex debugging.
- **Memory budget**: ~2500-3000 tokens.
- **Load**: everything in balanced + decisions + architecture summary + lessons.
- **Skip**: archived summaries, full raw session history.

### architecture

- **When**: system design, module boundary changes, ADR authoring.
- **Memory budget**: ~3500-4000 tokens.
- **Load**: everything in deep + full architecture files + all recent ADRs.
- **Skip**: prompt library, agent notes.

### debugging

- **When**: active investigation, incident response, flaky test hunt.
- **Memory budget**: ~1500-2000 tokens.
- **Load**: project-context + last 5 digests + errors (area-filtered) + anti-patterns + debugging-lessons.
- **Skip**: decisions, prompts, architecture (unless the bug is architectural).

### deployment

- **When**: deploy, CI fix, infra change.
- **Memory budget**: ~1000-1500 tokens.
- **Load**: project-context + deployment-related decisions + last 3 digests + deploy-related errors.
- **Skip**: frontend lessons, prompt library.

### emergency

- **When**: production outage, security incident, data issue.
- **Memory budget**: ~800-1000 tokens.
- **Load**: current-state + last 2 digests + errors (area-filtered) + anti-patterns.
- **Priority**: fastest possible relevant context, nothing else.
- **Skip**: everything not immediately relevant.

## Mode selection logic

```
Request analysis → Mode
────────────────────────────────────────────────────────────
Single word / short Q&A              → minimal
Bug fix, one file                    → balanced
Feature, 1-3 files                   → balanced
Feature, 4+ files or cross-module    → deep
Schema / ADR / system change         → architecture
Error investigation, no repro yet    → debugging
Deploy / CI / infra                  → deployment
Outage / incident / CVE              → emergency
```

When in doubt, use **balanced**. It covers 80% of routine work.

## Mode override

The user can override: `"use deep context"` or `"minimal context, just fix the bug"`.

The context-manager agent respects explicit mode overrides without question.

# Workflow: Project Onboarding

For an AI agent dropping into a new (to it) project.

## Pre-work

1. Read `02-PROJECTS/project-context.md` if present.
2. If absent: run `scan` to detect stack and seed it.
3. Read root `README.md`, `ARCHITECTURE.md`/`docs/architecture.md` if present.
4. Read `04-DECISIONS/decisions.md` and any recent ADRs.
5. Skim `01-SESSIONS/` for the last 3-5 digests to see recent activity.
6. Read `03-ERRORS/error-memory.md`.

## Detect

- Languages, frameworks, package manager.
- Test runner, linter, formatter.
- Build/dev commands from `package.json` / `Makefile` / `justfile` / `pyproject.toml`.
- Entry points and module layout.
- CI workflows (`.github/workflows/`, `.gitlab-ci.yml`, etc.).

## Record

Write or update `02-PROJECTS/project-context.md` with:

- Stack, architecture sketch, important constraints.
- How to run, test, lint, build.
- Known risks, do-not-repeats.

## Digest

Write a session digest titled "project onboarding — <project>". Mark next steps clearly.

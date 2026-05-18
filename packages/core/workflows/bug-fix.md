# Workflow: Bug Fix

## Reproduce first

- Get a deterministic reproduction. No reproduction → no fix.
- Capture the failing input, environment, and exact symptom.

## Pre-work

- Retrieve memory. Search `03-ERRORS/error-memory.md` for similar symptoms. If found and prevention rule was violated → flag it.
- Read recent commits touching the affected area.

## Diagnose

- Form a hypothesis. State it.
- Confirm or reject with the smallest possible experiment (read a value, add one log, set a breakpoint).
- Walk the data path: input → boundary → domain → IO → response.

## Fix

- Smallest change that makes the failing reproduction pass.
- Add a regression test that fails without the fix and passes with it.
- Avoid surrounding refactors in the same change.

## Verify

- Reproduction now passes.
- Existing tests still pass.
- Manual smoke of adjacent paths.

## Record (mandatory)

Write an entry in `03-ERRORS/error-memory.md` using `templates/error-entry.md`:

- Symptom · Root cause · Fix · Prevention rule · Regression test path · Related session digest.

> Every fixed error must become future prevention knowledge.

## Digest

Standard session digest, linked to the error entry.

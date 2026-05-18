# Session Digest System

## What a session digest is

A short markdown file per meaningful AI session, capturing what the AI saw, did, decided, and recommends next. Lives at `01-SESSIONS/YYYY-MM-DD/session-HHMM-<tool>.md`.

## Required fields

(see `packages/memory/schemas/session-digest.schema.md`)

Date · Tool · Agent/Role · Project · User Request · Context Retrieved · Files Read · Files Changed · Commands Run · Decisions Made · Errors Encountered · Fixes Applied · Tests/Verification · Docs Updated · Memory Updated · Open Questions · Next Recommended Step.

## What "meaningful" means

A session is meaningful if it:
- Modified files, **or**
- Reached a non-trivial decision, **or**
- Encountered an error worth remembering, **or**
- Took more than ~10 minutes of effort.

Trivial "what does this function do?" Q&A sessions don't need digests.

## Why every meaningful session

- **Continuity.** The next session (yours or another tool's) starts informed.
- **Audit.** You can see what changed and why.
- **Recovery.** If the AI crashed mid-task, the digest is the handoff.

## Cost

A digest takes ~2 minutes of AI time. The cost of *not* writing one is repeated context loss every session.

## CLI support

`omnix session-digest --notes=<file> --tool=<name>` will (when implemented) accept free-form notes or a transcript and produce a structured digest.

## Failure mode to avoid

Generating a *fake* digest with all fields filled with "N/A". A digest that lies is worse than no digest. If a field doesn't apply, write "none" honestly.

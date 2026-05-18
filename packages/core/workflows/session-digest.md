# Workflow: Session Digest

When and how to write a session digest. Replaces the "every session must write a digest" rule with practical thresholds.

## When to write a digest

| Session type | Write digest? | How |
|---|---|---|
| 30-second factual question | No | Maybe append one line to today's daily summary |
| Single-file edit, minor | **Minimal** digest (auto-generated from git diff) | `omnix session-digest --auto` |
| Multi-file feature work | Full digest | `omnix session-digest --tool <name>` interactive |
| Bug fix | Full digest + error memory entry | both |
| Architecture decision | Full digest + decision entry (or ADR) | both |
| Failed/abandoned attempt | Short digest noting what didn't work | full |

## Digest types

### Minimal digest (auto-generated)

```markdown
# Session Digest (auto)

- Date: 2026-05-16 1430
- Tool: claude-code
- Changed files: src/auth.ts, src/auth.test.ts
- Commits: 1 (add JWT refresh handler)
- Tests run: yes (passing)
- Auto-summary: implemented refresh token flow per existing pattern in src/auth.ts
```

Generated from:
- `git diff --name-only HEAD~1` for files changed.
- `git log -1 --pretty=%s` for commit message.
- Tool name from `--tool` flag.

No interactive fields. Takes 0 seconds.

### Full digest (interactive or from notes file)

Use the 17-field template at `templates/session-digest.md`. For meaningful sessions only.

## Procedure (end of session)

```
1. Was anything changed?
   - No  → skip digest entirely.
   - Yes → continue.

2. Was it < 5 minutes / single trivial file?
   - Yes → minimal digest.
   - No  → full digest.

3. Did an error get fixed?
   - Yes → add error-memory entry too (see error-intelligence workflow).

4. Was a non-trivial choice made?
   - Yes → add decision entry too.

5. Update active-context.md:
   - "Last activity: <date>"
   - "Current state: <one sentence>"
   - "Next: <one sentence>"

6. Write digest with sanitization (see standards/memory-safety.md).
```

## Anti-fatigue rules

- **No digest for read-only sessions.** Asking the AI a question doesn't create memory.
- **No digest for sub-5-minute trivial edits** unless the user opts in.
- **No required fields beyond date + tool + summary** for auto digests.
- **Bulk digests**: end of day, you can write one digest summarizing several small sessions instead of one each.

## CLI invocations

```bash
omnix session-digest --tool claude-code               # interactive full
omnix session-digest --tool claude-code --auto        # minimal from git
omnix session-digest --tool cursor --notes notes.md   # parse notes file
omnix session-digest --dry-run                        # preview without writing
```

## Failure modes
- **Sanitization detects unredactable secret** → refuse to write; tell user.
- **Vault not initialized** → tell user to run `omnix init`.
- **Git not available for auto-digest** → fall back to manual interactive.

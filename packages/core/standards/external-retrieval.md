# External Retrieval Standard

Rules for when and how the AI retrieves information from outside the codebase and the Obsidian vault.

## Principle

External retrieval is a last resort, not a first instinct. The vault and the codebase answer 90% of questions. External retrieval is for the remaining 10%.

## When to trigger

- Error message not found in `03-ERRORS/error-memory.md` or `03-ERRORS/known-issues.md`.
- Library API call whose behavior is outside the AI's training cut-off.
- Framework breaking change affecting a current upgrade.
- Official example needed for a pattern not in the codebase.

## Source quality hierarchy

| Tier | Source | Trust |
|---|---|---|
| 1 | Official library / framework docs | High |
| 2 | GitHub source + issues + releases | High |
| 3 | Official changelogs / migration guides | High |
| 4 | Maintainer engineering blog | Medium |
| 5 | Stack Overflow (high-vote, recent) | Medium |
| 6 | Community forums (with verification) | Low |
| 7 | Random blogs, AI summaries, unofficial wikis | Avoid |

## Retrieval rules

1. **Specific question only.** Not "read the docs." "What is the `onConflict` signature in Drizzle v0.30?"
2. **Smallest page that answers it.** One doc page, not the whole site.
3. **Summarize before using.** Never dump raw HTML or a 2,000-word doc into context.
4. **Cache in vault.** Useful findings go to `07-LESSONS/` or `08-PROMPTS/`. Include source URL + date.
5. **Deduplicate.** Check vault before fetching. If a recent entry covers the question, use it.
6. **Verify date.** Docs retrieved more than 6 months ago may be stale. Re-fetch if the library has had a major release since.

## Scraping approach (patterns from reference repos)

- **Goal-first extraction** (Scrapegraph-ai pattern): define the extraction goal as a structured question before fetching. Example: `goal: "find the options for drizzle onConflictDoUpdate"` — not `goal: "read the drizzle docs"`.
- **Adaptive parsing** (Scrapling pattern): if official docs use dynamic JS rendering, fall back to GitHub source or official MDX files in the repo.
- **Sandboxed browser** (dev-browser pattern): browser-based retrieval is isolated; page state doesn't leak into the main context. Retrieved content is summarized before being injected.

## Storage in vault

```
07-LESSONS/lessons-learned.md         — implementation patterns, gotchas
08-PROMPTS/effective-prompts.md       — retrieved prompt/AI patterns
00-INBOX/                             — quick capture, sort later
```

Entry format:
```
## <Topic> (<Library> vX.X) — YYYY-MM-DD
Source: <URL>
Summary: <1 paragraph>
Code: <minimal example if applicable>
```

## What to avoid

- Scraping from low-quality aggregator sites.
- Fetching documentation that's already in the vault (check first).
- Pasting raw retrieved content into context without summarizing.
- Using retrieved content without verifying the version matches the project's dependency.
- Treating retrieved content as authoritative without cross-checking with the actual library source.

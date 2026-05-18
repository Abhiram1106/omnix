# Workflow: External Intelligence

When the task requires information that isn't in the codebase or the memory vault (docs updates, framework changes, API references, debugging unknown errors), the AI may retrieve external knowledge.

## When to use

- Debugging an error message with no internal match in `03-ERRORS/`.
- Implementing with a library whose API is outside the AI's knowledge cutoff.
- Verifying current behavior of an external API or service.
- Retrieving changelogs to understand a breaking upgrade.
- Finding official examples for a pattern not yet in the codebase.

## Priority order for external sources

1. **Official documentation** — framework/library maintainer's own docs.
2. **GitHub repository** — source, issues, releases, discussions.
3. **Official changelogs / migration guides** — always authoritative on breaking changes.
4. **Stack Overflow** — only highly-voted, recent answers for well-defined technical problems.
5. **Engineering blogs from the maintainer org** — often used for architectural announcements.
6. **Avoid**: random SEO blogs, AI-generated summaries of docs, unofficial wikis.

## Retrieval rules

1. **Prefer official sources.** If the official docs answer the question, stop there.
2. **One retrieval, one purpose.** Fetch what you need for the current task, not a general reference library.
3. **Summarize, don't dump.** Retrieved content should be compressed to the relevant section.
4. **Record useful findings** in the vault: add a note to `00-INBOX/` or the relevant `07-LESSONS/` or `08-PROMPTS/` file with a source reference.
5. **No duplicate retrieval.** If the same external source was fetched in a prior session (check `07-LESSONS/` and `08-PROMPTS/`), use the stored summary first.

## Structured extraction workflow

When retrieving complex reference material (API docs, migration guides):

1. Identify the specific question (not "read all the docs").
2. Fetch the smallest page/section that answers it.
3. Extract the relevant code examples or rules.
4. Summarize: one paragraph + code block.
5. Write to vault: `07-LESSONS/` (implementation) or `08-PROMPTS/effective-prompts.md` (prompt/AI patterns).
6. Note the source URL and date in the vault entry.

## Storage format in vault

```markdown
## <Library/Topic> — YYYY-MM-DD

Source: <official URL>
Relevant for: <area>

<one paragraph summary>

```code block if applicable```
```

## Patterns inspired by reference repos

- **Scrapegraph-ai**: structured graph-based extraction — use a specific goal per fetch, not free-form browsing.
- **Scrapling**: adaptive parsing — if a page's structure changes, focus on semantic content, not CSS selectors.
- **dev-browser**: sandboxed, named-page persistence — when browser retrieval is needed, isolate it; don't pollute the main context with raw HTML.

## What NOT to do

- Don't browse general "best practices" articles to pad the context.
- Don't retrieve the same URL twice in one session.
- Don't paste entire docs pages into context — summarize.
- Don't rely on external retrieval when the vault or the codebase already has the answer.

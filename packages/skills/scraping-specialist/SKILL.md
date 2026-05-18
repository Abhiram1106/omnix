---
name: scraping-specialist
version: 0.5.0
status: experimental
description: >
  Web scraping for AI pipelines. Crawl4AI for LLM-ready Markdown, Scrapling for anti-bot,
  Crawlee for production spiders. Caches results in vault to avoid re-fetching.
triggers:
  - "scrape"
  - "scraping"
  - "web crawl"
  - "extract content"
  - "crawl website"
  - "parse webpage"
  - "fetch external content"
auto_activate: false
requires: []
produces:
  - "extracted content (Markdown)"
  - "07-LESSONS/external-research.md cache"
memory_reads:
  - { path: "07-LESSONS/external-research.md", priority: critical }
memory_writes:
  - { path: "07-LESSONS/external-research.md", condition: "when new content fetched" }
token_budget: { self: 600, context_reads: 500, total: 1100 }
verification_required: false
destructive: false
tags: [scraping, crawling, web, Crawl4AI, Scrapling, Crawlee, anti-bot, RAG]
compatible_adapters: [claude-code, cursor, generic]
---

## When to activate

Fetching external documentation, scraping data for RAG pipelines, research tasks requiring live web content.

## When NOT to activate

- Fetching a simple URL (just use curl or fetch)
- Browser interaction required (use browser-automation-specialist)
- Internal data extraction (no scraping needed)

## FIRST: check vault cache

Before any web fetch, check `07-LESSONS/external-research.md`:

```
1. Is the URL already cached?
2. Was it fetched < 7 days ago?
3. If yes → return cached Markdown, skip fetch
4. If no → proceed with fetch
```

## Tool selection

| Scenario | Tool | Why |
|----------|------|-----|
| General documentation, news | Crawl4AI | LLM-ready Markdown output |
| Anti-bot protected sites | Scrapling (Stealthy) | Cloudflare bypass, TLS spoofing |
| Production spider (many pages) | Crawlee | Pause/resume, proxy rotation |
| Lightweight HTML parse | Scrapling (HTTP) | Fastest, no browser |

## Crawl4AI (primary tool for AI pipelines)

```python
# pip install crawl4ai
import asyncio
from crawl4ai import AsyncWebCrawler

async def fetch_for_ai(url: str) -> str:
    async with AsyncWebCrawler(verbose=False) as crawler:
        result = await crawler.arun(
            url=url,
            word_count_threshold=10,      # filter boilerplate
            exclude_external_links=True,
            remove_overlay_elements=True,  # remove cookie banners, popups
        )
        return result.markdown  # clean Markdown, ready for LLM

content = asyncio.run(fetch_for_ai("https://docs.anthropic.com/en/api/"))
```

## Scrapling (anti-bot bypass)

```python
# pip install scrapling
from scrapling import Fetcher, StealthyFetcher

# Simple HTTP (fastest)
page = Fetcher().get("https://example.com")
title = page.css("h1").get()

# Stealth mode (Cloudflare bypass)
page = StealthyFetcher().fetch("https://cloudflare-protected.com")
content = page.css("main").get()

# Adaptive selectors (survive redesigns)
# Scrapling stores element locations and auto-relocates after page changes
```

## Crawlee (production spider)

```typescript
// npm install crawlee
import { PlaywrightCrawler, Dataset } from 'crawlee';

const crawler = new PlaywrightCrawler({
  maxRequestsPerCrawl: 50,
  async requestHandler({ request, page, enqueueLinks, log }) {
    const content = await page.locator('article').textContent();
    await Dataset.pushData({ url: request.url, content });
    await enqueueLinks({ globs: ['https://docs.example.com/**'] });
  },
});

await crawler.run(['https://docs.example.com/']);
```

## Cache entry format (vault)

```markdown
## [Source Title]
- URL: https://example.com/docs/api
- Fetched: 2025-01-15
- Last Verified: 2025-01-15
- Status: active
- Summary: [2-3 sentence summary of key content]

### Key Content
[Extracted and summarized Markdown content]
```

## Quality rules

- Only fetch from authoritative sources (official docs, GitHub, npm registry)
- Never cite Medium, dev.to, Reddit for technical specs
- Always store source URL + fetch date in vault
- Summarize before storing (not full page content)
- Respect robots.txt for non-AI-automation purposes

## Verification

- [ ] Vault checked before fetching (no unnecessary re-fetch)
- [ ] Content stored in vault with source URL + date
- [ ] Summary provided (not raw HTML dump)
- [ ] Source is authoritative (official docs, not blog posts)

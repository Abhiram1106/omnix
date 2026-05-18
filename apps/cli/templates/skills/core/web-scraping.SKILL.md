---
name: web-scraping
description: >
  Activate when user needs to extract data from websites, scrape documentation,
  retrieve external content programmatically, or automate browser interactions.
  Covers HTTP scraping, stealth scraping, and full browser automation.
triggers:
  - scrape
  - crawl
  - extract data
  - web scraping
  - browser automation
  - playwright
  - spider
  - fetch page
  - bypass cloudflare
  - parse HTML
  - web automation
---

## When to activate

When the task involves retrieving structured data from the web programmatically — from a simple HTTP fetch to bypassing anti-bot systems to full browser automation.

## Fetcher escalation tower (Scrapling pattern)

Choose the simplest fetcher that works for the target site. Escalate only when needed.

```
Level 1: HTTP Fetcher (Fetcher)
  Use for: public pages, APIs, no anti-bot
  Speed: fastest, minimal resources
  Python: Fetcher.get(url) / Fetcher.post(url, data={})

Level 2: Stealth Fetcher (StealthyFetcher)
  Use for: sites with fingerprint detection, header checks
  Speed: moderate, sends realistic browser headers + TLS fingerprint
  Python: StealthyFetcher.fetch(url, headless=True, network_idle=True)
  Options: impersonate='chrome', stealthy_headers=True

Level 3: Dynamic Fetcher (DynamicFetcher)
  Use for: sites requiring JS execution, SPAs, Cloudflare-protected
  Speed: slow, launches full headless browser
  Python: DynamicFetcher.fetch(url, wait_selector='.content')
  Options: solve_cloudflare=True, wait_for_network_idle=True
```

## Session-based scraping (persistent cookies/state)

```python
from scrapling.fetchers import FetcherSession

with FetcherSession(impersonate='chrome') as session:
    login_page = session.get(login_url)
    session.post(login_url, data={'user': u, 'pass': p})
    protected_page = session.get(protected_url)
    data = protected_page.css('.data-row').getall()
```

## Async spider (concurrent multi-page)

```python
from scrapling import Spider

class DocsSpider(Spider):
    name = "docs"
    start_urls = ["https://docs.example.com"]
    concurrent_requests = 5       # parallel requests
    robots_txt_obey = True        # respect robots.txt
    delay = 0.5                   # be polite

    async def parse(self, response):
        yield {"title": response.css("h1::text").get(),
               "content": response.css(".content").get()}
        for link in response.css("a[href]"):
            yield response.follow(link, callback=self.parse)
```

## Browser automation (dev-browser / Playwright pattern)

For tasks requiring full browser control (form filling, auth flows, screenshot, dynamic content):

```typescript
// Sandboxed Playwright execution (dev-browser pattern)
// Pages persist across calls — reconnect by name

await browser.goto("https://example.com");
await browser.fill("#email", userEmail);
await browser.fill("#password", password);
await browser.click('button[type="submit"]');
await browser.waitForSelector(".dashboard");
const data = await browser.evaluate(() =>
  document.querySelector(".data-table")?.innerText
);
```

Key options:
- `headless: true` — no visible browser (default for CI)
- `connect: "127.0.0.1:9222"` — attach to existing Chrome session
- `ignoreHTTPSErrors: true` — for self-signed cert environments
- `timeoutMs: 30000` — max wait time

## LLM-powered extraction (Scrapegraph-ai pattern)

For unstructured pages where CSS selectors are brittle, use goal-first LLM extraction:

```python
from scrapegraphai.graphs import SmartScraperGraph

graph_config = {
    "llm": {"model": "claude-sonnet-4-6", "api_key": ANTHROPIC_KEY},
    "verbose": False,
    "headless": True,
}

# Define extraction goal precisely — not "extract everything"
goal = "Extract the product name, price, and availability status from each product card"

scraper = SmartScraperGraph(prompt=goal, source=url, config=graph_config)
result = scraper.run()
```

Goals must be specific: "extract X from Y" not "analyze the page".

## Retrieval rules (when scraping for knowledge)

1. **Prefer official sources** — framework docs, GitHub source, official changelogs.
2. **One retrieval, one purpose** — don't fetch entire docs sites for one question.
3. **Summarize, don't dump** — extract the relevant section, compress, inject.
4. **Cache in vault** — store useful retrieved content in `07-LESSONS/` or `08-PROMPTS/` with source URL + date.
5. **Deduplicate** — check vault before fetching. If recent entry covers the question, use it.
6. **Respect robots.txt** — always, unless explicitly authorized by the site owner for your use case.
7. **Rate limit** — never hammer a site. Default: ≤1 request/second. Session-based: ≤5 concurrent.

## CLI reference (Scrapling)

```bash
scrapling extract get <url> --css-selector ".content"
scrapling extract stealthy-fetch <url> --solve-cloudflare
scrapling extract fetch <url> --proxy socks5://proxy:1080
```

## Vault storage format for retrieved content

```markdown
## <Topic> (<Source> - YYYY-MM-DD)
Source: <URL>
Fetched: YYYY-MM-DD
Relevant for: <area/task>

<one paragraph summary>

```code if applicable```
```

## Gotchas

- Cloudflare IUAM (challenge) requires DynamicFetcher + `solve_cloudflare=True` — no HTTP workaround.
- Paginated content: detect `next` link pattern, don't assume page=1, page=2, etc.
- JS-rendered content returns empty in Level 1/2 — check the HTML before escalating.
- LLM extraction is expensive — use CSS selectors when the structure is stable.
- Session cookies expire — re-authenticate if you get a redirect to login page.
- `robots.txt` disallowing your path → don't scrape it, or get explicit permission.

## Integration

- External retrieval rules: `packages/core/standards/external-retrieval.md`
- External intelligence workflow: `packages/core/workflows/external-intelligence.md`
- Agents: `ai-engineer`, `context-manager` (for vault storage after retrieval)

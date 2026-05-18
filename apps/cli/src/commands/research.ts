/**
 * omnix research — cache-first external research with vault storage.
 *
 * Flow:
 * 1. Check vault 07-LESSONS/external-research.md for cached result (< 7 days old)
 * 2. If fresh cache → return it immediately (0 network calls)
 * 3. If stale/missing → fetch from authoritative sources using Node https
 * 4. Summarize (extract title + first meaningful paragraph per source)
 * 5. Store result in vault with fetched_at + source URL
 * 6. Return summary
 *
 * Supported source types (auto-detected from the query):
 *   - npm packages       → registry.npmjs.org
 *   - GitHub repos       → api.github.com
 *   - Node.js versions   → nodejs.org/dist/index.json
 *   - MDN web docs       → developer.mozilla.org search
 *   - caniuse features   → caniuse.com data
 *
 * No Medium/Reddit/dev.to — authoritative sources only.
 */

import path from "node:path";
import https from "node:https";
import fs from "fs-extra";
import { VAULT_DIR, cwdPath, exists } from "../utils/paths.js";
import { logger } from "../utils/logger.js";

export interface ResearchOptions {
  cwd: string;
  query: string;
  force: boolean;
  json: boolean;
}

interface SourceResult {
  url: string;
  title: string;
  summary: string;
  kind: string;
}

interface CacheEntry {
  query: string;
  fetchedAt: string;
  sources: SourceResult[];
}

const CACHE_FILE = "07-LESSONS/external-research.md";
const CACHE_TTL_DAYS = 7;

export async function runResearch(opts: ResearchOptions): Promise<void> {
  const vaultRoot = cwdPath(opts.cwd, VAULT_DIR);
  const cachePath = path.join(vaultRoot, CACHE_FILE);

  if (!opts.json) {
    logger.header("Omnix Research");
    logger.info(`Query: "${opts.query}"`);
    logger.blank();
  }

  // ── Check vault cache ─────────────────────────────────────────────────────
  if (!opts.force) {
    const cached = await findCachedResult(cachePath, opts.query);
    if (cached) {
      if (!opts.json) {
        logger.dim(`Cache hit (fetched ${cached.fetchedAt})`);
        logger.blank();
      }
      printResult(cached, opts.json);
      return;
    }
    if (!opts.json) logger.dim("No cache — fetching authoritative sources...");
  }

  // ── Resolve sources based on the query ───────────────────────────────────
  const sources = resolveSourcesForQuery(opts.query);
  if (sources.length === 0) {
    if (opts.json) {
      console.log(JSON.stringify({ query: opts.query, error: "no-source", message: "No authoritative source detected for this query type." }, null, 2));
    } else {
      logger.warn("No authoritative source detected for this query type.");
      logger.dim("Supported queries:");
      logger.dim("  - npm package info:   omnix research \"npm <name>\" or just the name");
      logger.dim("  - GitHub repo info:   omnix research \"github owner/repo\"");
      logger.dim("  - Node.js versions:   omnix research \"node lts\" or \"node version\"");
      logger.dim("  - MDN web docs:       omnix research \"mdn <term>\" or \"<feature> web api\"");
      logger.dim("  - Caniuse browser:    omnix research \"caniuse <feature>\" or \"<feature> browser support\"");
      logger.blank();
      logger.dim("For broader research, paste relevant docs into 07-LESSONS/external-research.md manually.");
    }
    process.exitCode = 1;
    return;
  }

  // ── Fetch each source ─────────────────────────────────────────────────────
  const results: SourceResult[] = [];
  for (const source of sources) {
    if (!opts.json) logger.dim(`  Fetching ${source.url}...`);
    try {
      const raw = await fetchData(source.url, source.accept ?? "application/json");
      const parsed = source.parse(raw);
      if (parsed) results.push({ url: source.url, kind: source.kind, ...parsed });
    } catch (e) {
      if (!opts.json) logger.dim(`  Skipped: ${(e as Error).message}`);
    }
  }

  if (results.length === 0) {
    if (opts.json) {
      console.log(JSON.stringify({ query: opts.query, error: "fetch-failed", sources: [] }, null, 2));
    } else {
      logger.warn("All fetches failed. Check your internet connection or try again.");
    }
    process.exitCode = 1;
    return;
  }

  // ── Write to vault cache ──────────────────────────────────────────────────
  const today = new Date().toISOString().split("T")[0]!;
  const entry: CacheEntry = { query: opts.query, fetchedAt: today, sources: results };

  const cacheContent = formatCacheEntry(entry);
  if (await exists(vaultRoot)) {
    const existing = await fs.readFile(cachePath, "utf8").catch(() => "");
    await fs.ensureDir(path.dirname(cachePath));
    const header = existing.trim().startsWith("#") ? existing : "# External Research Cache\n> Auto-managed by omnix research.\n\n" + existing;
    await fs.writeFile(cachePath, header + "\n\n" + cacheContent, "utf8");
    if (!opts.json) logger.success(`Saved to vault: ${CACHE_FILE}`);
  }

  if (!opts.json) logger.blank();
  printResult(entry, opts.json);
}

// ── Source resolution ────────────────────────────────────────────────────────

type ParseFn = (data: unknown) => { title: string; summary: string } | null;

interface Source {
  url: string;
  kind: string;
  parse: ParseFn;
  accept?: string;
}

function resolveSourcesForQuery(query: string): Source[] {
  const q = query.toLowerCase().trim();
  const sources: Source[] = [];

  // ── 1. Explicit "npm <name>" or just a single bare package name ──────────
  const npmExplicit = q.match(/(?:npm|package)[\s:]+([a-z0-9@/_.-]+)/);
  if (npmExplicit?.[1]) {
    sources.push(buildNpmSource(npmExplicit[1]));
  }

  // ── 2. Explicit "github owner/repo" ──────────────────────────────────────
  const ghMatch = q.match(/(?:github|gh)[\s:]+([a-z0-9_.-]+\/[a-z0-9_.-]+)/i);
  if (ghMatch?.[1]) {
    sources.push(buildGithubSource(ghMatch[1]));
  }

  // ── 3. Node.js version query ─────────────────────────────────────────────
  if (/\bnode(\.js)?\b/.test(q) && /(version|lts|release|latest)/.test(q)) {
    sources.push(buildNodeSource());
  }

  // ── 4. MDN web docs ──────────────────────────────────────────────────────
  if (q.includes("mdn") || /(web api|html element|css property|javascript api|browser api)/.test(q)) {
    const term = q.replace(/mdn|web api|html element|css property|javascript api|browser api/g, "").trim();
    if (term) sources.push(buildMdnSource(term));
  }

  // ── 5. Caniuse / browser support ─────────────────────────────────────────
  if (/caniuse|browser support|browser compat|can i use/.test(q)) {
    const feat = q.replace(/caniuse|browser support|browser compat|can i use/g, "").trim();
    if (feat) sources.push(buildCaniuseSource(feat));
  }

  // ── 6. Fallback: if the query is a single token, try it as an npm package ─
  if (sources.length === 0) {
    const stopwords = new Set([
      "best", "latest", "for", "in", "the", "how", "to", "use", "setup", "install",
      "what", "is", "a", "an", "and", "or", "but", "with", "without",
    ]);
    const candidates = q
      .split(/\s+/)
      .filter((w) => !stopwords.has(w) && /^@?[a-z0-9][a-z0-9@/_.-]*$/.test(w));
    if (candidates.length === 1 && candidates[0]) {
      sources.push(buildNpmSource(candidates[0]));
    }
  }

  return sources;
}

function buildNpmSource(name: string): Source {
  const encoded = encodeURIComponent(name).replace(/%40/g, "@"); // keep scoped names readable
  return {
    url: `https://registry.npmjs.org/${encoded}/latest`,
    kind: "npm",
    parse: (data) => {
      const d = data as { name?: string; version?: string; description?: string; homepage?: string; license?: string };
      if (!d?.name) return null;
      return {
        title: `npm: ${d.name}@${d.version ?? "unknown"}`,
        summary: [
          d.description ?? "No description.",
          d.homepage ? `Homepage: ${d.homepage}` : "",
          d.license ? `License: ${d.license}` : "",
        ].filter(Boolean).join(" — "),
      };
    },
  };
}

function buildGithubSource(repo: string): Source {
  return {
    url: `https://api.github.com/repos/${repo}`,
    kind: "github",
    parse: (data) => {
      const d = data as {
        full_name?: string;
        description?: string;
        stargazers_count?: number;
        language?: string;
        license?: { name?: string };
        pushed_at?: string;
        homepage?: string;
      };
      if (!d?.full_name) return null;
      return {
        title: `github: ${d.full_name}`,
        summary: [
          d.description ?? "No description.",
          d.stargazers_count ? `${d.stargazers_count.toLocaleString()} stars` : "",
          d.language ? `Primary language: ${d.language}` : "",
          d.license?.name ? `License: ${d.license.name}` : "",
          d.pushed_at ? `Last pushed: ${d.pushed_at.split("T")[0]}` : "",
        ].filter(Boolean).join(" — "),
      };
    },
  };
}

function buildNodeSource(): Source {
  return {
    url: "https://nodejs.org/dist/index.json",
    kind: "nodejs",
    parse: (data) => {
      const versions = data as Array<{ version: string; lts: string | boolean; date: string }>;
      if (!Array.isArray(versions)) return null;
      const lts = versions.find((v) => v.lts);
      const current = versions[0];
      return {
        title: "Node.js — active versions",
        summary: [
          lts ? `Latest LTS: ${lts.version} (${typeof lts.lts === "string" ? lts.lts : "active"}, released ${lts.date})` : "",
          current ? `Latest current: ${current.version} (released ${current.date})` : "",
          "Use LTS for production unless you need bleeding-edge features.",
        ].filter(Boolean).join(" — "),
      };
    },
  };
}

function buildMdnSource(term: string): Source {
  // MDN search endpoint returns JSON for search results.
  return {
    url: `https://developer.mozilla.org/api/v1/search?q=${encodeURIComponent(term)}&locale=en-US`,
    kind: "mdn",
    parse: (data) => {
      const d = data as { documents?: Array<{ title?: string; summary?: string; mdn_url?: string }> };
      const docs = d?.documents;
      if (!Array.isArray(docs) || docs.length === 0) return null;
      const top = docs[0]!;
      return {
        title: `MDN: ${top.title ?? "Untitled"}`,
        summary: [
          top.summary ?? "No summary available.",
          top.mdn_url ? `Read more: https://developer.mozilla.org${top.mdn_url}` : "",
        ].filter(Boolean).join(" — "),
      };
    },
  };
}

function buildCaniuseSource(feature: string): Source {
  // Use the unofficial caniuse JSON mirror maintained by GitHub
  const slug = feature.replace(/\s+/g, "-");
  return {
    url: `https://raw.githubusercontent.com/Fyrd/caniuse/main/features-json/${slug}.json`,
    kind: "caniuse",
    parse: (data) => {
      const d = data as { title?: string; description?: string; status?: string; categories?: string[] };
      if (!d?.title) return null;
      return {
        title: `caniuse: ${d.title}`,
        summary: [
          d.description ?? "No description.",
          d.status ? `Status: ${d.status}` : "",
          d.categories ? `Categories: ${d.categories.join(", ")}` : "",
        ].filter(Boolean).join(" — "),
      };
    },
  };
}

// ── Cache helpers ─────────────────────────────────────────────────────────────

async function findCachedResult(cachePath: string, query: string): Promise<CacheEntry | null> {
  const content = await fs.readFile(cachePath, "utf8").catch(() => "");
  if (!content) return null;

  const sections = content.split(/\n## Query: /);
  const queryLower = query.toLowerCase();
  for (const section of sections) {
    const firstLine = section.split("\n")[0]?.trim().toLowerCase() ?? "";
    if (!firstLine || firstLine.length < 3) continue;
    if (!firstLine.includes(queryLower) && !queryLower.includes(firstLine)) continue;

    const dateMatch = section.match(/- Fetched: (\d{4}-\d{2}-\d{2})/);
    if (!dateMatch) continue;
    const fetchedAt = dateMatch[1]!;

    const ageMs = Date.now() - new Date(fetchedAt).getTime();
    const ageDays = ageMs / (1000 * 60 * 60 * 24);
    if (ageDays > CACHE_TTL_DAYS) continue;

    const sourceMatches = [...section.matchAll(/### (.+)\n- URL: (.+)\n- Kind: (.+)\n\n([\s\S]*?)(?=\n###|\n##|$)/g)];
    const sources: SourceResult[] = sourceMatches.map((m) => ({
      title: m[1]?.trim() ?? "",
      url: m[2]?.trim() ?? "",
      kind: m[3]?.trim() ?? "unknown",
      summary: m[4]?.trim().slice(0, 500) ?? "",
    }));

    return { query, fetchedAt, sources };
  }
  return null;
}

function formatCacheEntry(entry: CacheEntry): string {
  const lines = [
    `## Query: ${entry.query}`,
    `- Fetched: ${entry.fetchedAt}`,
    `- Status: cached`,
    "",
  ];
  for (const s of entry.sources) {
    lines.push(`### ${s.title}`);
    lines.push(`- URL: ${s.url}`);
    lines.push(`- Kind: ${s.kind}`);
    lines.push("");
    lines.push(s.summary);
    lines.push("");
  }
  return lines.join("\n");
}

function printResult(entry: CacheEntry, json: boolean): void {
  if (json) {
    console.log(JSON.stringify(entry, null, 2));
    return;
  }
  for (const s of entry.sources) {
    console.log(`  [${s.kind}] ${s.title}`);
    console.log(`  ${s.url}`);
    logger.dim(`  ${s.summary}`);
    console.log();
  }
}

// ── HTTP helper ───────────────────────────────────────────────────────────────

function fetchData(url: string, accept: string): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const req = https.get(
      url,
      { headers: { "User-Agent": "omnix-cli/0.1.0", "Accept": accept } },
      (res) => {
        // Handle redirects (e.g. raw.githubusercontent.com sometimes 302s)
        if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          fetchData(res.headers.location, accept).then(resolve, reject);
          return;
        }
        if (res.statusCode && res.statusCode >= 400) {
          reject(new Error(`HTTP ${res.statusCode}`));
          return;
        }
        const chunks: Buffer[] = [];
        res.on("data", (c: Buffer) => chunks.push(c));
        res.on("end", () => {
          try {
            const body = Buffer.concat(chunks).toString("utf8");
            resolve(accept.includes("json") ? JSON.parse(body) : body);
          } catch (e) {
            reject(e);
          }
        });
      },
    );
    req.on("error", reject);
    req.setTimeout(8000, () => { req.destroy(); reject(new Error("Request timed out")); });
  });
}

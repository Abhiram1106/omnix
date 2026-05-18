import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { runInit } from "../src/commands/init.js";
import { runResearch } from "../src/commands/research.js";
import fs from "fs-extra";
import path from "node:path";
import os from "node:os";

let tmpDir: string;

beforeEach(async () => {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "omnix-research-"));
  await fs.writeFile(path.join(tmpDir, "package.json"), JSON.stringify({ name: "test" }));
  process.exitCode = 0;
});

afterEach(async () => {
  await fs.remove(tmpDir);
  process.exitCode = 0;
});

function captureStdout<T>(fn: () => Promise<T>): Promise<string> {
  const lines: string[] = [];
  const origLog = console.log;
  console.log = (msg: string) => lines.push(msg);
  return fn()
    .then(() => { console.log = origLog; return lines.join("\n"); })
    .catch((e) => { console.log = origLog; throw e; });
}

describe("omnix research — cache layer", () => {
  it("returns cached entry on cache hit (no network call)", async () => {
    await runInit({ cwd: tmpDir, yes: true, force: true, dryRun: false });

    // Manually seed the cache with a recent entry
    const cachePath = path.join(tmpDir, ".obsidian-ai-memory", "07-LESSONS", "external-research.md");
    const today = new Date().toISOString().split("T")[0];
    await fs.writeFile(cachePath, `# External Research Cache

## Query: npm axios
- Fetched: ${today}
- Status: cached

### npm: axios@1.0.0
- URL: https://registry.npmjs.org/axios/latest
- Kind: npm

Test description from cache.
`, "utf8");

    const output = await captureStdout(() =>
      runResearch({ cwd: tmpDir, query: "npm axios", force: false, json: true })
    );
    const parsed = JSON.parse(output);
    expect(parsed.fetchedAt).toBe(today);
    expect(parsed.sources.length).toBeGreaterThan(0);
    expect(parsed.sources[0].title).toContain("axios");
  });

  it("rejects unknown query types cleanly", async () => {
    await runInit({ cwd: tmpDir, yes: true, force: true, dryRun: false });
    // A query that doesn't match any source resolver and isn't a single token
    await runResearch({
      cwd: tmpDir,
      query: "best ways to handle async error patterns in production systems",
      force: true,
      json: true,
    });
    expect(process.exitCode).toBe(1);
  });

  it("treats a single bare token as an npm package fallback", async () => {
    await runInit({ cwd: tmpDir, yes: true, force: true, dryRun: false });
    // Seed cache so we don't hit the network in tests
    const cachePath = path.join(tmpDir, ".obsidian-ai-memory", "07-LESSONS", "external-research.md");
    const today = new Date().toISOString().split("T")[0];
    await fs.writeFile(cachePath, `# External Research Cache

## Query: lodash
- Fetched: ${today}
- Status: cached

### npm: lodash@4.17.21
- URL: https://registry.npmjs.org/lodash/latest
- Kind: npm

Lodash utility library.
`, "utf8");

    const output = await captureStdout(() =>
      runResearch({ cwd: tmpDir, query: "lodash", force: false, json: true })
    );
    const parsed = JSON.parse(output);
    expect(parsed.sources.length).toBeGreaterThan(0);
  });
});

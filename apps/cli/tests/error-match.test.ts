import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { runInit } from "../src/commands/init.js";
import { runErrorMatch } from "../src/commands/error-match.js";
import fs from "fs-extra";
import path from "node:path";
import os from "node:os";

let tmpDir: string;

beforeEach(async () => {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "omnix-errormatch-"));
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
  const origErr = console.error;
  console.log = (msg: string) => lines.push(typeof msg === "string" ? msg : String(msg));
  console.error = (msg: string) => lines.push(typeof msg === "string" ? msg : String(msg));
  return fn()
    .then(() => { console.log = origLog; console.error = origErr; return lines.join("\n"); })
    .catch((e) => { console.log = origLog; console.error = origErr; throw e; });
}

describe("omnix error-match", () => {
  it("warns and exits cleanly when no vault exists", async () => {
    await runErrorMatch({ cwd: tmpDir, errorText: "TypeError", top: 3, json: true });
    expect(process.exitCode).toBe(1);
  });

  it("warns gracefully when error memory is empty", async () => {
    await runInit({ cwd: tmpDir, yes: true, force: true, dryRun: false });
    // Use --json so we get a deterministic, structured response
    const output = await captureStdout(() =>
      runErrorMatch({ cwd: tmpDir, errorText: "anything", top: 3, json: true })
    );
    // Either JSON [] or the warn message — both valid
    const trimmed = output.trim();
    if (trimmed.startsWith("[")) {
      const parsed = JSON.parse(trimmed);
      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed.length).toBe(0);
    } else {
      expect(trimmed.toLowerCase()).toMatch(/empty|no past|no match/);
    }
  });

  it("finds matching past error by keywords", async () => {
    await runInit({ cwd: tmpDir, yes: true, force: true, dryRun: false });
    const errorPath = path.join(tmpDir, ".obsidian-ai-memory", "03-ERRORS", "error-memory.md");
    await fs.writeFile(errorPath, `# Error Memory

## TypeError: cannot read property of null
- Date: 2025-01-15
- Root Cause: user.createdAt was optional but the handler assumed it existed
- Fix: Added null guard before accessing user.createdAt
- Prevention Rule: Always check optional fields before use

## Network: ECONNREFUSED
- Date: 2025-01-10
- Root Cause: Database container not started
- Fix: Added docker-compose up to test setup
- Prevention Rule: Use Testcontainers for integration tests
`, "utf8");

    const output = await captureStdout(() =>
      runErrorMatch({ cwd: tmpDir, errorText: "cannot read property of null on user", top: 3, json: true })
    );
    const parsed = JSON.parse(output);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed.length).toBeGreaterThan(0);
    expect(parsed[0].title).toContain("cannot read property");
    expect(parsed[0].rootCause).toContain("optional");
  });

  it("respects --top limit", async () => {
    await runInit({ cwd: tmpDir, yes: true, force: true, dryRun: false });
    const errorPath = path.join(tmpDir, ".obsidian-ai-memory", "03-ERRORS", "error-memory.md");
    const entries = Array.from({ length: 5 }, (_, i) => `
## Error type ${i}: cannot read property
- Date: 2025-01-15
- Root Cause: null propagation
- Fix: Added guard ${i}
- Prevention Rule: check nulls
`).join("\n");
    await fs.writeFile(errorPath, `# Error Memory\n${entries}`, "utf8");

    const output = await captureStdout(() =>
      runErrorMatch({ cwd: tmpDir, errorText: "cannot read property", top: 2, json: true })
    );
    const parsed = JSON.parse(output);
    expect(parsed.length).toBeLessThanOrEqual(2);
  });
});

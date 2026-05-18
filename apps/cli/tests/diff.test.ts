import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { runInit } from "../src/commands/init.js";
import { runDiff } from "../src/commands/diff.js";
import fs from "fs-extra";
import path from "node:path";
import os from "node:os";

let tmpDir: string;

beforeEach(async () => {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "omnix-diff-"));
  await fs.writeFile(path.join(tmpDir, "package.json"), JSON.stringify({ name: "test" }));
});

afterEach(async () => {
  await fs.remove(tmpDir);
});

function captureStdout<T>(fn: () => Promise<T>): Promise<string> {
  const lines: string[] = [];
  const origLog = console.log;
  console.log = (msg: string) => lines.push(msg);
  return fn()
    .then(() => { console.log = origLog; return lines.join("\n"); })
    .catch((e) => { console.log = origLog; throw e; });
}

describe("omnix diff", () => {
  it("reports no session when no digests exist", async () => {
    const output = await captureStdout(() =>
      runDiff({ cwd: tmpDir, json: true })
    );
    const parsed = JSON.parse(output);
    expect(parsed.lastSessionFile).toBe(null);
    expect(parsed.lastSessionDate).toBe(null);
  });

  it("finds the last session after init", async () => {
    await runInit({ cwd: tmpDir, yes: true, force: true, dryRun: false });
    const output = await captureStdout(() =>
      runDiff({ cwd: tmpDir, json: true })
    );
    const parsed = JSON.parse(output);
    expect(parsed.lastSessionDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(parsed.lastSessionFile).toContain("01-SESSIONS");
  });

  it("parses files-in-last-digest from session", async () => {
    await runInit({ cwd: tmpDir, yes: true, force: true, dryRun: false });
    // Write a session with explicit Files Changed entries
    const sessionsDir = path.join(tmpDir, ".obsidian-ai-memory", "01-SESSIONS");
    const dateDirs = await fs.readdir(sessionsDir);
    const dayDir = path.join(sessionsDir, dateDirs[0]!);
    const customDigest = `# Session Digest

- Date: 2025-01-15 1200
- Tool: claude-code
- Files Changed:
- src/foo.ts
- src/bar.ts
- src/baz.ts
- Next Recommended Step: review tests
`;
    await fs.writeFile(path.join(dayDir, "session-9999-custom.md"), customDigest, "utf8");

    const output = await captureStdout(() =>
      runDiff({ cwd: tmpDir, json: true })
    );
    const parsed = JSON.parse(output);
    expect(parsed.filesInLastDigest).toContain("src/foo.ts");
    expect(parsed.filesInLastDigest).toContain("src/bar.ts");
    expect(parsed.filesInLastDigest).toContain("src/baz.ts");
  });

  it("filesChangedSinceLastCommit is array (non-git project)", async () => {
    await runInit({ cwd: tmpDir, yes: true, force: true, dryRun: false });
    const output = await captureStdout(() =>
      runDiff({ cwd: tmpDir, json: true })
    );
    const parsed = JSON.parse(output);
    // Non-git project: git commands fail silently, array stays empty
    expect(Array.isArray(parsed.filesChangedSinceLastCommit)).toBe(true);
  });
});

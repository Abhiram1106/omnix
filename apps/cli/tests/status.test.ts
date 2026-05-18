import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { runInit } from "../src/commands/init.js";
import { runStatus } from "../src/commands/status.js";
import fs from "fs-extra";
import path from "node:path";
import os from "node:os";

let tmpDir: string;

beforeEach(async () => {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "omnix-status-"));
  await fs.writeFile(path.join(tmpDir, "package.json"), JSON.stringify({ name: "test" }));
});

afterEach(async () => {
  await fs.remove(tmpDir);
});

function captureStdout<T>(fn: () => Promise<T>): Promise<{ result: T; output: string }> {
  const lines: string[] = [];
  const origLog = console.log;
  console.log = (msg: string) => lines.push(msg);
  return fn().then((result) => {
    console.log = origLog;
    return { result, output: lines.join("\n") };
  }).catch((e) => {
    console.log = origLog;
    throw e;
  });
}

describe("omnix status", () => {
  it("reports critical issues when vault is missing", async () => {
    const { output } = await captureStdout(() =>
      runStatus({ cwd: tmpDir, json: true })
    );
    const parsed = JSON.parse(output);
    expect(parsed.vaultPresent).toBe(false);
    expect(parsed.score).toBeLessThan(70);
    expect(parsed.issues.length).toBeGreaterThan(0);
    expect(parsed.issues.some((i: string) => /vault not found/i.test(i))).toBe(true);
  });

  it("reports high score after init", async () => {
    await runInit({ cwd: tmpDir, yes: true, force: true, dryRun: false });
    const { output } = await captureStdout(() =>
      runStatus({ cwd: tmpDir, json: true })
    );
    const parsed = JSON.parse(output);
    expect(parsed.vaultPresent).toBe(true);
    expect(parsed.omnixDirPresent).toBe(true);
    expect(parsed.installedAdapters.length).toBeGreaterThan(0);
    expect(parsed.score).toBeGreaterThanOrEqual(70);
  });

  it("includes A/B/C/D/F grade in JSON", async () => {
    await runInit({ cwd: tmpDir, yes: true, force: true, dryRun: false });
    const { output } = await captureStdout(() =>
      runStatus({ cwd: tmpDir, json: true })
    );
    const parsed = JSON.parse(output);
    expect(["A", "B", "C", "D", "F"]).toContain(parsed.grade);
  });

  it("flags missing .gitignore guard", async () => {
    await runInit({ cwd: tmpDir, yes: true, force: true, dryRun: false });
    // Remove .gitignore to simulate missing guard
    await fs.remove(path.join(tmpDir, ".gitignore"));
    const { output } = await captureStdout(() =>
      runStatus({ cwd: tmpDir, json: true })
    );
    const parsed = JSON.parse(output);
    expect(parsed.gitignoreOk).toBe(false);
  });

  it("counts sessions correctly", async () => {
    await runInit({ cwd: tmpDir, yes: true, force: true, dryRun: false });
    // Init writes one session; count it
    const { output } = await captureStdout(() =>
      runStatus({ cwd: tmpDir, json: true })
    );
    const parsed = JSON.parse(output);
    expect(parsed.sessionCount).toBeGreaterThanOrEqual(1);
    expect(parsed.lastSessionDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("lists installed adapters", async () => {
    await runInit({
      cwd: tmpDir, yes: true, force: true, dryRun: false,
      adapters: ["generic", "claude", "cursor"],
    });
    const { output } = await captureStdout(() =>
      runStatus({ cwd: tmpDir, json: true })
    );
    const parsed = JSON.parse(output);
    expect(parsed.installedAdapters).toContain("generic");
    expect(parsed.installedAdapters).toContain("claude");
    expect(parsed.installedAdapters).toContain("cursor");
  });
});

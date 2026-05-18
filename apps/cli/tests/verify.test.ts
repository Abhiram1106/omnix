import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { runInit } from "../src/commands/init.js";
import { runVerify } from "../src/commands/verify.js";
import fs from "fs-extra";
import path from "node:path";
import os from "node:os";

let tmpDir: string;

beforeEach(async () => {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "omnix-verify-"));
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

describe("omnix verify", () => {
  it("fails when no conventions are installed", async () => {
    const output = await captureStdout(() =>
      runVerify({ cwd: tmpDir, json: true })
    );
    const parsed = JSON.parse(output);
    expect(Array.isArray(parsed)).toBe(true);
    const failing = parsed.filter((c: { ok: boolean }) => !c.ok);
    expect(failing.length).toBeGreaterThan(0);
    expect(process.exitCode).toBe(1);
  });

  it("passes after init for all core checks", async () => {
    await runInit({ cwd: tmpDir, yes: true, force: true, dryRun: false });
    const output = await captureStdout(() =>
      runVerify({ cwd: tmpDir, json: true })
    );
    const parsed = JSON.parse(output);
    // All checks should pass after init (project-context.md is seeded from scan)
    const failing = parsed.filter((c: { ok: boolean }) => !c.ok);
    expect(failing).toEqual([]);
  });

  it("AGENTS.md check requires memory loop keyword", async () => {
    await runInit({ cwd: tmpDir, yes: true, force: true, dryRun: false });
    // Wipe AGENTS.md to remove the memory loop reference
    await fs.writeFile(path.join(tmpDir, "AGENTS.md"), "# Empty\n", "utf8");
    const output = await captureStdout(() =>
      runVerify({ cwd: tmpDir, json: true })
    );
    const parsed = JSON.parse(output);
    const agentsCheck = parsed.find((c: { name: string }) => c.name === "AGENTS.md");
    expect(agentsCheck.ok).toBe(false);
    expect(agentsCheck.detail).toMatch(/memory loop/i);
  });

  it("adapter detection finds installed file by exact path", async () => {
    await runInit({ cwd: tmpDir, yes: true, force: true, dryRun: false });
    const output = await captureStdout(() =>
      runVerify({ cwd: tmpDir, json: true })
    );
    const parsed = JSON.parse(output);
    const adapterCheck = parsed.find((c: { name: string }) => c.name === "Tool adapter present");
    expect(adapterCheck.ok).toBe(true);
    expect(adapterCheck.detail).toContain("Found:");
    // The detail should mention an actual filename, not the "one of the known" fallback
    expect(adapterCheck.detail).not.toContain("one of the known adapters");
  });
});

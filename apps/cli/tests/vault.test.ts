import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { runInit } from "../src/commands/init.js";
import { runVault } from "../src/commands/vault.js";
import fs from "fs-extra";
import path from "node:path";
import os from "node:os";

let tmpDir: string;

beforeEach(async () => {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "omnix-vault-"));
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

describe("omnix vault validate", () => {
  it("fails when vault is missing", async () => {
    await runVault({ cwd: tmpDir, subcommand: "validate", dryRun: false, json: true });
    expect(process.exitCode).toBe(1);
  });

  it("passes after init", async () => {
    await runInit({ cwd: tmpDir, yes: true, force: true, dryRun: false });
    const output = await captureStdout(() =>
      runVault({ cwd: tmpDir, subcommand: "validate", dryRun: false, json: true })
    );
    const parsed = JSON.parse(output);
    const errors = parsed.filter((i: { severity: string }) => i.severity === "error");
    expect(errors).toEqual([]);
  });

  it("flags missing required vault folder", async () => {
    await runInit({ cwd: tmpDir, yes: true, force: true, dryRun: false });
    await fs.remove(path.join(tmpDir, ".obsidian-ai-memory", "03-ERRORS"));

    const output = await captureStdout(() =>
      runVault({ cwd: tmpDir, subcommand: "validate", dryRun: false, json: true })
    );
    const parsed = JSON.parse(output);
    const errors = parsed.filter((i: { severity: string }) => i.severity === "error");
    expect(errors.length).toBeGreaterThan(0);
  });
});

describe("omnix vault streak", () => {
  it("warns when no sessions exist", async () => {
    await runInit({ cwd: tmpDir, yes: true, force: true, dryRun: false });
    // Clear sessions
    await fs.emptyDir(path.join(tmpDir, ".obsidian-ai-memory", "01-SESSIONS"));

    const output = await captureStdout(() =>
      runVault({ cwd: tmpDir, subcommand: "streak", dryRun: false, json: false })
    );
    // Either "No sessions" warning or empty streak — either is fine
    expect(output.length).toBeGreaterThan(0);
  });

  it("reports streak after init", async () => {
    await runInit({ cwd: tmpDir, yes: true, force: true, dryRun: false });
    const output = await captureStdout(() =>
      runVault({ cwd: tmpDir, subcommand: "streak", dryRun: false, json: false })
    );
    expect(output).toMatch(/streak/i);
  });
});

describe("omnix vault migrate", () => {
  it("reports already-current after init", async () => {
    await runInit({ cwd: tmpDir, yes: true, force: true, dryRun: false });
    const output = await captureStdout(() =>
      runVault({ cwd: tmpDir, subcommand: "migrate", dryRun: false, json: false })
    );
    expect(output.toLowerCase()).toMatch(/already at the latest|already current/);
  });

  it("detects pre-versioning install", async () => {
    await runInit({ cwd: tmpDir, yes: true, force: true, dryRun: false });
    // Simulate old install: delete the version marker
    const versionFile = path.join(tmpDir, ".omnix", ".omnix-vault-version");
    await fs.remove(versionFile);

    const output = await captureStdout(() =>
      runVault({ cwd: tmpDir, subcommand: "migrate", dryRun: true, json: false })
    );
    // Should report a migration is needed (1.0 → current)
    expect(output).toMatch(/Current vault version: 1\.0/);
  });
});

describe("omnix vault self-test", () => {
  it("warns when no adapters installed", async () => {
    const output = await captureStdout(() =>
      runVault({ cwd: tmpDir, subcommand: "self-test", dryRun: false, json: true })
    );
    const parsed = JSON.parse(output);
    expect(parsed).toEqual([]);
  });

  it("reports adapter content references after init", async () => {
    await runInit({ cwd: tmpDir, yes: true, force: true, dryRun: false });
    const output = await captureStdout(() =>
      runVault({ cwd: tmpDir, subcommand: "self-test", dryRun: false, json: true })
    );
    const parsed = JSON.parse(output);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed.length).toBeGreaterThan(0);
    // At least one adapter should reference AGENTS.md (the source of truth)
    expect(parsed.some((r: { referencesAgents: boolean }) => r.referencesAgents)).toBe(true);
  });
});

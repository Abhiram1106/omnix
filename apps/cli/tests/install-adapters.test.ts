import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { runInstallAdapters } from "../src/commands/install-adapters.js";
import fs from "fs-extra";
import path from "node:path";
import os from "node:os";

let tmpDir: string;

beforeEach(async () => {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "omnix-installadapters-"));
  process.exitCode = 0;
});

afterEach(async () => {
  await fs.remove(tmpDir);
  process.exitCode = 0;
});

describe("omnix install-adapters", () => {
  it("installs generic adapter files", async () => {
    await runInstallAdapters({
      cwd: tmpDir, adapters: ["generic"], force: true, dryRun: false,
    });
    expect(await fs.pathExists(path.join(tmpDir, "AGENTS.md"))).toBe(true);
    expect(await fs.pathExists(path.join(tmpDir, "AI_RULES.md"))).toBe(true);
    expect(await fs.pathExists(path.join(tmpDir, "STARTUP_PROTOCOL.md"))).toBe(true);
  });

  it("installs claude adapter files including settings.json", async () => {
    await runInstallAdapters({
      cwd: tmpDir, adapters: ["claude"], force: true, dryRun: false,
    });
    expect(await fs.pathExists(path.join(tmpDir, "CLAUDE.md"))).toBe(true);
    expect(await fs.pathExists(path.join(tmpDir, ".claude", "settings.json"))).toBe(true);
  });

  it("installs cursor adapter with 5 mdc rule files", async () => {
    await runInstallAdapters({
      cwd: tmpDir, adapters: ["cursor"], force: true, dryRun: false,
    });
    const rules = ["project-rules", "frontend", "backend", "testing", "security"];
    for (const rule of rules) {
      expect(await fs.pathExists(path.join(tmpDir, ".cursor", "rules", `${rule}.mdc`))).toBe(true);
    }
  });

  it("rejects unknown adapters with exit code 1", async () => {
    await runInstallAdapters({
      cwd: tmpDir, adapters: ["nonexistent-tool"], force: true, dryRun: false,
    });
    expect(process.exitCode).toBe(1);
  });

  it("filters mix of valid and invalid adapter names", async () => {
    await runInstallAdapters({
      cwd: tmpDir, adapters: ["generic", "fake-tool"], force: true, dryRun: false,
    });
    // generic should still install despite the bogus one
    expect(await fs.pathExists(path.join(tmpDir, "AGENTS.md"))).toBe(true);
  });

  it("dry-run does not write files", async () => {
    await runInstallAdapters({
      cwd: tmpDir, adapters: ["generic"], force: true, dryRun: true,
    });
    expect(await fs.pathExists(path.join(tmpDir, "AGENTS.md"))).toBe(false);
  });

  it("default adapters install when none specified", async () => {
    await runInstallAdapters({
      cwd: tmpDir, adapters: [], force: true, dryRun: false,
    });
    expect(await fs.pathExists(path.join(tmpDir, "AGENTS.md"))).toBe(true);
    expect(await fs.pathExists(path.join(tmpDir, "CLAUDE.md"))).toBe(true);
  });

  it("force flag overwrites existing files", async () => {
    await fs.writeFile(path.join(tmpDir, "AGENTS.md"), "USER-MODIFIED-CONTENT", "utf8");
    await runInstallAdapters({
      cwd: tmpDir, adapters: ["generic"], force: true, dryRun: false,
    });
    const content = await fs.readFile(path.join(tmpDir, "AGENTS.md"), "utf8");
    expect(content).not.toContain("USER-MODIFIED-CONTENT");
  });

  it("no force preserves existing user content", async () => {
    await fs.writeFile(path.join(tmpDir, "AGENTS.md"), "USER-MODIFIED-CONTENT", "utf8");
    await runInstallAdapters({
      cwd: tmpDir, adapters: ["generic"], force: false, dryRun: false,
    });
    const content = await fs.readFile(path.join(tmpDir, "AGENTS.md"), "utf8");
    expect(content).toBe("USER-MODIFIED-CONTENT");
  });
});

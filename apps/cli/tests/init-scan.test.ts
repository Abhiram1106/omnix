import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { runInit } from "../src/commands/init.js";
import { runScan } from "../src/commands/scan.js";
import { runDetect } from "../src/commands/detect.js";
import { runDoctor } from "../src/commands/doctor.js";
import fs from "fs-extra";
import path from "node:path";
import os from "node:os";

let tmpDir: string;

beforeEach(async () => {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "omnix-e2e-"));
  // Seed a minimal package.json so scan has something to detect
  await fs.writeFile(
    path.join(tmpDir, "package.json"),
    JSON.stringify({ name: "test-project", dependencies: { next: "^15" } })
  );
  await fs.writeFile(path.join(tmpDir, "next.config.ts"), "export default {}");
});

afterEach(async () => {
  await fs.remove(tmpDir);
});

describe("omnix init (real fs, --yes --force)", () => {
  it("creates vault directories", async () => {
    await runInit({ cwd: tmpDir, yes: true, force: true, dryRun: false });

    const vault = path.join(tmpDir, ".obsidian-ai-memory");
    expect(await fs.pathExists(vault)).toBe(true);

    const requiredFolders = ["00-INBOX", "01-SESSIONS", "02-PROJECTS", "03-ERRORS",
      "04-DECISIONS", "05-ARCHITECTURE", "06-WORKFLOWS", "07-LESSONS",
      "08-PROMPTS", "09-AGENTS", "10-DAILY-DIGESTS", "templates"];
    for (const folder of requiredFolders) {
      expect(await fs.pathExists(path.join(vault, folder))).toBe(true);
    }
  });

  it("creates .omnix/ runtime directory", async () => {
    await runInit({ cwd: tmpDir, yes: true, force: true, dryRun: false });
    const omnix = path.join(tmpDir, ".omnix");
    expect(await fs.pathExists(omnix)).toBe(true);
    expect(await fs.pathExists(path.join(omnix, "settings", "omnix.json"))).toBe(true);
  });

  it("creates AGENTS.md and AI_RULES.md (generic adapter)", async () => {
    await runInit({ cwd: tmpDir, yes: true, force: true, dryRun: false });
    expect(await fs.pathExists(path.join(tmpDir, "AGENTS.md"))).toBe(true);
    expect(await fs.pathExists(path.join(tmpDir, "AI_RULES.md"))).toBe(true);
    expect(await fs.pathExists(path.join(tmpDir, "STARTUP_PROTOCOL.md"))).toBe(true);
  });

  it("creates CLAUDE.md for claude adapter", async () => {
    await runInit({ cwd: tmpDir, yes: true, force: true, dryRun: false, adapters: ["generic", "claude"] });
    expect(await fs.pathExists(path.join(tmpDir, "CLAUDE.md"))).toBe(true);
  });

  it("creates cursor rules for cursor adapter", async () => {
    await runInit({ cwd: tmpDir, yes: true, force: true, dryRun: false, adapters: ["cursor"] });
    expect(await fs.pathExists(path.join(tmpDir, ".cursor", "rules", "project-rules.mdc"))).toBe(true);
  });

  it("seeds project-context.md with detected stack", async () => {
    await runInit({ cwd: tmpDir, yes: true, force: true, dryRun: false });
    const ctxPath = path.join(tmpDir, ".obsidian-ai-memory", "02-PROJECTS", "project-context.md");
    expect(await fs.pathExists(ctxPath)).toBe(true);
    const content = await fs.readFile(ctxPath, "utf8");
    expect(content).toContain("Project Name:");
  });

  it("writes first session digest", async () => {
    await runInit({ cwd: tmpDir, yes: true, force: true, dryRun: false });
    const sessionsDir = path.join(tmpDir, ".obsidian-ai-memory", "01-SESSIONS");
    const dateDirs = await fs.readdir(sessionsDir);
    expect(dateDirs.length).toBeGreaterThan(0);
  });

  it("dry-run does not write any files", async () => {
    await runInit({ cwd: tmpDir, yes: true, force: false, dryRun: true });
    // Vault should NOT exist after dry-run
    expect(await fs.pathExists(path.join(tmpDir, ".obsidian-ai-memory"))).toBe(false);
  });

  it("second init --no-force skips existing files", async () => {
    await runInit({ cwd: tmpDir, yes: true, force: false, dryRun: false });
    // Write a custom marker to existing file
    const agentsPath = path.join(tmpDir, "AGENTS.md");
    await fs.appendFile(agentsPath, "\n## CUSTOM MARKER");
    // Run again without force
    await runInit({ cwd: tmpDir, yes: true, force: false, dryRun: false });
    const content = await fs.readFile(agentsPath, "utf8");
    // Custom content should be preserved (file was skipped)
    expect(content).toContain("CUSTOM MARKER");
  });
});

describe("omnix scan --write (real fs)", () => {
  it("detects Next.js stack", async () => {
    let detected = "";
    const origLog = console.log;
    console.log = (msg: string) => { detected += msg; };
    await runScan({ cwd: tmpDir, json: false });
    console.log = origLog;
    expect(detected).toContain("Next.js");
  });

  it("--write creates current-state.md", async () => {
    await runInit({ cwd: tmpDir, yes: true, force: true, dryRun: false });
    await runScan({ cwd: tmpDir, json: false, write: true });
    const statePath = path.join(tmpDir, ".obsidian-ai-memory", "02-PROJECTS", "current-state.md");
    expect(await fs.pathExists(statePath)).toBe(true);
    const content = await fs.readFile(statePath, "utf8");
    expect(content).toContain("Next.js");
  });

  it("--json returns valid JSON with projectType field", async () => {
    const results: string[] = [];
    const origLog = console.log;
    console.log = (msg: string) => results.push(msg);
    await runScan({ cwd: tmpDir, json: true });
    console.log = origLog;
    const parsed = JSON.parse(results[0]!);
    expect(parsed).toHaveProperty("projectType");
    expect(parsed).toHaveProperty("languages");
    expect(parsed).toHaveProperty("packageManager");
    expect(parsed.projectType).toBe("fullstack-saas");
  });
});

describe("omnix detect", () => {
  it("reports no markers before init", async () => {
    const results: string[] = [];
    const origLog = console.log;
    console.log = (msg: string) => results.push(msg);
    await runDetect({ cwd: tmpDir, json: true });
    console.log = origLog;
    const parsed = JSON.parse(results[0]!);
    expect(parsed.aiOsPresent).toBe(false);
  });

  it("detects markers after init", async () => {
    await runInit({ cwd: tmpDir, yes: true, force: true, dryRun: false });
    const results: string[] = [];
    const origLog = console.log;
    console.log = (msg: string) => results.push(msg);
    await runDetect({ cwd: tmpDir, json: true });
    console.log = origLog;
    const parsed = JSON.parse(results[0]!);
    expect(parsed.aiOsPresent).toBe(true);
    expect(parsed.vaultPresent).toBe(true);
  });
});

describe("omnix doctor", () => {
  it("reports failures before init", async () => {
    const results: string[] = [];
    const origLog = console.log;
    console.log = (msg: string) => results.push(msg);
    await runDoctor({ cwd: tmpDir, json: true });
    console.log = origLog;
    const parsed = JSON.parse(results[0]!);
    expect(parsed.failed).toBeGreaterThan(0);
  });

  it("passes vault checks after init", async () => {
    await runInit({ cwd: tmpDir, yes: true, force: true, dryRun: false });
    const results: string[] = [];
    const origLog = console.log;
    console.log = (msg: string) => results.push(msg);
    await runDoctor({ cwd: tmpDir, json: true });
    console.log = origLog;
    const parsed = JSON.parse(results[0]!);
    // Memory vault checks (14 of them) should all pass after init
    const memoryChecks = parsed.checks.filter((c: { category: string }) => c.category === "memory");
    const passingMemory = memoryChecks.filter((c: { pass: boolean }) => c.pass);
    expect(passingMemory.length).toBeGreaterThanOrEqual(14);
  });
});

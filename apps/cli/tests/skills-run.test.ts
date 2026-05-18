import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { runInit } from "../src/commands/init.js";
import { runSkill } from "../src/utils/skill-runner.js";
import fs from "fs-extra";
import path from "node:path";
import os from "node:os";

let tmpDir: string;

beforeEach(async () => {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "omnix-skillrun-"));
  await fs.writeFile(path.join(tmpDir, "package.json"), JSON.stringify({
    name: "test",
    scripts: { test: "echo no tests" },
  }));
});

afterEach(async () => {
  await fs.remove(tmpDir);
});

describe("omnix skills run — handlers", () => {
  it("returns 'not found' for unknown skill", async () => {
    const result = await runSkill({ cwd: tmpDir, skillName: "nonexistent-skill" });
    expect(result.hadHandler).toBe(false);
    expect(result.output).toContain("not found");
  });

  it("debugging-specialist returns hypothesis + recovery plan", async () => {
    await runInit({ cwd: tmpDir, yes: true, force: true, dryRun: false });
    const result = await runSkill({
      cwd: tmpDir,
      skillName: "debugging-specialist",
      input: "TypeError: cannot read property of undefined",
      dryRun: true,
    });
    expect(result.hadHandler).toBe(true);
    expect(result.output.toLowerCase()).toContain("hypothesis");
    expect(result.output.toLowerCase()).toContain("recovery");
  });

  it("error-intelligence parses pipe-separated input", async () => {
    await runInit({ cwd: tmpDir, yes: true, force: true, dryRun: false });
    const result = await runSkill({
      cwd: tmpDir,
      skillName: "error-intelligence",
      input: "Null pointer | Missing null guard | Added if-check | Always validate optional fields",
      dryRun: true,
    });
    expect(result.hadHandler).toBe(true);
    expect(result.output).toContain("Null pointer");
    expect(result.output).toContain("Missing null guard");
  });

  it("workflow-router routes debugging tasks correctly", async () => {
    await runInit({ cwd: tmpDir, yes: true, force: true, dryRun: false });
    const result = await runSkill({
      cwd: tmpDir,
      skillName: "workflow-router",
      input: "fix the broken login error",
    });
    expect(result.hadHandler).toBe(true);
    expect(result.output).toContain("debugging");
    expect(result.output).toContain("debugger");
  });

  it("workflow-router routes deployment tasks correctly", async () => {
    await runInit({ cwd: tmpDir, yes: true, force: true, dryRun: false });
    const result = await runSkill({
      cwd: tmpDir,
      skillName: "workflow-router",
      input: "release version 2.0 to production",
    });
    expect(result.hadHandler).toBe(true);
    expect(result.output).toContain("deployment");
  });

  it("test-architect detects framework and gaps", async () => {
    await runInit({ cwd: tmpDir, yes: true, force: true, dryRun: false });
    await fs.ensureDir(path.join(tmpDir, "src"));
    await fs.writeFile(path.join(tmpDir, "src", "utils.ts"), "export function add(a: number, b: number) { return a + b; }");

    const result = await runSkill({
      cwd: tmpDir,
      skillName: "test-architect",
      dryRun: true,
    });
    expect(result.hadHandler).toBe(true);
    expect(result.output).toMatch(/source files|test gaps|framework/i);
  });

  it("security-threat-modeler flags hardcoded password", async () => {
    await runInit({ cwd: tmpDir, yes: true, force: true, dryRun: false });
    await fs.ensureDir(path.join(tmpDir, "src"));
    await fs.writeFile(path.join(tmpDir, "src", "config.ts"), `export const config = { password: "supersecret123" };`);

    const result = await runSkill({
      cwd: tmpDir,
      skillName: "security-threat-modeler",
      dryRun: true,
    });
    expect(result.hadHandler).toBe(true);
    expect(result.output.toLowerCase()).toMatch(/password|hardcoded|finding/);
  });

  it("release-manager produces a readiness checklist", async () => {
    await runInit({ cwd: tmpDir, yes: true, force: true, dryRun: false });
    const result = await runSkill({
      cwd: tmpDir,
      skillName: "release-manager",
    });
    expect(result.hadHandler).toBe(true);
    expect(result.output.toLowerCase()).toMatch(/release|checklist|version/);
  });

  it("context-manager returns context pack with token estimate", async () => {
    await runInit({ cwd: tmpDir, yes: true, force: true, dryRun: false });
    const result = await runSkill({
      cwd: tmpDir,
      skillName: "context-manager",
      input: "add a new feature for user auth",
    });
    expect(result.hadHandler).toBe(true);
    expect(result.output).toContain("Context Pack");
    expect(result.output).toMatch(/Token estimate/);
  });

  it("dry-run does not write memory", async () => {
    await runInit({ cwd: tmpDir, yes: true, force: true, dryRun: false });
    const result = await runSkill({
      cwd: tmpDir,
      skillName: "error-intelligence",
      input: "test error",
      dryRun: true,
    });
    expect(result.memoryWritten).toEqual([]);
  });
});

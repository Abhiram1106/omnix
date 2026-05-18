import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { runHooks } from "../src/commands/hooks.js";
import fs from "fs-extra";
import path from "node:path";
import os from "node:os";

let tmpDir: string;

beforeEach(async () => {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "omnix-hooks-"));
  process.exitCode = 0;
});

afterEach(async () => {
  await fs.remove(tmpDir);
  process.exitCode = 0;
});

describe("omnix hooks", () => {
  it("fails cleanly when not a git repo", async () => {
    await runHooks({ cwd: tmpDir, install: "pre-commit", dryRun: false });
    expect(process.exitCode).toBe(1);
  });

  it("installs pre-commit hook in real git repo", async () => {
    await fs.ensureDir(path.join(tmpDir, ".git", "hooks"));
    await runHooks({ cwd: tmpDir, install: "pre-commit", dryRun: false });

    const hookPath = path.join(tmpDir, ".git", "hooks", "pre-commit");
    expect(await fs.pathExists(hookPath)).toBe(true);
    const content = await fs.readFile(hookPath, "utf8");
    expect(content).toContain("omnix check-secrets");
  });

  it("installs post-commit hook", async () => {
    await fs.ensureDir(path.join(tmpDir, ".git", "hooks"));
    await runHooks({ cwd: tmpDir, install: "post-commit", dryRun: false });

    const hookPath = path.join(tmpDir, ".git", "hooks", "post-commit");
    expect(await fs.pathExists(hookPath)).toBe(true);
    const content = await fs.readFile(hookPath, "utf8");
    expect(content).toContain("omnix session-digest");
  });

  it("install --all installs both hooks", async () => {
    await fs.ensureDir(path.join(tmpDir, ".git", "hooks"));
    await runHooks({ cwd: tmpDir, install: "all", dryRun: false });

    expect(await fs.pathExists(path.join(tmpDir, ".git", "hooks", "pre-commit"))).toBe(true);
    expect(await fs.pathExists(path.join(tmpDir, ".git", "hooks", "post-commit"))).toBe(true);
  });

  it("dry-run does not install files", async () => {
    await fs.ensureDir(path.join(tmpDir, ".git", "hooks"));
    await runHooks({ cwd: tmpDir, install: "pre-commit", dryRun: true });
    expect(await fs.pathExists(path.join(tmpDir, ".git", "hooks", "pre-commit"))).toBe(false);
  });

  it("does not overwrite non-omnix hooks", async () => {
    const hooksDir = path.join(tmpDir, ".git", "hooks");
    await fs.ensureDir(hooksDir);
    const existingHook = "#!/bin/sh\necho 'existing custom hook'\n";
    await fs.writeFile(path.join(hooksDir, "pre-commit"), existingHook, { mode: 0o755 });

    await runHooks({ cwd: tmpDir, install: "pre-commit", dryRun: false });

    const content = await fs.readFile(path.join(hooksDir, "pre-commit"), "utf8");
    expect(content).toBe(existingHook);
  });

  it("uninstall removes omnix hook", async () => {
    await fs.ensureDir(path.join(tmpDir, ".git", "hooks"));
    await runHooks({ cwd: tmpDir, install: "pre-commit", dryRun: false });
    expect(await fs.pathExists(path.join(tmpDir, ".git", "hooks", "pre-commit"))).toBe(true);

    await runHooks({ cwd: tmpDir, uninstall: "pre-commit", dryRun: false });
    expect(await fs.pathExists(path.join(tmpDir, ".git", "hooks", "pre-commit"))).toBe(false);
  });

  it("uninstall refuses to remove non-omnix hook", async () => {
    const hooksDir = path.join(tmpDir, ".git", "hooks");
    await fs.ensureDir(hooksDir);
    await fs.writeFile(path.join(hooksDir, "pre-commit"), "#!/bin/sh\n# custom\n", "utf8");

    await runHooks({ cwd: tmpDir, uninstall: "pre-commit", dryRun: false });
    // The non-omnix hook should still exist
    expect(await fs.pathExists(path.join(hooksDir, "pre-commit"))).toBe(true);
  });
});

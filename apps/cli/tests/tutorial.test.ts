import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { runInit } from "../src/commands/init.js";
import { runTutorial } from "../src/commands/tutorial.js";
import fs from "fs-extra";
import path from "node:path";
import os from "node:os";

let tmpDir: string;

beforeEach(async () => {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "omnix-tutorial-"));
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

describe("omnix tutorial", () => {
  it("suggests init when nothing is installed", async () => {
    const output = await captureStdout(() => runTutorial({ cwd: tmpDir }));
    expect(output).toMatch(/initialize|init/i);
    expect(output).toContain("npx omnix init");
  });

  it("adapts to installed state after init", async () => {
    await runInit({ cwd: tmpDir, yes: true, force: true, dryRun: false });
    const output = await captureStdout(() => runTutorial({ cwd: tmpDir }));
    // After init it should NOT suggest running init again
    expect(output).not.toContain("npx omnix init --yes");
    // It should suggest commands that build on the installed state
    expect(output).toMatch(/status|error-match|skills|hooks/i);
  });

  it("shows current setup checklist", async () => {
    const output = await captureStdout(() => runTutorial({ cwd: tmpDir }));
    expect(output).toMatch(/current setup/i);
    expect(output).toMatch(/memory vault|adapter/i);
  });
});

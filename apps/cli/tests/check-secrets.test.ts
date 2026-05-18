import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { runInit } from "../src/commands/init.js";
import { runCheckSecrets } from "../src/commands/check-secrets.js";
import fs from "fs-extra";
import path from "node:path";
import os from "node:os";

let tmpDir: string;

beforeEach(async () => {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "omnix-secrets-"));
  await fs.writeFile(path.join(tmpDir, "package.json"), JSON.stringify({ name: "test" }));
  // Reset process.exitCode between tests
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

describe("omnix check-secrets", () => {
  it("returns empty array when vault is clean", async () => {
    await runInit({ cwd: tmpDir, yes: true, force: true, dryRun: false });
    const output = await captureStdout(() =>
      runCheckSecrets({ cwd: tmpDir, fix: false, json: true })
    );
    const parsed = JSON.parse(output);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed.length).toBe(0);
    expect(process.exitCode).toBe(0);
  });

  it("detects OpenAI key in vault file", async () => {
    await runInit({ cwd: tmpDir, yes: true, force: true, dryRun: false });
    const evilPath = path.join(tmpDir, ".obsidian-ai-memory", "00-INBOX", "leaked.md");
    // Fake key constructed via concatenation — not a real secret
    const fakeKey = "sk-" + "abcdef1234567890abcdef1234567890aaa";
    await fs.writeFile(evilPath, "# Notes\n\nMy key is " + fakeKey, "utf8");

    const output = await captureStdout(() =>
      runCheckSecrets({ cwd: tmpDir, fix: false, json: true })
    );
    const parsed = JSON.parse(output);
    expect(parsed.length).toBeGreaterThan(0);
    expect(parsed[0].pattern).toContain("OpenAI");
    expect(process.exitCode).toBe(1);
  });

  it("detects AWS access key", async () => {
    await runInit({ cwd: tmpDir, yes: true, force: true, dryRun: false });
    const evilPath = path.join(tmpDir, ".obsidian-ai-memory", "00-INBOX", "aws.md");
    // AKIA + 16 chars — fake, constructed via concatenation
    const fakeAws = "AKIA" + "IOSFODNN7EXAMPLE";
    await fs.writeFile(evilPath, "AWS_ACCESS_KEY_ID=" + fakeAws + "\n", "utf8");

    const output = await captureStdout(() =>
      runCheckSecrets({ cwd: tmpDir, fix: false, json: true })
    );
    const parsed = JSON.parse(output);
    const aws = parsed.find((p: { pattern: string }) => p.pattern.includes("AWS"));
    expect(aws).toBeTruthy();
  });

  it("detects JWT tokens", async () => {
    await runInit({ cwd: tmpDir, yes: true, force: true, dryRun: false });
    const evilPath = path.join(tmpDir, ".obsidian-ai-memory", "00-INBOX", "jwt.md");
    // JWT: three base64url segments — fake, constructed via concatenation
    const fakeJwt = ["eyJhbGciOiJIUzI1NiJ9", "eyJzdWIiOiJ0ZXN0In0", "SflKxwRJSMeKKF2QT4fwpMeJf36"].join(".");
    await fs.writeFile(evilPath, "Token: " + fakeJwt + "\n", "utf8");

    const output = await captureStdout(() =>
      runCheckSecrets({ cwd: tmpDir, fix: false, json: true })
    );
    const parsed = JSON.parse(output);
    expect(parsed.some((p: { pattern: string }) => p.pattern.includes("JWT"))).toBe(true);
  });

  it("preview field never exposes full secret", async () => {
    await runInit({ cwd: tmpDir, yes: true, force: true, dryRun: false });
    // Fake key — constructed via concatenation so scanner doesn't flag source file
    const fullSecret = "sk-" + "abcdef1234567890abcdef1234567890aaa";
    await fs.writeFile(
      path.join(tmpDir, ".obsidian-ai-memory", "00-INBOX", "leaked.md"),
      fullSecret + " plus more text after",
      "utf8"
    );

    const output = await captureStdout(() =>
      runCheckSecrets({ cwd: tmpDir, fix: false, json: true })
    );
    const parsed = JSON.parse(output);
    expect(parsed[0].preview.length).toBeLessThanOrEqual(25);
    expect(parsed[0].preview).not.toBe(fullSecret);
  });

  it("scans .omnix/ directory in addition to vault", async () => {
    await runInit({ cwd: tmpDir, yes: true, force: true, dryRun: false });
    const evilPath = path.join(tmpDir, ".omnix", "settings", "leaked.md");
    // Fake GitHub token — constructed via concatenation
    const fakeGhp = "ghp_" + "abcdefghijklmnopqrstuvwxyz0123456789";
    await fs.writeFile(evilPath, fakeGhp, "utf8");

    const output = await captureStdout(() =>
      runCheckSecrets({ cwd: tmpDir, fix: false, json: true })
    );
    const parsed = JSON.parse(output);
    expect(parsed.length).toBeGreaterThan(0);
    expect(parsed.some((p: { file: string }) => p.file.includes(".omnix"))).toBe(true);
  });
});

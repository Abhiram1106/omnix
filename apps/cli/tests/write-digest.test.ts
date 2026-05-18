import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { writeDigest, renderDigest, digestTimestamp } from "../src/utils/write-digest.js";
import fs from "fs-extra";
import path from "node:path";
import os from "node:os";

let tmpDir: string;

beforeAll(async () => {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "omnix-digest-test-"));
});

afterAll(async () => {
  await fs.remove(tmpDir);
});

describe("digestTimestamp", () => {
  it("returns ISO date and HHMM time", () => {
    const { date, time } = digestTimestamp();
    expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(time).toMatch(/^\d{4}$/);
  });
});

describe("renderDigest", () => {
  it("renders all 17 fields", () => {
    const rendered = renderDigest({ tool: "claude-code" }, "2026-05-16 1200");
    expect(rendered).toContain("- Date: 2026-05-16 1200");
    expect(rendered).toContain("- Tool: claude-code");
    expect(rendered).toContain("- User Request:");
    expect(rendered).toContain("- Files Changed:");
    expect(rendered).toContain("- Decisions Made:");
    expect(rendered).toContain("- Open Questions:");
    expect(rendered).toContain("- Next Recommended Step:");
  });

  it("renders list items", () => {
    const rendered = renderDigest({
      tool: "cursor",
      filesChanged: ["src/auth.ts", "src/middleware.ts"],
      decisionsMade: ["Use JWT over sessions"],
    }, "2026-05-16 1200");
    expect(rendered).toContain("- src/auth.ts");
    expect(rendered).toContain("- src/middleware.ts");
    expect(rendered).toContain("- Use JWT over sessions");
  });

  it("renders 'none' for empty lists", () => {
    const rendered = renderDigest({ tool: "windsurf" }, "2026-05-16 1200");
    expect(rendered).toContain("none");
  });
});

describe("writeDigest", () => {
  it("writes file to correct vault path", async () => {
    const vaultDir = path.join(tmpDir, ".obsidian-ai-memory");
    await fs.ensureDir(vaultDir);

    const filePath = await writeDigest(tmpDir, {
      tool: "test-tool",
      userRequest: "test request",
      filesChanged: ["test.ts"],
    });

    expect(await fs.pathExists(filePath)).toBe(true);

    const content = await fs.readFile(filePath, "utf8");
    expect(content).toContain("- Tool: test-tool");
    expect(content).toContain("- test.ts");
  });

  it("dry-run does NOT write file", async () => {
    const filePath = await writeDigest(
      tmpDir,
      { tool: "dry-run-tool" },
      true // dryRun
    );
    expect(await fs.pathExists(filePath)).toBe(false);
  });

  it("file is in correct date folder", async () => {
    const vaultDir = path.join(tmpDir, ".obsidian-ai-memory");
    await fs.ensureDir(vaultDir);

    const filePath = await writeDigest(tmpDir, { tool: "date-test" });
    const { date } = digestTimestamp();
    expect(filePath).toContain(date);
    expect(filePath).toContain("01-SESSIONS");
  });

  it("filename includes tool slug", async () => {
    const vaultDir = path.join(tmpDir, ".obsidian-ai-memory");
    await fs.ensureDir(vaultDir);

    const filePath = await writeDigest(tmpDir, { tool: "My Cool Tool" });
    expect(path.basename(filePath)).toContain("my-cool-tool");
  });
});

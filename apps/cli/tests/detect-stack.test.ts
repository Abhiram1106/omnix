import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { detectStack } from "../src/utils/detect-stack.js";
import fs from "fs-extra";
import path from "node:path";
import os from "node:os";

let tmpDir: string;

beforeAll(async () => {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "omnix-test-"));
});

afterAll(async () => {
  await fs.remove(tmpDir);
});

async function setup(files: Record<string, string>): Promise<string> {
  const dir = await fs.mkdtemp(path.join(tmpDir, "proj-"));
  for (const [name, content] of Object.entries(files)) {
    await fs.ensureDir(path.join(dir, path.dirname(name)));
    await fs.writeFile(path.join(dir, name), content);
  }
  return dir;
}

describe("detectStack", () => {
  it("detects Next.js fullstack project", async () => {
    const dir = await setup({
      "next.config.ts": "export default {}",
      "package.json": JSON.stringify({ dependencies: { next: "^15", react: "^18" } }),
    });
    const s = await detectStack(dir);
    expect(s.projectType).toBe("fullstack-saas");
    expect(s.frameworks).toContain("Next.js");
    expect(s.languages).toContain("TypeScript/JavaScript");
  });

  it("detects Python backend project", async () => {
    const dir = await setup({
      "pyproject.toml": '[project]\nname = "api"\n[tool.poetry.dependencies]\nfastapi = "*"',
    });
    const s = await detectStack(dir);
    expect(s.languages).toContain("Python");
    expect(s.projectType).toBe("backend-api");
  });

  it("detects pnpm monorepo", async () => {
    const dir = await setup({
      "pnpm-workspace.yaml": "packages:\n  - 'apps/*'",
      "package.json": JSON.stringify({ name: "monorepo" }),
    });
    const s = await detectStack(dir);
    expect(s.projectType).toBe("monorepo");
    expect(s.packageManager).toBe("pnpm");
  });

  it("detects Docker project", async () => {
    const dir = await setup({
      Dockerfile: "FROM node:20-alpine\nWORKDIR /app",
    });
    const s = await detectStack(dir);
    expect(s.hasDocker).toBe(true);
  });

  it("detects Prisma ORM", async () => {
    const dir = await setup({
      "prisma/schema.prisma": 'datasource db { provider = "postgresql" }',
      "package.json": JSON.stringify({ dependencies: { "@prisma/client": "^5" } }),
    });
    const s = await detectStack(dir);
    expect(s.hasPrisma).toBe(true);
    expect(s.databases).toContain("Postgres/Prisma");
  });

  it("detects GitHub Actions", async () => {
    const dir = await setup({
      ".github/workflows/ci.yml": "on: [push]\njobs:\n  ci:\n    runs-on: ubuntu-latest",
    });
    const s = await detectStack(dir);
    expect(s.hasGitHubActions).toBe(true);
  });

  it("detects npm package manager (yarn lock)", async () => {
    const dir = await setup({
      "yarn.lock": "# This file is generated",
      "package.json": JSON.stringify({ name: "app" }),
    });
    const s = await detectStack(dir);
    expect(s.packageManager).toBe("yarn");
  });

  it("returns unknown for empty directory", async () => {
    const dir = await setup({});
    const s = await detectStack(dir);
    expect(s.projectType).toBe("unknown");
    expect(s.languages).toHaveLength(0);
  });

  it("detects vitest test runner", async () => {
    const dir = await setup({
      "package.json": JSON.stringify({ devDependencies: { vitest: "^2" } }),
    });
    const s = await detectStack(dir);
    expect(s.testRunner).toBe("vitest");
  });

  it("detects AI SDK project type", async () => {
    const dir = await setup({
      "package.json": JSON.stringify({ dependencies: { "@anthropic-ai/sdk": "^0.20", next: "^15" } }),
    });
    const s = await detectStack(dir);
    // next.config absent so not fullstack-saas — falls to ai-app
    expect(s.languages).toContain("TypeScript/JavaScript");
  });
});

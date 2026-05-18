/**
 * test-architect skill handler
 *
 * Analyzes the project's test setup and produces a concrete plan:
 *   - Detects test framework (Vitest, Jest, Pytest, etc.)
 *   - Counts source files vs test files (real coverage signal, not coverage report)
 *   - Identifies test gaps via mirror-path detection
 *   - Suggests the right test type (unit/integration/E2E) for each gap
 *   - Generates a starter test file for one gap if --input is a file path
 */

import path from "node:path";
import fs from "fs-extra";
import type { SkillHandler } from "../utils/skill-runner.js";

export const handler: SkillHandler = async ({ cwd, input, dryRun }) => {
  const output: string[] = ["# Test Architect", ""];

  // ── 1. Detect test framework ──────────────────────────────────────────────
  const framework = await detectFramework(cwd);
  output.push(`**Detected test framework:** ${framework.name}`);
  if (framework.configFile) output.push(`**Config file:** ${framework.configFile}`);
  output.push("");

  // ── 2. Count source vs test files ─────────────────────────────────────────
  const srcDir = await findSourceDir(cwd);
  if (!srcDir) {
    output.push("No source directory found (looked for: src/, lib/, app/).");
    output.push("Activate this skill from a project root, or pass a file path via --input.");
    return { output: output.join("\n"), memoryWrites: [] };
  }

  const sourceFiles = await listSourceFiles(srcDir, framework.language);
  const testCount = sourceFiles.filter((f) => /\.(test|spec)\.[tj]sx?$/.test(f) || /\.test\.py$/.test(f)).length;
  const codeCount = sourceFiles.length - testCount;
  const ratio = codeCount > 0 ? (testCount / codeCount).toFixed(2) : "—";

  output.push(`**Source files:** ${codeCount}`);
  output.push(`**Test files:**   ${testCount}`);
  output.push(`**Ratio:**        ${ratio} (target: ≥ 0.7 for good coverage)`);
  output.push("");

  // ── 3. Find test gaps ─────────────────────────────────────────────────────
  const gaps = await findTestGaps(cwd, srcDir, framework.language);
  if (gaps.length === 0) {
    output.push("✓ No untested source files detected. Coverage looks good structurally.");
  } else {
    output.push(`## Test gaps (${gaps.length} files without tests)`);
    output.push("");
    for (const gap of gaps.slice(0, 15)) {
      const suggestion = suggestTestType(gap);
      output.push(`  - \`${gap}\``);
      output.push(`    → suggest: **${suggestion.type}** (${suggestion.reason})`);
    }
    if (gaps.length > 15) output.push(`  ... and ${gaps.length - 15} more`);
    output.push("");
  }

  // ── 4. Generate starter test if input is a specific file path ─────────────
  const inputPath = input.trim();
  if (inputPath && await fs.pathExists(path.join(cwd, inputPath))) {
    output.push(`## Starter test for ${inputPath}`);
    output.push("");
    output.push("```typescript");
    output.push(generateStarterTest(inputPath, framework));
    output.push("```");
  }

  // ── 5. Test pyramid recommendation ────────────────────────────────────────
  output.push("");
  output.push("## Test pyramid (70/20/10 rule)");
  output.push("");
  output.push("- 70% **Unit tests** — pure functions, components, utils (fast, isolated)");
  output.push("- 20% **Integration tests** — API endpoints, DB ops (real services via Testcontainers)");
  output.push("- 10% **E2E tests** — critical user flows only (login, checkout, core happy path)");
  output.push("");
  output.push("Don't test implementation details. Test observable behavior.");

  // Write to vault
  const today = new Date().toISOString().split("T")[0]!;
  const vaultEntry = `# Test Plan — ${today}\n\nFramework: ${framework.name}\nSource files: ${codeCount}\nTest files: ${testCount}\nGaps: ${gaps.length}\n\n${output.slice(1).join("\n")}`;

  return {
    output: output.join("\n"),
    memoryWrites: dryRun ? [] : [{
      path: "06-WORKFLOWS/test-plan.md",
      content: vaultEntry,
      mode: "overwrite",
    }],
  };
};

// ── Detection helpers ────────────────────────────────────────────────────────

interface Framework {
  name: string;
  language: "ts" | "js" | "py" | "unknown";
  configFile: string | null;
}

async function detectFramework(cwd: string): Promise<Framework> {
  const checks: Array<{ file: string; framework: string; language: Framework["language"] }> = [
    { file: "vitest.config.ts", framework: "Vitest", language: "ts" },
    { file: "vitest.config.js", framework: "Vitest", language: "js" },
    { file: "vitest.config.mjs", framework: "Vitest", language: "js" },
    { file: "jest.config.ts", framework: "Jest", language: "ts" },
    { file: "jest.config.js", framework: "Jest", language: "js" },
    { file: "playwright.config.ts", framework: "Playwright", language: "ts" },
    { file: "playwright.config.js", framework: "Playwright", language: "js" },
    { file: "pytest.ini", framework: "pytest", language: "py" },
    { file: "pyproject.toml", framework: "pytest", language: "py" },
    { file: "karma.conf.js", framework: "Karma", language: "js" },
  ];

  for (const { file, framework, language } of checks) {
    if (await fs.pathExists(path.join(cwd, file))) {
      return { name: framework, language, configFile: file };
    }
  }

  // Check package.json for test scripts / framework deps
  const pkg = await fs.readJSON(path.join(cwd, "package.json")).catch(() => null);
  if (pkg) {
    const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
    if (allDeps.vitest) return { name: "Vitest (dep only)", language: "ts", configFile: null };
    if (allDeps.jest) return { name: "Jest (dep only)", language: "ts", configFile: null };
    if (allDeps.mocha) return { name: "Mocha (dep only)", language: "js", configFile: null };
    return { name: "Node — no test framework detected", language: "ts", configFile: null };
  }

  return { name: "Unknown", language: "unknown", configFile: null };
}

async function findSourceDir(cwd: string): Promise<string | null> {
  for (const dir of ["src", "lib", "app"]) {
    const full = path.join(cwd, dir);
    if (await fs.pathExists(full)) return full;
  }
  return null;
}

async function listSourceFiles(srcDir: string, language: Framework["language"]): Promise<string[]> {
  const exts = language === "py" ? [".py"] : [".ts", ".tsx", ".js", ".jsx"];
  const results: string[] = [];

  async function walk(dir: string): Promise<void> {
    const entries = await fs.readdir(dir, { withFileTypes: true }).catch(() => []);
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) {
        if (["node_modules", ".git", "dist", ".next", "__pycache__"].includes(e.name)) continue;
        await walk(full);
      } else if (exts.some((ext) => e.name.endsWith(ext))) {
        results.push(full);
      }
    }
  }
  await walk(srcDir);
  return results;
}

async function findTestGaps(cwd: string, srcDir: string, language: Framework["language"]): Promise<string[]> {
  const sourceFiles = await listSourceFiles(srcDir, language);
  const gaps: string[] = [];
  const testDirs = ["tests", "test", "__tests__", "spec"];

  for (const srcFile of sourceFiles) {
    if (/\.(test|spec)\./.test(srcFile)) continue;

    const baseName = path.basename(srcFile, path.extname(srcFile));
    const relFromSrc = path.relative(srcDir, srcFile).replace(/\.(ts|tsx|js|jsx|py)$/, "");

    let hasTest = false;
    for (const td of testDirs) {
      const candidates = [
        path.join(cwd, td, `${baseName}.test.ts`),
        path.join(cwd, td, `${baseName}.test.js`),
        path.join(cwd, td, `${relFromSrc}.test.ts`),
        path.join(cwd, td, `${relFromSrc}.test.js`),
        path.join(cwd, td, `test_${baseName}.py`),
        srcFile.replace(/\.(ts|tsx|js|jsx)$/, ".test.$1"),
        srcFile.replace(/\.(ts|tsx|js|jsx)$/, ".spec.$1"),
      ];
      for (const c of candidates) {
        if (await fs.pathExists(c)) { hasTest = true; break; }
      }
      if (hasTest) break;
    }
    if (!hasTest) gaps.push(path.relative(cwd, srcFile));
  }

  return gaps;
}

function suggestTestType(srcPath: string): { type: string; reason: string } {
  const p = srcPath.toLowerCase();
  if (/util|helper|format|parse|valid/.test(p)) return { type: "Unit", reason: "pure logic, fast tests" };
  if (/route|controller|handler|api|endpoint/.test(p)) return { type: "Integration", reason: "exercise the HTTP layer" };
  if (/component|page|view/.test(p)) return { type: "Unit (component)", reason: "render + interaction" };
  if (/repository|service|db|database/.test(p)) return { type: "Integration", reason: "real DB via Testcontainers" };
  if (/index|main|app/.test(p)) return { type: "Smoke", reason: "entry point — verify it boots" };
  return { type: "Unit", reason: "start with happy path + 2 edge cases" };
}

function generateStarterTest(filePath: string, framework: Framework): string {
  const base = path.basename(filePath, path.extname(filePath));
  if (framework.language === "py") {
    return `# tests/test_${base}.py
import pytest
from ${base.replace(/-/g, "_")} import *  # adjust import

def test_${base.replace(/-/g, "_")}_happy_path():
    # Arrange
    # Act
    # Assert
    assert True  # TODO: replace with real assertion

def test_${base.replace(/-/g, "_")}_edge_case():
    # TODO: test null/empty/boundary input
    assert True`;
  }
  return `import { describe, it, expect } from "vitest";
import { /* TODO: imports */ } from "../${filePath.replace(/\.(ts|tsx|js|jsx)$/, "")}";

describe("${base}", () => {
  it("handles the happy path", () => {
    // Arrange
    // Act
    // Assert
    expect(true).toBe(true); // TODO: replace with real assertion
  });

  it("handles null/empty input", () => {
    // TODO: test boundary cases
    expect(true).toBe(true);
  });

  it("throws on invalid input", () => {
    // TODO: test failure modes
    expect(() => { /* invoke with bad input */ }).not.toThrow(); // change to .toThrow() for negative tests
  });
});`;
}

/**
 * release-manager skill handler
 *
 * Produces a pre-release checklist for the current project:
 *   - Verifies git working tree is clean
 *   - Checks tests pass (runs the test script if present)
 *   - Validates version matches CHANGELOG
 *   - Confirms package.json fields are filled (no TODO authors / URLs)
 *   - Suggests next version based on commit messages (patch/minor/major)
 *   - Generates a release plan with exact commands
 */

import path from "node:path";
import { execSync } from "node:child_process";
import fs from "fs-extra";
import type { SkillHandler } from "../utils/skill-runner.js";

interface CheckResult {
  name: string;
  pass: boolean;
  detail: string;
}

export const handler: SkillHandler = async ({ cwd, input }) => {
  const output: string[] = ["# Release Manager", ""];
  const checks: CheckResult[] = [];

  // Helper: safe exec that returns empty on failure
  const tryExec = (cmd: string): string => {
    try {
      return execSync(cmd, { cwd, encoding: "utf8", timeout: 15000, stdio: ["ignore", "pipe", "ignore"] });
    } catch { return ""; }
  };

  // ── 1. Working tree clean? ───────────────────────────────────────────────
  const dirty = tryExec("git status --porcelain");
  checks.push({
    name: "Git working tree clean",
    pass: dirty.trim() === "",
    detail: dirty.trim() === "" ? "All changes committed" : `${dirty.split("\n").filter(Boolean).length} uncommitted change(s)`,
  });

  // ── 2. On a release branch (main/master)? ────────────────────────────────
  const branch = tryExec("git rev-parse --abbrev-ref HEAD").trim();
  checks.push({
    name: "On release branch",
    pass: branch === "main" || branch === "master",
    detail: `Current branch: ${branch || "unknown"}`,
  });

  // ── 3. Tests defined and passing? ────────────────────────────────────────
  const pkg = await fs.readJSON(path.join(cwd, "package.json")).catch(() => null);
  const testScript = pkg?.scripts?.test;
  if (testScript && !testScript.startsWith("echo")) {
    output.push("Running tests... this may take a minute.");
    output.push("");
    const testOutput = tryExec(`${detectPm(cwd)} test`);
    const passed = testOutput.includes("passed") || testOutput.includes("✓") || !testOutput.includes("failed");
    checks.push({
      name: "Tests pass",
      pass: testOutput.length > 0 && passed,
      detail: testOutput.length > 0 ? (passed ? "All tests pass" : "Tests reported failures") : "Could not run tests",
    });
  } else {
    checks.push({
      name: "Tests defined",
      pass: false,
      detail: "No test script found in package.json — add one before releasing",
    });
  }

  // ── 4. package.json metadata complete? ───────────────────────────────────
  if (pkg) {
    const metaIssues: string[] = [];
    if (!pkg.author || /TODO/i.test(pkg.author)) metaIssues.push("author");
    if (!pkg.repository?.url || /TODO/i.test(pkg.repository.url)) metaIssues.push("repository.url");
    if (!pkg.homepage || /TODO/i.test(pkg.homepage)) metaIssues.push("homepage");
    if (!pkg.bugs?.url || /TODO/i.test(pkg.bugs.url)) metaIssues.push("bugs.url");
    if (!pkg.license) metaIssues.push("license");

    checks.push({
      name: "package.json metadata complete",
      pass: metaIssues.length === 0,
      detail: metaIssues.length === 0 ? "All fields present" : `Missing/TODO: ${metaIssues.join(", ")}`,
    });
  }

  // ── 5. CHANGELOG has current version? ────────────────────────────────────
  const changelog = await fs.readFile(path.join(cwd, "CHANGELOG.md"), "utf8").catch(() => "");
  if (changelog && pkg?.version) {
    const hasVersion = changelog.includes(`[${pkg.version}]`);
    const hasUnreleased = changelog.includes("[Unreleased]");
    checks.push({
      name: "CHANGELOG up to date",
      pass: hasVersion || hasUnreleased,
      detail: hasVersion ? `Version ${pkg.version} documented` : hasUnreleased ? "[Unreleased] section present — promote to versioned" : "No version entry found",
    });
  } else if (!changelog) {
    checks.push({
      name: "CHANGELOG exists",
      pass: false,
      detail: "CHANGELOG.md not found — required for any user-facing release",
    });
  }

  // ── 6. Determine bump type from recent commits ───────────────────────────
  const log = tryExec("git log v" + (pkg?.version ?? "0.0.0") + "..HEAD --oneline 2>nul || git log --oneline -20");
  const fallbackLog = tryExec("git log --oneline -20");
  const commits = (log || fallbackLog).split("\n").filter(Boolean);
  const suggestion = suggestVersionBump(commits, pkg?.version ?? "0.0.0");

  // ── 7. Output ────────────────────────────────────────────────────────────
  output.push("## Release readiness checklist");
  output.push("");
  for (const c of checks) {
    const icon = c.pass ? "✓" : "✗";
    output.push(`- ${icon} **${c.name}** — ${c.detail}`);
  }
  output.push("");

  const passing = checks.filter((c) => c.pass).length;
  const ready = passing === checks.length;
  if (ready) {
    output.push(`✅ **${passing}/${checks.length} checks passed — ready to release**`);
  } else {
    output.push(`⚠ **${passing}/${checks.length} checks passed — fix issues above before releasing**`);
  }
  output.push("");

  // ── 8. Suggested next version ────────────────────────────────────────────
  output.push("## Version suggestion");
  output.push("");
  output.push(`Current version: \`${pkg?.version ?? "unknown"}\``);
  output.push(`Suggested next:  \`${suggestion.nextVersion}\` (${suggestion.reason})`);
  output.push(`Based on: ${commits.length} commit(s) since last release`);
  output.push("");

  // ── 9. Release plan ──────────────────────────────────────────────────────
  output.push("## Release plan");
  output.push("");
  output.push("```bash");
  output.push("# 1. Update version");
  output.push(`npm version ${suggestion.bumpType}  # ${pkg?.version ?? "?"} → ${suggestion.nextVersion}`);
  output.push("");
  output.push("# 2. Update CHANGELOG: move [Unreleased] entries under new version heading");
  output.push("");
  output.push("# 3. Verify packaging");
  output.push("npm publish --dry-run");
  output.push("");
  output.push("# 4. Tag and publish");
  output.push("git push origin main --tags");
  output.push("npm publish --access public");
  output.push("");
  output.push("# 5. Smoke test");
  output.push(`npx ${pkg?.name ?? "package"}@${suggestion.nextVersion} --version`);
  output.push("```");

  if (input.trim()) {
    output.push("");
    output.push(`> Note: input "${input.trim()}" was provided — the release-manager skill does not currently use freeform input.`);
  }

  return { output: output.join("\n"), memoryWrites: [] };
};

function detectPm(cwd: string): string {
  if (fs.existsSync(path.join(cwd, "pnpm-lock.yaml"))) return "pnpm";
  if (fs.existsSync(path.join(cwd, "yarn.lock"))) return "yarn";
  return "npm";
}

function suggestVersionBump(commits: string[], currentVersion: string): { bumpType: "patch" | "minor" | "major"; nextVersion: string; reason: string } {
  // Use Conventional Commits: feat: → minor, fix: → patch, BREAKING CHANGE → major
  let hasBreaking = false;
  let hasFeat = false;
  let hasFix = false;

  for (const c of commits) {
    if (/breaking change/i.test(c) || /!:/i.test(c)) hasBreaking = true;
    else if (/^[a-f0-9]+\s+feat[(:]/i.test(c)) hasFeat = true;
    else if (/^[a-f0-9]+\s+fix[(:]/i.test(c)) hasFix = true;
  }

  const [major = "0", minor = "0", patch = "0"] = currentVersion.split(".");

  if (hasBreaking) {
    return {
      bumpType: "major",
      nextVersion: `${Number(major) + 1}.0.0`,
      reason: "BREAKING CHANGE in commits",
    };
  }
  if (hasFeat) {
    return {
      bumpType: "minor",
      nextVersion: `${major}.${Number(minor) + 1}.0`,
      reason: "feat: commits found",
    };
  }
  if (hasFix) {
    return {
      bumpType: "patch",
      nextVersion: `${major}.${minor}.${Number(patch) + 1}`,
      reason: "fix: commits found",
    };
  }
  return {
    bumpType: "patch",
    nextVersion: `${major}.${minor}.${Number(patch) + 1}`,
    reason: "no conventional commits — defaulting to patch",
  };
}

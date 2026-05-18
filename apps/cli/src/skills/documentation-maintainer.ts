/**
 * documentation-maintainer skill handler
 *
 * Detects doc drift: finds source files changed more recently than their
 * corresponding documentation. Produces a prioritized fix list.
 */

import path from "node:path";
import { execSync } from "node:child_process";
import fs from "fs-extra";
import type { SkillHandler } from "../utils/skill-runner.js";

export const handler: SkillHandler = async ({ cwd }) => {
  const output: string[] = ["# Documentation Maintainer", ""];

  // ── 1. Find recently changed source files (Windows-safe, no shell ops) ───
  const safeExec = (cmd: string): string => {
    try {
      return execSync(cmd, { cwd, encoding: "utf8", timeout: 5000, stdio: ["ignore", "pipe", "ignore"] });
    } catch { return ""; }
  };

  let recentChanges: string[] = [];
  // Try last 10 commits first, fall back to working-tree diff
  const log10 = safeExec("git diff --name-only HEAD~10 HEAD");
  const logCurrent = log10 || safeExec("git diff --name-only HEAD");
  if (logCurrent) {
    recentChanges = logCurrent.split("\n").filter(Boolean);
  } else {
    output.push("Not a git repo or no commits — cannot detect recent changes.");
  }

  // ── 2. Check if corresponding docs were updated ─────────────────────────
  const docDrift: string[] = [];
  const docFiles = ["README.md", "CHANGELOG.md", "docs/", "openapi.yaml", "openapi.json"];

  const srcChanged = recentChanges.filter((f) =>
    /\.(ts|tsx|js|jsx|py|go|rs)$/.test(f) &&
    !f.includes(".test.") && !f.includes(".spec.")
  );

  const docChanged = recentChanges.filter((f) =>
    docFiles.some((d) => f.startsWith(d) || f === d)
  );

  if (srcChanged.length > 0 && docChanged.length === 0) {
    docDrift.push("Source files changed but no documentation was updated in the same commit range.");
    for (const f of srcChanged.slice(0, 10)) docDrift.push(`  Changed: ${f}`);
  }

  // ── 3. Check README health ────────────────────────────────────────────────
  output.push("## README health check");
  const readmePath = path.join(cwd, "README.md");
  const readme = await fs.readFile(readmePath, "utf8").catch(() => "");
  if (!readme) {
    output.push("⚠ README.md not found");
  } else {
    const issues: string[] = [];
    if (readme.length < 200) issues.push("README is very short (< 200 chars)");
    if (!readme.includes("```")) issues.push("No code examples");
    if (!readme.includes("npm install") && !readme.includes("npx") && !readme.includes("pip install")) {
      issues.push("No installation instructions");
    }
    if (readme.includes("TODO") || readme.includes("Coming soon")) {
      issues.push("README contains TODO/Coming soon placeholders");
    }
    if (issues.length === 0) {
      output.push("✓ README looks healthy");
    } else {
      for (const i of issues) output.push(`  ⚠ ${i}`);
    }
  }

  // ── 4. Check CHANGELOG ────────────────────────────────────────────────────
  output.push("");
  output.push("## CHANGELOG health check");
  const changelogPath = path.join(cwd, "CHANGELOG.md");
  const changelog = await fs.readFile(changelogPath, "utf8").catch(() => "");
  if (!changelog) {
    output.push("⚠ CHANGELOG.md not found. Create one using keep-a-changelog format.");
  } else {
    const hasUnreleased = changelog.includes("## [Unreleased]");
    const hasVersions = /## \[\d+\.\d+\.\d+\]/.test(changelog);
    if (hasUnreleased) output.push("✓ Has [Unreleased] section");
    else output.push("⚠ Missing [Unreleased] section — add entries there as you work");
    if (hasVersions) output.push("✓ Has versioned entries");
    else output.push("⚠ No versioned entries yet");
  }

  // ── 5. Doc drift summary ─────────────────────────────────────────────────
  if (docDrift.length > 0) {
    output.push("");
    output.push("## Doc drift detected");
    for (const d of docDrift) output.push(d);
    output.push("");
    output.push("**Recommended action:** Update README and/or CHANGELOG to reflect the source changes above.");
  } else if (recentChanges.length > 0) {
    output.push("");
    output.push("## Doc drift: none detected");
    output.push("Documentation was updated alongside source changes. ✓");
  }

  output.push("");
  output.push("## Next steps");
  output.push("  1. Review the issues above");
  output.push("  2. Update README.md if any public API or behavior changed");
  output.push("  3. Add entry to CHANGELOG.md [Unreleased] section");
  output.push("  4. Run `omnix session-digest --auto` after documentation updates");

  return { output: output.join("\n"), memoryWrites: [] };
};

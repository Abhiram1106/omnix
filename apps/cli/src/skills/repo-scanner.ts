/**
 * repo-scanner skill handler
 *
 * Produces a code intelligence report: entry points, hotspots, test gaps,
 * coupling signals, and a health score. Writes results to vault.
 */

import path from "node:path";
import fs from "fs-extra";
import type { SkillHandler } from "../utils/skill-runner.js";
import { detectStack } from "../utils/detect-stack.js";

export const handler: SkillHandler = async ({ cwd, vaultRoot, dryRun }) => {
  const output: string[] = ["# Repo Scanner — Code Intelligence", ""];

  const stack = await detectStack(cwd);

  // For monorepos: scan each package, then aggregate
  const scanDirs: Array<{ label: string; dir: string }> = [];
  if (stack.isMonorepo && stack.monorepoPackages.length > 0) {
    for (const pkg of stack.monorepoPackages) {
      scanDirs.push({ label: pkg.path, dir: path.join(cwd, pkg.path) });
    }
    output.push(`**Monorepo:** ${stack.monorepoTool} · ${stack.monorepoPackages.length} packages`);
    output.push("");
  } else {
    scanDirs.push({ label: "root", dir: cwd });
  }

  const allHotspots: Array<{ path: string; lines: number }> = [];
  const allTestGaps: string[] = [];
  const allRisks: string[] = [];
  const allEntryPoints: string[] = [];
  let totalScore = 0;

  for (const target of scanDirs) {
    const report = await scanRepo(target.dir, target.label !== "root" ? target.label : undefined);
    allEntryPoints.push(...report.entryPoints);
    allHotspots.push(...report.hotspots);
    allTestGaps.push(...report.testGaps);
    allRisks.push(...report.risks);
    totalScore += report.score;
  }

  allHotspots.sort((a, b) => b.lines - a.lines);
  allHotspots.splice(15);

  const avgScore = Math.round(totalScore / (scanDirs.length || 1));
  const riskLevel = avgScore >= 80 ? "Low" : avgScore >= 60 ? "Medium" : "High";
  const report = { score: avgScore, riskLevel, entryPoints: allEntryPoints, hotspots: allHotspots, testGaps: allTestGaps, risks: allRisks };

  output.push(`**Engineering Score:** ${report.score}/100`);
  output.push(`**Risk level:** ${report.riskLevel}`);
  output.push("");

  output.push("## Entry points");
  if (report.entryPoints.length > 0) {
    for (const e of report.entryPoints) output.push(`  - ${e}`);
  } else {
    output.push("  None detected");
  }
  output.push("");

  output.push("## Hotspots (large files)");
  if (report.hotspots.length > 0) {
    for (const h of report.hotspots) output.push(`  - ${h.path}  (${h.lines} lines)`);
  } else {
    output.push("  No files > 200 lines");
  }
  output.push("");

  output.push("## Test gaps");
  if (report.testGaps.length > 0) {
    const shown = report.testGaps.slice(0, 10);
    for (const g of shown) output.push(`  - ${g}`);
    if (report.testGaps.length > 10) output.push(`  ... and ${report.testGaps.length - 10} more`);
  } else {
    output.push("  No gaps detected");
  }
  output.push("");

  output.push("## Risks");
  if (report.risks.length > 0) {
    for (const r of report.risks) output.push(`  ⚠ ${r}`);
  } else {
    output.push("  No risks detected");
  }

  // Write to vault
  const today = new Date().toISOString().split("T")[0];
  const vaultEntry = `# Repo Scan — ${today}\n\n` + output.slice(1).join("\n");

  return {
    output: output.join("\n"),
    memoryWrites: dryRun ? [] : [{
      path: "05-ARCHITECTURE/repo-scan.md",
      content: vaultEntry,
      mode: "overwrite",
    }],
  };
};

async function scanRepo(cwd: string, pathPrefix?: string) {
  let score = 100;
  const risks: string[] = [];
  const entryPoints: string[] = [];
  const hotspots: { path: string; lines: number }[] = [];
  const testGaps: string[] = [];

  const label = pathPrefix ? `${pathPrefix}/` : "";

  // Entry points
  for (const p of ["src/index.ts", "src/main.ts", "index.ts", "main.ts", "bin/index.js", "app.py", "main.py"]) {
    if (await fs.pathExists(path.join(cwd, p))) entryPoints.push(`${label}${p}`);
  }

  // Hotspots
  const srcDirs = ["src", "lib", "app", "pages"];
  for (const dir of srcDirs) {
    const dirPath = path.join(cwd, dir);
    if (!(await fs.pathExists(dirPath))) continue;
    const files = await getFilesRec(dirPath, [".ts", ".tsx", ".js", ".jsx", ".py"]);
    for (const f of files) {
      try {
        const lines = (await fs.readFile(f, "utf8")).split("\n").length;
        if (lines > 200) hotspots.push({ path: `${label}${path.relative(cwd, f)}`, lines });
      } catch { /* skip */ }
    }
  }
  hotspots.sort((a, b) => b.lines - a.lines);
  hotspots.splice(10);

  if (hotspots.some((h) => h.lines > 500)) {
    risks.push(`${hotspots.filter((h) => h.lines > 500).length} file(s) exceed 500 lines — split them`);
    score -= 10;
  }

  // Test gaps (mirror path detection)
  const srcDir = path.join(cwd, "src");
  if (await fs.pathExists(srcDir)) {
    const srcFiles = await getFilesRec(srcDir, [".ts", ".tsx", ".js"]);
    for (const f of srcFiles) {
      if (f.includes(".test.") || f.includes(".spec.")) continue;
      const base = path.basename(f, path.extname(f));
      const rel = path.relative(path.join(cwd, "src"), f).replace(/\.(ts|tsx|js)$/, "");
      let hasTest = false;
      for (const dir of ["tests", "test", "__tests__"]) {
        const candidates = [
          path.join(cwd, dir, `${base}.test.ts`),
          path.join(cwd, dir, `${rel}.test.ts`),
          f.replace(/\.(ts|tsx|js)$/, ".test.$1"),
        ];
        for (const c of candidates) {
          if (await fs.pathExists(c)) { hasTest = true; break; }
        }
        if (hasTest) break;
      }
      if (!hasTest) testGaps.push(`${label}${path.relative(cwd, f)}`);
    }
  }
  if (testGaps.length > 10) { risks.push(`${testGaps.length} src files without tests`); score -= 15; }
  else if (testGaps.length > 0) score -= 5;

  // Gitignore check
  const gitignore = await fs.readFile(path.join(cwd, ".gitignore"), "utf8").catch(() => "");
  if (!gitignore.includes(".env")) { risks.push(".env not gitignored"); score -= 10; }
  if (await fs.pathExists(path.join(cwd, ".env")) && !gitignore.includes(".env")) {
    risks.push(".env EXISTS and not gitignored — CRITICAL");
    score -= 20;
  }

  return { score: Math.max(0, score), entryPoints, hotspots, testGaps, risks };
}

async function getFilesRec(dir: string, exts: string[]): Promise<string[]> {
  const results: string[] = [];
  const entries = await fs.readdir(dir, { withFileTypes: true }).catch(() => []);
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory() && !["node_modules", ".git", "dist", ".next"].includes(e.name)) {
      results.push(...await getFilesRec(full, exts));
    } else if (exts.some((ext) => e.name.endsWith(ext))) {
      results.push(full);
    }
  }
  return results;
}

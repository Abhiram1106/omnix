import path from "node:path";
import fs from "fs-extra";
import { detectStack, type MonorepoPackage } from "../utils/detect-stack.js";
import { logger } from "../utils/logger.js";
import { exists, cwdPath, VAULT_DIR } from "../utils/paths.js";

export interface WorkspaceOptions {
  cwd: string;
  json: boolean;
  /** Show per-package health score breakdown */
  health: boolean;
}

interface PackageHealth {
  name: string;
  path: string;
  type: string;
  hasTests: boolean;
  hasTypecheck: boolean;
  hasLint: boolean;
  hasReadme: boolean;
  hasOmnixRule: boolean;
  score: number;
  grade: string;
}

export async function runWorkspace(opts: WorkspaceOptions): Promise<void> {
  const stack = await detectStack(opts.cwd);

  if (!stack.isMonorepo) {
    logger.warn("Not a monorepo — no workspace packages detected.");
    logger.dim("Omnix detects monorepos via: turbo.json, nx.json, lerna.json, pnpm-workspace.yaml");
    return;
  }

  logger.header(`Workspace — ${stack.monorepoTool} · ${stack.monorepoPackages.length} packages`);

  const healthResults = await Promise.all(
    stack.monorepoPackages.map((pkg) => scorePackage(opts.cwd, pkg))
  );

  if (opts.json) {
    console.log(JSON.stringify(healthResults, null, 2));
    return;
  }

  // Group by parent directory
  const grouped: Record<string, PackageHealth[]> = {};
  for (const result of healthResults) {
    const parent = result.path.split("/")[0]!;
    (grouped[parent] ??= []).push(result);
  }

  for (const [group, packages] of Object.entries(grouped)) {
    logger.header(group + "/");
    for (const pkg of packages) {
      const bar = gradeBar(pkg.score);
      logger.info(`  ${pkg.grade}  ${bar}  ${pkg.name}  (${pkg.path})`);
      if (opts.health) {
        logger.dim(`       tests:${pkg.hasTests ? "✓" : "✗"}  typecheck:${pkg.hasTypecheck ? "✓" : "✗"}  lint:${pkg.hasLint ? "✓" : "✗"}  readme:${pkg.hasReadme ? "✓" : "✗"}  omnix-rule:${pkg.hasOmnixRule ? "✓" : "✗"}`);
      }
    }
    logger.blank();
  }

  const avgScore = Math.round(
    healthResults.reduce((s, p) => s + p.score, 0) / (healthResults.length || 1)
  );
  logger.info(`Overall workspace health: ${scoreGrade(avgScore)} (${avgScore}/100)`);
  logger.blank();
  logger.dim("Run `omnix workspace --health` for per-package breakdown.");
  logger.dim("Edit .claude/rules/packages/<name>.md to fill in package boundaries.");
}

async function scorePackage(cwd: string, pkg: MonorepoPackage): Promise<PackageHealth> {
  const pkgDir = path.join(cwd, pkg.path);

  const [hasTests, hasTypecheck, hasLint, hasReadme, hasOmnixRule] = await Promise.all([
    hasTestDir(pkgDir),
    hasTypecheckScript(pkgDir),
    hasLintScript(pkgDir),
    exists(path.join(pkgDir, "README.md")),
    exists(cwdPath(cwd, `.claude/rules/packages/${pkg.name.replace(/\//g, "__")}.md`)),
  ]);

  let score = 0;
  if (hasTests) score += 30;
  if (hasTypecheck) score += 25;
  if (hasLint) score += 20;
  if (hasReadme) score += 15;
  if (hasOmnixRule) score += 10;

  return {
    name: pkg.name,
    path: pkg.path,
    type: pkg.type,
    hasTests,
    hasTypecheck,
    hasLint,
    hasReadme,
    hasOmnixRule,
    score,
    grade: scoreGrade(score),
  };
}

async function hasTestDir(pkgDir: string): Promise<boolean> {
  for (const dir of ["tests", "test", "__tests__", "src"]) {
    if (await fs.pathExists(path.join(pkgDir, dir))) {
      // Check for test files inside
      const entries = await fs.readdir(path.join(pkgDir, dir)).catch(() => [] as string[]);
      if (entries.some((e) => e.endsWith(".test.ts") || e.endsWith(".test.js") || e.endsWith(".spec.ts") || e.endsWith(".spec.js"))) {
        return true;
      }
    }
  }
  return false;
}

async function hasTypecheckScript(pkgDir: string): Promise<boolean> {
  try {
    const raw = await fs.readFile(path.join(pkgDir, "package.json"), "utf8");
    return raw.includes('"typecheck"') || raw.includes('"tsc"');
  } catch {
    return false;
  }
}

async function hasLintScript(pkgDir: string): Promise<boolean> {
  try {
    const raw = await fs.readFile(path.join(pkgDir, "package.json"), "utf8");
    return raw.includes('"lint"') || raw.includes('"eslint"') || raw.includes('"biome"');
  } catch {
    return false;
  }
}

function scoreGrade(score: number): string {
  if (score >= 90) return "A+";
  if (score >= 80) return "A";
  if (score >= 70) return "B";
  if (score >= 60) return "C";
  if (score >= 50) return "D";
  return "F";
}

function gradeBar(score: number): string {
  const filled = Math.round(score / 10);
  return "█".repeat(filled) + "░".repeat(10 - filled);
}

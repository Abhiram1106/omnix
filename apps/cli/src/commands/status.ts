import path from "node:path";
import fs from "fs-extra";
import { VAULT_DIR, OMNIX_DIR, cwdPath, exists } from "../utils/paths.js";
import { ADAPTER_FILES } from "../utils/adapter-files.js";
import { ALL_ADAPTERS } from "../utils/prompts.js";
import { logger } from "../utils/logger.js";

export interface StatusOptions {
  cwd: string;
  json: boolean;
}

interface StatusResult {
  score: number;            // 0–100 health score
  grade: string;            // A / B / C / D / F
  vaultPresent: boolean;
  vaultFolders: { name: string; files: number }[];
  sessionCount: number;
  errorMemoryEntries: number;
  lastSessionDate: string | null;
  installedAdapters: string[];
  missingAdapters: string[];
  gitignoreOk: boolean;
  omnixDirPresent: boolean;
  projectContextCustomized: boolean;
  issues: string[];
  suggestions: string[];
}

export async function runStatus(opts: StatusOptions): Promise<void> {
  const result = await computeStatus(opts.cwd);

  if (opts.json) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  // ── Header ────────────────────────────────────────────────────────────────
  logger.header("Omnix Status");
  logger.blank();

  // Health score bar
  const bar = buildScoreBar(result.score);
  const gradeColor = result.score >= 80 ? "green" : result.score >= 50 ? "yellow" : "red";
  console.log(`  Health Score   ${bar}  ${result.score}/100  (${result.grade})`);
  if (gradeColor === "red") logger.warn("  Score below 50 — critical issues need attention.");
  logger.blank();

  // ── Vault ─────────────────────────────────────────────────────────────────
  console.log("VAULT");
  logger.row("Vault present",      result.vaultPresent ? "yes" : "NO",     result.vaultPresent);
  logger.row("Session count",      String(result.sessionCount),             result.sessionCount > 0);
  logger.row("Last session",       result.lastSessionDate ?? "none yet",    result.lastSessionDate !== null);
  logger.row("Error memory",       `${result.errorMemoryEntries} entries`,  true);
  logger.row("project-context.md", result.projectContextCustomized ? "customized" : "needs setup", result.projectContextCustomized);
  logger.row(".gitignore guard",   result.gitignoreOk ? "ok" : "MISSING",  result.gitignoreOk);
  logger.blank();

  // ── Adapters ──────────────────────────────────────────────────────────────
  console.log("ADAPTERS");
  if (result.installedAdapters.length > 0) {
    logger.row("Installed", result.installedAdapters.join(", "), true);
  } else {
    logger.row("Installed", "none — run omnix install-adapters", false);
  }
  if (result.missingAdapters.length > 0) {
    logger.dim(`  Not installed: ${result.missingAdapters.join(", ")}`);
  }
  logger.blank();

  // ── Issues ────────────────────────────────────────────────────────────────
  if (result.issues.length > 0) {
    console.log("ISSUES");
    for (const issue of result.issues) {
      logger.warn(`  ${issue}`);
    }
    logger.blank();
  }

  // ── Suggestions ───────────────────────────────────────────────────────────
  if (result.suggestions.length > 0) {
    console.log("NEXT STEPS");
    for (const s of result.suggestions) {
      logger.dim(`  → ${s}`);
    }
    logger.blank();
  }

  if (result.issues.length === 0) {
    logger.success("No critical issues found.");
  }
}

async function computeStatus(cwd: string): Promise<StatusResult> {
  const issues: string[] = [];
  const suggestions: string[] = [];
  let score = 100;

  // Vault present
  const vaultRoot = cwdPath(cwd, VAULT_DIR);
  const vaultPresent = await exists(vaultRoot);
  if (!vaultPresent) {
    issues.push("Memory vault not found. Run `omnix init`.");
    suggestions.push("omnix init --yes");
    score -= 30;
  }

  // Vault folders + file counts
  const vaultFolders: { name: string; files: number }[] = [];
  if (vaultPresent) {
    const folders = await fs.readdir(vaultRoot).catch(() => [] as string[]);
    for (const folder of folders) {
      const fp = path.join(vaultRoot, folder);
      const st = await fs.stat(fp).catch(() => null);
      if (!st?.isDirectory()) continue;
      const files = await fs.readdir(fp).catch(() => [] as string[]);
      vaultFolders.push({ name: folder, files: files.length });
    }
  }

  // Session count + last session
  const sessionsDir = path.join(vaultRoot, "01-SESSIONS");
  let sessionCount = 0;
  let lastSessionDate: string | null = null;
  if (await exists(sessionsDir)) {
    const dateDirs = (await fs.readdir(sessionsDir))
      .filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d))
      .sort()
      .reverse();
    lastSessionDate = dateDirs[0] ?? null;
    for (const d of dateDirs) {
      const files = await fs.readdir(path.join(sessionsDir, d)).catch(() => []);
      sessionCount += files.filter((f) => f.endsWith(".md")).length;
    }
  }
  if (sessionCount === 0 && vaultPresent) {
    suggestions.push("Write your first session digest: omnix session-digest --tool claude-code");
  }

  // Error memory entries
  const errorMemPath = path.join(vaultRoot, "03-ERRORS", "error-memory.md");
  let errorMemoryEntries = 0;
  if (await exists(errorMemPath)) {
    const content = await fs.readFile(errorMemPath, "utf8").catch(() => "");
    errorMemoryEntries = (content.match(/^## /gm) ?? []).length;
  }

  // project-context.md customized
  const ctxPath = path.join(vaultRoot, "02-PROJECTS", "project-context.md");
  const ctxContent = await fs.readFile(ctxPath, "utf8").catch(() => "");
  const projectContextCustomized = ctxContent.length > 100 && !ctxContent.includes("TODO");
  if (!projectContextCustomized && vaultPresent) {
    issues.push("project-context.md has TODO markers or is empty. Edit it with your project details.");
    suggestions.push("omnix scan --write   (auto-populate project-context.md)");
    score -= 10;
  }

  // .gitignore guard
  const gitignore = await fs.readFile(path.join(cwd, ".gitignore"), "utf8").catch(() => "");
  const gitignoreOk = gitignore.includes(".omnix/memory/");
  if (!gitignoreOk) {
    issues.push(".omnix/memory/ not in .gitignore — risk of committing memory data.");
    suggestions.push("omnix init   (auto-adds .omnix/memory/ to .gitignore)");
    score -= 10;
  }

  // .omnix/ dir
  const omnixDirPresent = await exists(cwdPath(cwd, OMNIX_DIR));
  if (!omnixDirPresent) {
    issues.push(".omnix/ config directory missing. Run `omnix init`.");
    score -= 10;
  }

  // Installed adapters
  const installedAdapters: string[] = [];
  const missingAdapters: string[] = [];
  for (const adapter of ALL_ADAPTERS) {
    const files = ADAPTER_FILES[adapter] ?? [];
    const anyInstalled = (await Promise.all(files.map((f) => exists(path.join(cwd, f.dest))))).some(Boolean);
    if (anyInstalled) installedAdapters.push(adapter);
    else missingAdapters.push(adapter);
  }
  if (installedAdapters.length === 0) {
    issues.push("No AI tool adapters installed. Run `omnix install-adapters`.");
    score -= 20;
  }

  // Large vault warning
  if (sessionCount > 200) {
    suggestions.push(`Vault has ${sessionCount} sessions. Run: omnix memory --compact`);
    score -= 5;
  }

  const grade = score >= 90 ? "A" : score >= 75 ? "B" : score >= 60 ? "C" : score >= 40 ? "D" : "F";

  return {
    score: Math.max(0, score),
    grade,
    vaultPresent,
    vaultFolders,
    sessionCount,
    errorMemoryEntries,
    lastSessionDate,
    installedAdapters,
    missingAdapters,
    gitignoreOk,
    omnixDirPresent,
    projectContextCustomized,
    issues,
    suggestions,
  };
}

function buildScoreBar(score: number): string {
  const filled = Math.round(score / 5);
  const empty = 20 - filled;
  return `[${"█".repeat(filled)}${"░".repeat(empty)}]`;
}

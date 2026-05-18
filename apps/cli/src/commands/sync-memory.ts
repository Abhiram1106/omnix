import path from "node:path";
import fs from "fs-extra";
import { VAULT_DIR, VAULT_FOLDERS, cwdPath, exists, templatesDir } from "../utils/paths.js";
import { logger } from "../utils/logger.js";

export interface SyncMemoryOptions {
  cwd: string;
  fix: boolean;
  dryRun: boolean;
  compress?: boolean;
  /** Print vault size stats (file count, total KB per folder). */
  stats?: boolean;
  /** Archive (move) sessions older than N days to 10-DAILY-DIGESTS/archive/. Default: 90 */
  prune?: number;
}

export async function runSyncMemory(opts: SyncMemoryOptions): Promise<void> {
  if (opts.dryRun) logger.warn("Dry-run mode: no files will be written.\n");

  logger.header("Sync Memory");

  const vaultRoot = cwdPath(opts.cwd, VAULT_DIR);
  let fixed = 0;
  let issues = 0;

  // Check vault root
  if (!(await exists(vaultRoot))) {
    logger.error(`${VAULT_DIR}/ not found.`);
    logger.dim("  Run `omnix init` to initialize the vault.");
    process.exitCode = 1;
    return;
  }

  logger.row(VAULT_DIR + "/", "present", true);

  // Check/fix required folders
  for (const folder of VAULT_FOLDERS) {
    const folderPath = path.join(vaultRoot, folder);
    const ok = await exists(folderPath);
    if (!ok) {
      issues++;
      logger.row(folder + "/", "MISSING", false);
      if (opts.fix) {
        if (!opts.dryRun) {
          await fs.ensureDir(folderPath);
          // Copy README from bundled templates if available
          const tplReadme = path.join(templatesDir(), "vault", folder, "README.md");
          const destReadme = path.join(folderPath, "README.md");
          if (await exists(tplReadme)) {
            await fs.copyFile(tplReadme, destReadme);
          }
        }
        logger.success(`  created ${folder}/`);
        fixed++;
      }
    } else {
      logger.row(folder + "/", "ok", true);
    }
  }

  // Check required files
  const requiredFiles: [string, string][] = [
    ["02-PROJECTS/project-context.md", "Project context template"],
    ["03-ERRORS/error-memory.md", "# Error Memory\n\n"],
    ["03-ERRORS/anti-patterns.md", "# Anti-patterns\n\n"],
    ["templates/session-digest.md", ""],
    ["templates/error-entry.md", ""],
  ];

  for (const [relPath, stub] of requiredFiles) {
    const filePath = path.join(vaultRoot, relPath);
    const ok = await exists(filePath);
    if (!ok) {
      issues++;
      logger.row(relPath, "MISSING", false);
      if (opts.fix && stub) {
        if (!opts.dryRun) {
          await fs.ensureDir(path.dirname(filePath));
          // Try bundled template first
          const tplPath = path.join(
            templatesDir(),
            "vault",
            relPath
          );
          if (await exists(tplPath)) {
            await fs.copyFile(tplPath, filePath);
          } else if (stub) {
            await fs.writeFile(filePath, stub, "utf8");
          }
        }
        logger.success(`  created ${relPath}`);
        fixed++;
      }
    } else {
      logger.row(relPath, "ok", true);
    }
  }

  // Check malformed session filenames
  const sessionsDir = path.join(vaultRoot, "01-SESSIONS");
  if (await exists(sessionsDir)) {
    const dateDirs = await fs.readdir(sessionsDir).catch(() => [] as string[]);
    for (const dateDir of dateDirs) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dateDir)) {
        issues++;
        logger.warn(`  Unexpected directory in 01-SESSIONS: ${dateDir}`);
      }
    }
  }

  logger.blank();
  if (issues === 0) {
    logger.success("Vault is healthy.");
  } else if (opts.fix) {
    logger.success(`Fixed ${fixed}/${issues} issues.`);
    if (fixed < issues) {
      logger.warn(`${issues - fixed} issue(s) could not be auto-fixed.`);
    }
  } else {
    logger.warn(`${issues} issue(s) found. Run with --fix to repair.`);
  }

  // ---- Always: regenerate vault-index.md (lightweight memory bank) ----
  await regenerateVaultIndex(vaultRoot, opts.dryRun);

  // ---- Session compression (rolling weekly summaries) ----
  if (opts.compress) {
    await compressSessions(vaultRoot, opts.dryRun);
  }

  // ---- Vault stats ----
  if (opts.stats) {
    await printVaultStats(vaultRoot);
  }

  // ---- Prune old sessions ----
  if (opts.prune !== undefined) {
    await pruneSessions(vaultRoot, opts.prune, opts.dryRun);
  }
}

/** Compress sessions older than 7 days into weekly summary files. */
async function compressSessions(vaultRoot: string, dryRun: boolean): Promise<void> {
  logger.blank();
  logger.header("Session Compression");

  const sessionsDir = path.join(vaultRoot, "01-SESSIONS");
  if (!(await exists(sessionsDir))) {
    logger.dim("  No sessions dir — nothing to compress.");
    return;
  }

  const dateDirs = (await fs.readdir(sessionsDir))
    .filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d))
    .sort();

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 7);
  const cutoffStr = cutoff.toISOString().split("T")[0]!;

  const old = dateDirs.filter((d) => d < cutoffStr);

  if (old.length === 0) {
    logger.dim("  No sessions older than 7 days — nothing to compress.");
    return;
  }

  // Group by ISO week
  const byWeek = new Map<string, string[]>();
  for (const dateDir of old) {
    const d = new Date(dateDir);
    const weekNum = getISOWeek(d);
    const weekKey = `${d.getFullYear()}-W${String(weekNum).padStart(2, "0")}`;
    if (!byWeek.has(weekKey)) byWeek.set(weekKey, []);
    byWeek.get(weekKey)!.push(dateDir);
  }

  for (const [weekKey, days] of byWeek) {
    const firstDay = days[0]!;
    const lastDay = days[days.length - 1]!;
    const summaryPath = path.join(vaultRoot, "10-DAILY-DIGESTS", `${weekKey}-summary.md`);

    if (await exists(summaryPath)) {
      logger.dim(`  skip (exists) ${weekKey}-summary.md`);
      continue;
    }

    // Collect all session digests for this week
    const sessionEntries: string[] = [];
    let totalSessions = 0;
    for (const day of days) {
      const dayDir = path.join(sessionsDir, day);
      const files = await fs.readdir(dayDir).catch(() => [] as string[]);
      for (const f of files.filter((f) => f.endsWith(".md"))) {
        totalSessions++;
        const content = await fs.readFile(path.join(dayDir, f), "utf8").catch(() => "");
        // Extract key fields only (Next Recommended Step, Decisions Made)
        const nextStep = content.match(/- Next Recommended Step:\s*(.+)/)?.[1]?.trim() ?? "";
        const decisions = content.match(/- Decisions Made:\s*\n((?:- .+\n?)*)/)?.[1]?.trim() ?? "";
        const tool = content.match(/- Tool:\s*(.+)/)?.[1]?.trim() ?? "unknown";
        if (nextStep || decisions) {
          sessionEntries.push(`### ${day} (${tool})\n${decisions ? `Decisions: ${decisions}\n` : ""}${nextStep ? `Next step: ${nextStep}` : ""}`);
        }
      }
    }

    const summaryContent = `# Weekly Summary — ${weekKey} (${firstDay} to ${lastDay})

- Sessions: ${totalSessions} across ${days.length} days
- Compressed: ${new Date().toISOString().split("T")[0]}
- Original files: preserved in 01-SESSIONS/

## Key decisions and next steps

${sessionEntries.length > 0 ? sessionEntries.join("\n\n") : "_No significant decisions or next steps recorded._"}

---
_Generated by omnix sync-memory --compress_
`;

    if (!dryRun) {
      await fs.ensureDir(path.join(vaultRoot, "10-DAILY-DIGESTS"));
      await fs.writeFile(summaryPath, summaryContent, "utf8");
    }
    logger.success(`  ${dryRun ? "[dry-run] " : ""}${weekKey}-summary.md (${totalSessions} sessions compressed)`);
  }
}

/**
 * Regenerate vault-index.md — a lightweight memory bank (one line per session).
 * Loaded by context-manager instead of full session digests.
 * Pattern: Agent-Skills-for-Context-Engineering memory bank (lightweight identifiers).
 */
async function regenerateVaultIndex(vaultRoot: string, dryRun: boolean): Promise<void> {
  const sessionsDir = path.join(vaultRoot, "01-SESSIONS");
  if (!(await exists(sessionsDir))) return;

  const dateDirs = (await fs.readdir(sessionsDir))
    .filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d))
    .sort()
    .reverse()
    .slice(0, 30); // last 30 days max

  const lines: string[] = [
    "# Vault Index",
    "> Auto-generated by omnix sync-memory. One line per session for lightweight context loading.",
    "> Load full session via: 01-SESSIONS/YYYY-MM-DD/session-*.md",
    "",
    "| Date | Tool | Files Changed | Next Step |",
    "|------|------|--------------|-----------|",
  ];

  for (const dateDir of dateDirs) {
    const dayDir = path.join(sessionsDir, dateDir);
    const sessionFiles = (await fs.readdir(dayDir))
      .filter((f) => f.endsWith(".md"))
      .sort()
      .reverse();

    for (const sf of sessionFiles) {
      const content = await fs.readFile(path.join(dayDir, sf), "utf8").catch(() => "");
      const tool = content.match(/- Tool:\s*(.+)/)?.[1]?.trim() ?? "unknown";
      // Count only lines under the "Files Changed:" section, not every list item
      const filesChangedSection = content.match(/- Files Changed:\n((?:\s*-[^\n]*\n)*)/)?.[1] ?? "";
      const filesChanged = filesChangedSection.split("\n").filter((l) => /^\s*-\s/.test(l)).length;
      const nextStep = content.match(/- Next Recommended Step:\s*(.+)/)?.[1]?.trim() ?? "";
      const truncatedNext = nextStep.length > 60 ? nextStep.slice(0, 57) + "..." : nextStep;
      // Escape pipe characters so they don't break the markdown table
      const safeTool = tool.replace(/\|/g, "\\|");
      const safeNext = truncatedNext.replace(/\|/g, "\\|");
      lines.push(`| ${dateDir} | ${safeTool} | ${filesChanged} files | ${safeNext} |`);
    }
  }

  lines.push("");
  lines.push(`_Last updated: ${new Date().toISOString().split("T")[0]}_`);

  const indexPath = path.join(vaultRoot, "02-PROJECTS", "vault-index.md");
  if (!dryRun) {
    await fs.ensureDir(path.join(vaultRoot, "02-PROJECTS"));
    await fs.writeFile(indexPath, lines.join("\n"), "utf8");
  }
  logger.dim(`  vault-index.md updated (${dateDirs.length} session days indexed)`);
}

/** Print per-folder file count and total KB — gives a quick signal before vault becomes noise. */
async function printVaultStats(vaultRoot: string): Promise<void> {
  logger.blank();
  logger.header("Vault Stats");

  const folders = await fs.readdir(vaultRoot).catch(() => [] as string[]);
  let grandTotal = 0;
  let grandFiles = 0;

  for (const folder of folders.sort()) {
    const folderPath = path.join(vaultRoot, folder);
    const stat = await fs.stat(folderPath).catch(() => null);
    if (!stat?.isDirectory()) continue;

    const files = await getAllFiles(folderPath);
    const totalBytes = files.reduce((sum, f) => sum + f.size, 0);
    const kb = Math.round(totalBytes / 1024);
    grandTotal += totalBytes;
    grandFiles += files.length;
    logger.row(folder, `${files.length} files · ${kb} KB`, files.length > 0);
  }

  logger.blank();
  logger.row("Total", `${grandFiles} files · ${Math.round(grandTotal / 1024)} KB`, true);

  if (grandFiles > 200) {
    logger.warn("Vault has 200+ files. Consider running `omnix sync-memory --compress` or `--prune 90`.");
  }
}

async function getAllFiles(dir: string): Promise<Array<{ size: number }>> {
  const entries = await fs.readdir(dir, { withFileTypes: true }).catch(() => []);
  const results: Array<{ size: number }> = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...await getAllFiles(full));
    } else {
      const s = await fs.stat(full).catch(() => null);
      if (s) results.push({ size: s.size });
    }
  }
  return results;
}

/** Move session dirs older than `days` to 10-DAILY-DIGESTS/archive/ to keep vault lean. */
async function pruneSessions(vaultRoot: string, days: number, dryRun: boolean): Promise<void> {
  logger.blank();
  logger.header(`Pruning sessions older than ${days} days`);

  const sessionsDir = path.join(vaultRoot, "01-SESSIONS");
  if (!(await exists(sessionsDir))) {
    logger.dim("  No sessions dir — nothing to prune.");
    return;
  }

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffStr = cutoff.toISOString().split("T")[0]!;

  const dateDirs = (await fs.readdir(sessionsDir))
    .filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d) && d < cutoffStr)
    .sort();

  if (dateDirs.length === 0) {
    logger.dim(`  No sessions older than ${days} days.`);
    return;
  }

  const archiveDir = path.join(vaultRoot, "10-DAILY-DIGESTS", "archive");

  for (const dateDir of dateDirs) {
    const src = path.join(sessionsDir, dateDir);
    const dest = path.join(archiveDir, dateDir);
    if (!dryRun) {
      await fs.ensureDir(archiveDir);
      await fs.move(src, dest, { overwrite: false });
    }
    logger.success(`  ${dryRun ? "[dry-run] " : ""}archived ${dateDir}`);
  }

  logger.info(`${dryRun ? "Would archive" : "Archived"} ${dateDirs.length} session dir(s) → 10-DAILY-DIGESTS/archive/`);
}

function getISOWeek(date: Date): number {
  if (isNaN(date.getTime())) return 1; // guard against invalid dates
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return isNaN(week) ? 1 : week;
}

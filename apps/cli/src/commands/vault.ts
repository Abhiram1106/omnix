/**
 * omnix vault — vault management subcommands.
 *
 *   omnix vault validate   — schema validation of vault files
 *   omnix vault streak     — session activity streak and heatmap
 *   omnix vault migrate    — upgrade vault format between versions
 *   omnix vault self-test  — adapter self-test (verify AI tool config)
 */

import path from "node:path";
import fs from "fs-extra";
import { VAULT_DIR, OMNIX_DIR, cwdPath, exists } from "../utils/paths.js";
import { ADAPTER_FILES } from "../utils/adapter-files.js";
import { ALL_ADAPTERS } from "../utils/prompts.js";
import { logger } from "../utils/logger.js";

export interface VaultOptions {
  cwd: string;
  subcommand: "validate" | "streak" | "migrate" | "self-test";
  dryRun: boolean;
  json: boolean;
}

export async function runVault(opts: VaultOptions): Promise<void> {
  switch (opts.subcommand) {
    case "validate":  return runValidate(opts);
    case "streak":    return runStreak(opts);
    case "migrate":   return runMigrate(opts);
    case "self-test": return runSelfTest(opts);
  }
}

// ── validate ──────────────────────────────────────────────────────────────────

interface ValidationIssue {
  file: string;
  severity: "error" | "warning";
  message: string;
}

async function runValidate(opts: VaultOptions): Promise<void> {
  const vaultRoot = cwdPath(opts.cwd, VAULT_DIR);
  const issues: ValidationIssue[] = [];

  if (!opts.json) {
    logger.header("Vault Validate");
    logger.dim("Checking vault files for schema compliance...\n");
  }

  if (!(await exists(vaultRoot))) {
    if (opts.json) {
      console.log(JSON.stringify([{ file: ".obsidian-ai-memory", severity: "error", message: "No vault found. Run `omnix init` first." }], null, 2));
    } else {
      logger.error("No vault found. Run `omnix init` first.");
    }
    process.exitCode = 1;
    return;
  }

  // Required folders
  const requiredFolders = [
    "00-INBOX", "01-SESSIONS", "02-PROJECTS", "03-ERRORS",
    "04-DECISIONS", "05-ARCHITECTURE", "06-WORKFLOWS",
    "07-LESSONS", "08-PROMPTS", "09-AGENTS", "10-DAILY-DIGESTS", "templates",
  ];
  for (const folder of requiredFolders) {
    if (!(await exists(path.join(vaultRoot, folder)))) {
      issues.push({ file: folder, severity: "error", message: "Required vault folder missing" });
    }
  }

  // Session digest schema validation
  const sessionsDir = path.join(vaultRoot, "01-SESSIONS");
  if (await exists(sessionsDir)) {
    const dateDirs = await fs.readdir(sessionsDir).catch(() => [] as string[]);
    for (const dateDir of dateDirs.filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d)).slice(0, 5)) {
      const dayDir = path.join(sessionsDir, dateDir);
      const files = (await fs.readdir(dayDir)).filter((f) => f.endsWith(".md"));
      for (const file of files) {
        const content = await fs.readFile(path.join(dayDir, file), "utf8").catch(() => "");
        const digestIssues = validateDigestSchema(content, `01-SESSIONS/${dateDir}/${file}`);
        issues.push(...digestIssues);
      }
    }
  }

  // project-context.md checks
  const ctxPath = path.join(vaultRoot, "02-PROJECTS", "project-context.md");
  if (await exists(ctxPath)) {
    const ctx = await fs.readFile(ctxPath, "utf8").catch(() => "");
    if (ctx.includes("TODO")) {
      issues.push({ file: "02-PROJECTS/project-context.md", severity: "warning", message: "Contains TODO markers — not fully customized" });
    }
    if (ctx.length < 100) {
      issues.push({ file: "02-PROJECTS/project-context.md", severity: "warning", message: "Very short — run `omnix scan --write` to populate it" });
    }
  }

  // error-memory.md entry format check
  const errorPath = path.join(vaultRoot, "03-ERRORS", "error-memory.md");
  if (await exists(errorPath)) {
    const content = await fs.readFile(errorPath, "utf8").catch(() => "");
    const entries = content.split(/^## /m).filter(Boolean);
    for (const entry of entries.slice(0, 10)) {
      if (!entry.includes("Root Cause:")) {
        issues.push({
          file: "03-ERRORS/error-memory.md",
          severity: "warning",
          message: `Entry "${entry.split("\n")[0]?.trim().slice(0, 40)}" is missing Root Cause field`,
        });
      }
    }
  }

  if (opts.json) {
    console.log(JSON.stringify(issues, null, 2));
    if (issues.some((i) => i.severity === "error")) process.exitCode = 1;
    return;
  }

  const errors = issues.filter((i) => i.severity === "error");
  const warnings = issues.filter((i) => i.severity === "warning");

  if (issues.length === 0) {
    logger.success("Vault schema validation passed. No issues found.");
    return;
  }

  for (const issue of errors) {
    logger.warn(`[ERROR] ${issue.file}: ${issue.message}`);
  }
  for (const issue of warnings) {
    logger.dim(`[warn]  ${issue.file}: ${issue.message}`);
  }

  logger.blank();
  logger.info(`${errors.length} error(s), ${warnings.length} warning(s).`);
  if (errors.length > 0) {
    logger.dim("Fix errors first, then re-run `omnix vault validate`.");
    process.exitCode = 1;
  }
}

function validateDigestSchema(content: string, file: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const required = ["Date:", "Tool:", "Next Recommended Step:"];
  for (const field of required) {
    if (!content.includes(field)) {
      issues.push({ file, severity: "warning", message: `Missing field: ${field}` });
    }
  }
  return issues;
}

// ── streak ────────────────────────────────────────────────────────────────────

async function runStreak(opts: VaultOptions): Promise<void> {
  const vaultRoot = cwdPath(opts.cwd, VAULT_DIR);
  const sessionsDir = path.join(vaultRoot, "01-SESSIONS");

  logger.header("Session Streak");
  logger.blank();

  if (!(await exists(sessionsDir))) {
    logger.warn("No sessions recorded yet. Start with: omnix session-digest --auto");
    return;
  }

  const dateDirs = (await fs.readdir(sessionsDir))
    .filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d))
    .sort();

  if (dateDirs.length === 0) {
    logger.warn("No session folders found.");
    return;
  }

  // Build activity map: date → count
  const activity: Record<string, number> = {};
  for (const dateDir of dateDirs) {
    const dayDir = path.join(sessionsDir, dateDir);
    const files = (await fs.readdir(dayDir)).filter((f) => f.endsWith(".md"));
    activity[dateDir] = files.length;
  }

  // Calculate current streak — count consecutive days ending today (or yesterday)
  // Use millisecond arithmetic on a stable epoch to avoid timezone surprises.
  const today = new Date();
  today.setHours(12, 0, 0, 0); // noon avoids DST edge cases
  const ONE_DAY = 86400000;
  let streak = 0;
  for (let offset = 0; offset < 365; offset++) {
    const check = new Date(today.getTime() - offset * ONE_DAY);
    const dateStr = check.toISOString().split("T")[0]!;
    if (activity[dateStr]) {
      streak++;
    } else if (offset === 0) {
      // Today has no session yet — that's OK, check yesterday
      continue;
    } else {
      break;
    }
  }

  // Longest streak
  let longest = 0;
  let current = 0;
  let prevDate: Date | null = null;
  for (const dateStr of dateDirs) {
    const d = new Date(dateStr);
    if (prevDate) {
      const diffDays = Math.round((d.getTime() - prevDate.getTime()) / 86400000);
      if (diffDays === 1) { current++; longest = Math.max(longest, current); }
      else current = 1;
    } else {
      current = 1;
    }
    prevDate = d;
  }
  longest = Math.max(longest, current);

  const totalSessions = Object.values(activity).reduce((s, n) => s + n, 0);
  const lastDate = dateDirs[dateDirs.length - 1] ?? "none";

  console.log(`  Current streak:  ${streak} day${streak !== 1 ? "s" : ""}`);
  console.log(`  Longest streak:  ${longest} day${longest !== 1 ? "s" : ""}`);
  console.log(`  Total sessions:  ${totalSessions}`);
  console.log(`  Last session:    ${lastDate}`);
  console.log(`  Active days:     ${dateDirs.length}`);
  logger.blank();

  // ASCII heatmap — last 10 weeks (70 days)
  console.log("  Activity (last 10 weeks):");
  console.log("");
  const heatmap = buildHeatmap(activity, 70);
  console.log("  " + heatmap);
  logger.blank();
  logger.dim("  Each block = one day. Darker = more sessions.");
  logger.dim("  █ = 3+   ▓ = 2   ░ = 1   · = 0");
}

function buildHeatmap(activity: Record<string, number>, days: number): string {
  const blocks = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0]!;
    const count = activity[dateStr] ?? 0;
    if (count === 0) blocks.push("·");
    else if (count === 1) blocks.push("░");
    else if (count === 2) blocks.push("▓");
    else blocks.push("█");
  }
  return blocks.join("");
}

// ── migrate ───────────────────────────────────────────────────────────────────

import { CURRENT_VAULT_VERSION, VAULT_VERSION_FILE } from "../utils/vault-version.js";

async function runMigrate(opts: VaultOptions): Promise<void> {
  const vaultRoot = cwdPath(opts.cwd, VAULT_DIR);
  const omnixDir = cwdPath(opts.cwd, OMNIX_DIR);
  const versionFile = path.join(omnixDir, VAULT_VERSION_FILE);

  logger.header("Vault Migrate");
  logger.blank();

  if (!(await exists(vaultRoot))) {
    logger.error("No vault found. Run `omnix init` first.");
    process.exitCode = 1;
    return;
  }

  // Read current version. If the marker file is missing AND .omnix/ exists,
  // assume this is a pre-versioning install (1.0). If neither exists, it's a
  // fresh install that already wrote the current version.
  let currentVersion: string;
  if (await exists(versionFile)) {
    currentVersion = (await fs.readFile(versionFile, "utf8")).trim();
  } else if (await exists(omnixDir)) {
    // Old install — never wrote a version marker. Treat as 1.0.
    currentVersion = "1.0";
  } else {
    // No .omnix/ at all — shouldn't reach here since vault exists, but be safe
    currentVersion = CURRENT_VAULT_VERSION;
  }

  logger.info(`Current vault version: ${currentVersion}`);
  logger.info(`Target version: ${CURRENT_VAULT_VERSION}`);
  logger.blank();

  if (currentVersion === CURRENT_VAULT_VERSION) {
    logger.success("Vault is already at the latest version. Nothing to migrate.");
    return;
  }

  const migrations = getMigrations(currentVersion, CURRENT_VAULT_VERSION);

  if (migrations.length === 0) {
    logger.warn(`No migration path from ${currentVersion} to ${CURRENT_VAULT_VERSION}.`);
    logger.dim("Your vault may be from an unsupported version. Back up before continuing.");
    return;
  }

  for (const migration of migrations) {
    logger.step(`Migrating: ${migration.description}`);
    if (!opts.dryRun) {
      await migration.run(vaultRoot, opts.cwd);
      logger.success(`  Done`);
    } else {
      logger.dim(`  [dry-run] Would: ${migration.description}`);
    }
  }

  if (!opts.dryRun) {
    await fs.ensureDir(omnixDir);
    await fs.writeFile(versionFile, CURRENT_VAULT_VERSION, "utf8");
    logger.success(`Vault migrated to v${CURRENT_VAULT_VERSION}`);
  }
}

interface Migration {
  from: string; to: string; description: string;
  run: (vaultRoot: string, cwd: string) => Promise<void>;
}

function getMigrations(from: string, to: string): Migration[] {
  const all: Migration[] = [
    {
      from: "1.0", to: "1.1",
      description: "Add last-verified field to error-memory entries",
      run: async (vaultRoot) => {
        const errorPath = path.join(vaultRoot, "03-ERRORS", "error-memory.md");
        if (!(await exists(errorPath))) return;
        let content = await fs.readFile(errorPath, "utf8");
        const today = new Date().toISOString().split("T")[0];
        // Add Last Verified field after Date: field in entries that don't have it
        content = content.replace(
          /^(- Date: .+)$/gm,
          (match) => {
            const nextLine = "- Last Verified:";
            if (content.includes(nextLine)) return match; // already has it
            return `${match}\n- Last Verified: ${today}`;
          }
        );
        await fs.writeFile(errorPath, content, "utf8");
      },
    },
    {
      from: "1.0", to: "1.1",
      description: "Create 07-LESSONS/external-research.md if missing",
      run: async (vaultRoot) => {
        const p = path.join(vaultRoot, "07-LESSONS", "external-research.md");
        if (!(await exists(p))) {
          await fs.ensureDir(path.dirname(p));
          await fs.writeFile(p, "# External Research Cache\n> Auto-managed by omnix research. Each entry: query, fetched date, summary.\n", "utf8");
        }
      },
    },
  ];

  return all.filter((m) => m.from === from && m.to <= to);
}

// ── self-test ─────────────────────────────────────────────────────────────────

async function runSelfTest(opts: VaultOptions): Promise<void> {
  if (!opts.json) {
    logger.header("Adapter Self-Test");
    logger.dim("Verifying AI tool config actually references Omnix files...\n");
  }

  const results: Array<{ adapter: string; installed: boolean; referencesVault: boolean; referencesAgents: boolean; issues: string[] }> = [];

  for (const adapter of ALL_ADAPTERS) {
    const files = ADAPTER_FILES[adapter] ?? [];
    const adapterResult = { adapter, installed: false, referencesVault: false, referencesAgents: false, issues: [] as string[] };

    for (const { dest } of files) {
      const absPath = path.join(opts.cwd, dest);
      if (!(await exists(absPath))) continue;
      adapterResult.installed = true;

      const content = await fs.readFile(absPath, "utf8").catch(() => "");

      // Check for vault reference
      if (content.includes(".obsidian-ai-memory") || content.includes("VAULT")) {
        adapterResult.referencesVault = true;
      }

      // Check for AGENTS.md reference (source of truth)
      if (content.includes("AGENTS.md") || content.includes("@AGENTS")) {
        adapterResult.referencesAgents = true;
      }

      // Check file is non-trivial
      if (content.length < 100) {
        adapterResult.issues.push(`${dest} is suspiciously short (${content.length} chars)`);
      }

      // Check for memory loop keywords
      if (!content.toLowerCase().includes("memory") && !content.toLowerCase().includes("vault")) {
        if (!adapterResult.referencesAgents) {
          adapterResult.issues.push(`${dest} has no memory loop reference and doesn't import AGENTS.md`);
        }
      }
    }

    results.push(adapterResult);
  }

  if (opts.json) {
    console.log(JSON.stringify(results.filter((r) => r.installed), null, 2));
    return;
  }

  const installed = results.filter((r) => r.installed);
  if (installed.length === 0) {
    logger.warn("No adapters installed. Run `omnix install-adapters` first.");
    return;
  }

  for (const r of installed) {
    const ok = r.referencesVault || r.referencesAgents;
    logger.row(r.adapter, ok ? "ok" : "ISSUES", ok);
    if (!r.referencesVault && !r.referencesAgents) {
      logger.dim(`    No vault or AGENTS.md reference — your AI tool may not follow the memory loop`);
    }
    for (const issue of r.issues) {
      logger.dim(`    ⚠ ${issue}`);
    }
  }

  logger.blank();
  const passing = installed.filter((r) => r.referencesVault || r.referencesAgents).length;
  if (passing === installed.length) {
    logger.success(`All ${installed.length} installed adapters reference vault or AGENTS.md.`);
  } else {
    logger.warn(`${installed.length - passing}/${installed.length} adapters have issues.`);
    logger.dim("Run `omnix update --force` to refresh adapter files.");
  }

  logger.blank();
  logger.dim("Note: this checks the file content, not whether your AI tool actually reads it.");
  logger.dim("Adapter compliance ultimately depends on your AI tool + model.");
}

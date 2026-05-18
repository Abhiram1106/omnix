/**
 * omnix hooks — install/uninstall git hooks that run automatically.
 *
 * Available hooks:
 *   pre-commit: runs `omnix check-secrets` before every commit.
 *               Blocks the commit if secrets are detected.
 *   post-commit: runs `omnix session-digest --auto` after every commit.
 *               Keeps the vault in sync with commits automatically.
 */

import path from "node:path";
import fs from "fs-extra";
import { logger } from "../utils/logger.js";

export interface HooksOptions {
  cwd: string;
  install?: "pre-commit" | "post-commit" | "all";
  uninstall?: "pre-commit" | "post-commit" | "all";
  list?: boolean;
  dryRun: boolean;
}

const HOOK_SCRIPTS: Record<string, string> = {
  "pre-commit": `#!/usr/bin/env sh
# Installed by omnix hooks --install pre-commit
# Scans vault and .omnix/ for accidentally written secrets before every commit.
# Remove this file to disable.

if command -v omnix > /dev/null 2>&1; then
  omnix check-secrets
  if [ $? -ne 0 ]; then
    echo ""
    echo "COMMIT BLOCKED: omnix check-secrets found potential secrets."
    echo "Review the files above, redact secrets, then commit again."
    echo "To skip this check (NOT recommended): git commit --no-verify"
    exit 1
  fi
else
  echo "omnix not found in PATH — skipping secret scan"
fi
`,
  "post-commit": `#!/usr/bin/env sh
# Installed by omnix hooks --install post-commit
# Auto-writes a minimal session digest after every git commit.
# Remove this file to disable.

if command -v omnix > /dev/null 2>&1; then
  # Detect which AI tool is being used (check for active adapter files)
  TOOL="git-commit"
  if [ -f "CLAUDE.md" ]; then TOOL="claude-code"; fi
  if [ -d ".cursor" ]; then TOOL="cursor"; fi

  omnix session-digest --auto --tool "$TOOL" > /dev/null 2>&1 || true
  echo "[omnix] Session digest updated."
fi
`,
};

export async function runHooks(opts: HooksOptions): Promise<void> {
  const gitDir = path.join(opts.cwd, ".git");
  const hooksDir = path.join(gitDir, "hooks");

  if (!(await fs.pathExists(gitDir))) {
    logger.error("Not a git repository. Run `git init` first.");
    process.exitCode = 1;
    return;
  }

  if (opts.list) {
    await listHooks(hooksDir);
    return;
  }

  if (opts.uninstall) {
    const names = opts.uninstall === "all" ? Object.keys(HOOK_SCRIPTS) : [opts.uninstall];
    for (const name of names) {
      await uninstallHook(hooksDir, name, opts.dryRun);
    }
    return;
  }

  if (opts.install) {
    await fs.ensureDir(hooksDir);
    const names = opts.install === "all" ? Object.keys(HOOK_SCRIPTS) : [opts.install];
    for (const name of names) {
      await installHook(hooksDir, name, opts.dryRun);
    }
    logger.blank();
    logger.dim("Test the hook by making a commit. Use --no-verify to skip if needed.");
  }
}

async function listHooks(hooksDir: string): Promise<void> {
  logger.header("Omnix Hooks");
  logger.blank();
  for (const name of Object.keys(HOOK_SCRIPTS)) {
    const hookPath = path.join(hooksDir, name);
    const installed = await fs.pathExists(hookPath);
    const isOmnix = installed
      ? (await fs.readFile(hookPath, "utf8").catch(() => "")).includes("omnix")
      : false;

    if (!installed) {
      logger.row(name, "not installed", false);
    } else if (isOmnix) {
      logger.row(name, "installed (omnix)", true);
    } else {
      logger.row(name, "installed (external — not omnix)", true);
    }
  }
  logger.blank();
  logger.dim("Install: omnix hooks --install pre-commit");
  logger.dim("Install all: omnix hooks --install all");
  logger.dim("Remove: omnix hooks --uninstall pre-commit");
}

async function installHook(hooksDir: string, name: string, dryRun: boolean): Promise<void> {
  const script = HOOK_SCRIPTS[name];
  if (!script) {
    logger.warn(`Unknown hook: ${name}. Available: ${Object.keys(HOOK_SCRIPTS).join(", ")}`);
    return;
  }

  const hookPath = path.join(hooksDir, name);

  // Check if a non-omnix hook already exists
  if (await fs.pathExists(hookPath)) {
    const existing = await fs.readFile(hookPath, "utf8").catch(() => "");
    if (!existing.includes("omnix")) {
      logger.warn(`${name}: existing non-omnix hook found. Skipping to avoid overwrite.`);
      logger.dim(`  To install anyway: delete ${hookPath} first, then re-run.`);
      return;
    }
  }

  if (!dryRun) {
    await fs.writeFile(hookPath, script, { encoding: "utf8", mode: 0o755 });
    logger.success(`${name}: installed`);
    logger.dim(`  ${hookPath}`);
  } else {
    logger.info(`[dry-run] Would install ${name} hook`);
    logger.dim(`  ${hookPath}`);
  }
}

async function uninstallHook(hooksDir: string, name: string, dryRun: boolean): Promise<void> {
  const hookPath = path.join(hooksDir, name);
  if (!(await fs.pathExists(hookPath))) {
    logger.dim(`${name}: not installed`);
    return;
  }

  const content = await fs.readFile(hookPath, "utf8").catch(() => "");
  if (!content.includes("omnix")) {
    logger.warn(`${name}: hook exists but was not installed by omnix. Not removing.`);
    return;
  }

  if (!dryRun) {
    await fs.remove(hookPath);
    logger.success(`${name}: removed`);
  } else {
    logger.info(`[dry-run] Would remove ${hookPath}`);
  }
}

/**
 * omnix diff — show what changed since the last recorded session digest.
 *
 * Compares current git state against the last session digest to force
 * the user to review before writing a new digest.
 *
 * Output:
 * - Files changed since last session
 * - Files in last digest vs current diff (drift detection)
 * - Prompt: does the last digest still reflect the current state?
 */

import path from "node:path";
import { execSync } from "node:child_process";
import fs from "fs-extra";
import { VAULT_DIR, cwdPath, exists } from "../utils/paths.js";
import { logger } from "../utils/logger.js";

export interface DiffOptions {
  cwd: string;
  json: boolean;
}

interface DiffResult {
  lastSessionDate: string | null;
  lastSessionFile: string | null;
  filesInLastDigest: string[];
  filesChangedSinceLastCommit: string[];
  newFilesSinceDigest: string[];    // in git but not in digest
  missingFromDigest: string[];      // in digest but no longer changed
  digestIsFresh: boolean;
}

export async function runDiff(opts: DiffOptions): Promise<void> {
  const result = await computeDiff(opts.cwd);

  if (opts.json) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  logger.header("Omnix Diff");
  logger.dim("Changes since last session digest.\n");

  if (!result.lastSessionFile) {
    logger.warn("No session digests found. Run `omnix session-digest --auto` to start tracking.");
    return;
  }

  logger.dim(`Last session: ${result.lastSessionDate} (${result.lastSessionFile})`);
  logger.blank();

  // Files changed since last commit (git)
  if (result.filesChangedSinceLastCommit.length === 0) {
    logger.success("No uncommitted changes since last session.");
  } else {
    console.log("CHANGED FILES (git diff HEAD)");
    for (const f of result.filesChangedSinceLastCommit) {
      console.log(`  ${f}`);
    }
    logger.blank();
  }

  // New files not captured in last digest
  if (result.newFilesSinceDigest.length > 0) {
    console.log("NOT IN LAST DIGEST (new since digest was written)");
    for (const f of result.newFilesSinceDigest) {
      logger.warn(`  ${f}`);
    }
    logger.blank();
  }

  // Verdict
  if (result.digestIsFresh) {
    logger.success("Last digest appears current — no significant new changes.");
  } else {
    logger.warn("Last digest is stale. Run `omnix session-digest --auto` to update it.");
  }

  logger.blank();
  logger.dim("Update digest: omnix session-digest --auto --tool <your-tool>");
}

async function computeDiff(cwd: string): Promise<DiffResult> {
  const vaultRoot = cwdPath(cwd, VAULT_DIR);
  const sessionsDir = path.join(vaultRoot, "01-SESSIONS");

  // Find latest session digest
  let lastSessionDate: string | null = null;
  let lastSessionFile: string | null = null;
  let filesInLastDigest: string[] = [];

  if (await exists(sessionsDir)) {
    const dateDirs = (await fs.readdir(sessionsDir))
      .filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d))
      .sort()
      .reverse();

    for (const dateDir of dateDirs) {
      const dayDir = path.join(sessionsDir, dateDir);
      const files = (await fs.readdir(dayDir)).filter((f) => f.endsWith(".md")).sort().reverse();
      if (files.length > 0) {
        lastSessionDate = dateDir;
        lastSessionFile = `01-SESSIONS/${dateDir}/${files[0]}`;
        const content = await fs.readFile(path.join(dayDir, files[0]!), "utf8").catch(() => "");
        // Parse files changed from the digest
        const section = content.match(/- Files Changed:\n((?:- .+\n?)*)/)?.[1] ?? "";
        filesInLastDigest = section.split("\n")
          .map((l) => l.replace(/^- /, "").trim())
          .filter((l) => l && l !== "none");
        break;
      }
    }
  }

  // Get current git diff — use child_process without shell operators (Windows-safe)
  const safeExec = (cmd: string): string => {
    try {
      return execSync(cmd, { cwd, encoding: "utf8", timeout: 5000, stdio: ["ignore", "pipe", "ignore"] });
    } catch { return ""; }
  };

  const filesChangedSinceLastCommit: string[] = [];
  const stat = safeExec("git diff --name-only HEAD");
  filesChangedSinceLastCommit.push(...stat.split("\n").filter(Boolean));

  const untracked = safeExec("git ls-files --others --exclude-standard");
  filesChangedSinceLastCommit.push(...untracked.split("\n").filter(Boolean));

  // New since digest = in current changes but not in last digest
  const digestSet = new Set(filesInLastDigest.map((f) => f.toLowerCase()));
  const newFilesSinceDigest = filesChangedSinceLastCommit.filter(
    (f) => !digestSet.has(f.toLowerCase())
  );

  const missingFromDigest = filesInLastDigest.filter(
    (f) => !filesChangedSinceLastCommit.some((c) => c.toLowerCase() === f.toLowerCase())
  );

  const digestIsFresh = newFilesSinceDigest.length === 0 && filesChangedSinceLastCommit.length <= 3;

  return {
    lastSessionDate,
    lastSessionFile,
    filesInLastDigest,
    filesChangedSinceLastCommit,
    newFilesSinceDigest,
    missingFromDigest,
    digestIsFresh,
  };
}

import { detectStack } from "../utils/detect-stack.js";
import { AI_OS_MARKERS, VAULT_DIR, VAULT_FOLDERS, cwdPath, exists } from "../utils/paths.js";
import { logger } from "../utils/logger.js";

export interface DetectOptions {
  cwd: string;
  json: boolean;
}

export async function runDetect(opts: DetectOptions): Promise<void> {
  // Markers
  const markers = await Promise.all(
    AI_OS_MARKERS.map(async (m) => ({
      name: m,
      found: await exists(cwdPath(opts.cwd, m)),
    }))
  );

  const aiOsPresent = markers.some((m) => m.found);

  // Vault health
  const vaultPresent = await exists(cwdPath(opts.cwd, VAULT_DIR));
  const missingFolders: string[] = [];
  if (vaultPresent) {
    for (const folder of VAULT_FOLDERS) {
      const ok = await exists(cwdPath(opts.cwd, VAULT_DIR, folder));
      if (!ok) missingFolders.push(folder);
    }
  }

  const stack = await detectStack(opts.cwd);

  const result = {
    aiOsPresent,
    markers,
    vaultPresent,
    missingVaultFolders: missingFolders,
    projectType: stack.projectType,
    stack: [...stack.languages, ...stack.frameworks],
    aiToolsInstalled: stack.aiTools,
  };

  if (opts.json) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  logger.header("Omnix Detection");
  logger.row("Omnix present", aiOsPresent ? "yes" : "no", aiOsPresent);
  logger.blank();

  for (const m of markers) {
    logger.row(m.name, m.found ? "found" : "—", m.found ? true : undefined);
  }

  logger.blank();
  logger.row("Vault present", vaultPresent ? "yes" : "no", vaultPresent);
  if (vaultPresent && missingFolders.length > 0) {
    logger.warn(`Missing vault folders: ${missingFolders.join(", ")}`);
    logger.dim("  Run `omnix sync-memory --fix` to repair.");
  } else if (vaultPresent) {
    logger.row("All vault folders", "ok", true);
  }

  logger.blank();
  logger.row("Project type", result.projectType);
  logger.row("Stack", result.stack.join(", ") || "unknown");
}

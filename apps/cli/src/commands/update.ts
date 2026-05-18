import path from "node:path";
import fs from "fs-extra";
import { copyTemplate } from "../utils/copy-template.js";
import { logger } from "../utils/logger.js";
import { cwdPath, exists, OMNIX_DIR } from "../utils/paths.js";
import type { AdapterName } from "../utils/prompts.js";
import { ALL_ADAPTERS } from "../utils/prompts.js";
import { ADAPTER_FILES } from "../utils/adapter-files.js";

export interface UpdateOptions {
  cwd: string;
  /** What to update: adapters | settings | all */
  target: "adapters" | "settings" | "all";
  /** Specific adapters (defaults to all detected). */
  adapters?: string[];
  dryRun: boolean;
}

export async function runUpdate(opts: UpdateOptions): Promise<void> {
  if (opts.dryRun) logger.warn("Dry-run mode: no files will be written.\n");

  logger.header("Omnix Update");

  const copyOpts = { dest: opts.cwd, force: true, dryRun: opts.dryRun };

  // Detect which adapters are currently installed (to avoid installing new ones without consent)
  const installedAdapters: AdapterName[] = [];
  for (const adapter of ALL_ADAPTERS) {
    const files = ADAPTER_FILES[adapter] ?? [];
    const anyInstalled = await Promise.all(files.map((f) => exists(cwdPath(opts.cwd, f.dest))));
    if (anyInstalled.some(Boolean)) installedAdapters.push(adapter);
  }

  const updateAdapters = opts.adapters?.length
    ? (opts.adapters.filter((a) => (ALL_ADAPTERS as string[]).includes(a)) as AdapterName[])
    : installedAdapters;

  // ---- Update adapter files ----
  if (opts.target === "adapters" || opts.target === "all") {
    if (updateAdapters.length === 0) {
      logger.warn("No installed adapters detected. Run `omnix install-adapters` first.");
    } else {
      logger.step(`Updating adapters: ${updateAdapters.join(", ")}`);
      let updated = 0;
      for (const adapter of updateAdapters) {
        const files = ADAPTER_FILES[adapter] ?? [];
        for (const f of files) {
          // Only update files that are already present (never add new ones without --adapters flag)
          if (opts.adapters?.length || await exists(cwdPath(opts.cwd, f.dest))) {
            const result = await copyTemplate(f.src, f.dest, copyOpts);
            updated += result.written.length;
          }
        }
      }
      logger.success(`  ${updated} adapter file(s) updated.`);
    }
  }

  // ---- Update .omnix/ settings ----
  if (opts.target === "settings" || opts.target === "all") {
    const omnixSettings = path.join(opts.cwd, OMNIX_DIR, "settings", "omnix.json");
    if (await exists(omnixSettings)) {
      logger.step("Checking .omnix/settings/omnix.json…");
      // Read current settings and check for missing keys from the template
      const current = await fs.readJSON(omnixSettings).catch(() => ({})) as Record<string, unknown>;
      const { templatesDir } = await import("../utils/paths.js");
      const templatePath = path.join(
        templatesDir(),
        ".omnix/settings/omnix.json"
      );
      if (await exists(templatePath)) {
        const template = await fs.readJSON(templatePath).catch(() => ({})) as Record<string, unknown>;
        let addedKeys = 0;
        for (const [key, val] of Object.entries(template)) {
          if (!(key in current)) {
            current[key] = val;
            addedKeys++;
          }
        }
        if (addedKeys > 0 && !opts.dryRun) {
          await fs.writeJSON(omnixSettings, current, { spaces: 2 });
          logger.success(`  omnix.json: added ${addedKeys} new setting key(s).`);
        } else if (addedKeys > 0) {
          logger.dim(`  [dry-run] would add ${addedKeys} new key(s) to omnix.json`);
        } else {
          logger.dim("  omnix.json already up to date.");
        }
      }
    } else {
      logger.dim("  .omnix/settings/omnix.json not found — skipping settings update.");
    }
  }

  logger.blank();
  logger.success("Update complete.");
  logger.dim("Run `omnix doctor` to verify installation health.");
}

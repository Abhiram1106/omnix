import { copyTemplate } from "../utils/copy-template.js";
import { logger } from "../utils/logger.js";
import type { AdapterName } from "../utils/prompts.js";
import { ALL_ADAPTERS } from "../utils/prompts.js";
import { ADAPTER_FILES } from "../utils/adapter-files.js";

export interface InstallAdaptersOptions {
  cwd: string;
  adapters: string[];
  force: boolean;
  dryRun: boolean;
}

export async function runInstallAdapters(opts: InstallAdaptersOptions): Promise<void> {
  const copyOpts = { dest: opts.cwd, force: opts.force, dryRun: opts.dryRun };

  if (opts.dryRun) logger.warn("Dry-run mode: no files will be written.\n");

  // Resolve adapter list
  const requested = opts.adapters.length > 0 ? opts.adapters : ["generic", "claude", "cursor"];
  const valid: AdapterName[] = [];
  const invalid: string[] = [];

  for (const a of requested) {
    if ((ALL_ADAPTERS as string[]).includes(a)) {
      valid.push(a as AdapterName);
    } else {
      invalid.push(a);
    }
  }

  if (invalid.length > 0) {
    logger.warn(`Unknown adapters (ignored): ${invalid.join(", ")}`);
    logger.dim(`  Valid: ${ALL_ADAPTERS.join(", ")}`);
  }

  if (valid.length === 0) {
    logger.error("No valid adapters specified.");
    process.exitCode = 1;
    return;
  }

  logger.header(`Installing adapters: ${valid.join(", ")}`);

  let totalWritten = 0;
  let totalSkipped = 0;

  for (const adapter of valid) {
    logger.blank();
    logger.step(adapter);
    const files = ADAPTER_FILES[adapter] ?? [];
    for (const f of files) {
      const result = await copyTemplate(f.src, f.dest, copyOpts);
      totalWritten += result.written.length;
      totalSkipped += result.skipped.length;
    }
  }

  logger.blank();
  logger.success(`Done — ${totalWritten} written, ${totalSkipped} skipped.`);
  if (totalSkipped > 0) {
    logger.dim("  Use --force to overwrite existing files.");
  }
}

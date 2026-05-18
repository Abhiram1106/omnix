import path from "node:path";
import fs from "fs-extra";
import { templatesDir } from "./paths.js";
import { logger } from "./logger.js";

export interface CopyOptions {
  /** Absolute destination directory (project root or sub-dir). */
  dest: string;
  /** Overwrite existing files without asking. */
  force?: boolean;
  /** Print what would happen without writing. */
  dryRun?: boolean;
}

export interface CopyResult {
  written: string[];
  skipped: string[];
}

/**
 * Copy a template file/directory from the CLI's bundled templates/ folder
 * to `dest`. Relative paths inside templates/ map 1-to-1 to dest.
 *
 * @param templateRelPath  Path relative to templates/ dir  e.g. "vault/02-PROJECTS/project-context.md"
 * @param destRelPath      Path relative to dest             e.g. ".obsidian-ai-memory/02-PROJECTS/project-context.md"
 */
export async function copyTemplate(
  templateRelPath: string,
  destRelPath: string,
  opts: CopyOptions
): Promise<CopyResult> {
  const src = path.join(templatesDir(), templateRelPath);
  const dst = path.join(opts.dest, destRelPath);
  const result: CopyResult = { written: [], skipped: [] };

  if (!(await fs.pathExists(src))) {
    logger.warn(`Template not found: ${templateRelPath}`);
    return result;
  }

  const stat = await fs.stat(src);

  if (stat.isDirectory()) {
    const entries = await fs.readdir(src, { recursive: true, withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isFile()) continue;
      // entry.path is the containing dir (Node 20+); fallback for older
      const entryDir = (entry as { path?: string }).path ?? src;
      const relToSrc = path.relative(src, path.join(entryDir, entry.name));
      const srcFile = path.join(src, relToSrc);
      const dstFile = path.join(dst, relToSrc);
      const sub = await copySingleFile(srcFile, dstFile, opts);
      result.written.push(...sub.written);
      result.skipped.push(...sub.skipped);
    }
  } else {
    const sub = await copySingleFile(src, dst, opts);
    result.written.push(...sub.written);
    result.skipped.push(...sub.skipped);
  }

  return result;
}

async function copySingleFile(
  src: string,
  dst: string,
  opts: CopyOptions
): Promise<CopyResult> {
  const result: CopyResult = { written: [], skipped: [] };

  if (!opts.force && (await fs.pathExists(dst))) {
    logger.dim(`  skip (exists) ${dst}`);
    result.skipped.push(dst);
    return result;
  }

  if (opts.dryRun) {
    logger.dim(`  [dry-run] write ${dst}`);
    result.written.push(dst);
    return result;
  }

  await fs.ensureDir(path.dirname(dst));
  await fs.copyFile(src, dst);
  logger.success(`  ${dst}`);
  result.written.push(dst);
  return result;
}

/** Write a string as a file, respecting dry-run and force flags. */
export async function writeFile(
  dest: string,
  content: string,
  opts: CopyOptions
): Promise<boolean> {
  if (!opts.force && (await fs.pathExists(dest))) {
    logger.dim(`  skip (exists) ${dest}`);
    return false;
  }
  if (opts.dryRun) {
    logger.dim(`  [dry-run] write ${dest}`);
    return true;
  }
  await fs.ensureDir(path.dirname(dest));
  await fs.writeFile(dest, content, "utf8");
  logger.success(`  ${dest}`);
  return true;
}

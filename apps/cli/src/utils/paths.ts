import path from "node:path";
import fs from "fs-extra";

/** Absolute path to the CLI package root (contains src/, templates/, dist/).
 *
 * Resolution strategy:
 *   - Built (tsup CJS): __dirname === <pkg>/dist/ → resolve("..")
 *   - Vitest (source): __dirname === <pkg>/src/utils/ → resolve("../..")
 *   - Fallback: walk up until we find a templates/ directory
 */
export function pkgRoot(): string {
  // Walk up from __dirname until we find the directory containing templates/
  let dir = __dirname;
  for (let i = 0; i < 4; i++) {
    if (require("fs").existsSync(path.join(dir, "templates"))) return dir;
    dir = path.resolve(dir, "..");
  }
  // Last resort: assume one level above __dirname (built CJS default)
  return path.resolve(__dirname, "..");
}

/** Absolute path to the bundled templates directory inside the CLI package. */
export function templatesDir(): string {
  return path.join(pkgRoot(), "templates");
}

/** Vault sub-path relative to project root. */
export const VAULT_DIR = ".obsidian-ai-memory";

/** All required vault sub-folders. */
export const VAULT_FOLDERS = [
  "00-INBOX",
  "01-SESSIONS",
  "02-PROJECTS",
  "03-ERRORS",
  "04-DECISIONS",
  "05-ARCHITECTURE",
  "06-WORKFLOWS",
  "07-LESSONS",
  "08-PROMPTS",
  "09-AGENTS",
  "10-DAILY-DIGESTS",
  "templates",
] as const;

/** Directory created by `omnix init` — primary Omnix config dir. */
export const OMNIX_DIR = ".omnix";

/** Sub-folders created inside .omnix/ */
export const OMNIX_SUBFOLDERS = [
  "agents",
  "workflows",
  "memory",
  "commands",
  "settings",
] as const;

/** Omnix marker files/dirs the startup protocol detects. */
export const AI_OS_MARKERS = [
  OMNIX_DIR,
  ".ai",
  ".claude",
  ".cursor",
  ".windsurf",
  ".cline",
  ".roo",
  ".continue",
  ".aider",
  ".openhands",
  VAULT_DIR,
  "AGENTS.md",
  "AI_RULES.md",
  "PROJECT_CONTEXT.md",
] as const;

/**
 * Resolve a path inside cwd.
 * Throws if the resolved path escapes cwd — prevents path traversal.
 */
export function cwdPath(cwd: string, ...parts: string[]): string {
  const resolved = path.resolve(cwd, ...parts);
  const normalCwd = path.resolve(cwd);
  if (!resolved.startsWith(normalCwd + path.sep) && resolved !== normalCwd) {
    throw new Error(`Path traversal denied: "${parts.join("/")}" resolves outside project directory.`);
  }
  return resolved;
}

/**
 * Sanitize a user-supplied name for use in file paths and markdown.
 * Strips path separators, null bytes, and control characters.
 */
export function sanitizeName(name: string): string {
  return name
    .replace(/[/\\]/g, "-")    // no path separators
    .replace(/\0/g, "")        // no null bytes
    .replace(/[<>:"|?*]/g, "-") // Windows-forbidden chars
    .replace(/\.{2,}/g, ".")   // no double-dots
    .slice(0, 64)               // max 64 chars
    .trim();
}

/** True if path exists (file or directory). */
export async function exists(p: string): Promise<boolean> {
  return fs.pathExists(p);
}

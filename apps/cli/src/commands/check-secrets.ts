import path from "node:path";
import fs from "fs-extra";
import { VAULT_DIR, OMNIX_DIR, cwdPath, exists } from "../utils/paths.js";
import { logger } from "../utils/logger.js";

export interface CheckSecretsOptions {
  cwd: string;
  fix: boolean;
  json: boolean;
}

interface SecretHit {
  file: string;
  line: number;
  pattern: string;
  preview: string; // first 20 chars only — enough to identify, not enough to expose
}

/** Patterns that should NEVER appear in vault files. */
const SECRET_PATTERNS: { name: string; re: RegExp }[] = [
  { name: "OpenAI/sk- key",    re: /sk-[A-Za-z0-9_\-]{20,}/g },
  { name: "Stripe key",        re: /(?:pk|sk)_(live|test)_[A-Za-z0-9]{20,}/g },
  { name: "GitHub token",      re: /ghp_[A-Za-z0-9]{36,}|github_pat_[A-Za-z0-9_]{80,}/g },
  { name: "AWS key",           re: /AKIA[0-9A-Z]{16}/g },
  { name: "Slack token",       re: /xox[baprs]-[A-Za-z0-9\-]{10,}/g },
  { name: "JWT",               re: /ey[A-Za-z0-9_\-]{10,}\.[A-Za-z0-9_\-]{10,}\.[A-Za-z0-9_\-]{10,}/g },
  { name: "DB password URL",   re: /(?:postgres|mysql|mongodb(?:\+srv)?|redis):\/\/[^:]+:[^@\s]{4,}@[^\s"']+/gi },
  { name: "Private key block", re: /-----BEGIN (?:[A-Z]+ )*PRIVATE KEY-----/g },
  { name: ".env secret",       re: /^[A-Z_]{4,}(?:_KEY|_SECRET|_TOKEN|_PASSWORD|_PASS|_PWD|_API_KEY|_PRIVATE)\s*=\s*\S+/gm },
];

export async function runCheckSecrets(opts: CheckSecretsOptions): Promise<void> {
  const scanDirs = [
    cwdPath(opts.cwd, VAULT_DIR),
    cwdPath(opts.cwd, OMNIX_DIR),
  ].filter(async (d) => await exists(d));

  const dirsToScan: string[] = [];
  for (const d of scanDirs) {
    if (await exists(d)) dirsToScan.push(d);
  }

  if (dirsToScan.length === 0) {
    if (opts.json) {
      console.log(JSON.stringify([], null, 2));
    } else {
      logger.warn("No vault or .omnix directory found — nothing to scan.");
    }
    return;
  }

  if (!opts.json) {
    logger.header("Secret Scan");
    logger.dim(`Scanning vault and .omnix/ for accidental secret exposure...\n`);
  }

  const hits: SecretHit[] = [];

  for (const dir of dirsToScan) {
    const mdFiles = await collectMarkdownFiles(dir);
    for (const file of mdFiles) {
      const content = await fs.readFile(file, "utf8").catch(() => "");
      const lines = content.split("\n");
      for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
        const line = lines[lineIdx]!;
        for (const { name, re } of SECRET_PATTERNS) {
          re.lastIndex = 0;
          if (re.test(line)) {
            hits.push({
              file: path.relative(opts.cwd, file),
              line: lineIdx + 1,
              pattern: name,
              preview: line.trim().slice(0, 20) + (line.trim().length > 20 ? "…" : ""),
            });
          }
        }
      }
    }
  }

  if (opts.json) {
    console.log(JSON.stringify(hits, null, 2));
    if (hits.length > 0) process.exitCode = 1;
    return;
  }

  if (hits.length === 0) {
    logger.success("No secrets detected in vault or .omnix/ directories.");
    logger.dim("Note: this scanner catches common patterns. Manual review is still recommended.");
    return;
  }

  logger.warn(`Found ${hits.length} potential secret(s):\n`);
  for (const hit of hits) {
    console.log(`  ${hit.file}:${hit.line}`);
    logger.dim(`    Pattern: ${hit.pattern}`);
    logger.dim(`    Preview: ${hit.preview}`);
    console.log();
  }

  if (opts.fix) {
    logger.info("--fix is not implemented: automatic redaction of existing secrets could corrupt intended content.");
    logger.dim("Please manually review the files above and redact secrets, then re-run the scan.");
  } else {
    logger.dim("Re-run with --fix flag to see guidance, or manually edit the files above.");
  }

  logger.blank();
  logger.warn("IMPORTANT: If any of these secrets are real, rotate them immediately — they may already be in git history.");
  process.exitCode = 1;
}

/** Folders to skip — these are templates/examples that intentionally show secret patterns. */
const SKIP_FOLDERS = new Set(["templates"]);

async function collectMarkdownFiles(dir: string): Promise<string[]> {
  const results: string[] = [];
  const entries = await fs.readdir(dir, { withFileTypes: true }).catch(() => []);
  for (const entry of entries) {
    if (entry.isDirectory() && SKIP_FOLDERS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...await collectMarkdownFiles(full));
    } else if (entry.name.endsWith(".md") || entry.name.endsWith(".json")) {
      results.push(full);
    }
  }
  return results;
}

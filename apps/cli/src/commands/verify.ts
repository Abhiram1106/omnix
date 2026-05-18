import path from "node:path";
import fs from "fs-extra";
import { VAULT_DIR, OMNIX_DIR, cwdPath, exists } from "../utils/paths.js";
import { logger } from "../utils/logger.js";

export interface VerifyOptions {
  cwd: string;
  json: boolean;
}

interface VerifyCheck {
  name: string;
  ok: boolean;
  detail: string;
}

/**
 * Verify that Omnix conventions are actually present and readable by AI tools.
 * This doesn't guarantee an AI tool will follow them — nothing can — but it
 * confirms the files are in place and non-empty.
 */
export async function runVerify(opts: VerifyOptions): Promise<void> {
  const checks: VerifyCheck[] = [];

  // 1. AGENTS.md (source of truth) exists and contains memory loop keyword
  await checkFile(opts.cwd, "AGENTS.md", "memory loop", checks);

  // 2. STARTUP_PROTOCOL.md exists
  await checkFile(opts.cwd, "STARTUP_PROTOCOL.md", "retrieve", checks);

  // 3. AI_RULES.md exists
  await checkFile(opts.cwd, "AI_RULES.md", null, checks);

  // 4. Tool-specific adapter present (at least one of the known locations)
  const adapterLocations = [
    "CLAUDE.md",
    ".cursor/rules/project-rules.mdc",
    ".windsurf/rules.md",
    ".cline/instructions.md",
    ".roo/instructions.md",
    "CONVENTIONS.md",
    ".openhands/instructions.md",
  ];
  const adapterResults = await Promise.all(
    adapterLocations.map(async (f) => ({ file: f, found: await exists(path.join(opts.cwd, f)) }))
  );
  const adapterFound = adapterResults.some((r) => r.found);
  const foundFile = adapterResults.find((r) => r.found)?.file;
  checks.push({
    name: "Tool adapter present",
    ok: adapterFound,
    detail: adapterFound
      ? `Found: ${foundFile}`
      : `None of the known adapter files found. Run: omnix install-adapters`,
  });

  // 5. Vault root exists
  const vaultPresent = await exists(cwdPath(opts.cwd, VAULT_DIR));
  checks.push({
    name: "Memory vault present",
    ok: vaultPresent,
    detail: vaultPresent ? VAULT_DIR : `Missing. Run: omnix init`,
  });

  // 6. project-context.md has been customized (not just a stub)
  if (vaultPresent) {
    const ctxPath = path.join(opts.cwd, VAULT_DIR, "02-PROJECTS", "project-context.md");
    const ctx = await fs.readFile(ctxPath, "utf8").catch(() => "");
    const customized = ctx.length > 100 && !ctx.includes("TODO");
    checks.push({
      name: "project-context.md customized",
      ok: customized,
      detail: customized
        ? "Has content and no TODO markers"
        : "Still has TODO markers or is too short — edit it with your project details",
    });
  }

  // 7. .omnix/ runtime dir exists
  const omnixPresent = await exists(cwdPath(opts.cwd, OMNIX_DIR));
  checks.push({
    name: ".omnix/ runtime dir",
    ok: omnixPresent,
    detail: omnixPresent ? OMNIX_DIR : `Missing. Run: omnix init`,
  });

  // 8. .gitignore excludes .omnix/memory/
  const gitignorePath = path.join(opts.cwd, ".gitignore");
  const gitignore = await fs.readFile(gitignorePath, "utf8").catch(() => "");
  const gitignoreOk = gitignore.includes(".omnix/memory/");
  checks.push({
    name: ".gitignore excludes .omnix/memory/",
    ok: gitignoreOk,
    detail: gitignoreOk ? "Found in .gitignore" : "Missing — run omnix init to auto-add, or add manually",
  });

  const passed = checks.filter((c) => c.ok).length;
  const total = checks.length;
  if (passed < total) {
    process.exitCode = 1;
  }

  if (opts.json) {
    console.log(JSON.stringify(checks, null, 2));
    return;
  }

  logger.header("Omnix Verify");
  logger.dim("Checks that Omnix convention files are in place and readable.\n");

  for (const c of checks) {
    logger.row(c.name, c.ok ? "ok" : "FAIL", c.ok);
    if (!c.ok) logger.dim(`    → ${c.detail}`);
  }

  logger.blank();

  if (passed === total) {
    logger.success(`All ${total} checks passed.`);
    logger.dim("Note: passing these checks means the files are present — not that your AI tool will follow them.");
    logger.dim("Check your AI tool's docs for how it loads project rules.");
  } else {
    logger.warn(`${passed}/${total} checks passed. Fix the issues above to ensure conventions are readable.`);
  }
}

async function checkFile(
  cwd: string,
  relPath: string,
  mustContain: string | null,
  checks: VerifyCheck[]
): Promise<void> {
  const filePath = path.join(cwd, relPath);
  const content = await fs.readFile(filePath, "utf8").catch(() => null);

  if (content === null) {
    checks.push({ name: relPath, ok: false, detail: `File not found. Run: omnix init` });
    return;
  }

  if (mustContain && !content.toLowerCase().includes(mustContain.toLowerCase())) {
    checks.push({
      name: relPath,
      ok: false,
      detail: `File exists but is missing "${mustContain}" — may not include memory loop instructions`,
    });
    return;
  }

  checks.push({ name: relPath, ok: true, detail: `${content.length} chars` });
}

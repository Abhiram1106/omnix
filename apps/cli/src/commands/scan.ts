import path from "node:path";
import fs from "fs-extra";
import { detectStack } from "../utils/detect-stack.js";
import { AI_OS_MARKERS, VAULT_DIR, cwdPath, exists } from "../utils/paths.js";
import { logger } from "../utils/logger.js";

export interface ScanOptions {
  cwd: string;
  json: boolean;
  /** If true, write/update project-context.md and current-state.md in vault */
  write?: boolean;
  /** If true, run deep code intelligence scan (hotspots, test gaps, entry points) */
  deep?: boolean;
}

export async function runScan(opts: ScanOptions): Promise<void> {
  const stack = await detectStack(opts.cwd);

  // Detect Omnix markers present
  const markerResults = await Promise.all(
    AI_OS_MARKERS.map(async (m) => ({
      name: m,
      found: await exists(cwdPath(opts.cwd, m)),
    }))
  );

  // Check memory status
  const vaultPath = cwdPath(opts.cwd, VAULT_DIR);
  const memoryPresent = await exists(vaultPath);
  let lastSession: string | null = null;
  let errorCount = 0;

  if (memoryPresent) {
    const sessionsDir = path.join(vaultPath, "01-SESSIONS");
    if (await exists(sessionsDir)) {
      const dateDirs = await fs.readdir(sessionsDir).catch(() => [] as string[]);
      const sorted = dateDirs.filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d)).sort();
      lastSession = sorted[sorted.length - 1] ?? null;
    }
    const errorFile = path.join(vaultPath, "03-ERRORS", "error-memory.md");
    if (await exists(errorFile)) {
      const content = await fs.readFile(errorFile, "utf8").catch(() => "");
      errorCount = (content.match(/^## /gm) ?? []).length;
    }
  }

  const result = {
    projectType: stack.projectType,
    languages: stack.languages,
    frameworks: stack.frameworks,
    packageManager: stack.packageManager,
    testRunner: stack.testRunner,
    databases: stack.databases,
    hasDocker: stack.hasDocker,
    hasK8s: stack.hasK8s,
    hasGitHubActions: stack.hasGitHubActions,
    aiToolsInstalled: stack.aiTools,
    monorepoPackages: stack.monorepoPackages,
    memoryPresent,
    lastSession,
    errorCount,
    markersFound: markerResults.filter((m) => m.found).map((m) => m.name),
  };

  if (opts.json) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  logger.header("Project Scan");
  logger.row("Project type", result.projectType);
  logger.row("Languages", result.languages.join(", ") || "unknown");
  logger.row("Frameworks", result.frameworks.join(", ") || "none");
  logger.row("Package manager", result.packageManager);
  logger.row("Test runner", result.testRunner ?? "none");
  logger.row("Databases", result.databases.join(", ") || "none");
  logger.row("Docker", String(result.hasDocker));
  logger.row("Kubernetes", String(result.hasK8s));
  logger.row("GitHub Actions", String(result.hasGitHubActions));
  logger.blank();
  logger.row("Omnix memory", memoryPresent ? "present" : "missing", memoryPresent);
  logger.row("Last session", lastSession ?? "none");
  logger.row("Error entries", String(errorCount));
  logger.blank();
  logger.row("AI tools installed", result.aiToolsInstalled.join(", ") || "none");
  logger.row("Omnix markers found", result.markersFound.join(", ") || "none");

  if (result.monorepoPackages.length > 0) {
    logger.blank();
    logger.dim("  [monorepo packages]");
    for (const pkg of result.monorepoPackages) {
      logger.row(pkg.path, `${pkg.name} (${pkg.type})`);
    }
  }

  // Deep code intelligence scan
  if (opts.deep) {
    const intel = await runCodeIntelligence(opts.cwd);
    if (!opts.json) {
      logger.blank();
      logger.header("Code Intelligence");
      if (intel.entryPoints.length > 0) {
        logger.dim("  Entry points:");
        for (const ep of intel.entryPoints) logger.dim(`    ${ep}`);
      }
      if (intel.hotspots.length > 0) {
        logger.blank();
        logger.dim("  Hotspots (largest files):");
        for (const h of intel.hotspots) {
          const warning = h.lines > 500 ? " ⚠ consider splitting" : "";
          logger.dim(`    ${h.path}  (${h.lines} lines)${warning}`);
        }
      }
      if (intel.testGaps.length > 0) {
        logger.blank();
        logger.warn(`  Test gaps (${intel.testGaps.length} src files without tests):`);
        for (const g of intel.testGaps.slice(0, 5)) logger.dim(`    ${g}`);
        if (intel.testGaps.length > 5) logger.dim(`    ... and ${intel.testGaps.length - 5} more`);
      }
      if (intel.risks.length > 0) {
        logger.blank();
        logger.warn("  Risks detected:");
        for (const r of intel.risks) logger.dim(`    ${r}`);
      }
    }
    if (opts.write && memoryPresent) {
      await writeCodeIntelligenceToVault(opts.cwd, intel);
    }
  }

  // Optionally write detected info into vault
  if (opts.write && memoryPresent) {
    await writeDetectedContext(opts.cwd, stack);
  } else if (opts.write && !memoryPresent) {
    logger.blank();
    logger.warn("Vault not found — run `omnix init` first to initialize memory.");
  }
}

interface CodeIntelligence {
  entryPoints: string[];
  hotspots: Array<{ path: string; lines: number }>;
  testGaps: string[];
  risks: string[];
}

async function runCodeIntelligence(cwd: string): Promise<CodeIntelligence> {
  const entryPoints: string[] = [];
  const hotspots: Array<{ path: string; lines: number }> = [];
  const testGaps: string[] = [];
  const risks: string[] = [];

  // Find entry points (common patterns)
  const entryPatterns = [
    "src/index.ts", "src/index.js", "src/main.ts", "src/main.js",
    "index.ts", "index.js", "main.ts", "main.py", "app.py",
    "bin/index.js", "bin/cli.js",
  ];
  for (const p of entryPatterns) {
    if (await exists(path.join(cwd, p))) entryPoints.push(p);
  }

  // Find largest files (hotspots) — scan src/ and common dirs
  const srcDirs = ["src", "lib", "app", "pages", "components", "api"];
  for (const dir of srcDirs) {
    const dirPath = path.join(cwd, dir);
    if (!(await exists(dirPath))) continue;
    const files = await getFilesRecursive(dirPath, [".ts", ".tsx", ".js", ".jsx", ".py"]);
    for (const f of files) {
      try {
        const content = await fs.readFile(f, "utf8");
        const lines = content.split("\n").length;
        if (lines > 200) {
          hotspots.push({ path: path.relative(cwd, f), lines });
        }
      } catch { /* skip */ }
    }
  }
  hotspots.sort((a, b) => b.lines - a.lines);
  hotspots.splice(10); // keep top 10

  // Detect test gaps: src files without corresponding test files
  const testDirs = ["tests", "test", "__tests__", "spec"];
  const srcDir = path.join(cwd, "src");
  if (await exists(srcDir)) {
    const srcFiles = await getFilesRecursive(srcDir, [".ts", ".tsx", ".js", ".jsx"]);
    for (const srcFile of srcFiles) {
      if (srcFile.includes(".test.") || srcFile.includes(".spec.")) continue;
      const relSrc = path.relative(cwd, srcFile);
      const baseName = path.basename(srcFile, path.extname(srcFile));
      // Relative sub-path from src/ (e.g. "utils/date" for "src/utils/date.ts")
      const relFromSrc = path.relative(path.join(cwd, "src"), srcFile).replace(/\.(ts|tsx|js|jsx)$/, "");
      let hasTest = false;
      for (const testDir of testDirs) {
        const candidates = [
          // Flat: tests/date.test.ts
          path.join(cwd, testDir, `${baseName}.test.ts`),
          path.join(cwd, testDir, `${baseName}.test.js`),
          // Mirror path: tests/utils/date.test.ts
          path.join(cwd, testDir, `${relFromSrc}.test.ts`),
          path.join(cwd, testDir, `${relFromSrc}.test.js`),
          // Co-located: src/utils/date.test.ts
          srcFile.replace(/\.(ts|tsx|js|jsx)$/, ".test.$1"),
          srcFile.replace(/\.(ts|tsx|js|jsx)$/, ".spec.$1"),
        ];
        for (const candidate of candidates) {
          if (await exists(candidate)) { hasTest = true; break; }
        }
        if (hasTest) break;
      }
      if (!hasTest) testGaps.push(relSrc);
    }
  }

  // Detect risks
  const gitignorePath = path.join(cwd, ".gitignore");
  const gitignore = await fs.readFile(gitignorePath, "utf8").catch(() => "");
  if (!gitignore.includes(".env")) {
    risks.push(".env not in .gitignore — risk of secret exposure");
  }
  const envFile = path.join(cwd, ".env");
  if (await exists(envFile) && !gitignore.includes(".env")) {
    risks.push(".env file exists and not gitignored — CRITICAL: check for committed secrets");
  }
  if (hotspots.some((h) => h.lines > 1000)) {
    risks.push(`${hotspots.filter((h) => h.lines > 1000).length} file(s) exceed 1000 lines — likely need splitting`);
  }
  if (testGaps.length > 10) {
    risks.push(`${testGaps.length} src files without tests — low test coverage`);
  }

  return { entryPoints, hotspots, testGaps, risks };
}

async function getFilesRecursive(dir: string, extensions: string[]): Promise<string[]> {
  const results: string[] = [];
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name.startsWith(".") || entry.name === "node_modules" || entry.name === "dist") continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        results.push(...await getFilesRecursive(full, extensions));
      } else if (extensions.some((ext) => entry.name.endsWith(ext))) {
        results.push(full);
      }
    }
  } catch { /* skip unreadable dirs */ }
  return results;
}

async function writeCodeIntelligenceToVault(cwd: string, intel: CodeIntelligence): Promise<void> {
  const vaultPath = cwdPath(cwd, VAULT_DIR);
  const archPath = path.join(vaultPath, "05-ARCHITECTURE", "repo-scan.md");
  await fs.ensureDir(path.join(vaultPath, "05-ARCHITECTURE"));

  const content = `# Repo Scan
_Generated: ${new Date().toISOString().split("T")[0]}_

## Entry Points
${intel.entryPoints.length > 0 ? intel.entryPoints.map((e) => `- ${e}`).join("\n") : "- None detected"}

## Hotspots (Largest Files)
${intel.hotspots.length > 0
  ? intel.hotspots.map((h) => `- \`${h.path}\` — ${h.lines} lines${h.lines > 500 ? " ⚠" : ""}`).join("\n")
  : "- No large files detected"}

## Test Gaps
${intel.testGaps.length > 0
  ? intel.testGaps.slice(0, 10).map((g) => `- \`${g}\``).join("\n") + (intel.testGaps.length > 10 ? `\n- ... and ${intel.testGaps.length - 10} more` : "")
  : "- No test gaps detected"}

## Risks
${intel.risks.length > 0 ? intel.risks.map((r) => `- ${r}`).join("\n") : "- No risks detected"}
`;

  await fs.writeFile(archPath, content, "utf8");
  logger.success(`Code intelligence written to ${VAULT_DIR}/05-ARCHITECTURE/repo-scan.md`);
}

async function writeDetectedContext(
  cwd: string,
  stack: Awaited<ReturnType<typeof detectStack>>
): Promise<void> {
  const vaultPath = cwdPath(cwd, VAULT_DIR);
  const projectName = path.basename(cwd);
  const stackStr = [...stack.languages, ...stack.frameworks].join(", ") || "unknown";

  const contextPath = path.join(vaultPath, "02-PROJECTS", "project-context.md");
  const statePath = path.join(vaultPath, "02-PROJECTS", "current-state.md");

  // Write project-context.md if it hasn't been manually edited (still contains template markers)
  const existingCtx = await fs.readFile(contextPath, "utf8").catch(() => "");
  const isTemplate = existingCtx.includes("- Stack:") && !existingCtx.includes(stackStr);

  if (!existingCtx || isTemplate) {
    const content = `# Project Context

- Project Name: ${projectName}
- Current Goal: (fill in)
- Stack: ${stackStr}
- Package Manager: ${stack.packageManager}
- Project Type: ${stack.projectType}
- Architecture: (fill in)
- Important Constraints: (fill in)
- Current Priorities: (fill in)
- Known Risks: (fill in)
- Active Decisions: (fill in)
- Known Errors: see 03-ERRORS/error-memory.md
- Do Not Repeat: see 03-ERRORS/anti-patterns.md
- Next Steps: (fill in)

---
_Generated by omnix scan on ${new Date().toISOString().split("T")[0]}_
`;
    await fs.writeFile(contextPath, content, "utf8");
    logger.success(`Updated ${VAULT_DIR}/02-PROJECTS/project-context.md`);
  } else {
    logger.dim(`  project-context.md already customized — skipping auto-update`);
  }

  // Always update current-state.md with latest scan results
  const stateContent = `# Current State

_Last scanned: ${new Date().toISOString().split("T")[0]}_

## Stack

- Languages: ${stack.languages.join(", ") || "none detected"}
- Frameworks: ${stack.frameworks.join(", ") || "none detected"}
- Package Manager: ${stack.packageManager}
- Test Runner: ${stack.testRunner ?? "none detected"}
- Databases: ${stack.databases.join(", ") || "none detected"}

## Infrastructure

- Docker: ${stack.hasDocker ? "yes" : "no"}
- Kubernetes: ${stack.hasK8s ? "yes" : "no"}
- GitHub Actions: ${stack.hasGitHubActions ? "yes" : "no"}

## AI Tools Installed

${stack.aiTools.length > 0 ? stack.aiTools.map((t) => `- ${t}`).join("\n") : "- none detected"}

## What's shipping

(fill in)

## What's blocked

(fill in)
`;
  await fs.writeFile(statePath, stateContent, "utf8");
  logger.success(`Updated ${VAULT_DIR}/02-PROJECTS/current-state.md`);
}

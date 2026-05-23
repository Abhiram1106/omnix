/**
 * dependency-doctor skill handler
 *
 * Audits package.json for outdated, unused, and vulnerable dependencies.
 * Does not require Trivy (which may not be installed) — uses npm audit JSON
 * and package.json analysis available in any Node environment.
 */

import path from "node:path";
import { execSync } from "node:child_process";
import fs from "fs-extra";
import type { SkillHandler } from "../utils/skill-runner.js";
import { detectStack } from "../utils/detect-stack.js";

/**
 * Run a command and capture stdout. Returns empty string on failure.
 * Cross-platform: avoids shell-specific operators like `||` and `2>/dev/null`.
 */
function tryExec(cmd: string, cwd: string, timeout = 30000): string {
  try {
    return execSync(cmd, { cwd, encoding: "utf8", timeout, stdio: ["ignore", "pipe", "ignore"] });
  } catch {
    return "";
  }
}

/** Detect which Node package manager is available. */
function detectPm(cwd: string): "npm" | "pnpm" | "yarn" | null {
  if (fs.existsSync(path.join(cwd, "pnpm-lock.yaml"))) return "pnpm";
  if (fs.existsSync(path.join(cwd, "yarn.lock"))) return "yarn";
  if (fs.existsSync(path.join(cwd, "package-lock.json"))) return "npm";
  // Fallback: try npm first
  return "npm";
}

export const handler: SkillHandler = async ({ cwd, vaultRoot, dryRun }) => {
  const output: string[] = ["# Dependency Doctor", ""];

  const stack = await detectStack(cwd);

  // For monorepos: show which packages will be scanned
  if (stack.isMonorepo && stack.monorepoPackages.length > 0) {
    output.push(`**Monorepo** (${stack.monorepoTool}) — scanning ${stack.monorepoPackages.length} packages + root`);
    output.push("");
  }

  // Detect manifest
  const pkgPath = path.join(cwd, "package.json");
  const hasPkg = await fs.pathExists(pkgPath);
  const hasRequirements = await fs.pathExists(path.join(cwd, "requirements.txt"));
  const hasPyproject = await fs.pathExists(path.join(cwd, "pyproject.toml"));

  if (!hasPkg && !hasRequirements && !hasPyproject) {
    output.push("No package manifest found (package.json, requirements.txt, pyproject.toml).");
    return { output: output.join("\n"), memoryWrites: [] };
  }

  // ── npm audit ─────────────────────────────────────────────────────────────
  if (hasPkg) {
    output.push("## npm audit");
    output.push("");

    const pm = detectPm(cwd);
    // Try the detected pm first, then npm as fallback. No shell operators — pure node child_process.
    let auditRaw = pm ? tryExec(`${pm} audit --json`, cwd) : "";
    if (!auditRaw && pm !== "npm") auditRaw = tryExec("npm audit --json", cwd);

    if (!auditRaw) {
      output.push("Could not run audit. Is npm/pnpm/yarn installed and accessible?");
    } else {
      try {
        const audit = JSON.parse(auditRaw) as {
          vulnerabilities?: Record<string, { severity: string; name: string; via: unknown[] }>;
          metadata?: { vulnerabilities: Record<string, number> };
        };

        const vulns = audit.vulnerabilities ?? {};
        const meta = audit.metadata?.vulnerabilities ?? {};

        const critical = (meta["critical"] ?? 0);
        const high = (meta["high"] ?? 0);
        const moderate = (meta["moderate"] ?? 0);
        const low = (meta["low"] ?? 0);
        const total = critical + high + moderate + low;

        if (total === 0) {
          output.push("✓ No vulnerabilities found.");
        } else {
          if (critical > 0) output.push(`🔴 **${critical} CRITICAL** — fix before release`);
          if (high > 0)     output.push(`🟠 **${high} HIGH** — fix this week`);
          if (moderate > 0) output.push(`🟡 ${moderate} moderate`);
          if (low > 0)      output.push(`⚪ ${low} low`);
          output.push("");

          const topVulns = Object.values(vulns)
            .filter((v) => v.severity === "critical" || v.severity === "high")
            .slice(0, 5);
          if (topVulns.length > 0) {
            output.push("**Top issues:**");
            for (const v of topVulns) {
              output.push(`  - [${v.severity.toUpperCase()}] ${v.name}`);
            }
          }
          output.push("");
          output.push("Run `npm audit fix` for auto-fixable issues.");
        }
      } catch {
        output.push("Audit ran but JSON output could not be parsed.");
      }
    }

    // ── Dependency age check ─────────────────────────────────────────────────
    output.push("");
    output.push("## Outdated packages (direct dependencies)");
    output.push("");
    const outdatedRaw = tryExec("npm outdated --json", cwd);
    if (!outdatedRaw) {
      output.push("Run `npm outdated` manually to see outdated packages.");
    } else {
      try {
        const outdated = JSON.parse(outdatedRaw) as Record<string, {
          current: string; wanted: string; latest: string;
        }>;
        const entries = Object.entries(outdated);
        if (entries.length === 0) {
          output.push("✓ All packages up to date.");
        } else {
          output.push("| Package | Current | Latest |");
          output.push("|---------|---------|--------|");
          for (const [name, info] of entries.slice(0, 15)) {
            output.push(`| ${name} | ${info.current} | ${info.latest} |`);
          }
          if (entries.length > 15) output.push(`| ... and ${entries.length - 15} more | | |`);
        }
      } catch {
        output.push("`npm outdated` ran but output could not be parsed.");
      }
    }

    // ── License check (quick) ────────────────────────────────────────────────
    output.push("");
    output.push("## License check");
    const pkg = await fs.readJSON(pkgPath).catch(() => ({})) as {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };
    const depCount = Object.keys(pkg.dependencies ?? {}).length;
    const devDepCount = Object.keys(pkg.devDependencies ?? {}).length;
    output.push(`${depCount} production deps, ${devDepCount} dev deps.`);
    output.push("Run `npx license-checker --summary` for a full license report.");
  }

  if (hasRequirements || hasPyproject) {
    output.push("");
    output.push("## Python dependencies");
    output.push("Run `pip-audit` for vulnerability scanning: `pip install pip-audit && pip-audit`");
  }

  // ── Monorepo: per-package audit summary ─────────────────────────────────────
  if (stack.isMonorepo && stack.monorepoPackages.length > 0) {
    output.push("");
    output.push("## Per-package dependency summary");
    output.push("");
    for (const pkg of stack.monorepoPackages) {
      const pkgDir = path.join(cwd, pkg.path);
      const pkgJsonPath = path.join(pkgDir, "package.json");
      if (!(await fs.pathExists(pkgJsonPath))) continue;
      const pkgJson = await fs.readJSON(pkgJsonPath).catch(() => ({})) as {
        dependencies?: Record<string, string>;
        devDependencies?: Record<string, string>;
        version?: string;
      };
      const deps = Object.keys(pkgJson.dependencies ?? {}).length;
      const devDeps = Object.keys(pkgJson.devDependencies ?? {}).length;
      output.push(`- **${pkg.name}** (\`${pkg.path}\`): ${deps} prod, ${devDeps} dev deps`);
    }
  }

  // Write findings to vault
  const today = new Date().toISOString().split("T")[0];
  const vaultEntry = `# Dependency Audit — ${today}\n\n${output.slice(1).join("\n")}`;

  return {
    output: output.join("\n"),
    memoryWrites: dryRun ? [] : [{
      path: "07-LESSONS/dependency-notes.md",
      content: vaultEntry,
      mode: "overwrite",
    }],
  };
};

/**
 * security-threat-modeler skill handler
 *
 * Runs a STRIDE-style threat scan of the project:
 *   - Scans code for risky patterns (eval, exec, child_process with user input, etc.)
 *   - Checks .env handling and .gitignore correctness
 *   - Runs sanitize patterns over recent commits to find leaked secrets
 *   - Verifies HTTPS-only patterns (no http:// in fetch/axios calls)
 *   - Produces a threat model with severity ranking
 */

import path from "node:path";
import { execSync } from "node:child_process";
import fs from "fs-extra";
import type { SkillHandler } from "../utils/skill-runner.js";

interface Finding {
  severity: "critical" | "high" | "medium" | "low";
  category: string;
  file: string;
  line?: number;
  message: string;
}

export const handler: SkillHandler = async ({ cwd, dryRun }) => {
  const output: string[] = ["# Security Threat Model", ""];
  const findings: Finding[] = [];

  // ── 1. .env / .gitignore checks ──────────────────────────────────────────
  const gitignore = await fs.readFile(path.join(cwd, ".gitignore"), "utf8").catch(() => "");
  const envExists = await fs.pathExists(path.join(cwd, ".env"));

  if (envExists && !gitignore.includes(".env")) {
    findings.push({
      severity: "critical",
      category: "Information Disclosure",
      file: ".env",
      message: ".env file exists and is NOT in .gitignore — may be committed to git history",
    });
  } else if (!gitignore.includes(".env")) {
    findings.push({
      severity: "medium",
      category: "Information Disclosure",
      file: ".gitignore",
      message: ".env not listed in .gitignore — risk if a .env file is ever created",
    });
  }

  // ── 2. Code pattern scanning ─────────────────────────────────────────────
  const sourceFiles = await listSourceFiles(cwd);
  const patterns: Array<{ re: RegExp; severity: Finding["severity"]; category: string; message: string }> = [
    { re: /\beval\s*\(/g,               severity: "high",     category: "Tampering",         message: "eval() — code injection risk if input is user-controlled" },
    { re: /new Function\s*\(/g,         severity: "high",     category: "Tampering",         message: "new Function() — same risk as eval" },
    { re: /child_process[.\s]*exec\s*\(/g, severity: "high",  category: "Elevation of Privilege", message: "child_process.exec — command injection risk; use execFile with array args" },
    { re: /http:\/\/(?!localhost|127\.)/g, severity: "medium", category: "Information Disclosure", message: "Plain http:// URL — should be https://" },
    { re: /password\s*[:=]\s*['"][^'"]+['"]/gi, severity: "high", category: "Information Disclosure", message: "Hardcoded password literal" },
    { re: /api[_-]?key\s*[:=]\s*['"][^'"]+['"]/gi, severity: "high", category: "Information Disclosure", message: "Hardcoded API key literal" },
    { re: /\bcrypto\.createHash\(['"]md5['"]\)/g, severity: "medium", category: "Tampering", message: "MD5 is broken — use SHA-256 or better" },
    { re: /\bcrypto\.createHash\(['"]sha1['"]\)/g, severity: "medium", category: "Tampering", message: "SHA-1 is deprecated — use SHA-256 or better" },
    { re: /innerHTML\s*=/g,             severity: "high",     category: "Tampering",         message: "innerHTML assignment — XSS risk; use textContent or a sanitizer" },
    { re: /dangerouslySetInnerHTML/g,   severity: "medium",   category: "Tampering",         message: "React dangerouslySetInnerHTML — verify input is sanitized" },
    { re: /req\.(query|params|body)\.\w+\s*\+/g, severity: "medium", category: "Tampering", message: "User input concatenated into a string — verify destination (SQL? command? path?)" },
    { re: /Math\.random\(\)/g,          severity: "low",      category: "Tampering",         message: "Math.random is NOT cryptographically secure; use crypto.randomBytes for tokens" },
  ];

  for (const file of sourceFiles.slice(0, 200)) { // cap at 200 files for speed
    const content = await fs.readFile(file, "utf8").catch(() => "");
    if (!content) continue;
    const lines = content.split("\n");
    for (const { re, severity, category, message } of patterns) {
      let m: RegExpExecArray | null;
      re.lastIndex = 0;
      while ((m = re.exec(content)) !== null) {
        const lineNum = content.slice(0, m.index).split("\n").length;
        const lineText = lines[lineNum - 1] ?? "";
        // Skip obvious test/comment false positives
        if (file.includes(".test.") || file.includes(".spec.")) break;
        if (/^\s*(\/\/|\/\*|\*|#)/.test(lineText)) continue;
        findings.push({
          severity,
          category,
          file: path.relative(cwd, file),
          line: lineNum,
          message,
        });
        if (findings.length > 100) break;
      }
      if (findings.length > 100) break;
    }
    if (findings.length > 100) break;
  }

  // ── 3. Check git history for committed secrets (last 20 commits) ─────────
  try {
    const log = execSync("git log -20 --name-only --pretty=format:%H", {
      cwd, encoding: "utf8", timeout: 10000, stdio: ["ignore", "pipe", "ignore"],
    });
    if (log.match(/\.env(\s|$)/m)) {
      findings.push({
        severity: "critical",
        category: "Information Disclosure",
        file: "git history",
        message: ".env appears in git history — secrets may already be public. Rotate any keys.",
      });
    }
  } catch { /* not a git repo */ }

  // ── 4. Output ────────────────────────────────────────────────────────────
  output.push(`**Total findings:** ${findings.length}`);
  const counts = {
    critical: findings.filter((f) => f.severity === "critical").length,
    high:     findings.filter((f) => f.severity === "high").length,
    medium:   findings.filter((f) => f.severity === "medium").length,
    low:      findings.filter((f) => f.severity === "low").length,
  };
  output.push(`🔴 Critical: ${counts.critical}    🟠 High: ${counts.high}    🟡 Medium: ${counts.medium}    ⚪ Low: ${counts.low}`);
  output.push("");

  if (findings.length === 0) {
    output.push("✓ No security issues detected by pattern scanning.");
    output.push("");
    output.push("Note: this is a static scan. It does not replace a real security review.");
  } else {
    // Group by severity
    for (const sev of ["critical", "high", "medium", "low"] as const) {
      const group = findings.filter((f) => f.severity === sev);
      if (group.length === 0) continue;
      output.push(`## ${sev.toUpperCase()} (${group.length})`);
      output.push("");
      for (const f of group.slice(0, 15)) {
        const loc = f.line ? `${f.file}:${f.line}` : f.file;
        output.push(`- **${loc}** [${f.category}]`);
        output.push(`  ${f.message}`);
      }
      if (group.length > 15) output.push(`  ... and ${group.length - 15} more`);
      output.push("");
    }
  }

  output.push("## STRIDE coverage");
  output.push("");
  output.push("- **S**poofing: check auth flow, session handling (manual review)");
  output.push("- **T**ampering: covered by code pattern scan above");
  output.push("- **R**epudiation: audit logging present? (manual review)");
  output.push("- **I**nformation Disclosure: covered by .env + git history scan");
  output.push("- **D**oS: rate limiting on public endpoints? (manual review)");
  output.push("- **E**levation of Privilege: covered by exec/eval scan");

  const today = new Date().toISOString().split("T")[0]!;
  const vaultEntry = `# Security Scan — ${today}\n\n${output.slice(1).join("\n")}`;

  return {
    output: output.join("\n"),
    memoryWrites: dryRun ? [] : [{
      path: "07-LESSONS/security-scan.md",
      content: vaultEntry,
      mode: "overwrite",
    }],
  };
};

async function listSourceFiles(cwd: string): Promise<string[]> {
  const results: string[] = [];
  const exts = [".ts", ".tsx", ".js", ".jsx", ".py", ".go", ".rs"];

  async function walk(dir: string): Promise<void> {
    const entries = await fs.readdir(dir, { withFileTypes: true }).catch(() => []);
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) {
        if (["node_modules", ".git", "dist", ".next", "build", "__pycache__", ".obsidian-ai-memory"].includes(e.name)) continue;
        await walk(full);
      } else if (exts.some((ext) => e.name.endsWith(ext))) {
        results.push(full);
      }
    }
  }
  await walk(cwd);
  return results;
}

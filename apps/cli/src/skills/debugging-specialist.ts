/**
 * debugging-specialist skill handler
 *
 * Runtime behavior:
 * 1. Parse error text from input
 * 2. Search error-memory.md for matching past errors (BM25-style)
 * 3. Classify error type from the message
 * 4. Generate a hypothesis-driven diagnosis plan
 * 5. Output the plan + any matching past fixes
 * 6. Optionally write a new error entry template to vault
 */

import path from "node:path";
import fs from "fs-extra";
import type { SkillHandler } from "../utils/skill-runner.js";

export const handler: SkillHandler = async ({ input, vaultRoot, dryRun }) => {
  const errorText = input.trim();
  const output: string[] = [];
  const memoryWrites: ReturnType<typeof buildMemoryWrite>[] = [];

  output.push("# Debugging Specialist");
  output.push("");

  if (!errorText) {
    output.push("No error text provided. Usage: omnix skills run debugging-specialist --input \"<error message>\"");
    return { output: output.join("\n"), memoryWrites: [] };
  }

  // ── Step 1: Search error memory ────────────────────────────────────────────
  const errorMemPath = path.join(vaultRoot, "03-ERRORS", "error-memory.md");
  const errorMemContent = await fs.readFile(errorMemPath, "utf8").catch(() => "");
  const matches = searchErrorMemory(errorText, errorMemContent);

  if (matches.length > 0) {
    output.push("## Past matches from error memory");
    output.push("");
    for (const m of matches.slice(0, 3)) {
      output.push(`### ${m.title}  (relevance: ${m.score.toFixed(1)})`);
      if (m.rootCause) output.push(`- **Root Cause:** ${m.rootCause}`);
      if (m.fix)       output.push(`- **Fix:** ${m.fix}`);
      if (m.prevention) output.push(`- **Prevention:** ${m.prevention}`);
      output.push("");
    }
    output.push("---");
    output.push("");
  } else {
    output.push("## No past matches found");
    output.push("This appears to be a new error type.");
    output.push("");
  }

  // ── Step 2: Classify error type ───────────────────────────────────────────
  const classification = classifyError(errorText);
  output.push("## Error classification");
  output.push("");
  output.push(`**Type:** ${classification.type}`);
  output.push(`**Likely cause:** ${classification.likelyCause}`);
  output.push(`**Cheapest diagnostic check:** ${classification.check}`);
  output.push("");

  // ── Step 3: Generate hypothesis ───────────────────────────────────────────
  output.push("## Suggested hypothesis");
  output.push("");
  output.push(`> ${classification.hypothesis}`);
  output.push("");
  output.push("**Test this hypothesis first** — one change at a time.");
  output.push("");

  // ── Step 4: Four-phase recovery plan ──────────────────────────────────────
  output.push("## Four-phase recovery plan");
  output.push("");
  output.push("**Phase 1 — Capture**");
  output.push("- Copy the full error including stack trace (not just first line)");
  output.push("- Note: last action taken, environment (local/CI/prod)");
  output.push("");
  output.push("**Phase 2 — Binary search**");
  output.push(`- ${classification.check}`);
  output.push("- Add a log/assertion at the midpoint of the call stack");
  output.push("- Work toward the root, not away from it");
  output.push("");
  output.push("**Phase 3 — Minimal fix**");
  output.push("- Change ONE thing only");
  output.push("- Write the regression test BEFORE merging the fix");
  output.push("");
  output.push("**Phase 4 — Record**");
  output.push("- After fixing: run `omnix skills run error-intelligence --input \"<error>\"` to record it");
  output.push("");

  // ── Step 5: Generate error entry template for vault ───────────────────────
  if (!dryRun && matches.length === 0) {
    const template = buildErrorEntryTemplate(errorText, classification);
    memoryWrites.push({
      path: "03-ERRORS/.pending-error.md",
      content: template,
      mode: "overwrite",
    });
    output.push("---");
    output.push("A blank error entry template has been written to `03-ERRORS/.pending-error.md`.");
    output.push("Fill it in after fixing, then paste it into `03-ERRORS/error-memory.md`.");
  }

  return { output: output.join("\n"), memoryWrites };
};

// ── Helpers ──────────────────────────────────────────────────────────────────

interface ErrorMatch {
  title: string;
  rootCause: string;
  fix: string;
  prevention: string;
  score: number;
}

function searchErrorMemory(query: string, content: string): ErrorMatch[] {
  const blocks = content.split(/^## /m).filter(Boolean);
  const queryWords = query.toLowerCase().split(/\W+/).filter((w) => w.length > 3);

  return blocks
    .map((block) => {
      const lines = block.trim().split("\n");
      const title = lines[0]?.trim() ?? "Unknown";
      const getField = (label: string) =>
        block.match(new RegExp(`- ${label}:\\s*(.+)`, "i"))?.[1]?.trim() ?? "";
      const score = queryWords.reduce((s, w) => {
        const hits = (block.toLowerCase().match(new RegExp(`\\b${w}\\b`, "g")) ?? []).length;
        return s + Math.log(1 + hits);
      }, 0);
      return { title, rootCause: getField("Root Cause"), fix: getField("Fix"), prevention: getField("Prevention"), score };
    })
    .filter((e) => e.score > 0)
    .sort((a, b) => b.score - a.score);
}

interface ErrorClassification {
  type: string;
  likelyCause: string;
  check: string;
  hypothesis: string;
}

function classifyError(text: string): ErrorClassification {
  const t = text.toLowerCase();

  if (/cannot read propert|undefined is not|null is not|typeerror/.test(t)) {
    return {
      type: "Null/undefined reference",
      likelyCause: "A value expected to exist is null or undefined at point of use",
      check: "Add console.log one line before the failure to inspect the value",
      hypothesis: "A null/undefined value is reaching code that assumes it is populated. Add a guard or trace the value's source.",
    };
  }
  if (/econnrefused|connection refused|enotfound|network|fetch/.test(t)) {
    return {
      type: "Network / connection failure",
      likelyCause: "Service not running, wrong host/port, or firewall",
      check: "curl the target URL directly from the same environment",
      hypothesis: "The target service is unreachable. Verify it is running, check the URL/port, and confirm environment variables match.",
    };
  }
  if (/module not found|cannot find module|import.*error|esm|require/.test(t)) {
    return {
      type: "Import / module resolution",
      likelyCause: "Wrong import path, package not installed, or CJS/ESM mismatch",
      check: "Verify the file exists at the exact import path; check node_modules",
      hypothesis: "The module path is wrong or the package is missing. Check package.json and the import statement.",
    };
  }
  if (/syntax error|unexpected token|parse error/.test(t)) {
    return {
      type: "Syntax error",
      likelyCause: "Typo, unclosed bracket, or invalid syntax in recently edited file",
      check: "Check the file mentioned in the stack trace at the given line number",
      hypothesis: "A syntax error was introduced in a recent edit. The error line number in the stack trace is exact.",
    };
  }
  if (/timeout|timed out|deadline/.test(t)) {
    return {
      type: "Timeout",
      likelyCause: "Slow query, network latency, or infinite loop",
      check: "Profile the operation that timed out — is it a DB query, HTTP call, or computation?",
      hypothesis: "An operation is taking longer than the configured timeout. Add timing logs to isolate the slow step.",
    };
  }
  if (/permission denied|eacces|forbidden|401|403/.test(t)) {
    return {
      type: "Permission / auth error",
      likelyCause: "Missing credentials, expired token, or wrong IAM role",
      check: "Verify the credentials/token in use; check they have the required permissions",
      hypothesis: "The operation requires a permission that is not granted. Verify auth credentials and scope.",
    };
  }
  if (/out of memory|heap|oom|killed/.test(t)) {
    return {
      type: "Memory exhaustion",
      likelyCause: "Memory leak, unbounded data load, or insufficient heap size",
      check: "Take a heap snapshot; check for accumulating data structures in a loop",
      hypothesis: "Memory is not being released. Profile with --inspect, look for growing arrays/maps that are never cleared.",
    };
  }

  return {
    type: "Unknown / general error",
    likelyCause: "Inspect the full stack trace for the root cause",
    check: "Read the FULL error message including the 'caused by' chain at the bottom",
    hypothesis: "The root cause is likely in the middle of the stack trace, not the first line. Read the complete trace.",
  };
}

function buildErrorEntryTemplate(errorText: string, classification: ErrorClassification): string {
  const today = new Date().toISOString().split("T")[0];
  return `## ${classification.type}: ${errorText.slice(0, 60)}
- Date: ${today}
- Last Verified: ${today}
- Status: investigating
- Symptom: ${errorText.slice(0, 120)}
- Root Cause: TODO
- Fix: TODO
- Prevention Rule: TODO
- Regression Test Added: no
- Related Files: TODO
`;
}

function buildMemoryWrite(p: string, content: string, mode: "append" | "overwrite") {
  return { path: p, content, mode };
}

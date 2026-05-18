/**
 * error-intelligence skill handler
 *
 * After fixing a bug, records it properly to error-memory.md.
 * Input format (pipe-separated or structured):
 *   "symptom | root cause | fix | prevention"
 *   or just the error text (creates a minimal entry)
 */

import path from "node:path";
import fs from "fs-extra";
import type { SkillHandler } from "../utils/skill-runner.js";

export const handler: SkillHandler = async ({ input, vaultRoot, dryRun }) => {
  const output: string[] = ["# Error Intelligence — Record Fix", ""];

  if (!input.trim()) {
    output.push("Usage: omnix skills run error-intelligence --input \"symptom | root cause | fix | prevention\"");
    output.push("       omnix skills run error-intelligence --input \"cannot read property of null\"");
    return { output: output.join("\n"), memoryWrites: [] };
  }

  // Parse pipe-separated or freeform input
  const parts = input.split("|").map((p) => p.trim());
  const symptom    = parts[0] ?? input.trim();
  const rootCause  = parts[1] ?? "TODO — fill in root cause";
  const fix        = parts[2] ?? "TODO — fill in what was done to fix it";
  const prevention = parts[3] ?? "TODO — fill in how to prevent this in future";

  const today = new Date().toISOString().split("T")[0]!;
  const title = symptom.slice(0, 70);

  const entry = `
## ${title}
- Date: ${today}
- Last Verified: ${today}
- Status: resolved
- Symptom: ${symptom}
- Root Cause: ${rootCause}
- Fix: ${fix}
- Prevention Rule: ${prevention}
- Regression Test Added: ${fix.toLowerCase().includes("test") ? "yes" : "no — add one"}
- Related Files:

`;

  const errorMemPath = path.join("03-ERRORS", "error-memory.md");
  const absPath = path.join(vaultRoot, errorMemPath);

  // Check for duplicates (loose match on symptom keywords)
  const existing = await fs.readFile(absPath, "utf8").catch(() => "");
  const keywords = symptom.toLowerCase().split(/\W+/).filter((w) => w.length > 4);
  const isDuplicate = keywords.length > 0 && keywords.some((kw) =>
    existing.toLowerCase().includes(kw)
  );

  if (isDuplicate) {
    output.push("⚠ A similar error entry may already exist in error-memory.md.");
    output.push("Review it before adding a duplicate.");
    output.push("");
    output.push("Entry that would be written:");
    output.push("```");
    output.push(entry.trim());
    output.push("```");
    return { output: output.join("\n"), memoryWrites: [] };
  }

  output.push("## Entry to be written to error-memory.md");
  output.push("```");
  output.push(entry.trim());
  output.push("```");

  if (dryRun) {
    output.push("");
    output.push("Dry-run: entry not written.");
  } else {
    output.push("");
    output.push(`✓ Written to ${errorMemPath}`);
    if (rootCause === "TODO — fill in root cause") {
      output.push("");
      output.push("⚠ Root cause and fix are placeholders. Edit the entry in your vault.");
    }
  }

  return {
    output: output.join("\n"),
    memoryWrites: dryRun ? [] : [{ path: errorMemPath, content: entry, mode: "append" }],
  };
};

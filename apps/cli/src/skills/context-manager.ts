/**
 * context-manager skill handler
 *
 * Produces a bounded, task-type-aware context snapshot from the vault.
 * Prints a startup block your AI tool can consume at session start.
 *
 * This is the runtime equivalent of `omnix retrieve-context` but driven
 * as a skill with memory integration.
 */

import path from "node:path";
import fs from "fs-extra";
import type { SkillHandler } from "../utils/skill-runner.js";

const TOKEN_BUDGET = 2000;
const CHARS_PER_TOKEN = 4;

export const handler: SkillHandler = async ({ input, vaultRoot, memoryContext }) => {
  const task = input.trim();
  const output: string[] = [];

  output.push("# Omnix Context Pack");
  output.push(`> Task: ${task || "(no task specified)"}`);
  output.push(`> Generated: ${new Date().toISOString()}`);
  output.push("");

  let tokensUsed = 0;
  const budget = TOKEN_BUDGET;

  // Priority order — task-type aware
  const mode = detectMode(task);
  output.push(`> Retrieval mode: ${mode}`);
  output.push("");

  const priorityFiles = getPriorityFiles(mode);

  for (const { key, label, maxChars } of priorityFiles) {
    const content = memoryContext[key];
    if (!content) continue;
    const chunk = content.slice(0, maxChars);
    const tokens = Math.ceil(chunk.length / CHARS_PER_TOKEN);
    if (tokensUsed + tokens > budget) break;
    tokensUsed += tokens;
    output.push(`## ${label}`);
    output.push(chunk.trim());
    output.push("");
  }

  // Active goals from vault if not already loaded
  const goalsPath = path.join(vaultRoot, "02-PROJECTS", "active-goals.md");
  if (!memoryContext["02-PROJECTS/active-goals.md"] && tokensUsed < budget) {
    const goals = await fs.readFile(goalsPath, "utf8").catch(() => "");
    if (goals.trim()) {
      const chunk = goals.slice(0, 800);
      output.push("## Active Goals");
      output.push(chunk.trim());
      output.push("");
      tokensUsed += Math.ceil(chunk.length / CHARS_PER_TOKEN);
    }
  }

  output.push("---");
  output.push(`> Token estimate: ~${tokensUsed} / ${budget}`);
  output.push("> Copy this block into your AI tool's context, or use: omnix context-pack");

  return {
    output: output.join("\n"),
    memoryWrites: [],
  };
};

function detectMode(task: string): string {
  const t = task.toLowerCase();
  if (/error|crash|fail|broken|exception|bug|debug/.test(t)) return "debugging";
  if (/architect|design|scale|structure|adr/.test(t)) return "architecture";
  if (/quick|what is|show me|list/.test(t)) return "minimal";
  if (/build|implement|add|create|feature/.test(t)) return "deep";
  return "balanced";
}

function getPriorityFiles(mode: string): Array<{ key: string; label: string; maxChars: number }> {
  const base = [
    { key: "02-PROJECTS/project-context.md", label: "Project Context", maxChars: 2000 },
    { key: "02-PROJECTS/active-goals.md",    label: "Active Goals",    maxChars: 800 },
  ];
  if (mode === "debugging") {
    return [
      { key: "03-ERRORS/error-memory.md",   label: "Error Memory",   maxChars: 2000 },
      { key: "03-ERRORS/anti-patterns.md",  label: "Anti-Patterns",  maxChars: 800 },
      ...base,
    ];
  }
  if (mode === "architecture") {
    return [
      { key: "05-ARCHITECTURE/system-overview.md", label: "Architecture", maxChars: 2000 },
      { key: "04-DECISIONS/decisions.md",          label: "Decisions",    maxChars: 1000 },
      ...base,
    ];
  }
  return base;
}

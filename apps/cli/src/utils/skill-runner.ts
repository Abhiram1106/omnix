/**
 * Skill runtime engine.
 * Loads a skill's SKILL.md, resolves its declared memory_reads from the vault,
 * executes the handler if one exists, and writes declared memory_writes.
 *
 * Skills with runtime handlers register themselves in SKILL_HANDLERS below.
 * Skills without handlers print their instructions and memory context instead
 * (the "guided mode" — AI reads it, user follows the steps).
 */

import path from "node:path";
import fs from "fs-extra";
import { VAULT_DIR, cwdPath, exists } from "./paths.js";
import { logger } from "./logger.js";

export interface SkillRunOptions {
  cwd: string;
  skillName: string;
  /** Freeform context to pass into the skill (e.g. error text, task description) */
  input?: string;
  dryRun?: boolean;
}

export interface SkillRunResult {
  skillName: string;
  hadHandler: boolean;
  output: string;
  memoryWritten: string[];
}

export type SkillHandler = (opts: SkillHandlerOptions) => Promise<SkillHandlerResult>;

export interface SkillHandlerOptions {
  cwd: string;
  input: string;
  vaultRoot: string;
  dryRun: boolean;
  /** Pre-loaded memory files as key→content map */
  memoryContext: Record<string, string>;
}

export interface SkillHandlerResult {
  output: string;
  memoryWrites: Array<{ path: string; content: string; mode: "append" | "overwrite" }>;
}

// ── Handler registry ─────────────────────────────────────────────────────────
// Each entry maps a skill name to its runtime handler function.
// Import lazily to keep startup fast.

const SKILL_HANDLERS: Record<string, () => Promise<SkillHandler>> = {
  "debugging-specialist":      () => import("../skills/debugging-specialist.js").then((m) => m.handler),
  "error-intelligence":        () => import("../skills/error-intelligence.js").then((m) => m.handler),
  "context-manager":           () => import("../skills/context-manager.js").then((m) => m.handler),
  "workflow-router":           () => import("../skills/workflow-router.js").then((m) => m.handler),
  "repo-scanner":              () => import("../skills/repo-scanner.js").then((m) => m.handler),
  "dependency-doctor":         () => import("../skills/dependency-doctor.js").then((m) => m.handler),
  "documentation-maintainer":  () => import("../skills/documentation-maintainer.js").then((m) => m.handler),
  "test-architect":            () => import("../skills/test-architect.js").then((m) => m.handler),
  "security-threat-modeler":   () => import("../skills/security-threat-modeler.js").then((m) => m.handler),
  "release-manager":           () => import("../skills/release-manager.js").then((m) => m.handler),
};

/** Run a skill by name. Falls back to guided mode if no handler registered. */
export async function runSkill(opts: SkillRunOptions): Promise<SkillRunResult> {
  const { cwd, skillName, input = "", dryRun = false } = opts;
  const vaultRoot = cwdPath(cwd, VAULT_DIR);

  const handlerLoader = SKILL_HANDLERS[skillName];

  // Locate SKILL.md (may be absent for handler-only skills running outside the monorepo)
  const skillFile = await resolveSkillFile(cwd, skillName);
  if (!skillFile && !handlerLoader) {
    return {
      skillName,
      hadHandler: false,
      output: `Skill "${skillName}" not found. Run: omnix skills to see available skills.`,
      memoryWritten: [],
    };
  }

  // Load memory context — if SKILL.md is missing but a handler exists, skip
  const skillContent = skillFile ? await fs.readFile(skillFile, "utf8") : "";
  const memoryContext = skillContent
    ? await loadMemoryContext(vaultRoot, skillContent)
    : {};

  // Check for runtime handler
  if (handlerLoader) {
    const handler = await handlerLoader();
    const result = await handler({ cwd, input, vaultRoot, dryRun, memoryContext });

    const memoryWritten: string[] = [];
    for (const write of result.memoryWrites) {
      if (!dryRun) {
        const absPath = path.join(vaultRoot, write.path);
        await fs.ensureDir(path.dirname(absPath));
        if (write.mode === "append") {
          const existing = await fs.readFile(absPath, "utf8").catch(() => "");
          await fs.writeFile(absPath, existing + "\n" + write.content, "utf8");
        } else {
          await fs.writeFile(absPath, write.content, "utf8");
        }
        memoryWritten.push(write.path);
      } else {
        memoryWritten.push(`[dry-run] would write ${write.path}`);
      }
    }

    return { skillName, hadHandler: true, output: result.output, memoryWritten };
  }

  // No handler — guided mode: print instructions + loaded memory context
  const output = buildGuidedOutput(skillName, skillContent, memoryContext, input);
  return { skillName, hadHandler: false, output, memoryWritten: [] };
}

/** Find the SKILL.md file for a given skill name by searching known locations. */
async function resolveSkillFile(cwd: string, skillName: string): Promise<string | null> {
  const candidates = [
    path.join(cwd, "packages", "skills", skillName, "SKILL.md"),
    path.join(cwd, "packages", "core", "skills", skillName, "SKILL.md"),
    path.join(cwd, ".omnix", "skills", skillName, "SKILL.md"),
  ];
  for (const c of candidates) {
    if (await exists(c)) return c;
  }
  return null;
}

/** Parse memory_reads from SKILL.md frontmatter and load vault files. */
async function loadMemoryContext(vaultRoot: string, skillContent: string): Promise<Record<string, string>> {
  const context: Record<string, string> = {};
  if (!(await exists(vaultRoot))) return context;

  // Parse memory_reads block from YAML frontmatter
  const fm = skillContent.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? "";
  const readsBlock = fm.match(/^memory_reads:\n((?:\s*-[^\n]*\n)*)/m)?.[1] ?? "";
  const paths = readsBlock
    .split("\n")
    .map((l) => l.match(/path:\s*["']?([^"'\s]+)["']?/)?.[1])
    .filter((p): p is string => Boolean(p));

  for (const relPath of paths) {
    // Support glob-style trailing slash (load all .md in folder)
    if (relPath.endsWith("/")) {
      const dir = path.join(vaultRoot, relPath);
      if (await exists(dir)) {
        const files = (await fs.readdir(dir)).filter((f) => f.endsWith(".md"));
        for (const f of files.slice(0, 3)) { // max 3 files per folder
          const content = await fs.readFile(path.join(dir, f), "utf8").catch(() => "");
          if (content.trim()) context[`${relPath}${f}`] = content.slice(0, 3000);
        }
      }
    } else {
      const absPath = path.join(vaultRoot, relPath);
      const content = await fs.readFile(absPath, "utf8").catch(() => "");
      if (content.trim()) context[relPath] = content.slice(0, 3000);
    }
  }

  return context;
}

/** Format guided output for skills without a runtime handler. */
function buildGuidedOutput(
  skillName: string,
  skillContent: string,
  memoryContext: Record<string, string>,
  input: string
): string {
  const lines: string[] = [
    `# Skill: ${skillName}`,
    "",
    "This skill does not have a runtime handler yet.",
    "Use the instructions below with your AI tool.",
    "",
  ];

  if (input) {
    lines.push(`## Your input: ${input}`, "");
  }

  if (Object.keys(memoryContext).length > 0) {
    lines.push("## Loaded memory context", "");
    for (const [filePath, content] of Object.entries(memoryContext)) {
      lines.push(`### ${filePath}`, "```", content.slice(0, 500), "```", "");
    }
  }

  // Extract just the execution steps from SKILL.md (between ## headers)
  const steps = skillContent.match(/## (?:Phase|Step|Execution|When to activate|When NOT)[^\n]*\n[\s\S]*?(?=\n## |\n---|\n$)/g);
  if (steps) {
    lines.push("## Skill instructions", "");
    lines.push(...steps.slice(0, 4).map((s) => s.trim()));
  }

  return lines.join("\n");
}

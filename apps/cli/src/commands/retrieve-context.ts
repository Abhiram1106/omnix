import path from "node:path";
import fs from "fs-extra";
import { VAULT_DIR, cwdPath, exists } from "../utils/paths.js";
import { logger } from "../utils/logger.js";

export interface RetrieveContextOptions {
  cwd: string;
  task: string;
  top: number;
  json: boolean;
  mode?: RetrievalMode;
}

export type RetrievalMode = "minimal" | "balanced" | "deep" | "architecture" | "debugging";

/** Token budgets per retrieval mode (estimated tokens = chars / 4) */
const TOKEN_BUDGETS: Record<RetrievalMode, number> = {
  minimal: 500,
  balanced: 1500,
  deep: 3000,
  architecture: 4000,
  debugging: 2000,
};

/** Detect retrieval mode from task text (task-type-aware routing). */
function detectMode(task: string): RetrievalMode {
  const t = task.toLowerCase();
  if (/error|crash|fail|broken|exception|bug|debug|why is|not work/.test(t)) return "debugging";
  if (/architect|system design|scale|module|structure|adr|trade.?off/.test(t)) return "architecture";
  if (/quick|simple|what is|list|show me|one.?liner/.test(t)) return "minimal";
  if (/feature|build|implement|add|create|refactor|migrate|release/.test(t)) return "deep";
  return "balanced";
}

/** Priority file lists per retrieval mode. Lower index = higher priority. */
function getFilePriorityList(mode: RetrievalMode): Array<{ relPath: string; label: string; maxLines: number }> {
  // Core files loaded in every mode
  const core = [
    { relPath: "02-PROJECTS/project-context.md", label: "project-context", maxLines: 80 },
    { relPath: "02-PROJECTS/active-goals.md", label: "active-goals", maxLines: 40 },
    { relPath: "03-ERRORS/error-memory.md", label: "error-memory", maxLines: 60 },
    { relPath: "03-ERRORS/anti-patterns.md", label: "anti-patterns", maxLines: 40 },
  ];

  switch (mode) {
    case "minimal":
      return [
        { relPath: "02-PROJECTS/project-context.md", label: "project-context", maxLines: 30 },
        { relPath: "02-PROJECTS/active-goals.md", label: "active-goals", maxLines: 20 },
      ];

    case "debugging":
      return [
        { relPath: "03-ERRORS/error-memory.md", label: "error-memory", maxLines: 100 },
        { relPath: "03-ERRORS/anti-patterns.md", label: "anti-patterns", maxLines: 60 },
        { relPath: "02-PROJECTS/project-context.md", label: "project-context", maxLines: 60 },
        { relPath: "02-PROJECTS/active-goals.md", label: "active-goals", maxLines: 30 },
        // sessions loaded separately below
      ];

    case "architecture":
      return [
        { relPath: "02-PROJECTS/project-context.md", label: "project-context", maxLines: 80 },
        { relPath: "05-ARCHITECTURE/system-overview.md", label: "architecture", maxLines: 100 },
        { relPath: "04-DECISIONS/decisions.md", label: "decisions", maxLines: 80 },
        { relPath: "02-PROJECTS/active-goals.md", label: "active-goals", maxLines: 40 },
        { relPath: "03-ERRORS/error-memory.md", label: "error-memory", maxLines: 40 },
        { relPath: "07-LESSONS/lessons-learned.md", label: "lessons", maxLines: 50 },
      ];

    case "deep":
      return [
        ...core,
        { relPath: "04-DECISIONS/decisions.md", label: "decisions", maxLines: 60 },
        { relPath: "05-ARCHITECTURE/system-overview.md", label: "architecture", maxLines: 80 },
        { relPath: "07-LESSONS/lessons-learned.md", label: "lessons", maxLines: 50 },
      ];

    case "balanced":
    default:
      return [
        ...core,
        { relPath: "04-DECISIONS/decisions.md", label: "decisions", maxLines: 40 },
      ];
  }
}

interface MemoryFile {
  path: string;
  label: string;
  priority: number;
  content: string;
  tags: string[];
  area: string;
  estimatedTokens: number;
}

/** Estimate tokens from text (chars / 4 heuristic). */
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/** Extract frontmatter tags and area from a vault file (minimal parser). */
function extractMeta(content: string): { tags: string[]; area: string } {
  const tagsMatch = content.match(/^tags:\s*\[([^\]]+)\]/m);
  const tagsInline = tagsMatch
    ? tagsMatch[1]!.split(",").map((t) => t.trim().replace(/['"]/g, ""))
    : [];
  const tagsList = [...content.matchAll(/^- tag:\s*(.+)$/gm)].map((m) => m[1]!.trim());
  const areaMatch =
    content.match(/^area:\s*(.+)$/m) ?? content.match(/^- Area:\s*(.+)$/m);
  return { tags: [...tagsInline, ...tagsList], area: areaMatch?.[1]?.trim() ?? "" };
}

/** Score relevance to task using term frequency + tag/area boost. */
function scoreRelevance(f: MemoryFile, taskWords: string[]): number {
  const lc = f.content.toLowerCase();
  let score = 0;
  for (const w of taskWords) {
    if (w.length <= 3) continue;
    const hits = (lc.match(new RegExp(`\\b${w}\\b`, "g")) ?? []).length;
    score += hits * 1.0;
    if (f.tags.some((t) => t.toLowerCase().includes(w))) score += 3;
    if (f.area.toLowerCase().includes(w)) score += 2;
  }
  return score;
}

async function readHead(filePath: string, maxLines: number): Promise<string> {
  const content = await fs.readFile(filePath, "utf8").catch(() => "");
  return content.split("\n").slice(0, maxLines).join("\n");
}

export async function runRetrieveContext(opts: RetrieveContextOptions): Promise<void> {
  const vault = cwdPath(opts.cwd, VAULT_DIR);

  if (!(await exists(vault))) {
    logger.error(`No memory vault found at ${VAULT_DIR}. Run \`omnix init\` first.`);
    process.exitCode = 1;
    return;
  }

  // Detect or use provided retrieval mode
  const mode: RetrievalMode = opts.mode ?? (opts.task ? detectMode(opts.task) : "balanced");
  const tokenBudget = TOKEN_BUDGETS[mode];
  let tokensUsed = 0;

  const files: MemoryFile[] = [];

  // Load priority file list for this mode
  const priorityList = getFilePriorityList(mode);
  for (let i = 0; i < priorityList.length; i++) {
    const { relPath, label, maxLines } = priorityList[i]!;
    const filePath = path.join(vault, relPath);
    if (!(await exists(filePath))) continue;

    const content = await readHead(filePath, maxLines);
    if (!content.trim()) continue;

    const tokens = estimateTokens(content);
    if (tokensUsed + tokens > tokenBudget) {
      // Load a summary instead (first 10 lines only)
      const summary = content.split("\n").slice(0, 10).join("\n");
      const summaryTokens = estimateTokens(summary);
      if (tokensUsed + summaryTokens > tokenBudget) break; // budget exhausted
      const meta = extractMeta(summary);
      files.push({ path: relPath, label: `${label} [truncated]`, priority: i, content: summary, ...meta, estimatedTokens: summaryTokens });
      tokensUsed += summaryTokens;
      continue;
    }

    const meta = extractMeta(content);
    files.push({ path: relPath, label, priority: i, content, ...meta, estimatedTokens: tokens });
    tokensUsed += tokens;
  }

  // Load recent sessions (always after priority files, up to budget)
  if (mode !== "minimal") {
    const sessionsDir = path.join(vault, "01-SESSIONS");
    if (await exists(sessionsDir)) {
      const maxSessions = mode === "debugging" ? 5 : 3;
      const dateDirs = (await fs.readdir(sessionsDir))
        .filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d))
        .sort()
        .reverse()
        .slice(0, maxSessions);

      for (const dateDir of dateDirs) {
        if (tokensUsed >= tokenBudget) break;
        const dayDir = path.join(sessionsDir, dateDir);
        const sessionFiles = (await fs.readdir(dayDir))
          .filter((f) => f.endsWith(".md"))
          .sort()
          .reverse()
          .slice(0, 1); // one session per day to save budget

        for (const sf of sessionFiles) {
          const filePath = path.join(dayDir, sf);
          const content = await readHead(filePath, 30);
          if (!content.trim()) continue;
          const tokens = estimateTokens(content);
          if (tokensUsed + tokens > tokenBudget) break;
          const meta = extractMeta(content);
          files.push({
            path: `01-SESSIONS/${dateDir}/${sf}`,
            label: `session:${dateDir}`,
            priority: 50 + files.length,
            content,
            ...meta,
            estimatedTokens: tokens,
          });
          tokensUsed += tokens;
        }
      }
    }
  }

  // Relevance re-ranking: boost files matching task keywords
  if (opts.task) {
    const taskWords = opts.task.toLowerCase().split(/\s+/);
    for (const f of files) {
      const relevance = scoreRelevance(f, taskWords);
      if (relevance > 0) {
        f.priority = Math.max(0.1, f.priority - relevance * 0.4);
      }
    }
  }

  // Sort by priority, take top N
  const ranked = files.sort((a, b) => a.priority - b.priority).slice(0, opts.top);

  if (opts.json) {
    console.log(
      JSON.stringify(
        ranked.map((f) => ({
          path: f.path,
          label: f.label,
          tags: f.tags,
          area: f.area,
          estimatedTokens: f.estimatedTokens,
        })),
        null,
        2
      )
    );
    return;
  }

  if (ranked.length === 0) {
    logger.warn("Memory vault is empty. Run `omnix init` first.");
    return;
  }

  logger.header("Retrieved Context");
  if (opts.task) logger.info(`Task: "${opts.task}"`);
  logger.dim(`Mode: ${mode} | Budget: ${tokenBudget} tokens | Used: ~${tokensUsed} tokens`);
  logger.blank();

  for (const f of ranked) {
    console.log(`\n${"─".repeat(60)}`);
    console.log(`## [${f.label}] ${f.path}  (~${f.estimatedTokens} tokens)`);
    console.log("─".repeat(60));
    console.log(f.content.trim());
  }

  console.log("\n" + "─".repeat(60));
  logger.blank();
  logger.dim(`${ranked.length} files retrieved | ~${tokensUsed}/${tokenBudget} tokens used | mode: ${mode}`);

  if (tokensUsed >= tokenBudget * 0.9) {
    logger.warn(`Budget nearly exhausted. Some files may be truncated. Use --mode deep for more context.`);
  }
}

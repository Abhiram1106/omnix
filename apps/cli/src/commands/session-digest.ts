import path from "node:path";
import { execSync } from "node:child_process";
import fs from "fs-extra";
import { writeDigest, type DigestData } from "../utils/write-digest.js";
import { exists } from "../utils/paths.js";
import { logger } from "../utils/logger.js";

export interface SessionDigestOptions {
  cwd: string;
  tool: string;
  notesPath: string | undefined;
  dryRun: boolean;
  /** Auto-mode: generate a minimal digest from git diff instead of asking for notes */
  auto: boolean;
}

export async function runSessionDigest(opts: SessionDigestOptions): Promise<void> {
  let data: DigestData = { tool: opts.tool };

  if (opts.auto) {
    data = buildAutoDigest(opts.cwd, opts.tool);
  } else if (opts.notesPath) {
    const notesAbs = path.resolve(opts.cwd, opts.notesPath);
    if (!(await exists(notesAbs))) {
      logger.error(`Notes file not found: ${opts.notesPath}`);
      process.exitCode = 1;
      return;
    }
    const notes = await fs.readFile(notesAbs, "utf8");
    data = parseNotesIntoDigest(notes, opts.tool);
  }

  logger.header("Session Digest");

  if (opts.dryRun) {
    logger.warn("Dry-run: no file will be written.\n");
    const { renderDigest, digestTimestamp } = await import("../utils/write-digest.js");
    const { date, time } = digestTimestamp();
    console.log(renderDigest(data, `${date} ${time}`));
    return;
  }

  const filePath = await writeDigest(opts.cwd, data, opts.dryRun);
  logger.success(`Digest written: ${path.relative(opts.cwd, filePath)}`);
  logger.dim("Open .obsidian-ai-memory/ in Obsidian to view it.");
}

/**
 * Build a minimal digest automatically from git diff --stat.
 * Skips prompts entirely — good for quick end-of-session habit without fatigue.
 */
function buildAutoDigest(cwd: string, tool: string): DigestData {
  let filesChanged: string[] = [];
  let commandsRun: string[] = ["omnix session-digest --auto"];

  // Helper: cross-platform exec that returns "" on failure (no shell operators).
  const safeExec = (cmd: string, args: string[]): string => {
    try {
      return execSync([cmd, ...args].join(" "), {
        cwd,
        encoding: "utf8",
        timeout: 10000,
        stdio: ["ignore", "pipe", "ignore"],
      });
    } catch {
      return "";
    }
  };

  const stat = safeExec("git", ["diff", "--stat", "HEAD"]);
  if (stat) {
    filesChanged = stat
      .split("\n")
      .filter((l) => l.includes("|") || l.includes("Bin"))
      .map((l) => l.trim().split(/\s+/)[0] ?? "")
      .filter(Boolean)
      .slice(0, 20);
  }

  const log = safeExec("git", ["log", "--oneline", "-5"]);
  if (log) {
    commandsRun = [...commandsRun, ...log.split("\n").filter(Boolean).map((l) => `git: ${l}`)];
  }

  return {
    tool,
    filesChanged,
    commandsRun,
    nextRecommendedStep: "Review .obsidian-ai-memory/ and add context manually if needed.",
  };
}

/**
 * Very lightweight notes-to-digest parser.
 * Looks for markdown sections matching digest field names.
 */
function parseNotesIntoDigest(notes: string, tool: string): DigestData {
  const get = (label: string): string => {
    const re = new RegExp(`(?:^|\\n)[-*]?\\s*${label}[:\\s]+(.+?)(?=\\n[-*#]|$)`, "is");
    return notes.match(re)?.[1]?.trim() ?? "";
  };
  const getList = (label: string): string[] => {
    const raw = get(label);
    if (!raw) return [];
    return raw
      .split(/\n/)
      .map((l) => l.replace(/^[-*]\s*/, "").trim())
      .filter(Boolean);
  };

  return {
    tool,
    agentRole: get("Agent/Role") || get("Role"),
    project: get("Project"),
    userRequest: get("User Request") || get("Request"),
    contextRetrieved: getList("Context Retrieved"),
    filesRead: getList("Files Read"),
    filesChanged: getList("Files Changed"),
    commandsRun: getList("Commands Run"),
    decisionsMade: getList("Decisions Made"),
    errorsEncountered: getList("Errors Encountered"),
    fixesApplied: getList("Fixes Applied"),
    testsVerification: get("Tests/Verification") || get("Verification"),
    docsUpdated: getList("Docs Updated"),
    memoryUpdated: getList("Memory Updated"),
    openQuestions: getList("Open Questions"),
    nextRecommendedStep: get("Next Recommended Step") || get("Next Step"),
  };
}

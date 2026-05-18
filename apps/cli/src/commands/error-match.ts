import path from "node:path";
import fs from "fs-extra";
import { VAULT_DIR, cwdPath, exists } from "../utils/paths.js";
import { logger } from "../utils/logger.js";

export interface ErrorMatchOptions {
  cwd: string;
  errorText: string;
  top: number;
  json: boolean;
}

interface ErrorEntry {
  title: string;
  rootCause: string;
  fix: string;
  prevention: string;
  rawBlock: string;
  score: number;
}

/**
 * BM25-style term frequency match against error-memory.md.
 * Returns top-N past errors most similar to the given error text.
 */
function termFrequencyScore(query: string, document: string): number {
  const queryWords = query.toLowerCase().split(/\W+/).filter((w) => w.length > 3);
  const docLower = document.toLowerCase();
  let score = 0;

  for (const word of queryWords) {
    const hits = (docLower.match(new RegExp(`\\b${word}\\b`, "g")) ?? []).length;
    // TF with diminishing returns
    score += Math.log(1 + hits);
  }

  return score;
}

/** Parse error-memory.md into individual error entries (split on ## headings). */
function parseErrorEntries(content: string): ErrorEntry[] {
  const blocks = content.split(/^## /m).filter(Boolean);
  const entries: ErrorEntry[] = [];

  for (const block of blocks) {
    const lines = block.trim().split("\n");
    const title = lines[0]?.trim() ?? "Unknown Error";

    const getField = (label: string): string => {
      const match = block.match(new RegExp(`\\*\\*${label}[:\\*]+\\*?\\*?\\s*(.+?)(?=\\n\\*\\*|$)`, "is"));
      if (match) return match[1]!.trim();
      // Also try `- Label: value` format
      const listMatch = block.match(new RegExp(`- ${label}:\\s*(.+)`, "i"));
      return listMatch?.[1]?.trim() ?? "";
    };

    entries.push({
      title,
      rootCause: getField("Root Cause") || getField("root cause"),
      fix: getField("Fix") || getField("fix applied") || getField("solution"),
      prevention: getField("Prevention") || getField("prevention rule"),
      rawBlock: block,
      score: 0,
    });
  }

  return entries;
}

export async function runErrorMatch(opts: ErrorMatchOptions): Promise<void> {
  const vault = cwdPath(opts.cwd, VAULT_DIR);

  if (!(await exists(vault))) {
    if (opts.json) {
      console.log(JSON.stringify({ error: "no-vault", message: `No memory vault found at ${VAULT_DIR}. Run \`omnix init\` first.` }, null, 2));
    } else {
      logger.error(`No memory vault found at ${VAULT_DIR}. Run \`omnix init\` first.`);
    }
    process.exitCode = 1;
    return;
  }

  const errorMemoryPath = path.join(vault, "03-ERRORS", "error-memory.md");
  if (!(await exists(errorMemoryPath))) {
    if (opts.json) {
      console.log(JSON.stringify([], null, 2));
    } else {
      logger.warn("No error memory found. Errors recorded by Omnix will appear here.");
    }
    return;
  }

  const content = await fs.readFile(errorMemoryPath, "utf8");
  const entries = parseErrorEntries(content);

  if (entries.length === 0) {
    if (opts.json) {
      console.log(JSON.stringify([], null, 2));
    } else {
      logger.warn("Error memory is empty. No past errors to match against.");
    }
    return;
  }

  // Score each entry against the query
  const scored = entries
    .map((entry) => ({
      ...entry,
      score: termFrequencyScore(opts.errorText, entry.rawBlock),
    }))
    .filter((e) => e.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, opts.top);

  if (scored.length === 0) {
    if (opts.json) {
      console.log(JSON.stringify([], null, 2));
    } else {
      logger.info("No similar past errors found. This may be a new error type.");
      logger.dim("Tip: After fixing, record it in 03-ERRORS/error-memory.md with root cause + fix + prevention rule.");
    }
    return;
  }

  if (opts.json) {
    console.log(JSON.stringify(scored.map(({ title, rootCause, fix, prevention, score }) => ({
      title, rootCause, fix, prevention, score,
    })), null, 2));
    return;
  }

  logger.header("Error Match Results");
  logger.info(`Query: "${opts.errorText}"`);
  logger.dim(`Found ${scored.length} similar past error(s) in error memory\n`);

  for (let i = 0; i < scored.length; i++) {
    const e = scored[i]!;
    console.log(`\n${"─".repeat(60)}`);
    console.log(`Match ${i + 1}: ${e.title}  (score: ${e.score.toFixed(1)})`);
    console.log("─".repeat(60));
    if (e.rootCause) console.log(`Root Cause:  ${e.rootCause}`);
    if (e.fix) console.log(`Fix Applied: ${e.fix}`);
    if (e.prevention) console.log(`Prevention:  ${e.prevention}`);
  }

  console.log("\n" + "─".repeat(60));
  logger.blank();
  logger.dim("If none of these match, this is likely a new error. Record the fix in 03-ERRORS/error-memory.md.");
}

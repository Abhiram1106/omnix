/**
 * tools/scripts/write-session-digest.ts
 *
 * Writes a session digest file. Accepts either:
 *  - A JSON payload matching schemas/session-digest.schema.md fields, or
 *  - A free-form notes file (parsed best-effort into the same fields).
 *
 * Output path:
 *   <cwd>/.obsidian-ai-memory/01-SESSIONS/YYYY-MM-DD/session-HHMM-<tool>.md
 *
 * Status: typed stub.
 */

export interface SessionDigestRecord {
  date: string;
  tool: string;
  agentRole: string;
  project: string;
  userRequest: string;
  contextRetrieved: string[];
  filesRead: string[];
  filesChanged: string[];
  commandsRun: string[];
  decisionsMade: string[];
  errorsEncountered: string[];
  fixesApplied: string[];
  testsVerification: string;
  docsUpdated: string[];
  memoryUpdated: string[];
  openQuestions: string[];
  nextRecommendedStep: string;
}

export interface WriteSessionDigestOptions {
  cwd: string;
  record: SessionDigestRecord;
}

export async function writeSessionDigest(opts: WriteSessionDigestOptions): Promise<string> {
  // TODO:
  //  - validate record (required fields)
  //  - resolve filename: session-HHMM-<tool>.md from record.date
  //  - render markdown using the template
  //  - write file, return its path
  void opts;
  return ".obsidian-ai-memory/01-SESSIONS/STUB/session-stub.md";
}

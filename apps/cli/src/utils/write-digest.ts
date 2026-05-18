import path from "node:path";
import fs from "fs-extra";
import { VAULT_DIR } from "./paths.js";
import { sanitize } from "./sanitize.js";

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

export function digestTimestamp(d = new Date()): { date: string; time: string } {
  const date = `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
  const time = `${pad2(d.getHours())}${pad2(d.getMinutes())}`;
  return { date, time };
}

export interface DigestData {
  tool: string;
  agentRole?: string;
  project?: string;
  userRequest?: string;
  contextRetrieved?: string[];
  filesRead?: string[];
  filesChanged?: string[];
  commandsRun?: string[];
  decisionsMade?: string[];
  errorsEncountered?: string[];
  fixesApplied?: string[];
  testsVerification?: string;
  docsUpdated?: string[];
  memoryUpdated?: string[];
  openQuestions?: string[];
  nextRecommendedStep?: string;
}

function list(items?: string[]): string {
  if (!items || items.length === 0) return "none";
  return items.map((i) => `- ${i}`).join("\n");
}

export function renderDigest(data: DigestData, dateStr: string): string {
  return `# Session Digest

- Date: ${dateStr}
- Tool: ${data.tool}
- Agent/Role: ${data.agentRole ?? ""}
- Project: ${data.project ?? ""}
- User Request: ${data.userRequest ?? ""}
- Context Retrieved:
${list(data.contextRetrieved)}
- Files Read:
${list(data.filesRead)}
- Files Changed:
${list(data.filesChanged)}
- Commands Run:
${list(data.commandsRun)}
- Decisions Made:
${list(data.decisionsMade)}
- Errors Encountered:
${list(data.errorsEncountered)}
- Fixes Applied:
${list(data.fixesApplied)}
- Tests/Verification: ${data.testsVerification ?? "not run"}
- Docs Updated:
${list(data.docsUpdated)}
- Memory Updated:
${list(data.memoryUpdated)}
- Open Questions:
${list(data.openQuestions)}
- Next Recommended Step: ${data.nextRecommendedStep ?? ""}
`;
}

export async function writeDigest(
  cwd: string,
  data: DigestData,
  dryRun = false
): Promise<string> {
  const { date, time } = digestTimestamp();
  const toolSlug = data.tool.replace(/[^a-z0-9]/gi, "-").toLowerCase();
  const filename = `session-${time}-${toolSlug}.md`;
  const dir = path.join(cwd, VAULT_DIR, "01-SESSIONS", date);
  const filePath = path.join(dir, filename);

  if (!dryRun) {
    await fs.ensureDir(dir);
    const content = sanitize(renderDigest(data, `${date} ${time}`));
    await fs.writeFile(filePath, content, "utf8");
  }

  return filePath;
}

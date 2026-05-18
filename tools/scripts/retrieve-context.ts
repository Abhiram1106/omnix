/**
 * tools/scripts/retrieve-context.ts
 *
 * Returns the most relevant memory files for a given task description.
 *
 * Strategy (v1, deterministic — no embeddings):
 *  - Always include: 02-PROJECTS/project-context.md, last N session digests,
 *    03-ERRORS/error-memory.md, 03-ERRORS/anti-patterns.md.
 *  - Keyword-rank: simple tf-idf or term overlap between task and file content
 *    over 04-DECISIONS/, 07-LESSONS/, 05-ARCHITECTURE/.
 *  - Cap total output (e.g., top 10 files or N tokens).
 *
 * v2 may add a vector index sidecar.
 *
 * Status: typed stub.
 */

export interface RetrieveContextOptions {
  cwd: string;
  task: string;
  top?: number;
}

export interface RetrievedContext {
  files: { path: string; reason: string }[];
  rendered: string;
}

export async function retrieveContext(opts: RetrieveContextOptions): Promise<RetrievedContext> {
  // TODO:
  //  - walk .obsidian-ai-memory/
  //  - score files by keyword overlap with opts.task
  //  - assemble top-N + always-include set
  //  - render a single markdown block the user can paste into an AI tool
  void opts;
  return { files: [], rendered: "[stub] retrieve-context\n" };
}

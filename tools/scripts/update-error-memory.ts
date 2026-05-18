/**
 * tools/scripts/update-error-memory.ts
 *
 * Appends a new error entry to .obsidian-ai-memory/03-ERRORS/error-memory.md
 * using the schema in packages/memory/schemas/error-memory.schema.md.
 *
 * Optionally promotes the prevention rule to anti-patterns.md if marked.
 *
 * Status: typed stub.
 */

export interface ErrorEntry {
  date: string;
  project: string;
  area: string;
  symptom: string;
  rootCause: string;
  fix: string;
  preventionRule: string;
  doNotRepeat: string;
  regressionTestAdded: string;
  relatedFiles: string[];
  relatedSessionDigest: string;
  /** When true, the prevention rule is also appended to anti-patterns.md. */
  promoteToAntiPattern?: boolean;
}

export interface UpdateErrorMemoryOptions {
  cwd: string;
  entry: ErrorEntry;
}

export async function updateErrorMemory(opts: UpdateErrorMemoryOptions): Promise<void> {
  // TODO:
  //  - validate fields
  //  - append rendered section to 03-ERRORS/error-memory.md
  //  - if promoteToAntiPattern, append a line to 03-ERRORS/anti-patterns.md
  void opts;
  process.stdout.write("[stub] update-error-memory\n");
}

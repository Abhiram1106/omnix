/**
 * tools/scripts/init-project-memory.ts
 *
 * Standalone script (no CLI deps) that initializes `.obsidian-ai-memory/`
 * in a given directory. Mirrors `apps/cli` `init` command but usable in
 * `package.json` scripts, CI, or one-off shells.
 *
 * Usage (intended):
 *   tsx tools/scripts/init-project-memory.ts --cwd /path/to/project
 *
 * Status: typed stub.
 */

export interface InitProjectMemoryOptions {
  cwd: string;
  force?: boolean;
}

export async function initProjectMemory(opts: InitProjectMemoryOptions): Promise<void> {
  // TODO:
  //  - resolve template at packages/memory/obsidian/vault-template
  //  - mkdir vault root + 11 subfolders
  //  - copy READMEs and templates/
  //  - seed 02-PROJECTS/project-context.md
  void opts;
  process.stdout.write("[stub] init-project-memory\n");
}

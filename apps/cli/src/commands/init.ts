import path from "node:path";
import fs from "fs-extra";
import { detectStack } from "../utils/detect-stack.js";
import {
  VAULT_DIR,
  VAULT_FOLDERS,
  OMNIX_DIR,
  OMNIX_SUBFOLDERS,
  cwdPath,
  exists,
  templatesDir,
} from "../utils/paths.js";
import { copyTemplate, writeFile } from "../utils/copy-template.js";
import { logger } from "../utils/logger.js";
import { askInitQuestions, type AdapterName } from "../utils/prompts.js";
import { ADAPTER_FILES } from "../utils/adapter-files.js";
import { CURRENT_VAULT_VERSION, VAULT_VERSION_FILE } from "../utils/vault-version.js";
import { runScan } from "./scan.js";
import { writeDigest } from "../utils/write-digest.js";

export interface InitOptions {
  cwd: string;
  yes: boolean;
  force: boolean;
  dryRun: boolean;
  projectType?: string;
  adapters?: AdapterName[];
}

export async function runInit(opts: InitOptions): Promise<void> {
  const copyOpts = { dest: opts.cwd, force: opts.force, dryRun: opts.dryRun };

  logger.header("Omnix — Init");

  if (opts.dryRun) logger.warn("Dry-run mode: no files will be written.\n");

  // Detect stack first
  logger.step("Scanning project stack…");
  const stack = await detectStack(opts.cwd);
  logger.info(
    `Detected: ${stack.projectType} · ${[...stack.languages, ...stack.frameworks].join(", ") || "unknown stack"}`
  );
  logger.blank();

  // Ask questions
  const answers = await askInitQuestions({
    yes: opts.yes,
    projectName: path.basename(opts.cwd),
    adapters: opts.adapters,
  });

  // ---------- 1. Vault ----------
  logger.header("Initializing .obsidian-ai-memory vault");

  const vaultRoot = cwdPath(opts.cwd, VAULT_DIR);
  const vaultExists = await exists(vaultRoot);

  if (vaultExists && !opts.force) {
    logger.warn(`${VAULT_DIR} already exists — use --force to overwrite individual files.`);
  }

  // Create all vault folders (directories only — no per-folder READMEs unless --force)
  // Core folders get essential seed files; the rest are created empty so they're
  // available without cluttering the vault with 30+ placeholder files on first run.
  for (const folder of VAULT_FOLDERS) {
    const folderPath = path.join(vaultRoot, folder);
    if (!opts.dryRun) await fs.ensureDir(folderPath);
  }

  // Only copy templates dir (5 files total — these are genuinely useful day 1)
  await copyTemplate("vault/templates", `${VAULT_DIR}/templates`, copyOpts);

  // Seed project-context.md with detected info
  const projectContextPath = path.join(
    opts.cwd, VAULT_DIR, "02-PROJECTS", "project-context.md"
  );
  if (!(await exists(projectContextPath)) || opts.force) {
    const content = buildProjectContext(answers.projectName, stack);
    await writeFile(projectContextPath, content, copyOpts);
  } else {
    logger.dim(`  skip (exists) ${VAULT_DIR}/02-PROJECTS/project-context.md`);
  }

  // Seed active-goals + current-state stubs
  await writeFile(
    path.join(opts.cwd, VAULT_DIR, "02-PROJECTS", "active-goals.md"),
    `# Active Goals\n\n- Goal 1:\n- Goal 2:\n`,
    copyOpts
  );
  await writeFile(
    path.join(opts.cwd, VAULT_DIR, "02-PROJECTS", "current-state.md"),
    `# Current State\n\n- What's shipping:\n- What's blocked:\n`,
    copyOpts
  );

  // Seed error-memory + anti-patterns
  await writeFile(
    path.join(opts.cwd, VAULT_DIR, "03-ERRORS", "error-memory.md"),
    `# Error Memory\n\n<!-- Errors will be recorded here. Use the error-entry template. -->\n`,
    copyOpts
  );
  await writeFile(
    path.join(opts.cwd, VAULT_DIR, "03-ERRORS", "anti-patterns.md"),
    `# Anti-patterns\n\n<!-- Prevention rules promoted from recurring errors. -->\n`,
    copyOpts
  );

  // ---------- 1b. .omnix/ runtime directory ----------
  logger.header("Initializing .omnix/ runtime directory");

  const omnixRoot = cwdPath(opts.cwd, OMNIX_DIR);
  for (const sub of OMNIX_SUBFOLDERS) {
    if (!opts.dryRun) await fs.ensureDir(path.join(omnixRoot, sub));
    await copyTemplate(`.omnix/${sub}/README.md`, `${OMNIX_DIR}/${sub}/README.md`, copyOpts);
  }
  await copyTemplate(".omnix/README.md", `${OMNIX_DIR}/README.md`, copyOpts);

  // Write settings with project name substituted
  const settingsSrc = path.join(templatesDir(), ".omnix/settings/omnix.json");
  const settingsDst = path.join(omnixRoot, "settings", "omnix.json");
  if (!(await exists(settingsDst)) || opts.force) {
    const raw = await fs.readFile(settingsSrc, "utf8").catch(() => "{}");
    const filled = raw.replace("{{PROJECT_NAME}}", answers.projectName);
    await writeFile(settingsDst, filled, copyOpts);
  } else {
    logger.dim(`  skip (exists) ${OMNIX_DIR}/settings/omnix.json`);
  }

  // Write current vault version marker (so `omnix vault migrate` knows we're already current)
  const versionFile = path.join(omnixRoot, VAULT_VERSION_FILE);
  if (!opts.dryRun) {
    await fs.writeFile(versionFile, CURRENT_VAULT_VERSION, "utf8");
  }

  // ---------- 2. Adapters ----------
  logger.header(`Installing adapters: ${answers.adapters.join(", ")}`);

  for (const adapter of answers.adapters) {
    const files = ADAPTER_FILES[adapter] ?? [];
    for (const f of files) {
      await copyTemplate(f.src, f.dest, copyOpts);
    }
  }

  // ---------- 3. Root AI files ----------
  logger.header("Writing root AI files");

  await writeFile(
    cwdPath(opts.cwd, "PROJECT_CONTEXT.md"),
    buildProjectContextRoot(answers.projectName, stack),
    copyOpts
  );

  // ---------- 4. First session digest ----------
  logger.header("Writing first session digest");

  const digestPath = await writeDigest(opts.cwd, {
    tool: "omnix-init",
    agentRole: "onboarding",
    project: answers.projectName,
    userRequest: "npx create-omnix / omnix init",
    contextRetrieved: ["none — first run"],
    filesChanged: [`${VAULT_DIR}/02-PROJECTS/project-context.md`, ...answers.adapters.map((a) => `adapter:${a}`)],
    commandsRun: ["omnix init"],
    nextRecommendedStep: "Run `omnix scan` to verify stack detection, then open your AI tool.",
  }, opts.dryRun);

  logger.success(`Session digest: ${path.relative(opts.cwd, digestPath)}`);

  // ---------- Seed vault with detected context ----------
  if (!opts.dryRun) {
    logger.header("Seeding vault with detected project context");
    await runScan({ cwd: opts.cwd, json: false, write: true });
  }

  // ---------- 5. .gitignore ----------
  await updateGitignore(opts.cwd, opts.dryRun);

  // ---------- Done ----------
  logger.blank();
  logger.header("Done");
  logger.info(`Omnix initialized in ${opts.cwd}`);
  logger.blank();
  logger.step("Next steps:");
  logger.dim("  omnix scan             — verify stack detection");
  logger.dim("  omnix doctor           — check installation health");
  logger.dim("  omnix detect           — list detected Omnix files");
  logger.dim("  omnix route \"<task>\"   — route a request to workflow + agents");
  logger.blank();
  logger.dim("Open .obsidian-ai-memory/ in Obsidian for the memory brain.");
  logger.blank();
  logger.dim("Add to .gitignore:");
  logger.dim("  .omnix/memory/          # session-scoped cache (auto-managed)");
  logger.dim("  .obsidian-ai-memory/    # if you prefer vault to be gitignored");
}

const GITIGNORE_ENTRIES = [
  ".omnix/memory/",
  ".omnix/cache/",
];

async function updateGitignore(cwd: string, dryRun: boolean): Promise<void> {
  const gitignorePath = path.join(cwd, ".gitignore");
  let existing = "";
  try {
    existing = await fs.readFile(gitignorePath, "utf8");
  } catch {
    // file doesn't exist yet — will create it
  }

  const toAdd = GITIGNORE_ENTRIES.filter((entry) => !existing.includes(entry));
  if (toAdd.length === 0) {
    logger.dim("  .gitignore already up to date");
    return;
  }

  const addition = `\n# Omnix — auto-added\n${toAdd.join("\n")}\n`;
  if (!dryRun) {
    await fs.outputFile(gitignorePath, existing + addition, "utf8");
  }
  logger.success(`.gitignore updated (added: ${toAdd.join(", ")})`);
}

function buildProjectContext(name: string, stack: ReturnType<typeof detectStack> extends Promise<infer T> ? T : never): string {
  return `# Project Context

- Project Name: ${name}
- Current Goal:
- Stack: ${[...stack.languages, ...stack.frameworks].join(", ") || "TODO"}
- Architecture:
- Important Constraints:
- Current Priorities:
- Known Risks:
- Active Decisions:
- Known Errors:
- Do Not Repeat:
- Next Steps:
`;
}

function buildProjectContextRoot(name: string, stack: ReturnType<typeof detectStack> extends Promise<infer T> ? T : never): string {
  return `# PROJECT_CONTEXT.md

- Project Name: ${name}
- Stack: ${[...stack.languages, ...stack.frameworks].join(", ") || "TODO"}
- Package Manager: ${stack.packageManager}
- Project Type: ${stack.projectType}

See .obsidian-ai-memory/02-PROJECTS/project-context.md for the full living context.
`;
}

import path from "node:path";
import fs from "fs-extra";
import { VAULT_DIR, VAULT_FOLDERS, cwdPath, exists } from "../utils/paths.js";
import { logger } from "../utils/logger.js";

export interface DoctorOptions {
  cwd: string;
  json: boolean;
}

interface Check {
  category: string;
  check: string;
  pass: boolean;
  detail?: string | undefined;
}

async function check(
  category: string,
  label: string,
  test: () => Promise<boolean>,
  detail?: string
): Promise<Check> {
  const pass = await test();
  return { category, check: label, pass, detail };
}

export async function runDoctor(opts: DoctorOptions): Promise<void> {
  const checks: Check[] = [];

  // ---- Vault presence & structure ----
  const vaultRoot = cwdPath(opts.cwd, VAULT_DIR);

  checks.push(
    await check("memory", `.obsidian-ai-memory/ exists`, () => exists(vaultRoot))
  );

  for (const folder of VAULT_FOLDERS) {
    checks.push(
      await check(
        "memory",
        `vault folder: ${folder}`,
        () => exists(path.join(vaultRoot, folder))
      )
    );
  }

  checks.push(
    await check(
      "memory",
      "02-PROJECTS/project-context.md",
      () => exists(path.join(vaultRoot, "02-PROJECTS", "project-context.md"))
    )
  );

  checks.push(
    await check(
      "memory",
      "03-ERRORS/error-memory.md",
      () => exists(path.join(vaultRoot, "03-ERRORS", "error-memory.md"))
    )
  );

  // session digest templates
  checks.push(
    await check(
      "memory",
      "templates/session-digest.md",
      () => exists(path.join(vaultRoot, "templates", "session-digest.md"))
    )
  );
  checks.push(
    await check(
      "memory",
      "templates/error-entry.md",
      () => exists(path.join(vaultRoot, "templates", "error-entry.md"))
    )
  );

  // ---- Adapters ----
  const adapterChecks: [string, string][] = [
    ["claude-code", "CLAUDE.md"],
    ["cursor", ".cursor/rules/project-rules.mdc"],
    ["aider", "CONVENTIONS.md"],
    ["generic", "AGENTS.md"],
    ["generic", "AI_RULES.md"],
    ["generic", "PROJECT_CONTEXT.md"],
    ["startup-protocol", "STARTUP_PROTOCOL.md"],
  ];

  for (const [adapter, file] of adapterChecks) {
    checks.push(
      await check(
        `adapter:${adapter}`,
        file,
        () => exists(cwdPath(opts.cwd, file))
      )
    );
  }

  // ---- Content checks ----
  const claudeMd = cwdPath(opts.cwd, "CLAUDE.md");
  if (await exists(claudeMd)) {
    const content = await fs.readFile(claudeMd, "utf8").catch(() => "");
    checks.push({
      category: "content",
      check: "CLAUDE.md references STARTUP_PROTOCOL",
      pass: content.includes("STARTUP_PROTOCOL"),
    });
  }

  // ---- .omnix/ config directory ----
  const omnixChecks: [string, string][] = [
    ["omnix-config", ".omnix/settings/omnix.json"],
    ["omnix-config", ".omnix/README.md"],
  ];
  for (const [cat, file] of omnixChecks) {
    checks.push(
      await check(cat, file, () => exists(cwdPath(opts.cwd, file)))
    );
  }

  // ---- Skills (monorepo only) ----
  const pkgPath = path.join(opts.cwd, "packages");
  if (await exists(pkgPath)) {
    const coreSkills = ["context-engineering", "debugging", "code-review", "prompt-engineering", "session-memory", "web-scraping"];
    for (const skill of coreSkills) {
      checks.push(
        await check(
          "skills:core",
          `skills/${skill}/SKILL.md`,
          () => exists(path.join(pkgPath, "core", "skills", skill, "SKILL.md"))
        )
      );
    }
    const designSkills = ["design-brief", "design-review", "component-design"];
    for (const skill of designSkills) {
      checks.push(
        await check(
          "skills:design",
          `design/skills/${skill}/SKILL.md`,
          () => exists(path.join(pkgPath, "design", "skills", skill, "SKILL.md"))
        )
      );
    }
    // Check all 17 agents are present
    const coreAgents = [
      "architect", "frontend", "backend", "fullstack", "devops", "qa",
      "security", "database", "api", "performance", "sre", "docs",
      "ai-engineer", "product-engineer", "reviewer", "debugger", "context-manager",
    ];
    for (const agent of coreAgents) {
      checks.push(
        await check(
          "agents",
          `agents/${agent}.md`,
          () => exists(path.join(pkgPath, "core", "agents", `${agent}.md`))
        )
      );
    }
  }

  const passed = checks.filter((c) => c.pass).length;
  const failed = checks.filter((c) => !c.pass).length;

  if (opts.json) {
    console.log(JSON.stringify({ passed, failed, checks }, null, 2));
    return;
  }

  logger.header("Omnix Doctor");

  let lastCategory = "";
  for (const c of checks) {
    if (c.category !== lastCategory) {
      logger.blank();
      logger.dim(`  [${c.category}]`);
      lastCategory = c.category;
    }
    logger.row(c.check, c.pass ? "ok" : "MISSING", c.pass);
  }

  logger.blank();
  logger.info(`${passed} passed, ${failed} failed`);

  if (failed > 0) {
    logger.blank();
    logger.step("Fix:");
    logger.dim("  omnix init --force      — reinstall everything");
    logger.dim("  omnix sync-memory --fix — repair vault only");
    logger.dim("  omnix install-adapters  — reinstall adapter files");
  } else {
    logger.success("Installation is healthy.");
  }
}

import path from "node:path";
import fs from "fs-extra";
import { logger } from "../utils/logger.js";
import { templatesDir, exists } from "../utils/paths.js";

export interface SkillsOptions {
  cwd: string;
  json: boolean;
  filter?: string;
  inspect?: string;
  activate?: string;
  deactivate?: string;
  doctor?: boolean;
}

export interface SkillEntry {
  name: string;
  package: string;
  description: string;
  version: string;
  status: string;
  triggers: string[];
  autoActivate: boolean;
  path: string;
}

// All skill source directories (checked in order)
const SKILL_DIRS = [
  { pkg: "skills", base: "packages/skills" },           // new superpower skills
  { pkg: "core", base: "packages/core/skills" },        // original core skills
  { pkg: "design", base: "packages/design/skills" },   // design skills
  { pkg: "user", base: ".omnix/skills" },               // user-installed skills
];

/** Parse YAML frontmatter from a SKILL.md file (minimal parser — no dependencies). */
function parseFrontmatter(content: string): Record<string, string | string[] | boolean> {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match || !match[1]) return {};

  const block = match[1];

  const get = (key: string): string | undefined => {
    const m = block.match(new RegExp(`^${key}:\\s*(.+)$`, "m"));
    return m?.[1]?.trim();
  };

  const getMultiline = (key: string): string | undefined => {
    const m = block.match(new RegExp(`^${key}:\\s*>\\n([\\s\\S]*?)(?=\\n\\S|\\n---|$)`, "m"));
    return m?.[1]?.split("\n").map((l) => l.trim()).filter(Boolean).join(" ");
  };

  const getList = (key: string): string[] => {
    const m = block.match(new RegExp(`^${key}:\\n((?:\\s*-\\s*.+\\n?)*)`, "m"));
    return (
      m?.[1]
        ?.split("\n")
        .map((l) => l.replace(/^\s*-\s*/, "").replace(/^["']|["']$/g, "").trim())
        .filter(Boolean) ?? []
    );
  };

  return {
    name: get("name") ?? "",
    version: get("version") ?? "0.0.0",
    status: get("status") ?? "experimental",
    description: getMultiline("description") ?? get("description") ?? "",
    triggers: getList("triggers"),
    autoActivate: get("auto_activate") === "true",
  };
}

async function collectSkills(cwd: string, filter?: string): Promise<SkillEntry[]> {
  const pkgRoot = path.resolve(cwd, "packages");
  const useMonorepo = await fs.pathExists(path.join(pkgRoot, "skills"));
  const skills: SkillEntry[] = [];
  const seen = new Set<string>();

  for (const { pkg, base } of SKILL_DIRS) {
    const skillsRoot = useMonorepo
      ? path.join(cwd, base)
      : path.join(templatesDir(), "skills", pkg);

    if (!(await fs.pathExists(skillsRoot))) continue;

    const entries = await fs.readdir(skillsRoot, { withFileTypes: true }).catch(() => []);
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const skillFile = path.join(skillsRoot, entry.name, "SKILL.md");
      if (!(await fs.pathExists(skillFile))) continue;
      if (seen.has(entry.name)) continue; // deduplicate by name
      seen.add(entry.name);

      const content = await fs.readFile(skillFile, "utf8").catch(() => "");
      const fm = parseFrontmatter(content);

      if (filter) {
        const f = filter.toLowerCase();
        const matches =
          String(fm.name).toLowerCase().includes(f) ||
          String(fm.description).toLowerCase().includes(f) ||
          (fm.triggers as string[]).some((t) => t.toLowerCase().includes(f));
        if (!matches) continue;
      }

      skills.push({
        name: String(fm.name) || entry.name,
        package: pkg,
        description: String(fm.description),
        version: String(fm.version),
        status: String(fm.status),
        triggers: fm.triggers as string[],
        autoActivate: fm.autoActivate as boolean,
        path: path.relative(cwd, skillFile),
      });
    }
  }

  return skills;
}

export async function runSkills(opts: SkillsOptions): Promise<void> {
  // --- INSPECT mode ---
  if (opts.inspect) {
    const skills = await collectSkills(opts.cwd);
    const skill = skills.find((s) => s.name === opts.inspect || s.name.includes(opts.inspect!));
    if (!skill) {
      logger.error(`Skill "${opts.inspect}" not found. Run \`omnix skills\` to list all skills.`);
      process.exitCode = 1;
      return;
    }
    const content = await fs.readFile(path.join(opts.cwd, skill.path), "utf8").catch(() => "");
    console.log(content);
    return;
  }

  // --- ACTIVATE mode ---
  if (opts.activate) {
    const skills = await collectSkills(opts.cwd);
    const skill = skills.find((s) => s.name === opts.activate || s.name.includes(opts.activate!));
    if (!skill) {
      logger.error(`Skill "${opts.activate}" not found.`);
      process.exitCode = 1;
      return;
    }
    await activateSkillInClaude(opts.cwd, skill);
    return;
  }

  // --- DEACTIVATE mode ---
  if (opts.deactivate) {
    await deactivateSkillInClaude(opts.cwd, opts.deactivate);
    return;
  }

  // --- DOCTOR mode ---
  if (opts.doctor) {
    await runSkillsDoctor(opts.cwd);
    return;
  }

  // --- LIST mode (default) ---
  const skills = await collectSkills(opts.cwd, opts.filter);

  if (opts.json) {
    console.log(JSON.stringify(skills, null, 2));
    return;
  }

  if (skills.length === 0) {
    logger.warn(opts.filter ? `No skills matching "${opts.filter}"` : "No skills found.");
    return;
  }

  // Group by status
  const stable = skills.filter((s) => s.status === "stable");
  const experimental = skills.filter((s) => s.status === "experimental");
  const deprecated = skills.filter((s) => s.status === "deprecated");
  const autoActive = skills.filter((s) => s.autoActivate);

  logger.header(`Omnix Skills${opts.filter ? ` — filter: "${opts.filter}"` : ""}`);
  logger.blank();

  if (autoActive.length > 0) {
    console.log("AUTO-ACTIVATED (every session)");
    for (const s of autoActive) {
      console.log(`  ✓ ${s.name.padEnd(30)} v${s.version}`);
      logger.dim(`    ${s.description.slice(0, 80)}${s.description.length > 80 ? "…" : ""}`);
    }
    logger.blank();
  }

  if (stable.length > 0) {
    console.log("STABLE — safe to activate");
    for (const s of stable.filter((x) => !x.autoActivate)) {
      console.log(`  ○ ${s.name.padEnd(30)} v${s.version}`);
      logger.dim(`    ${s.description.slice(0, 80)}${s.description.length > 80 ? "…" : ""}`);
    }
    logger.blank();
  }

  if (experimental.length > 0) {
    console.log("EXPERIMENTAL — may change");
    for (const s of experimental) {
      console.log(`  ⚠ ${s.name.padEnd(30)} v${s.version}`);
      logger.dim(`    ${s.description.slice(0, 80)}${s.description.length > 80 ? "…" : ""}`);
    }
    logger.blank();
  }

  if (deprecated.length > 0) {
    console.log("DEPRECATED");
    for (const s of deprecated) {
      console.log(`  ✗ ${s.name.padEnd(30)} v${s.version}`);
    }
    logger.blank();
  }

  logger.dim(`${skills.length} skill${skills.length !== 1 ? "s" : ""} found.`);
  logger.dim("  omnix skills --filter <keyword>        Search skills");
  logger.dim("  omnix skills inspect <name>            View full skill");
  logger.dim("  omnix skills activate <name>           Add to CLAUDE.md");
}

async function activateSkillInClaude(cwd: string, skill: SkillEntry): Promise<void> {
  const claudePath = path.join(cwd, "CLAUDE.md");
  if (!(await exists(claudePath))) {
    logger.error("CLAUDE.md not found. Run `omnix install-adapters --adapters claude` first.");
    process.exitCode = 1;
    return;
  }

  let content = await fs.readFile(claudePath, "utf8");
  const skillRef = `@${skill.path.replace(/\\/g, "/")}`;

  // Already active?
  if (content.includes(skillRef) && !content.includes(`<!-- ${skillRef}`)) {
    logger.info(`Skill "${skill.name}" is already active in CLAUDE.md.`);
    return;
  }

  // Remove commented-out version if present
  content = content.replace(new RegExp(`<!--\\s*${skillRef.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*-->`), skillRef);

  // If not present at all, add to Active Skills section
  if (!content.includes(skillRef)) {
    const sectionMarker = "## Active Skills";
    if (content.includes(sectionMarker)) {
      content = content.replace(
        sectionMarker,
        `${sectionMarker}\n${skillRef}`
      );
    } else {
      content += `\n\n## Active Skills\n${skillRef}\n`;
    }
  }

  await fs.writeFile(claudePath, content, "utf8");
  logger.success(`Skill "${skill.name}" activated in CLAUDE.md`);
  logger.dim(`  → ${skillRef}`);
  logger.dim("  Reload Claude Code to apply.");
}

async function deactivateSkillInClaude(cwd: string, skillName: string): Promise<void> {
  const claudePath = path.join(cwd, "CLAUDE.md");
  if (!(await exists(claudePath))) {
    logger.error("CLAUDE.md not found.");
    process.exitCode = 1;
    return;
  }

  let content = await fs.readFile(claudePath, "utf8");
  const escapedName = skillName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  // Use a fresh regex for test + replace to avoid lastIndex mutation on the g flag
  if (!new RegExp(`^@[^\\n]*${escapedName}[^\\n]*$`, "gm").test(content)) {
    logger.warn(`Skill "${skillName}" not found in CLAUDE.md active skills.`);
    return;
  }

  // Comment out each matching skill line
  content = content.replace(
    new RegExp(`^(@[^\\n]*${escapedName}[^\\n]*)$`, "gm"),
    (match) => `<!-- ${match} -->`
  );

  await fs.writeFile(claudePath, content, "utf8");
  logger.success(`Skill "${skillName}" deactivated in CLAUDE.md`);
  logger.dim("  Reload Claude Code to apply.");
}

async function runSkillsDoctor(cwd: string): Promise<void> {
  logger.header("Skills Doctor");
  logger.dim("Checking all skill files for schema compliance…\n");

  const skills = await collectSkills(cwd);
  let issues = 0;

  for (const skill of skills) {
    const errors: string[] = [];
    if (!skill.version) errors.push("missing version");
    if (!skill.status) errors.push("missing status");
    if (skill.triggers.length === 0) errors.push("no triggers defined");
    if (!skill.description) errors.push("missing description");

    if (errors.length > 0) {
      issues++;
      logger.warn(`${skill.name}: ${errors.join(", ")}`);
    } else {
      logger.row(skill.name, "ok", true);
    }
  }

  logger.blank();
  if (issues === 0) {
    logger.success(`All ${skills.length} skills pass schema check.`);
  } else {
    logger.warn(`${issues}/${skills.length} skills have issues.`);
  }
}

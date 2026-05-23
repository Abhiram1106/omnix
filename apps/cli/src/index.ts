#!/usr/bin/env node
import { Command } from "commander";
import pc from "picocolors";
import { runInit } from "./commands/init.js";
import { runScan } from "./commands/scan.js";
import { runDetect } from "./commands/detect.js";
import { runDoctor } from "./commands/doctor.js";
import { runInstallAdapters } from "./commands/install-adapters.js";
import { runRetrieveContext } from "./commands/retrieve-context.js";
import { runSessionDigest } from "./commands/session-digest.js";
import { runSyncMemory } from "./commands/sync-memory.js";
import { runRoute } from "./commands/route.js";
import { runTeamPlan } from "./commands/team-plan.js";
import { runSkills } from "./commands/skills.js";
import { runUpdate } from "./commands/update.js";
import { runVerify } from "./commands/verify.js";
import { runErrorMatch } from "./commands/error-match.js";
import { runStatus } from "./commands/status.js";
import { runCheckSecrets } from "./commands/check-secrets.js";
import { runResearch } from "./commands/research.js";
import { runDiff } from "./commands/diff.js";
import { runHooks } from "./commands/hooks.js";
import { runVault } from "./commands/vault.js";
import { runTutorial } from "./commands/tutorial.js";
import { runWorkspace } from "./commands/workspace.js";
import { runSkill } from "./utils/skill-runner.js";
import { logger } from "./utils/logger.js";

// ── Top-level safety: catch any unhandled errors so we never leave the user
// with a raw stack trace. Exit cleanly with code 1 instead.
process.on("uncaughtException", (err: Error) => {
  console.error(pc.red("\nUnexpected error: ") + err.message);
  if (process.env.OMNIX_DEBUG) {
    console.error(err.stack);
  } else {
    console.error(pc.dim("Set OMNIX_DEBUG=1 for a full stack trace."));
  }
  console.error(pc.dim("File an issue: https://github.com/Abhiram1106/omnix/issues"));
  process.exit(1);
});

process.on("unhandledRejection", (reason: unknown) => {
  const err = reason instanceof Error ? reason : new Error(String(reason));
  console.error(pc.red("\nUnexpected error: ") + err.message);
  if (process.env.OMNIX_DEBUG) {
    console.error(err.stack);
  } else {
    console.error(pc.dim("Set OMNIX_DEBUG=1 for a full stack trace."));
  }
  console.error(pc.dim("File an issue: https://github.com/Abhiram1106/omnix/issues"));
  process.exit(1);
});

// eslint-disable-next-line @typescript-eslint/no-require-imports
const VERSION: string = (require("../package.json") as { version: string }).version;

const program = new Command();

program
  .name("omnix")
  .description(
    pc.bold("Omnix") +
      " — AI engineering scaffolding: adapters, memory vault, agents, and conventions"
  )
  .version(VERSION, "-v, --version")
  .addHelpText(
    "after",
    `
${pc.bold("Aliases:")} ${pc.dim("omnix")}  ${pc.dim("create-omnix")}

${pc.bold("Quick start:")}
  ${pc.cyan("npx create-omnix")}          initialize in current project
  ${pc.cyan("omnix tutorial")}            5-minute interactive walkthrough (new users start here)
  ${pc.cyan("omnix status")}              health score + vault stats at a glance
  ${pc.cyan("omnix doctor")}              verify installation health
  ${pc.cyan("omnix check-secrets")}       scan vault for accidental secret exposure
  ${pc.cyan("omnix skills")}              list all available skills
  ${pc.cyan("omnix route \"<task>\"")}     route to workflow + agents

${pc.bold("Set OMNIX_DEBUG=1")} for full stack traces on errors.
`
  );

// ── init ──────────────────────────────────────────────────────────────────────
program
  .command("init")
  .description("Initialize Omnix in the current project")
  .option("-y, --yes", "skip prompts, use defaults", false)
  .option("-f, --force", "overwrite existing files", false)
  .option("-n, --dry-run", "print planned writes without writing", false)
  .option("--project-type <type>", "hint project type (fullstack-saas|backend-api|ai-app|…)")
  .option(
    "--adapters <list>",
    "comma-separated adapter names (generic,claude,cursor,windsurf,cline,roo,continue,aider,openhands)"
  )
  .action(async (opts: {
    yes: boolean;
    force: boolean;
    dryRun: boolean;
    projectType?: string;
    adapters?: string;
  }) => {
    const adapters = opts.adapters
      ? (opts.adapters.split(",").map((a) => a.trim()) as never)
      : undefined;
    await runInit({
      cwd: process.cwd(),
      yes: opts.yes,
      force: opts.force,
      dryRun: opts.dryRun,
      projectType: opts.projectType,
      adapters,
    });
  });

// ── scan ──────────────────────────────────────────────────────────────────────
program
  .command("scan")
  .description("Detect project stack, frameworks, AI tools, and memory status")
  .option("--json", "output as JSON", false)
  .option("--write", "write/update project-context.md and current-state.md in vault", false)
  .option("--deep", "run code intelligence scan: entry points, hotspots, test gaps, risks", false)
  .action(async (opts: { json: boolean; write: boolean; deep: boolean }) => {
    await runScan({ cwd: process.cwd(), json: opts.json, write: opts.write, deep: opts.deep });
  });

// ── detect ────────────────────────────────────────────────────────────────────
program
  .command("detect")
  .description("Detect installed Omnix markers and vault health")
  .option("--json", "output as JSON", false)
  .action(async (opts: { json: boolean }) => {
    await runDetect({ cwd: process.cwd(), json: opts.json });
  });

// ── doctor ────────────────────────────────────────────────────────────────────
program
  .command("doctor")
  .description("Verify Omnix installation health (adapters, vault, cross-refs)")
  .option("--json", "output as JSON", false)
  .action(async (opts: { json: boolean }) => {
    await runDoctor({ cwd: process.cwd(), json: opts.json });
  });

// ── install-adapters ──────────────────────────────────────────────────────────
program
  .command("install-adapters")
  .description("Install adapter files for selected AI tools")
  .option(
    "--adapters <list>",
    "comma-separated: generic,claude,cursor,windsurf,cline,roo,continue,aider,openhands",
    "generic,claude,cursor"
  )
  .option("-f, --force", "overwrite existing files", false)
  .option("-n, --dry-run", "print planned writes without writing", false)
  .action(async (opts: { adapters: string; force: boolean; dryRun: boolean }) => {
    await runInstallAdapters({
      cwd: process.cwd(),
      adapters: opts.adapters.split(",").map((a) => a.trim()),
      force: opts.force,
      dryRun: opts.dryRun,
    });
  });

// ── retrieve-context ──────────────────────────────────────────────────────────
program
  .command("retrieve-context")
  .description("Read and rank relevant memory files using task-type-aware retrieval with token budgets")
  .option("--task <description>", "task description for relevance ranking and mode detection", "")
  .option("--top <n>", "max files to retrieve", "8")
  .option("--mode <mode>", "retrieval mode: minimal|balanced|deep|architecture|debugging (auto-detected from task)")
  .option("--json", "output as JSON", false)
  .action(async (opts: { task: string; top: string; mode?: string; json: boolean }) => {
    const validModes = ["minimal", "balanced", "deep", "architecture", "debugging"];
    const mode = opts.mode && validModes.includes(opts.mode) ? opts.mode as never : undefined;
    await runRetrieveContext({
      cwd: process.cwd(),
      task: opts.task,
      top: parseInt(opts.top, 10),
      json: opts.json,
      mode,
    });
  });

// ── session-digest ────────────────────────────────────────────────────────────
program
  .command("session-digest")
  .description("Write a session digest to .obsidian-ai-memory/01-SESSIONS/")
  .option("--tool <name>", "AI tool name (claude-code, cursor, windsurf, …)", "unknown")
  .option("--notes <file>", "path to notes file with session details")
  .option("--auto", "auto-generate minimal digest from git diff (no prompts)", false)
  .option("-n, --dry-run", "print digest without writing", false)
  .action(async (opts: { tool: string; notes?: string; auto: boolean; dryRun: boolean }) => {
    await runSessionDigest({
      cwd: process.cwd(),
      tool: opts.tool,
      notesPath: opts.notes,
      auto: opts.auto,
      dryRun: opts.dryRun,
    });
  });

// ── sync-memory ───────────────────────────────────────────────────────────────
program
  .command("sync-memory")
  .description("Validate vault structure, show stats, compress or prune old sessions")
  .option("--fix", "create missing folders and stub files", false)
  .option("--compress", "compress sessions older than 7 days into weekly summaries", false)
  .option("--stats", "print per-folder file count and KB — spot vault bloat", false)
  .option("--prune [days]", "archive sessions older than N days (default: 90) to keep vault lean")
  .option("-n, --dry-run", "show what would be fixed/compressed/archived without writing", false)
  .action(async (opts: { fix: boolean; compress: boolean; stats: boolean; prune?: string | boolean; dryRun: boolean }) => {
    const pruneArg = opts.prune === true ? 90 : opts.prune ? parseInt(opts.prune, 10) : undefined;
    await runSyncMemory({
      cwd: process.cwd(),
      fix: opts.fix,
      compress: opts.compress,
      stats: opts.stats,
      prune: pruneArg,
      dryRun: opts.dryRun,
    });
  });

// ── route ─────────────────────────────────────────────────────────────────────
program
  .command("route [request]")
  .description('Route a request to the best workflow and agent roles (no LLM required)')
  .option("--json", "output as JSON", false)
  .action(async (request: string | undefined, opts: { json: boolean }) => {
    await runRoute({
      cwd: process.cwd(),
      request: request ?? "",
      json: opts.json,
    });
  });

// ── team-plan ─────────────────────────────────────────────────────────────────
program
  .command("team-plan [request]")
  .description("Generate a multi-role reasoning checklist for a request (single-session, not parallel processes)")
  .option("--json", "output as JSON", false)
  .action(async (request: string | undefined, opts: { json: boolean }) => {
    await runTeamPlan({
      cwd: process.cwd(),
      request: request ?? "",
      json: opts.json,
    });
  });

// ── skills ────────────────────────────────────────────────────────────────────
program
  .command("skills")
  .description("List, inspect, activate, run, and doctor Omnix skills")
  .option("--filter <keyword>", "filter skills by name, description, or trigger")
  .option("--inspect <name>", "show full SKILL.md for a skill")
  .option("--activate <name>", "add skill to CLAUDE.md active skills section")
  .option("--deactivate <name>", "remove skill from CLAUDE.md active skills section")
  .option("--run <name>", "execute a skill's runtime handler")
  .option("--input <text>", "input text to pass to the skill handler")
  .option("--doctor", "check all skill files for schema compliance", false)
  .option("-n, --dry-run", "dry run (skills that write to vault will preview instead)", false)
  .option("--json", "output as JSON", false)
  .action(async (opts: { filter?: string; inspect?: string; activate?: string; deactivate?: string; run?: string; input?: string; doctor: boolean; dryRun: boolean; json: boolean }) => {
    if (opts.run) {
      const result = await runSkill({
        cwd: process.cwd(),
        skillName: opts.run,
        input: opts.input,
        dryRun: opts.dryRun,
      });
      console.log(result.output);
      if (result.memoryWritten.length > 0) {
        logger.blank();
        logger.dim(`Memory writes: ${result.memoryWritten.join(", ")}`);
      }
      if (!result.hadHandler) {
        logger.blank();
        logger.dim(`"${opts.run}" has no runtime handler yet — showing guided mode.`);
        logger.dim("Skills with handlers: debugging-specialist, error-intelligence, context-manager, workflow-router, repo-scanner, dependency-doctor, documentation-maintainer");
      }
      return;
    }
    await runSkills({
      cwd: process.cwd(),
      json: opts.json,
      filter: opts.filter,
      inspect: opts.inspect,
      activate: opts.activate,
      deactivate: opts.deactivate,
      doctor: opts.doctor,
    });
  });

// ── research ─────────────────────────────────────────────────────────────────
program
  .command("research [query]")
  .description("Research a topic: check vault cache first, fetch authoritative sources, store result")
  .option("--force", "skip cache and always fetch fresh", false)
  .option("--json", "output as JSON", false)
  .action(async (query: string | undefined, opts: { force: boolean; json: boolean }) => {
    if (!query) {
      logger.error("Provide a research query: omnix research \"npm axios\" or omnix research \"node lts version\"");
      process.exitCode = 1;
      return;
    }
    await runResearch({ cwd: process.cwd(), query, force: opts.force, json: opts.json });
  });

// ── diff ──────────────────────────────────────────────────────────────────────
program
  .command("diff")
  .description("Show what changed since the last recorded session digest")
  .option("--json", "output as JSON", false)
  .action(async (opts: { json: boolean }) => {
    await runDiff({ cwd: process.cwd(), json: opts.json });
  });

// ── hooks ─────────────────────────────────────────────────────────────────────
program
  .command("hooks")
  .description("Install/uninstall git hooks (pre-commit: check-secrets, post-commit: auto-digest)")
  .option("--install <hook>", "install a hook: pre-commit | post-commit | all")
  .option("--uninstall <hook>", "remove a hook: pre-commit | post-commit | all")
  .option("--list", "list installed hooks", false)
  .option("-n, --dry-run", "preview without writing", false)
  .action(async (opts: { install?: string; uninstall?: string; list: boolean; dryRun: boolean }) => {
    await runHooks({
      cwd: process.cwd(),
      install: opts.install as "pre-commit" | "post-commit" | "all" | undefined,
      uninstall: opts.uninstall as "pre-commit" | "post-commit" | "all" | undefined,
      list: opts.list,
      dryRun: opts.dryRun,
    });
  });

// ── vault ─────────────────────────────────────────────────────────────────────
program
  .command("vault <subcommand>")
  .description("Vault management: validate | streak | migrate | self-test")
  .option("-n, --dry-run", "preview without writing", false)
  .option("--json", "output as JSON", false)
  .action(async (subcommand: string, opts: { dryRun: boolean; json: boolean }) => {
    const valid = ["validate", "streak", "migrate", "self-test"];
    if (!valid.includes(subcommand)) {
      logger.error(`Unknown subcommand "${subcommand}". Valid: ${valid.join(", ")}`);
      process.exitCode = 1;
      return;
    }
    await runVault({
      cwd: process.cwd(),
      subcommand: subcommand as "validate" | "streak" | "migrate" | "self-test",
      dryRun: opts.dryRun,
      json: opts.json,
    });
  });

// ── context pack ──────────────────────────────────────────────────────────────
program
  .command("context-pack")
  .description("Generate a bounded context pack (< 3000 tokens) of vault content for the current task")
  .option("--task <description>", "task description for relevance ranking", "")
  .option("--mode <mode>", "retrieval mode: minimal|balanced|deep|architecture|debugging", "balanced")
  .action(async (opts: { task: string; mode: string }) => {
    const { runRetrieveContext } = await import("./commands/retrieve-context.js");
    const validModes = ["minimal", "balanced", "deep", "architecture", "debugging"];
    const mode = validModes.includes(opts.mode) ? opts.mode as never : "balanced" as never;
    await runRetrieveContext({
      cwd: process.cwd(),
      task: opts.task,
      top: 10,
      json: false,
      mode,
    });
  });

// ── memory ────────────────────────────────────────────────────────────────────
program
  .command("memory")
  .description("Memory management: compact, stats, index")
  .option("--compact", "compress old sessions + prune > 90 days + update index", false)
  .option("--stats", "show vault size stats", false)
  .option("--index", "regenerate vault-index.md", false)
  .option("-n, --dry-run", "preview without writing", false)
  .action(async (opts: { compact: boolean; stats: boolean; index: boolean; dryRun: boolean }) => {
    await runSyncMemory({
      cwd: process.cwd(),
      fix: false,
      compress: opts.compact,
      prune: opts.compact ? 90 : undefined,
      stats: opts.stats,
      dryRun: opts.dryRun,
    });
  });

// ── error-match ───────────────────────────────────────────────────────────────
program
  .command("error-match [error]")
  .description("Search error memory for similar past errors and their fixes")
  .option("--top <n>", "max matches to return", "3")
  .option("--json", "output as JSON", false)
  .action(async (error: string | undefined, opts: { top: string; json: boolean }) => {
    if (!error) {
      logger.error("Provide an error description: omnix error-match \"cannot read property of undefined\"");
      process.exitCode = 1;
      return;
    }
    await runErrorMatch({
      cwd: process.cwd(),
      errorText: error,
      top: parseInt(opts.top, 10),
      json: opts.json,
    });
  });

// ── verify ────────────────────────────────────────────────────────────────────
program
  .command("verify")
  .description("Check that Omnix convention files are present and readable by AI tools")
  .option("--json", "output as JSON", false)
  .action(async (opts: { json: boolean }) => {
    await runVerify({ cwd: process.cwd(), json: opts.json });
  });

// ── update ────────────────────────────────────────────────────────────────────
program
  .command("update")
  .description("Update installed adapter files to the latest version from this omnix release")
  .option("--target <type>", "what to update: adapters | settings | all", "adapters")
  .option("--adapters <list>", "comma-separated adapters to update (default: all detected installed)")
  .option("-n, --dry-run", "show what would be updated without writing", false)
  .action(async (opts: { target: string; adapters?: string; dryRun: boolean }) => {
    const target = (["adapters", "settings", "all"].includes(opts.target)
      ? opts.target : "adapters") as "adapters" | "settings" | "all";
    await runUpdate({
      cwd: process.cwd(),
      target,
      adapters: opts.adapters?.split(",").map((a) => a.trim()),
      dryRun: opts.dryRun,
    });
  });

// ── tutorial ──────────────────────────────────────────────────────────────────
program
  .command("tutorial")
  .description("Interactive first-run walkthrough — detects your setup and suggests next steps")
  .action(async () => {
    await runTutorial({ cwd: process.cwd() });
  });

// ── status ────────────────────────────────────────────────────────────────────
program
  .command("status")
  .description("Show health score, vault stats, installed adapters, and next steps — at a glance")
  .option("--json", "output as JSON", false)
  .action(async (opts: { json: boolean }) => {
    await runStatus({ cwd: process.cwd(), json: opts.json });
  });

// ── check-secrets ─────────────────────────────────────────────────────────────
program
  .command("check-secrets")
  .description("Scan vault and .omnix/ for accidentally written secrets (API keys, tokens, passwords)")
  .option("--fix", "show guidance for each finding (no auto-redaction)", false)
  .option("--json", "output as JSON", false)
  .action(async (opts: { fix: boolean; json: boolean }) => {
    await runCheckSecrets({ cwd: process.cwd(), fix: opts.fix, json: opts.json });
  });

// ── workspace ─────────────────────────────────────────────────────────────────
program
  .command("workspace")
  .description("List all monorepo packages with per-package health scores")
  .option("--health", "show detailed health breakdown per package", false)
  .option("--json", "output as JSON", false)
  .action(async (opts: { health: boolean; json: boolean }) => {
    await runWorkspace({ cwd: process.cwd(), health: opts.health, json: opts.json });
  });

// ── default: bare `npx create-omnix` with no args → init ──────────
if (
  process.argv.length === 2 ||
  (process.argv.length === 3 &&
    ["create-omnix", "omnix"].includes(
      process.argv[1]?.split(/[\\/]/).pop()?.replace(/\.js$/, "") ?? ""
    ))
) {
  process.argv.push("init");
}

program.parseAsync(process.argv).catch((err: unknown) => {
  console.error(pc.red("Error:"), err instanceof Error ? err.message : String(err));
  process.exit(1);
});

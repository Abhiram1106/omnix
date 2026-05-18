/**
 * omnix tutorial — guided 5-minute first-run walkthrough.
 *
 * Detects what's installed, suggests the next 3 concrete steps based on
 * the current state, and explains each. Designed so a new user knows
 * exactly what to do without reading 1000 lines of docs.
 */

import path from "node:path";
import fs from "fs-extra";
import pc from "picocolors";
import { VAULT_DIR, OMNIX_DIR, cwdPath, exists } from "../utils/paths.js";
import { ADAPTER_FILES } from "../utils/adapter-files.js";
import { ALL_ADAPTERS } from "../utils/prompts.js";
import { logger } from "../utils/logger.js";

export interface TutorialOptions {
  cwd: string;
}

export async function runTutorial(opts: TutorialOptions): Promise<void> {
  const vaultRoot = cwdPath(opts.cwd, VAULT_DIR);
  const omnixDir = cwdPath(opts.cwd, OMNIX_DIR);

  // Detect current state
  const vaultPresent = await exists(vaultRoot);
  const omnixPresent = await exists(omnixDir);
  const gitignore = await fs.readFile(path.join(opts.cwd, ".gitignore"), "utf8").catch(() => "");
  const gitignoreOk = gitignore.includes(".omnix/memory/");
  const ctxPath = path.join(vaultRoot, "02-PROJECTS", "project-context.md");
  const ctx = await fs.readFile(ctxPath, "utf8").catch(() => "");
  const ctxCustomized = ctx.length > 100 && !ctx.includes("TODO");

  const installedAdapters: string[] = [];
  for (const a of ALL_ADAPTERS) {
    const files = ADAPTER_FILES[a] ?? [];
    const anyHere = (await Promise.all(files.map((f) => exists(path.join(opts.cwd, f.dest))))).some(Boolean);
    if (anyHere) installedAdapters.push(a);
  }

  const sessionsDir = path.join(vaultRoot, "01-SESSIONS");
  let sessionCount = 0;
  if (await exists(sessionsDir)) {
    const dateDirs = (await fs.readdir(sessionsDir)).filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d));
    for (const d of dateDirs) {
      const files = await fs.readdir(path.join(sessionsDir, d)).catch(() => []);
      sessionCount += files.filter((f) => f.endsWith(".md")).length;
    }
  }

  // ── Header ─────────────────────────────────────────────────────────────────
  console.log(pc.bold(pc.cyan("\nWelcome to Omnix tutorial.\n")));
  console.log("Omnix is a CLI that writes convention files into your project so any AI");
  console.log("coding tool (Claude Code, Cursor, etc.) shares the same memory and rules.");
  console.log("");

  // ── Current state ──────────────────────────────────────────────────────────
  console.log(pc.bold("Your current setup:"));
  console.log(`  ${vaultPresent ? "✓" : "✗"} Memory vault     ${vaultPresent ? pc.dim(VAULT_DIR) : pc.red("not installed")}`);
  console.log(`  ${omnixPresent ? "✓" : "✗"} .omnix/ config   ${omnixPresent ? pc.dim(OMNIX_DIR) : pc.red("not installed")}`);
  console.log(`  ${gitignoreOk ? "✓" : "✗"} .gitignore guard ${gitignoreOk ? pc.dim("memory/ excluded") : pc.red("missing entries")}`);
  console.log(`  ${installedAdapters.length > 0 ? "✓" : "✗"} AI tool adapters ${installedAdapters.length > 0 ? pc.dim(installedAdapters.join(", ")) : pc.red("none installed")}`);
  console.log(`  ${ctxCustomized ? "✓" : "✗"} Project context  ${ctxCustomized ? pc.dim("customized") : pc.red("needs setup")}`);
  console.log(`  ${sessionCount > 0 ? "✓" : "○"} Session digests  ${sessionCount > 0 ? pc.dim(`${sessionCount} written`) : pc.dim("none yet")}`);
  console.log();

  // ── Step-by-step suggestions ───────────────────────────────────────────────
  const steps: Array<{ heading: string; explanation: string; command: string }> = [];

  if (!vaultPresent || !omnixPresent) {
    steps.push({
      heading: "Step 1 — Initialize Omnix",
      explanation: "Creates the memory vault, .omnix/ config, and adapter files for your AI tools.",
      command: "npx omnix init --yes",
    });
  } else {
    if (!ctxCustomized) {
      steps.push({
        heading: "Step 1 — Populate your project context",
        explanation: "Run scan with --write to detect your stack and fill in project-context.md.\nThis is what every AI session loads first.",
        command: "omnix scan --write",
      });
    }

    if (sessionCount === 0) {
      steps.push({
        heading: `Step ${steps.length + 1} — Write your first session digest`,
        explanation: "After your next coding session with Claude/Cursor, record what you did.\nLater you can find it again with `omnix retrieve-context`.",
        command: "omnix session-digest --tool claude-code --auto",
      });
    }

    steps.push({
      heading: `Step ${steps.length + 1} — Try the killer features`,
      explanation: "These are the commands you'll actually use day-to-day:",
      command: `omnix status                              # health score + vault stats
omnix error-match "your error here"      # find past fixes for similar errors
omnix route "fix the auth bug"           # which workflow + agents to use
omnix skills --run debugging-specialist --input "TypeError: cannot read property"
omnix check-secrets                      # scan vault for accidental secrets`,
    });

    steps.push({
      heading: `Step ${steps.length + 1} — Auto-protect your commits`,
      explanation: "Install a git pre-commit hook so check-secrets runs on every commit.\nBlocks the commit if secrets are detected.",
      command: "omnix hooks --install pre-commit",
    });
  }

  // ── Print steps ────────────────────────────────────────────────────────────
  if (steps.length === 0) {
    console.log(pc.green(pc.bold("You're set up. There's nothing left for the tutorial to do.\n")));
    console.log("Run any of these whenever you want:");
    console.log(pc.cyan("  omnix status") + pc.dim("                      — at-a-glance health"));
    console.log(pc.cyan("  omnix skills") + pc.dim("                      — list all available skills"));
    console.log(pc.cyan("  omnix vault streak") + pc.dim("                — your session activity"));
    console.log(pc.cyan("  omnix diff") + pc.dim("                        — what changed since last digest"));
    console.log();
    return;
  }

  console.log(pc.bold(pc.cyan(`Next ${steps.length} step${steps.length !== 1 ? "s" : ""}:`)));
  console.log();
  for (const step of steps) {
    console.log(pc.bold(step.heading));
    for (const line of step.explanation.split("\n")) {
      console.log(`  ${line}`);
    }
    console.log();
    for (const line of step.command.split("\n")) {
      console.log(`  ${pc.cyan(line)}`);
    }
    console.log();
  }

  console.log(pc.dim("Run `omnix tutorial` again anytime — it adapts to your current state."));
  console.log();
}

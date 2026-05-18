/**
 * workflow-router skill handler
 *
 * Deterministic (no LLM) routing of a task to workflow + agent roles.
 * Extended version of omnix route with skill memory integration.
 */

import type { SkillHandler } from "../utils/skill-runner.js";

interface RouteResult {
  workflow: string;
  agents: string[];
  skills: string[];
  memoryPriority: string[];
  safetyFlags: string[];
}

const ROUTES: Array<{
  patterns: RegExp[];
  workflow: string;
  agents: string[];
  skills: string[];
  memoryPriority: string[];
  safetyFlags: string[];
}> = [
  {
    patterns: [/error|crash|fail|broken|exception|bug|not work|why is/i],
    workflow: "debugging → bug-fix",
    agents: ["debugger", "security"],
    skills: ["debugging-specialist", "error-intelligence"],
    memoryPriority: ["03-ERRORS/error-memory.md", "03-ERRORS/anti-patterns.md", "02-PROJECTS/project-context.md"],
    safetyFlags: [],
  },
  {
    patterns: [/build|implement|add|create|feature|new/i],
    workflow: "feature-build",
    agents: ["architect", "fullstack", "reviewer"],
    skills: ["context-manager", "test-architect"],
    memoryPriority: ["02-PROJECTS/project-context.md", "05-ARCHITECTURE/system-overview.md", "04-DECISIONS/decisions.md"],
    safetyFlags: [],
  },
  {
    patterns: [/deploy|ship|release|publish/i],
    workflow: "deployment",
    agents: ["devops (specialized)"],
    skills: ["devops-orchestrator", "release-manager"],
    memoryPriority: ["02-PROJECTS/project-context.md", "05-ARCHITECTURE/system-overview.md"],
    safetyFlags: ["Confirm with user before any production deploy", "Verify rollback plan exists"],
  },
  {
    patterns: [/review|audit|check quality|code review/i],
    workflow: "code-review",
    agents: ["reviewer", "security"],
    skills: ["security-threat-modeler", "api-contract-reviewer"],
    memoryPriority: ["03-ERRORS/anti-patterns.md", "02-PROJECTS/project-context.md"],
    safetyFlags: [],
  },
  {
    patterns: [/refactor|clean|simplify|improve|restructure/i],
    workflow: "refactor",
    agents: ["architect", "reviewer"],
    skills: ["repo-scanner"],
    memoryPriority: ["05-ARCHITECTURE/system-overview.md", "02-PROJECTS/project-context.md"],
    safetyFlags: ["Make sure tests pass before and after refactor"],
  },
  {
    patterns: [/security|vulnerability|CVE|auth|injection|secret/i],
    workflow: "code-review + security",
    agents: ["security", "reviewer"],
    skills: ["security-threat-modeler", "dependency-doctor"],
    memoryPriority: ["02-PROJECTS/project-context.md"],
    safetyFlags: ["Never expose secrets in output"],
  },
  {
    patterns: [/test|coverage|spec|TDD/i],
    workflow: "testing",
    agents: ["qa", "fullstack"],
    skills: ["test-architect"],
    memoryPriority: ["03-ERRORS/error-memory.md", "02-PROJECTS/project-context.md"],
    safetyFlags: [],
  },
  {
    patterns: [/database|migration|schema|sql|postgres|mysql/i],
    workflow: "feature-build + database",
    agents: ["architect", "database (specialized)"],
    skills: ["database-migration-guard"],
    memoryPriority: ["05-ARCHITECTURE/system-overview.md", "02-PROJECTS/project-context.md"],
    safetyFlags: ["Confirm before running any migration", "Always have a rollback plan"],
  },
  {
    patterns: [/doc|readme|runbook|changelog|document/i],
    workflow: "docs-update",
    agents: ["docs (specialized)"],
    skills: ["documentation-maintainer"],
    memoryPriority: ["02-PROJECTS/project-context.md", "04-DECISIONS/decisions.md"],
    safetyFlags: [],
  },
  {
    patterns: [/performance|slow|latency|optimize|profil/i],
    workflow: "debugging + performance",
    agents: ["debugger", "performance (specialized)"],
    skills: ["performance-profiler"],
    memoryPriority: ["02-PROJECTS/project-context.md", "07-LESSONS/performance-notes.md"],
    safetyFlags: ["Never optimize without measuring first"],
  },
];

export const handler: SkillHandler = async ({ input }) => {
  const task = input.trim();
  const output: string[] = ["# Workflow Router", ""];

  if (!task) {
    output.push("Usage: omnix skills run workflow-router --input \"<task description>\"");
    return { output: output.join("\n"), memoryWrites: [] };
  }

  output.push(`**Task:** ${task}`);
  output.push("");

  const route = matchRoute(task);

  output.push(`**Workflow:** ${route.workflow}`);
  output.push(`**Agents:** ${route.agents.join(", ")}`);
  output.push(`**Activate skills:** ${route.skills.join(", ")}`);
  output.push("");
  output.push("**Load memory in this order:**");
  for (const p of route.memoryPriority) {
    output.push(`  1. \`${p}\``);
  }

  if (route.safetyFlags.length > 0) {
    output.push("");
    output.push("**Safety flags:**");
    for (const flag of route.safetyFlags) {
      output.push(`  ⚠ ${flag}`);
    }
  }

  output.push("");
  output.push("**Activate skills in Claude Code:**");
  for (const skill of route.skills) {
    output.push(`  omnix skills activate ${skill}`);
  }

  return { output: output.join("\n"), memoryWrites: [] };
};

function matchRoute(task: string): RouteResult {
  for (const route of ROUTES) {
    if (route.patterns.some((p) => p.test(task))) {
      return route;
    }
  }
  // Default
  return {
    workflow: "feature-build",
    agents: ["fullstack", "reviewer"],
    skills: ["context-manager"],
    memoryPriority: ["02-PROJECTS/project-context.md"],
    safetyFlags: [],
  };
}

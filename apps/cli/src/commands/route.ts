import { logger } from "../utils/logger.js";

export interface RouteOptions {
  cwd: string;
  request: string;
  json: boolean;
}

// Rule-based routing — no LLM required.
interface RoutingRule {
  verbs: string[];
  nouns: string[];
  workflow: string;
  agents: string[];
  notes?: string;
}

const ROUTING_RULES: RoutingRule[] = [
  {
    verbs: ["fix", "broken", "error", "crash", "exception", "fail", "failing", "bug"],
    nouns: [],
    workflow: "debugging → bug-fix",
    agents: ["debugger", "qa", "reviewer"],
    notes: "error detected — retrieval mode: debugging",
  },
  {
    verbs: ["build", "add", "create", "implement", "develop", "write", "make"],
    nouns: [],
    workflow: "feature-build",
    agents: ["fullstack", "architect", "qa"],
  },
  {
    verbs: ["review", "check", "audit", "assess", "inspect"],
    nouns: [],
    workflow: "code-review",
    agents: ["reviewer", "security", "qa"],
  },
  {
    verbs: ["refactor", "clean", "simplify", "reorganize", "restructure"],
    nouns: [],
    workflow: "refactor",
    agents: ["architect", "reviewer", "qa"],
  },
  {
    verbs: ["deploy", "ship", "release", "publish", "push"],
    nouns: [],
    workflow: "deployment",
    agents: ["devops", "sre", "qa"],
  },
  {
    verbs: ["slow", "optimize", "performance", "latency", "speed"],
    nouns: [],
    workflow: "debugging + performance-review",
    agents: ["performance", "debugger", "database"],
  },
  {
    verbs: ["docs", "document", "update docs", "readme", "documentation"],
    nouns: [],
    workflow: "docs-update",
    agents: ["docs", "reviewer"],
  },
  {
    verbs: ["test", "tests", "spec", "coverage"],
    nouns: [],
    workflow: "testing",
    agents: ["qa", "reviewer"],
  },
];

const AREA_RULES: { keywords: string[]; agents: string[]; note: string }[] = [
  {
    keywords: ["auth", "login", "password", "jwt", "oauth", "session", "permission", "role"],
    agents: ["security", "backend"],
    note: "auth/security area — security agent activated",
  },
  {
    keywords: ["stripe", "payment", "billing", "subscription", "checkout"],
    agents: ["security", "backend", "product-engineer"],
    note: "payment area — security agent activated",
  },
  {
    keywords: ["schema", "migration", "database", "db", "postgres", "prisma", "drizzle", "sql"],
    agents: ["database", "backend"],
    note: "DB/schema area — database agent activated",
  },
  {
    keywords: ["docker", "kubernetes", "k8s", "ci", "cd", "github actions", "deploy", "helm"],
    agents: ["devops", "sre"],
    note: "DevOps/infra area — devops + sre agents activated",
  },
  {
    keywords: ["frontend", "ui", "component", "page", "layout", "css", "tailwind"],
    agents: ["frontend", "product-engineer"],
    note: "frontend area",
  },
  {
    keywords: ["api", "endpoint", "route", "rest", "graphql", "trpc", "openapi"],
    agents: ["api", "backend"],
    note: "API area",
  },
  {
    keywords: ["llm", "prompt", "ai", "openai", "anthropic", "claude", "gpt", "embedding"],
    agents: ["ai-engineer", "security"],
    note: "AI/LLM area — ai-engineer activated",
  },
  {
    keywords: ["architect", "architecture", "boundary", "module", "design"],
    agents: ["architect", "reviewer"],
    note: "architecture area",
  },
];

export interface RouteResult {
  request: string;
  workflow: string;
  agents: string[];
  retrievalMode: string;
  notes: string[];
}

export function routeRequest(request: string): RouteResult {
  const lower = request.toLowerCase();
  const words = lower.split(/\s+/);

  // Match routing rules
  let matchedRule: RoutingRule | null = null;
  for (const rule of ROUTING_RULES) {
    const verbMatch = rule.verbs.some((v) => lower.includes(v));
    if (verbMatch) {
      matchedRule = rule;
      break;
    }
  }

  const workflow = matchedRule?.workflow ?? "project-onboarding (no clear signal)";
  const agentSet = new Set<string>(matchedRule?.agents ?? ["fullstack"]);
  const notes: string[] = matchedRule?.notes ? [matchedRule.notes] : [];

  // Layer on area-specific agents
  for (const area of AREA_RULES) {
    if (area.keywords.some((k) => lower.includes(k))) {
      for (const a of area.agents) agentSet.add(a);
      notes.push(area.note);
    }
  }

  // Multi-area → parallel team mode
  const isMultiArea = agentSet.size >= 4;
  if (isMultiArea) notes.push("multi-area task → parallel team mode activated");

  // Retrieval mode
  let retrievalMode = "balanced";
  if (lower.includes("architect") || lower.includes("redesign")) retrievalMode = "architecture";
  else if (matchedRule?.workflow.includes("debug")) retrievalMode = "debugging";
  else if (matchedRule?.workflow.includes("deploy")) retrievalMode = "deployment";
  else if (words.length <= 3) retrievalMode = "minimal";
  else if (agentSet.size >= 5) retrievalMode = "deep";

  return {
    request,
    workflow,
    agents: Array.from(agentSet),
    retrievalMode,
    notes,
  };
}

export async function runRoute(opts: RouteOptions): Promise<void> {
  if (!opts.request.trim()) {
    logger.error("Provide a request string: omnix route \"<request>\"");
    process.exitCode = 1;
    return;
  }

  const result = routeRequest(opts.request);

  if (opts.json) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  logger.header("Route");
  logger.row("Request", `"${result.request}"`);
  logger.blank();
  logger.row("Workflow", result.workflow);
  logger.row("Agents", result.agents.join(", "));
  logger.row("Retrieval mode", result.retrievalMode);
  if (result.notes.length > 0) {
    logger.blank();
    for (const n of result.notes) logger.dim(`  ℹ ${n}`);
  }
}

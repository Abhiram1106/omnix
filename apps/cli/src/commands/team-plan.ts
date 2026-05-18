import { routeRequest } from "./route.js";
import { logger } from "../utils/logger.js";

export interface TeamPlanOptions {
  cwd: string;
  request: string;
  json: boolean;
}

const ROLE_RESPONSIBILITIES: Record<string, string> = {
  "product-engineer": "Confirm behavior, scope, and user value",
  architect: "Check design fit, module boundaries, reversibility",
  frontend: "UI implementation, accessibility, client perf",
  backend: "API/service implementation, business logic, idempotency",
  database: "Schema safety, migration, indexes, query correctness",
  security: "Auth/authz, input validation, secrets, threat surface",
  devops: "CI/CD, infra, container, deploy strategy",
  sre: "SLOs, runbooks, alerting, incident readiness",
  qa: "Test plan, edge cases, regression, coverage",
  "ai-engineer": "Prompt design, evals, model selection, cost/latency",
  api: "API contract, versioning, pagination, error envelopes",
  performance: "Latency profiling, DB query plans, bundle size",
  reviewer: "Code quality, conventions, final check",
  docs: "README, runbooks, API docs — updated if behavior changes",
  debugger: "Root cause analysis, hypothesis-driven investigation",
  fullstack: "End-to-end vertical slice ownership",
};

const SEQUENCE_TEMPLATES: Record<string, string[]> = {
  "feature-build": [
    "1. Retrieve memory (deep mode)",
    "2. Architect: confirm design + check constraints",
    "3. DB: schema + migration if needed",
    "4. Backend: API + business logic",
    "5. Frontend: UI + state",
    "6. QA: tests at each layer",
    "7. Security: auth/input check",
    "8. Reviewer: conventions + final check",
    "9. Docs: update if behavior changed",
    "10. Memory: session digest + decisions",
  ],
  "debugging": [
    "1. Retrieve memory (debugging mode) — check error-memory first",
    "2. Debugger: reproduce + hypothesize",
    "3. Backend/DB/Frontend (area-dependent): narrow to root cause",
    "4. QA: write regression test",
    "5. Security: check if vuln-related",
    "6. Reviewer: verify fix is minimal + correct",
    "7. Memory: error-memory entry + prevention rule",
  ],
  "code-review": [
    "1. Retrieve memory (balanced mode)",
    "2. Reviewer: correctness + conventions",
    "3. Security: auth/secret/injection risk",
    "4. QA: tests present, edge cases covered",
    "5. Docs: updated where needed",
    "6. Memory: recurring patterns → lessons",
  ],
  "deployment": [
    "1. Retrieve memory (deployment mode)",
    "2. DevOps: CI green, migrations safe, rollback plan",
    "3. SRE: health checks, synthetic monitors ready",
    "4. Security: secrets, headers, surface checks",
    "5. QA: smoke tests post-deploy",
    "6. Memory: session digest",
  ],
  "refactor": [
    "1. Retrieve memory (deep mode)",
    "2. Architect: confirm scope + boundaries",
    "3. Reviewer: identify code smells",
    "4. Backend/Frontend (area-dependent): apply refactor",
    "5. QA: run tests, add missing ones",
    "6. Docs: update if API/behavior changed",
    "7. Memory: session digest",
  ],
};

function pickSequence(workflow: string): string[] {
  for (const [key, steps] of Object.entries(SEQUENCE_TEMPLATES)) {
    if (workflow.includes(key)) return steps;
  }
  return SEQUENCE_TEMPLATES["feature-build"]!;
}

export async function runTeamPlan(opts: TeamPlanOptions): Promise<void> {
  if (!opts.request.trim()) {
    logger.error('Provide a request string: omnix team-plan "<request>"');
    process.exitCode = 1;
    return;
  }

  const route = routeRequest(opts.request);
  const isMultiArea = route.agents.length >= 3;
  const sequence = pickSequence(route.workflow);

  const roles = route.agents.map((a) => ({
    role: a,
    responsibility: ROLE_RESPONSIBILITIES[a] ?? "See agent definition",
  }));

  const result = {
    request: opts.request,
    taskType: isMultiArea ? "Cross-cutting — parallel team mode" : "Focused",
    parallelMode: isMultiArea,
    workflow: route.workflow,
    retrievalMode: route.retrievalMode,
    roles,
    workflowSequence: sequence,
    notes: route.notes,
  };

  if (opts.json) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  logger.header("Team Plan");
  logger.row("Request", `"${result.request}"`);
  logger.row("Workflow", result.workflow);
  logger.row("Mode", result.taskType);
  logger.row("Retrieval", result.retrievalMode);
  logger.blank();

  logger.step("Roles");
  const colW = Math.max(...roles.map((r) => r.role.length), 12) + 2;
  for (const r of roles) {
    console.log(`  ${r.role.padEnd(colW)} ${r.responsibility}`);
  }

  logger.blank();
  logger.step("Execution sequence");
  for (const step of sequence) console.log(`  ${step}`);

  if (result.notes.length > 0) {
    logger.blank();
    for (const n of result.notes) logger.dim(`  ℹ ${n}`);
  }

  logger.blank();
  logger.dim(
    "This plan is a guide. The AI synthesizes all perspectives before acting — not as separate agents."
  );
}

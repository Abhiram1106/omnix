import path from "node:path";
import fs from "fs-extra";

export type ProjectType =
  | "fullstack-saas"
  | "frontend-only"
  | "backend-api"
  | "ai-app"
  | "monorepo"
  | "devops-infra"
  | "browser-scraping"
  | "documentation"
  | "unknown";

export interface MonorepoPackage {
  name: string;
  path: string;
  type: string;
}

export interface StackInfo {
  projectType: ProjectType;
  languages: string[];
  frameworks: string[];
  packageManager: "pnpm" | "npm" | "yarn" | "bun" | "unknown";
  testRunner: string | null;
  databases: string[];
  hasDocker: boolean;
  hasK8s: boolean;
  hasGitHubActions: boolean;
  hasPrisma: boolean;
  hasDrizzle: boolean;
  hasOpenAPI: boolean;
  aiTools: string[];
  /** Whether the project is a monorepo. */
  isMonorepo: boolean;
  /** Which monorepo tool was detected. */
  monorepoTool: "turbo" | "nx" | "lerna" | "pnpm-workspaces" | "none";
  /** Sub-packages in monorepos (apps/*, packages/*, libs/*, services/*, tools/*). */
  monorepoPackages: MonorepoPackage[];
  raw: Record<string, boolean>;
}

/** Read first N lines of a file — avoids loading huge files. */
async function readHead(filePath: string, lines = 40): Promise<string> {
  try {
    const content = await fs.readFile(filePath, "utf8");
    return content.split("\n").slice(0, lines).join("\n");
  } catch {
    return "";
  }
}

/** Quick presence check. */
async function has(cwd: string, rel: string): Promise<boolean> {
  return fs.pathExists(path.join(cwd, rel));
}

export async function detectStack(cwd: string): Promise<StackInfo> {
  const [
    hasPkg,
    hasPyproject,
    hasRequirements,
    hasGoMod,
    hasCargo,
    hasPomXml,
    hasBuildGradle,
    hasDockerfile,
    hasDockerCompose,
    hasK8s,
    hasGHA,
    hasPrisma,
    hasDrizzle,
    hasNextConfig,
    hasNextConfigTs,
    hasViteConfig,
    hasPnpmWs,
    hasPnpmLock,
    hasYarnLock,
    hasBunLock,
    hasOpenApiJson,
    hasOpenApiYaml,
    hasPlaywright,
    hasTurbo,
    hasNx,
    hasLerna,
  ] = await Promise.all([
    has(cwd, "package.json"),
    has(cwd, "pyproject.toml"),
    has(cwd, "requirements.txt"),
    has(cwd, "go.mod"),
    has(cwd, "Cargo.toml"),
    has(cwd, "pom.xml"),
    has(cwd, "build.gradle"),
    has(cwd, "Dockerfile"),
    has(cwd, "docker-compose.yml"),
    has(cwd, "k8s"),
    has(cwd, ".github/workflows"),
    has(cwd, "prisma/schema.prisma"),
    has(cwd, "drizzle.config.ts").then((v) =>
      v ? v : has(cwd, "drizzle.config.js")
    ),
    has(cwd, "next.config.js"),
    has(cwd, "next.config.ts"),
    has(cwd, "vite.config.ts").then((v) =>
      v ? v : has(cwd, "vite.config.js")
    ),
    has(cwd, "pnpm-workspace.yaml"),
    has(cwd, "pnpm-lock.yaml"),
    has(cwd, "yarn.lock"),
    has(cwd, "bun.lockb"),
    has(cwd, "openapi.json"),
    has(cwd, "openapi.yaml"),
    has(cwd, "playwright.config.ts").then((v) =>
      v ? v : has(cwd, "playwright.config.js")
    ),
    has(cwd, "turbo.json"),
    has(cwd, "nx.json"),
    has(cwd, "lerna.json"),
  ]);

  const languages: string[] = [];
  const frameworks: string[] = [];
  const databases: string[] = [];

  if (hasPkg) languages.push("TypeScript/JavaScript");
  if (hasPyproject || hasRequirements) languages.push("Python");
  if (hasGoMod) languages.push("Go");
  if (hasCargo) languages.push("Rust");
  if (hasPomXml || hasBuildGradle) languages.push("Java/Kotlin");

  // Detect package manager
  let packageManager: StackInfo["packageManager"] = "unknown";
  if (hasPnpmLock || hasPnpmWs) packageManager = "pnpm";
  else if (hasYarnLock) packageManager = "yarn";
  else if (hasBunLock) packageManager = "bun";
  else if (hasPkg) packageManager = "npm";

  // Frameworks from package.json deps (first 80 lines is enough)
  let pkgDeps = "";
  if (hasPkg) pkgDeps = await readHead(path.join(cwd, "package.json"), 80);

  const hasNext = hasNextConfig || hasNextConfigTs || pkgDeps.includes('"next"');
  const hasReact = pkgDeps.includes('"react"');
  const hasSvelte = pkgDeps.includes('"svelte"') || pkgDeps.includes('"@sveltejs/kit"');
  const hasVue = pkgDeps.includes('"vue"');
  const hasAstro = pkgDeps.includes('"astro"');
  const hasFastify = pkgDeps.includes('"fastify"');
  const hasExpress = pkgDeps.includes('"express"');
  const hasHono = pkgDeps.includes('"hono"');
  const hasTrpc = pkgDeps.includes('"@trpc/');
  const hasAiSdk =
    pkgDeps.includes('"ai"') ||
    pkgDeps.includes('"@ai-sdk/') ||
    pkgDeps.includes('"openai"') ||
    pkgDeps.includes('"@anthropic-ai/sdk"');
  let testRunner: string | null = null;
  if (pkgDeps.includes('"vitest"')) testRunner = "vitest";
  else if (pkgDeps.includes('"jest"')) testRunner = "jest";

  if (hasNext) frameworks.push("Next.js");
  else if (hasReact) frameworks.push("React");
  if (hasSvelte) frameworks.push("SvelteKit/Svelte");
  if (hasVue) frameworks.push("Vue");
  if (hasAstro) frameworks.push("Astro");
  if (hasFastify) frameworks.push("Fastify");
  if (hasExpress) frameworks.push("Express");
  if (hasHono) frameworks.push("Hono");
  if (hasTrpc) frameworks.push("tRPC");

  if (hasPrisma) databases.push("Postgres/Prisma");
  if (hasDrizzle) databases.push("Postgres/Drizzle");

  // AI tools already installed
  const aiToolChecks: Array<string | null> = await Promise.all([
    has(cwd, ".claude").then((v): string | null => (v ? "Claude Code" : null)),
    has(cwd, "CLAUDE.md").then((v): string | null => (v ? "Claude Code (CLAUDE.md)" : null)),
    has(cwd, ".cursor").then((v): string | null => (v ? "Cursor" : null)),
    has(cwd, ".windsurf").then((v): string | null => (v ? "Windsurf" : null)),
    has(cwd, ".cline").then((v): string | null => (v ? "Cline" : null)),
    has(cwd, ".roo").then((v): string | null => (v ? "Roo" : null)),
    has(cwd, "CONVENTIONS.md").then((v): string | null => (v ? "Aider" : null)),
    has(cwd, ".openhands").then((v): string | null => (v ? "OpenHands" : null)),
  ]);
  const aiTools: string[] = aiToolChecks.filter((t): t is string => t !== null);

  // Project type
  let projectType: ProjectType = "unknown";
  if (hasPnpmWs || hasTurbo || hasNx || hasLerna) projectType = "monorepo";
  else if (hasNext) projectType = "fullstack-saas";
  else if (hasViteConfig && !hasFastify && !hasExpress) projectType = "frontend-only";
  else if ((hasFastify || hasExpress || hasHono) && !hasReact) projectType = "backend-api";
  else if (hasAiSdk) projectType = "ai-app";
  else if (hasDockerfile && (hasK8s || hasGHA)) projectType = "devops-infra";
  else if (hasPlaywright) projectType = "browser-scraping";
  else if (hasPyproject || hasRequirements) projectType = "backend-api";

  // Enumerate monorepo sub-packages
  const monorepoPackages: MonorepoPackage[] = [];
  if (projectType === "monorepo") {
    for (const parentDir of ["apps", "packages", "libs", "services", "tools"]) {
      const parentPath = path.join(cwd, parentDir);
      if (await has(cwd, parentDir)) {
        const entries = await fs.readdir(parentPath, { withFileTypes: true }).catch(() => []);
        for (const entry of entries) {
          if (!entry.isDirectory()) continue;
          const pkgJsonPath = path.join(parentPath, entry.name, "package.json");
          const pyprojectPath = path.join(parentPath, entry.name, "pyproject.toml");
          let pkgName = entry.name;
          let pkgType = "unknown";

          if (await has(parentPath, `${entry.name}/package.json`)) {
            const raw = await readHead(pkgJsonPath, 5);
            const match = raw.match(/"name":\s*"([^"]+)"/);
            if (match) pkgName = match[1]!;
            pkgType = "node";
          } else if (await has(parentPath, `${entry.name}/pyproject.toml`)) {
            pkgType = "python";
          }

          monorepoPackages.push({
            name: pkgName,
            path: `${parentDir}/${entry.name}`,
            type: pkgType,
          });
        }
      }
    }
  }

  const isMonorepo = projectType === "monorepo";
  let monorepoTool: StackInfo["monorepoTool"] = "none";
  if (hasTurbo) monorepoTool = "turbo";
  else if (hasNx) monorepoTool = "nx";
  else if (hasLerna) monorepoTool = "lerna";
  else if (hasPnpmWs) monorepoTool = "pnpm-workspaces";

  return {
    projectType,
    languages,
    frameworks,
    packageManager,
    testRunner,
    databases,
    hasDocker: hasDockerfile,
    hasK8s,
    hasGitHubActions: hasGHA,
    hasPrisma,
    hasDrizzle,
    hasOpenAPI: hasOpenApiJson || hasOpenApiYaml,
    aiTools,
    isMonorepo,
    monorepoTool,
    monorepoPackages,
    raw: {
      hasPkg,
      hasPyproject,
      hasGoMod,
      hasCargo,
      hasDockerfile,
      hasDockerCompose,
      hasK8s,
      hasGHA,
      hasPrisma,
      hasDrizzle,
      hasNext,
      hasReact,
      hasAiSdk,
      hasPlaywright,
    },
  };
}

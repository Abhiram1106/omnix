import promptsLib from "prompts";
import pc from "picocolors";
import { sanitizeName } from "./paths.js";

export type AdapterName =
  | "claude"
  | "cursor"
  | "windsurf"
  | "cline"
  | "roo"
  | "continue"
  | "aider"
  | "openhands"
  | "generic";

export const ALL_ADAPTERS: AdapterName[] = [
  "generic",
  "claude",
  "cursor",
  "windsurf",
  "cline",
  "roo",
  "continue",
  "aider",
  "openhands",
];

export const DEFAULT_ADAPTERS: AdapterName[] = ["generic", "claude", "cursor"];

export interface InitAnswers {
  adapters: AdapterName[];
  memoryLocation: "inside" | "adjacent";
  projectName: string;
}

/** Ask init setup questions. Returns defaults if `yes` is true. */
export async function askInitQuestions(opts: {
  yes: boolean;
  projectName?: string;
  adapters?: AdapterName[];
}): Promise<InitAnswers> {
  if (opts.yes) {
    return {
      adapters: opts.adapters ?? DEFAULT_ADAPTERS,
      memoryLocation: "inside",
      projectName: opts.projectName ?? "my-project",
    };
  }

  const answers = await promptsLib(
    [
      {
        type: "text",
        name: "projectName",
        message: "Project name?",
        initial: opts.projectName ?? "my-project",
      },
      {
        type: "multiselect",
        name: "adapters",
        message: "Which AI tools should adapters be installed for?",
        choices: ALL_ADAPTERS.map((a) => ({
          title: a,
          value: a,
          selected: DEFAULT_ADAPTERS.includes(a),
        })),
        instructions: pc.dim(
          "\n  ↑/↓ navigate  space select  a toggle all  enter confirm\n"
        ),
        min: 1,
      },
      {
        type: "select",
        name: "memoryLocation",
        message: "Where should .obsidian-ai-memory live?",
        choices: [
          {
            title: "Inside the project (committed to git)",
            value: "inside",
          },
          {
            title: "Adjacent to the project (gitignored)",
            value: "adjacent",
          },
        ],
      },
    ],
    { onCancel: () => process.exit(0) }
  );

  const rawName = String(answers["projectName"] ?? opts.projectName ?? "my-project");
  const rawAdapters = answers["adapters"] as unknown;
  const rawLocation = answers["memoryLocation"] as unknown;

  // Validate adapters: filter to only known values
  const adapters: AdapterName[] =
    Array.isArray(rawAdapters)
      ? (rawAdapters as string[]).filter((a): a is AdapterName => (ALL_ADAPTERS as string[]).includes(a))
      : DEFAULT_ADAPTERS;

  // Validate memoryLocation
  const memoryLocation: "inside" | "adjacent" =
    rawLocation === "inside" || rawLocation === "adjacent" ? rawLocation : "inside";

  return {
    projectName: sanitizeName(rawName) || "my-project",
    adapters: adapters.length > 0 ? adapters : DEFAULT_ADAPTERS,
    memoryLocation,
  };
}

/** Ask a single yes/no confirmation. Returns true if yes flag set. */
export async function confirm(
  message: string,
  yes: boolean
): Promise<boolean> {
  if (yes) return true;
  const { ok } = await promptsLib(
    { type: "confirm", name: "ok", message, initial: true },
    { onCancel: () => process.exit(0) }
  );
  return Boolean(ok);
}

import type { AdapterName } from "./prompts.js";

/**
 * Single source of truth for adapter template → destination mappings.
 * Used by init, install-adapters, and update commands.
 */
export const ADAPTER_FILES: Record<AdapterName, { src: string; dest: string }[]> = {
  generic: [
    { src: "adapters/generic/AGENTS.md",          dest: "AGENTS.md" },
    { src: "adapters/generic/AI_RULES.md",         dest: "AI_RULES.md" },
    { src: "adapters/generic/STARTUP_PROTOCOL.md", dest: "STARTUP_PROTOCOL.md" },
  ],
  claude: [
    { src: "adapters/claude/CLAUDE.md",        dest: "CLAUDE.md" },
    { src: "adapters/claude/settings.json",    dest: ".claude/settings.json" },
  ],
  cursor: [
    { src: "adapters/cursor/project-rules.mdc", dest: ".cursor/rules/project-rules.mdc" },
    { src: "adapters/cursor/frontend.mdc",      dest: ".cursor/rules/frontend.mdc" },
    { src: "adapters/cursor/backend.mdc",       dest: ".cursor/rules/backend.mdc" },
    { src: "adapters/cursor/testing.mdc",       dest: ".cursor/rules/testing.mdc" },
    { src: "adapters/cursor/security.mdc",      dest: ".cursor/rules/security.mdc" },
  ],
  windsurf: [
    { src: "adapters/windsurf/rules.md",        dest: ".windsurf/rules.md" },
  ],
  cline: [
    { src: "adapters/cline/instructions.md",    dest: ".cline/instructions.md" },
  ],
  roo: [
    { src: "adapters/roo/instructions.md",      dest: ".roo/instructions.md" },
  ],
  continue: [
    { src: "adapters/continue/config.md",       dest: ".continue/config.md" },
  ],
  aider: [
    { src: "adapters/aider/CONVENTIONS.md",     dest: "CONVENTIONS.md" },
  ],
  openhands: [
    { src: "adapters/openhands/instructions.md", dest: ".openhands/instructions.md" },
  ],
};

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
    { src: "adapters/claude/CLAUDE.md",                          dest: "CLAUDE.md" },
    { src: "adapters/claude/.claude/CLAUDE.md",                  dest: ".claude/CLAUDE.md" },
    { src: "adapters/claude/.claude/CLAUDE.local.md",            dest: ".claude/CLAUDE.local.md" },
    { src: "adapters/claude/.claude/settings.json",              dest: ".claude/settings.json" },
    { src: "adapters/claude/.claude/settings.local.json",        dest: ".claude/settings.local.json" },
    { src: "adapters/claude/.claude/.mcp.json",                  dest: ".claude/.mcp.json" },
    { src: "adapters/claude/.claude/agents/README.md",           dest: ".claude/agents/README.md" },
    { src: "adapters/claude/.claude/skills/README.md",           dest: ".claude/skills/README.md" },
    { src: "adapters/claude/.claude/rules/code-style.md",        dest: ".claude/rules/code-style.md" },
    { src: "adapters/claude/.claude/rules/frontend/react.md",    dest: ".claude/rules/frontend/react.md" },
    { src: "adapters/claude/.claude/rules/packages/README.md",   dest: ".claude/rules/packages/README.md" },
  ],
  cursor: [
    // .mdc rules
    { src: "adapters/cursor/project-rules.mdc",  dest: ".cursor/rules/project-rules.mdc" },
    { src: "adapters/cursor/memory-session.mdc", dest: ".cursor/rules/memory-session.mdc" },
    { src: "adapters/cursor/frontend.mdc",       dest: ".cursor/rules/frontend.mdc" },
    { src: "adapters/cursor/backend.mdc",        dest: ".cursor/rules/backend.mdc" },
    { src: "adapters/cursor/testing.mdc",        dest: ".cursor/rules/testing.mdc" },
    { src: "adapters/cursor/security.mdc",       dest: ".cursor/rules/security.mdc" },
    // Memory workflow + cursor-specific AGENTS
    { src: "adapters/cursor/MEMORY-WORKFLOW.md",  dest: ".cursor/MEMORY-WORKFLOW.md" },
    { src: "adapters/cursor/AGENTS.md",           dest: ".cursor/AGENTS.md" },
    { src: "adapters/cursor/cursor-settings.json", dest: ".cursor/cursor-settings.json" },
    // Context packs
    { src: "adapters/cursor/context/backend-context.md",  dest: ".cursor/context/backend-context.md" },
    { src: "adapters/cursor/context/frontend-context.md", dest: ".cursor/context/frontend-context.md" },
    { src: "adapters/cursor/context/database-context.md", dest: ".cursor/context/database-context.md" },
    // Agent recipes
    { src: "adapters/cursor/agents/debug.md",            dest: ".cursor/agents/debug.md" },
    { src: "adapters/cursor/agents/backend-feature.md",  dest: ".cursor/agents/backend-feature.md" },
    { src: "adapters/cursor/agents/frontend-feature.md", dest: ".cursor/agents/frontend-feature.md" },
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

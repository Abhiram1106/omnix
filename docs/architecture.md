# Architecture

## Goal

A monorepo whose content is consumed by multiple AI coding tools, with a shared long-term memory backend that every tool reads and writes.

## Layers

```
+------------------------------------------------------------+
|  AI coding tools  (Claude Code, Cursor, Windsurf, …)       |
+------------------------------------------------------------+
              | reads adapter files
              v
+------------------------------------------------------------+
|  packages/adapters/<tool>/                                 |
|  Thin compat layer. Points to core + memory.               |
+------------------------------------------------------------+
              | references
              v
+------------------------------------------------------------+
|  packages/core/                                            |
|  standards · workflows · agents · templates                |
|  (single source of truth)                                  |
+------------------------------------------------------------+

+------------------------------------------------------------+
|  packages/memory/  →  per-project .obsidian-ai-memory/     |
|  Long-term memory the tools read/write every session       |
+------------------------------------------------------------+

+------------------------------------------------------------+
|  apps/cli/   tools/scripts/                                |
|  Install adapters, init memory, scan, digest, sync         |
+------------------------------------------------------------+
```

## Why monorepo

- One change to a rule propagates to every adapter.
- Shared types/scripts for memory ops.
- Versioning happens at the repo level; tools pin to a tag.

## Tool independence

The CLI and the docs make no assumption about which AI tool the user runs. Adapters translate to each tool's specific config format/filename; that is the only tool-specific layer.

## Memory independence

The memory backend is plain markdown in a folder. Any tool that reads files reads the memory. Obsidian on top is for human navigation.

## What this is not

- An agent runtime.
- A swarm orchestrator.
- A wrapper around an LLM.

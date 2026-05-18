# Architecture Standards

## Principles

- **Boring is good.** Prefer well-understood patterns over novel ones unless the novelty is the point.
- **One way to do common things.** Pick a routing approach, a state pattern, a data-access pattern, and stick to it.
- **Boundaries before abstractions.** Identify modules/services by what they own, not by what they do.
- **Push complexity to the edges.** Keep core domain logic pure; do IO at module boundaries.
- **Reversible decisions are cheap.** Defer hard-to-reverse choices (DB engine, deployment platform, framework) until you have data.

## Layering

- `domain/` — entities, value objects, pure logic. No IO, no framework imports.
- `application/` — use cases, orchestration of domain + adapters.
- `infrastructure/` — DB, HTTP, queues, external APIs.
- `interface/` — controllers, CLI commands, web handlers.

Not every project needs all four; smaller projects collapse `application` and `interface` together. Larger projects split `infrastructure` per concern.

## Module rules

- Public surface area is explicit. Re-export from one `index` per module; everything else is internal.
- No circular imports. If two modules need each other, extract the shared piece.
- Cross-module calls go through public interfaces, never reach into internals.

## State of the world

Maintain `05-ARCHITECTURE/system-overview.md` in the memory vault: components, data stores, external services, key flows, and constraints. Update when architecture changes.

## Decisions

Architectural decisions go through an ADR (see `templates/adr-template.md`) and are listed in `04-DECISIONS/decisions.md`.

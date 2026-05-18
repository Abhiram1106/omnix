# Recommended Stack

Defaults for greenfield projects using this OS. Override per project where it makes sense.

## Frontend

| Need | Default | Alternates |
|---|---|---|
| Framework | Next.js (App Router) | SvelteKit, Solid Start, Astro |
| Language | TypeScript strict | — |
| Styling | Tailwind + shadcn/ui | CSS Modules, Vanilla Extract |
| State | TanStack Query + Zustand | Jotai, Redux Toolkit |
| Forms | React Hook Form + Zod | Conform |
| E2E tests | Playwright | Cypress |

## Backend

| Need | Default | Alternates |
|---|---|---|
| Runtime | Node 20+ or Python 3.12+ | Bun, Deno, Go, Rust |
| HTTP framework | Hono (Node), FastAPI (Python) | Express, Koa, Fastify |
| ORM | Drizzle (TS), SQLAlchemy / SQLModel (Py) | Prisma, Kysely |
| Background jobs | BullMQ (Node), Celery / Arq (Py) | Inngest, Trigger.dev, Temporal |
| Validation | Zod (TS), Pydantic (Py) | Valibot |

## Data

| Need | Default | Alternates |
|---|---|---|
| OLTP | Postgres | MySQL, SQLite (small) |
| Cache | Redis (or Valkey / DragonflyDB) | — |
| Search | Postgres FTS | Meilisearch, Typesense |
| Object storage | S3-compatible | R2, GCS |
| Vector | pgvector | Qdrant, LanceDB |

## Infra

| Need | Default | Alternates |
|---|---|---|
| Deploy | Vercel (frontend), Fly.io / Render / Railway (backend) | AWS, GCP, Azure |
| IaC | Terraform / OpenTofu | Pulumi, CDK |
| CI | GitHub Actions | GitLab CI, CircleCI |

## AI / LLM

| Need | Default | Alternates |
|---|---|---|
| Provider abstraction | Vercel AI SDK | LangChain, LlamaIndex |
| Gateway | Vercel AI Gateway / OpenRouter | direct |
| Embeddings | provider-native | sentence-transformers (local) |
| Eval | promptfoo or custom | Braintrust |

These defaults are starting points, not mandates. The standards in `packages/core/standards/*` apply regardless of stack choice.

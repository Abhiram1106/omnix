# Docker Workflow

## Local dev

- `docker compose` for local dependencies (Postgres, Redis, MinIO, etc.).
- App itself runs natively for fast iteration, unless cross-platform parity matters.

## Production images

- Multi-stage Dockerfile.
- Stage 1: build (full toolchain).
- Stage 2: runtime (distroless or Alpine).
- Non-root user, read-only filesystem where possible.

## Pinning

- Pin base image **digest** for production builds (`FROM node@sha256:...`).
- Renovate / Dependabot updates the digest.

## Size

- Multi-stage + `--mount=type=cache` for package managers.
- `.dockerignore` excludes node_modules, .git, .obsidian-ai-memory, etc.

## Secrets at build / run

- Build secrets: BuildKit `--secret`. Never `ARG` for credentials.
- Run secrets: env from the platform's secret store.

## Compose for tests

- A separate `docker-compose.test.yml` runs DBs/queues for integration tests in CI.

## Memory integration

- Image build incidents → error memory.
- Base image updates that broke something → lesson learned.

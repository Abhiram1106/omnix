---
name: docker-specialist
version: 0.7.0
status: experimental
description: >
  Writes secure, minimal Dockerfiles and Docker Compose configs. Multi-stage builds,
  non-root users, health checks, .dockerignore, bind mounts for dev.
triggers:
  - "dockerfile"
  - "docker"
  - "containerize"
  - "docker compose"
  - "docker-compose"
  - "container"
  - "build image"
  - "docker build"
auto_activate: false
requires: []
produces:
  - "Dockerfile"
  - "docker-compose.yml"
  - ".dockerignore"
memory_reads:
  - { path: "02-PROJECTS/project-context.md", priority: high }
memory_writes: []
token_budget: { self: 800, context_reads: 300, total: 1100 }
verification_required: true
destructive: false
tags: [docker, containers, dockerfile, compose, security, multi-stage]
compatible_adapters: [claude-code, cursor, generic]
---

## When to activate

Writing Dockerfiles, setting up Docker Compose for development, debugging container issues.

## Production Dockerfile (Node.js — multi-stage)

**PASS: Secure, minimal, multi-stage**
```dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

# Stage 2: Production
FROM node:20-alpine AS production
WORKDIR /app

# Non-root user (security)
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Only production deps
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./
RUN corepack enable && pnpm install --prod --frozen-lockfile

COPY --from=builder /app/dist ./dist

# Health check
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', r => process.exit(r.statusCode === 200 ? 0 : 1))"

EXPOSE 3000
CMD ["node", "dist/index.js"]
```

**FAIL: Single stage, runs as root**
```dockerfile
FROM node:20         # not alpine — 3x larger
WORKDIR /app
COPY . .
RUN npm install      # dev deps included in production image
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"] # no health check, runs as root
```

## .dockerignore (always include)

```
node_modules
.git
.env
.env.*
dist
coverage
*.log
.DS_Store
.obsidian-ai-memory
.omnix
README.md
Dockerfile
docker-compose*.yml
```

## Docker Compose (development)

```yaml
# docker-compose.yml
services:
  app:
    build: { context: ., target: builder }
    ports: ["3000:3000"]
    volumes:
      - .:/app:cached          # bind mount for live reload
      - /app/node_modules      # anonymous volume prevents host override
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://user:pass@db:5432/myapp
    depends_on:
      db: { condition: service_healthy }
    develop:
      watch:                   # docker compose watch (2024+)
        - action: sync
          path: ./src
          target: /app/src

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
      POSTGRES_DB: myapp
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U user -d myapp"]
      interval: 10s
      timeout: 5s
      retries: 5
    ports: ["5432:5432"]       # expose only in dev, not in prod compose

volumes:
  postgres_data:
```

**Key rules:**
- Use `version:` field is obsolete in modern Compose — omit it
- Use `condition: service_healthy` instead of just `depends_on`
- Bind mount for dev speed, named volumes for data persistence
- Never put secrets in Compose file — use `.env` or secrets manager

## Image size reduction checklist

- [ ] Use Alpine base (`node:20-alpine`, `python:3.12-slim`)
- [ ] Multi-stage build (build tools not in final image)
- [ ] Only copy what's needed (not `COPY . .` without .dockerignore)
- [ ] `pnpm install --prod` in production stage
- [ ] Combine RUN commands to reduce layers

## Verification

- [ ] `docker build` succeeds
- [ ] Container starts and health check passes
- [ ] No secrets in image (`docker history <image>` shows no env secrets)
- [ ] Non-root user (`docker inspect <container>` shows User field)
- [ ] Image size reasonable (< 500MB for most apps)

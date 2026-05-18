# Self-Hosted Stack Reference

Curated open-source alternatives to common SaaS products. Every entry is self-hostable via Docker.
Patterns from: `deploy-your-own-saas`.

> Use `omnix team-plan "self-host <category>"` to get a deployment plan for any of these.

---

## Authentication & Identity

| Tool | Replaces | Stars | Docker |
|---|---|---|---|
| [Keycloak](https://www.keycloak.org) | Auth0, Okta | ⭐⭐⭐⭐⭐ | `quay.io/keycloak/keycloak` |
| [Authentik](https://goauthentik.io) | Okta, Azure AD | ⭐⭐⭐⭐ | `ghcr.io/goauthentik/server` |
| [Zitadel](https://zitadel.com) | Auth0 | ⭐⭐⭐⭐ | `ghcr.io/zitadel/zitadel` |
| [Logto](https://logto.io) | Auth0, Clerk | ⭐⭐⭐ | `svhd/logto` |

**Quick deploy (Authentik):**
```yaml
services:
  authentik-server:
    image: ghcr.io/goauthentik/server:latest
    command: server
    environment:
      AUTHENTIK_SECRET_KEY: ${AUTHENTIK_SECRET_KEY}
      AUTHENTIK_REDIS__HOST: redis
      AUTHENTIK_POSTGRESQL__HOST: postgresql
```

---

## Analytics

| Tool | Replaces | Stars | Docker |
|---|---|---|---|
| [Plausible](https://plausible.io) | Google Analytics | ⭐⭐⭐⭐⭐ | `ghcr.io/plausible/community-edition` |
| [Umami](https://umami.is) | GA, Mixpanel | ⭐⭐⭐⭐⭐ | `ghcr.io/umami-software/umami` |
| [PostHog](https://posthog.com) | Mixpanel, Amplitude | ⭐⭐⭐⭐⭐ | `posthog/posthog` |
| [Matomo](https://matomo.org) | Google Analytics | ⭐⭐⭐⭐ | `matomo` |

---

## Error Monitoring & Observability

| Tool | Replaces | Stars | Docker |
|---|---|---|---|
| [Sentry](https://sentry.io) | Sentry SaaS | ⭐⭐⭐⭐⭐ | `getsentry/sentry` |
| [GlitchTip](https://glitchtip.com) | Sentry | ⭐⭐⭐ | `glitchtip/glitchtip` |
| [Signoz](https://signoz.io) | Datadog, New Relic | ⭐⭐⭐⭐ | `signoz/signoz` |
| [Grafana + Loki + Tempo](https://grafana.com) | Datadog | ⭐⭐⭐⭐⭐ | `grafana/grafana` |

---

## Databases & Storage

| Tool | Replaces | Stars | Docker |
|---|---|---|---|
| [MinIO](https://min.io) | S3 | ⭐⭐⭐⭐⭐ | `minio/minio` |
| [Garage](https://garagehq.deuxfleurs.fr) | S3 | ⭐⭐⭐ | `dxflrs/garage` |
| [PocketBase](https://pocketbase.io) | Firebase/Supabase | ⭐⭐⭐⭐⭐ | `ghcr.io/muchobien/pocketbase` |
| [Supabase](https://supabase.com/docs/guides/self-hosting) | Firebase | ⭐⭐⭐⭐⭐ | `supabase/postgres` |
| [Neon](https://neon.tech) | Planetscale, Neon SaaS | ⭐⭐⭐⭐ | `neondatabase/neon` |

---

## Email

| Tool | Replaces | Stars | Docker |
|---|---|---|---|
| [Listmonk](https://listmonk.app) | Mailchimp | ⭐⭐⭐⭐⭐ | `listmonk/listmonk` |
| [Postal](https://postalserver.io) | SendGrid, Postmark | ⭐⭐⭐⭐ | `ghcr.io/postalserver/postal` |
| [Mailu](https://mailu.io) | G Suite email | ⭐⭐⭐⭐ | `ghcr.io/mailu/core` |

---

## Project Management & Collaboration

| Tool | Replaces | Stars | Docker |
|---|---|---|---|
| [Plane](https://plane.so) | Jira, Linear | ⭐⭐⭐⭐⭐ | `makeplane/plane` |
| [Gitea](https://gitea.io) | GitHub | ⭐⭐⭐⭐⭐ | `gitea/gitea` |
| [Forgejo](https://forgejo.org) | GitHub (Gitea fork) | ⭐⭐⭐⭐ | `codeberg.org/forgejo/forgejo` |
| [Mattermost](https://mattermost.com) | Slack | ⭐⭐⭐⭐⭐ | `mattermost/mattermost-team-edition` |
| [Zulip](https://zulip.com) | Slack | ⭐⭐⭐⭐ | `zulip/docker-zulip` |

---

## CMS & Documentation

| Tool | Replaces | Stars | Docker |
|---|---|---|---|
| [Outline](https://getoutline.com) | Notion, Confluence | ⭐⭐⭐⭐⭐ | `outlinewiki/outline` |
| [BookStack](https://www.bookstackapp.com) | Confluence | ⭐⭐⭐⭐⭐ | `linuxserver/bookstack` |
| [Directus](https://directus.io) | Contentful | ⭐⭐⭐⭐⭐ | `directus/directus` |
| [Strapi](https://strapi.io) | Contentful | ⭐⭐⭐⭐⭐ | `strapi/strapi` |

---

## AI & LLM Infrastructure

| Tool | Replaces | Stars | Docker |
|---|---|---|---|
| [Ollama](https://ollama.ai) | OpenAI API (local models) | ⭐⭐⭐⭐⭐ | `ollama/ollama` |
| [Open WebUI](https://openwebui.com) | ChatGPT UI | ⭐⭐⭐⭐⭐ | `ghcr.io/open-webui/open-webui` |
| [LiteLLM](https://litellm.ai) | OpenAI proxy/router | ⭐⭐⭐⭐ | `ghcr.io/berriai/litellm` |
| [Langfuse](https://langfuse.com) | LLM observability | ⭐⭐⭐⭐ | `langfuse/langfuse` |
| [Chroma](https://trychroma.com) | Pinecone | ⭐⭐⭐⭐⭐ | `chromadb/chroma` |
| [Weaviate](https://weaviate.io) | Pinecone | ⭐⭐⭐⭐⭐ | `semitechnologies/weaviate` |

---

## Deployment patterns

### Minimum viable self-hosted stack
```
Reverse proxy:  Caddy or Traefik (auto TLS)
Auth:           Authentik
Storage:        MinIO
Analytics:      Umami
Errors:         Sentry (self-hosted)
DB:             Postgres + Supabase
```

### Full production stack
```
Reverse proxy:  Traefik
Auth:           Keycloak
Storage:        MinIO + Garage (multi-node)
Analytics:      PostHog
Observability:  Signoz or Grafana stack
Errors:         Sentry
DB:             Postgres (HA) + Redis
Docs:           Outline
Email:          Postal
```

### Runbook: Add a self-hosted service
1. Check robots/security before deploying public-facing services.
2. Always put behind a reverse proxy (Caddy/Traefik) — never expose raw ports.
3. Use Docker secrets or env files for credentials — never hardcode.
4. Back up data volumes before upgrades.
5. Check changelog for breaking changes before `docker pull`.

# INFRA-1 — multi-stage production image for the Next.js frontend.
#
# Build context is the bazaar-frontend submodule (see root docker-compose.yml:
#   frontend.build.context = ./bazaar-frontend). The deployed service runs
#   `pnpm start -- -H 0.0.0.0` on port 3000 (overridden by compose `command`).
#
# Stages:
#   deps    — install the FULL dependency tree (needs devDeps to build).
#   builder — `next build` against those deps.
#   prod-deps — install ONLY production deps for a lean runtime layer.
#   runner  — slim, non-root image carrying just the build output + prod deps.

ARG NODE_VERSION=20-slim

# ── deps: full install (incl. devDeps) for the build ───────────────────────────
FROM node:${NODE_VERSION} AS deps
WORKDIR /app
# Use the pnpm version pinned by Corepack from package.json's lockfile.
RUN corepack enable
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# ── builder: compile the Next.js app ──────────────────────────────────────────
FROM node:${NODE_VERSION} AS builder
WORKDIR /app
RUN corepack enable
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Telemetry off in CI/containers; build the production bundle.
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm build

# ── prod-deps: production-only dependencies for the runtime image ──────────────
FROM node:${NODE_VERSION} AS prod-deps
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod

# ── runner: minimal non-root runtime ──────────────────────────────────────────
FROM node:${NODE_VERSION} AS runner
WORKDIR /app
RUN corepack enable
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000

# Production deps only.
COPY --from=prod-deps /app/node_modules ./node_modules
# Build output + the files `next start` needs at runtime.
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./next.config.js
COPY --from=builder /app/package.json ./package.json

# Run as the unprivileged `node` user shipped in the base image.
USER node

EXPOSE 3000

# Default command; compose overrides with `pnpm start -- -H 0.0.0.0`.
CMD ["pnpm", "start"]

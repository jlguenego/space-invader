# syntax=docker/dockerfile:1

# Multi-stage image:
# - deps: install monorepo deps with Bun 1.3.5 (cache-friendly)
# - build: run the monorepo build (Vite -> client/dist)
# - runtime: run the Express server under Bun, serving the built SPA

FROM oven/bun:1.3.5 AS deps
WORKDIR /app

# Copy manifests first for better layer caching
COPY package.json bun.lock tsconfig.json eslint.config.mjs ./
COPY client/package.json ./client/package.json
COPY server/package.json ./server/package.json

# Install using the lockfile
RUN bun install --frozen-lockfile

FROM deps AS build
WORKDIR /app

# Copy sources
COPY client ./client
COPY server ./server
COPY scripts ./scripts

# Build (typecheck server + Vite build client)
RUN bun run build

FROM oven/bun:1.3.5 AS runtime
WORKDIR /app

ENV NODE_ENV=production

# Keep runtime simple: reuse installed deps from the deps stage.
# This includes dev deps, but guarantees lockfile-pinned installs.
COPY --from=deps /app/node_modules ./node_modules

# Server sources (executed directly by Bun)
COPY --from=build /app/server ./server

# Front build output (served by Express)
COPY --from=build /app/client/dist ./client/dist

# Ensure the default data dir exists (will be overridden by a bind mount in Compose)
RUN mkdir -p /app/server/data

WORKDIR /app/server

# Default server port (can be overridden with PORT)
EXPOSE 3000

CMD ["bun", "src/index.ts"]

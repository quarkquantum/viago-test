#####################################
# 1) Base image with shared dependencies
# Trigger note: test change for Dokploy auto-deploy
#####################################
FROM node:22-alpine AS base
LABEL maintainer="Viago Team" \
      org.opencontainers.image.source="https://github.com/azizbecha/viago-monorepo" \
      org.opencontainers.image.description="Viago Server"

# Define build arguments for flexibility
ARG PNPM_VERSION=10.12.4
ARG TURBO_VERSION=2.5.4

ENV PNPM_HOME="/pnpm" \
    NODE_ENV=production \
    PORT=3001 \
    API_PORT=3001 \
    NO_UPDATE_NOTIFIER=true \
    NODE_OPTIONS='--max-old-space-size=2048' \
    NODE_NO_WARNINGS=1 \
    CI=true \
    SHELL=/bin/sh \
    # Sharp configuration
    SHARP_IGNORE_GLOBAL_LIBVIPS=1

ENV PATH="$PNPM_HOME:$PATH"

# Install system dependencies including Sharp and Playwright requirements
RUN apk update && \
    apk add --no-cache \
      # Build dependencies
      curl \
      openssl \
      dumb-init && \
    # Cleanup
    rm -rf /var/cache/apk/* /tmp/* /var/tmp/*

# Enable corepack and install specific versions
RUN corepack enable && \
    corepack prepare pnpm@${PNPM_VERSION} --activate && \
    pnpm config set store-dir /pnpm/store && \
    pnpm config set global-bin-dir /usr/local/bin && \
    pnpm add -g turbo@${TURBO_VERSION}

WORKDIR /app

#####################################
# 2) Pruning stage (Smart dependency extraction)
#####################################
FROM base AS pruner

COPY . ./

# Run turbo prune to extract minimal dependency tree
RUN turbo prune @repo/server --docker

#####################################
# 3) Build stage (Install all deps and build)
#####################################
FROM base AS builder

# Set to development during build so devDependencies are available
ENV NODE_ENV=development

# Set dummy database URL for Prisma generate during build
ENV POSTGRES_URL="postgresql://dummy:dummy@localhost:5432/dummy"

WORKDIR /app

# Copy pruned source and configs
COPY --from=pruner /app/out/json/ ./
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=pruner /app/out/full/ ./

# Install all dependencies (including devDependencies) with enhanced caching
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    --mount=type=cache,id=pnpm-metadata,target=/pnpm/metadata \
    pnpm install --no-frozen-lockfile

# Generate Prisma client for @repo/database so generated/client exists at runtime
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm --filter @repo/database exec prisma generate --config=prisma.config.ts

# Mirror generated Prisma client to @repo/database local generated path used by runtime imports
RUN node -e "const fs=require('node:fs');const path=require('node:path');const prismaPkg=path.dirname(require.resolve('@prisma/client/package.json'));const src=path.resolve(prismaPkg,'../../.prisma/client');const dest=path.resolve('packages/database/generated/client');fs.rmSync(dest,{recursive:true,force:true});fs.mkdirSync(path.dirname(dest),{recursive:true});fs.cpSync(src,dest,{recursive:true});"

# Build the server with turbo's optimized build system
RUN --mount=type=cache,id=turbo,target=.turbo \
    NODE_OPTIONS="--max-old-space-size=4096" pnpm turbo run build --filter=@repo/server... --no-cache

#####################################
# 4) Production runner stage (Minimal secure image)
#####################################
FROM node:22-alpine AS runner

ARG PNPM_VERSION=10.12.4

# Production environment variables
ENV NO_UPDATE_NOTIFIER=true \
    NODE_OPTIONS='--max-old-space-size=2048' \
    NODE_NO_WARNINGS=1 \
    NPM_CONFIG_UPDATE_NOTIFIER=false \
    NPM_CONFIG_FUND=false \
    RUN_DB_MIGRATIONS=true \
    PORT=3001 \
    API_PORT=3001 \
    PNPM_HOME="/pnpm"

ENV PATH="$PNPM_HOME:$PATH"

# Install runtime dependencies for Sharp and Playwright
RUN apk update && \
    apk add --no-cache \
      curl \
      openssl \
      dumb-init \
      netcat-openbsd \
      postgresql-client && \
    rm -rf /var/cache/apk/* /tmp/* /var/tmp/*

# Enable corepack for production (minimal setup)
RUN corepack enable && \
    corepack prepare pnpm@${PNPM_VERSION} --activate

# Create dedicated non-root user with specific UID/GID for security
RUN addgroup -g 1001 -S hono && \
    adduser -S hono -u 1001 -G hono -h /app -s /bin/sh

# Switch to non-root user early
USER hono
WORKDIR /app

# Copy built application from builder stage
COPY --from=builder --chown=hono:hono /app .

# Copy scripts with execution permissions
COPY --chown=hono:hono --chmod=755 ./scripts/wait-for-it.sh /app/scripts/wait-for-it.sh
COPY --chown=hono:hono --chmod=755 ./scripts/docker-entrypoint.sh /app/scripts/docker-entrypoint.sh

# Health check for container orchestration
# HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
#     CMD curl -f http://localhost:$PORT/health || exit 1

EXPOSE $PORT

WORKDIR /app/apps/server

# Use entrypoint script to handle startup orchestration
ENTRYPOINT ["/app/scripts/docker-entrypoint.sh"]

# Use node directly instead of tsx for production
CMD ["npm", "start"]

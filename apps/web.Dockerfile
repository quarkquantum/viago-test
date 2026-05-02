#####################################
# 1) Base image with shared dependencies
#####################################
FROM node:22-alpine AS base
LABEL maintainer="Viago Team" \
      org.opencontainers.image.source="https://github.com/azizbecha/viago-monorepo"

ARG APP_NAME
ARG PORT=3003
ARG PNPM_VERSION=10.12.4
ARG TURBO_VERSION=2.5.4

ENV PNPM_HOME="/pnpm" \
    NODE_ENV=production \
    NO_UPDATE_NOTIFIER=true \
    NODE_OPTIONS='--max-old-space-size=2048' \
    NODE_NO_WARNINGS=1 \
    CI=true \
    SHELL=/bin/sh

ENV PATH="$PNPM_HOME:$PATH"

RUN apk update && \
    apk add --no-cache curl openssl && \
    rm -rf /var/cache/apk/* /tmp/* /var/tmp/*

RUN corepack enable && \
    corepack prepare pnpm@${PNPM_VERSION} --activate && \
    pnpm config set store-dir /pnpm/store && \
    pnpm config set global-bin-dir /usr/local/bin && \
    pnpm add -g turbo@${TURBO_VERSION}

WORKDIR /app

#####################################
# 2) Pruning stage
#####################################
FROM base AS pruner

ARG APP_NAME

COPY . ./

RUN turbo prune ${APP_NAME} --docker

#####################################
# 3) Build stage
#####################################
FROM base AS builder

ARG APP_NAME
ARG PORT=3003
ARG NEXT_PUBLIC_API_URL=http://localhost:3000
ARG NEXT_PUBLIC_APP_URL=http://localhost:3001

ENV NODE_ENV=development
ENV POSTGRES_URL="postgresql://dummy:dummy@localhost:5432/dummy"
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}

WORKDIR /app

COPY --from=pruner /app/out/json/ ./
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=pruner /app/out/full/ ./

RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    --mount=type=cache,id=pnpm-metadata,target=/pnpm/metadata \
    pnpm install --no-frozen-lockfile

RUN --mount=type=cache,id=turbo,target=.turbo \
    NODE_OPTIONS="--max-old-space-size=4096" pnpm turbo run build --filter=${APP_NAME}...

#####################################
# 4) Production runner stage
#####################################
FROM node:22-alpine AS runner

ARG APP_NAME
ARG PORT=3003

ENV NODE_ENV=production \
    PORT=${PORT} \
    HOSTNAME="0.0.0.0"

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001 -G nodejs

ARG APP_NAME
ARG PORT=3003

WORKDIR /app

COPY --from=builder --chown=nextjs:nodejs /app/apps/${APP_NAME}/.next/standalone ./apps/${APP_NAME}/
COPY --from=builder --chown=nextjs:nodejs /app/apps/${APP_NAME}/.next/static ./apps/${APP_NAME}/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/${APP_NAME}/public ./apps/${APP_NAME}/public

USER nextjs

EXPOSE ${PORT}

CMD node apps/${APP_NAME}/server.js

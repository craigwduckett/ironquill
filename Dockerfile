# ── Builder ───────────────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy workspace manifests for layer caching
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/api/package.json ./apps/api/

RUN pnpm install --frozen-lockfile

# Copy all source (API needs shared at compile time)
COPY packages/shared ./packages/shared
COPY apps/api ./apps/api

RUN pnpm --filter @ironquill/api build

# ── Runner ────────────────────────────────────────────────────────────────────
FROM node:22-alpine AS runner

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/api/package.json ./apps/api/

# Shared package exports TypeScript source directly — copy it to runner
COPY --from=builder /app/packages/shared ./packages/shared

RUN pnpm install --frozen-lockfile --prod

# Compiled API output
COPY --from=builder /app/apps/api/dist ./apps/api/dist

# Migrations are run as a deploy hook, not at startup
COPY --from=builder /app/apps/api/src/db/migrations ./apps/api/src/db/migrations

WORKDIR /app/apps/api

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "dist/index.js"]

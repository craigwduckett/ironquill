# IronQuill

A web application for running tabletop D&D 5e sessions. Helps dungeon masters manage adventures and players track their characters — without replacing physical dice, roleplay, or face-to-face play.

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite, TanStack Router, TanStack Query, Zustand, CSS Modules |
| Backend | Node.js 22 LTS, Fastify, TypeScript, Drizzle ORM, Socket.io |
| Database | PostgreSQL 16 |
| Shared | Zod schemas + TypeScript types (`packages/shared`) |
| Storage | Cloudflare R2 (S3-compatible) |
| Hosting | Railway (API + DB) + Cloudflare Pages (frontend) |
| Linting | Biome |

## Project Structure

```
ironquill/
├── apps/
│   ├── web/          # React SPA (Vite)
│   └── api/          # Fastify REST API + Socket.io
├── packages/
│   └── shared/       # Zod schemas, TypeScript types, Socket.io event types
├── docker-compose.yml
├── biome.json
└── pnpm-workspace.yaml
```

## Prerequisites

- Node.js >= 22
- pnpm >= 9
- Docker (for local Postgres and MinIO)

## Getting Started

**1. Install dependencies**

```bash
pnpm install
```

**2. Configure environment**

```bash
cp .env.example .env
```

Edit `.env` and set `JWT_SECRET` and `JWT_REFRESH_SECRET` to long random strings. All other values work out of the box for local development.

**3. Start local services**

```bash
docker compose up -d
```

This starts:
- PostgreSQL on `localhost:5432`
- MinIO (S3-compatible object storage) on `localhost:9000` — admin console at `localhost:9001`

**4. Run database migrations**

```bash
pnpm --filter @ironquill/api db:migrate
```

**5. Start the development servers**

```bash
pnpm dev
```

- API: `http://localhost:3000`
- Web: `http://localhost:5173`

## Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all apps in parallel (watch mode) |
| `pnpm build` | Build all packages |
| `pnpm typecheck` | TypeScript check across all workspaces |
| `pnpm check` | Biome lint + format (auto-fix) |
| `pnpm ci:check` | Biome lint + format check (no fix — used in CI) |
| `pnpm test` | Run tests across all workspaces |

### API-specific

| Command | Description |
|---------|-------------|
| `pnpm --filter @ironquill/api db:generate` | Generate a new Drizzle migration from schema changes |
| `pnpm --filter @ironquill/api db:migrate` | Apply pending migrations |
| `pnpm --filter @ironquill/api db:seed` | Seed SRD reference data |
| `pnpm --filter @ironquill/api db:studio` | Open Drizzle Studio (database GUI) |

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret for signing access tokens (min 32 chars) |
| `JWT_REFRESH_SECRET` | Secret for signing refresh tokens (different from above) |
| `PORT` | API server port (default: 3000) |
| `NODE_ENV` | `development`, `production`, or `test` |
| `STORAGE_ENDPOINT` | S3-compatible endpoint (MinIO locally, R2 in prod) |
| `STORAGE_ACCESS_KEY` | Storage access key |
| `STORAGE_SECRET_KEY` | Storage secret key |
| `STORAGE_BUCKET` | Storage bucket name |
| `STORAGE_PUBLIC_URL` | Public base URL for serving assets |
| `VITE_API_URL` | API base URL used by the frontend |
| `VITE_WS_URL` | WebSocket URL used by the frontend |

## Architecture

### Authentication

JWT-based with short-lived access tokens (15 min) and long-lived refresh tokens (7 days, stored in `httpOnly` cookies). A single account can act as Dungeon Master or Player across different adventures.

### Real-Time

Socket.io rooms per session. The DM and all connected players share a room. Events are fully typed via `packages/shared/src/types/socket.ts`.

### Database

PostgreSQL with Drizzle ORM. JSONB columns are used for flexible nested data (ability scores, stat blocks, scene narratives). All SRD reference tables are pre-seeded and read-only at the application level.

### Shared Package

`packages/shared` contains Zod validation schemas and TypeScript types used by both `apps/api` and `apps/web`. Schemas are the single source of truth — TypeScript types are derived with `z.infer<>`.

## Build Phases

The application is built in phases. See `dnd-adventure-manager-spec.md` for the full specification.

| Phase | Scope |
|-------|-------|
| 1 | Auth, dashboard, SRD data + browser, character creation wizard, character sheet |
| 2 | Adventure builder, scene flow editor, NPC roster, encounter builder, invite codes |
| 3 | Live sessions, WebSocket sync, DM view, player view, session lobby |
| 4 | Initiative tracker, combat state, condition tracker, combat log |
| 5 | DM coaching, SRD quick-reference, session summaries, rest mechanics, level-up flow |
| 6 | Sound/ambience, adventure templates, export/import, AI portraits, offline editing |

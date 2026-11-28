# Memory — Arcjet + Prisma Integration for HEKA NestJS

Last updated: 11/26/2026

## What was built

**Arcjet** — Request protection integrated into HEKA NestJS 11:
- `src/lib/arcjet/arcjet.service.ts` — ArcjetService with shield, detectBot, fixedWindow rules
- `src/lib/arcjet/arcjet.module.ts` — `@Global()` ArcjetModule
- `src/common/middleware/arcjet.middleware.ts` — Global middleware on all routes (`*`)

**Prisma ORM 7** — Database ORM with Prisma Postgres:
- `prisma/schema.prisma` — User and Post models with relation
- `prisma7.config.ts` — Prisma config loading DATABASE_URL from .env
- `prisma/migrations/20261126130536_init/` — Initial migration applied
- `src/lib/database/prisma.service.ts` — PrismaService extending PrismaClient with PrismaPg adapter
- `src/lib/database/prisma.module.ts` — `@Global()` PrismaModule

Files modified:
- `src/app.module.ts` — imports ArcjetModule + PrismaModule; removed ObserveModule
- `src/main.ts` — removed ObserveInstrument
- `.env` — ARCJET_KEY, ARCJET_ENV, ARCJET_MODE=LIVE, DATABASE_URL set
- `package.json` — added prisma@7, @prisma/client@7, @prisma/adapter-pg@7, pg, dotenv, tsx, @types/pg

Dependencies installed: `@arcjet/node`, `@nestjs/config`, `prisma@7`, `@prisma/client@7`, `@prisma/adapter-pg@7`, `pg`, `dotenv`, `tsx`, `@types/pg`

Arcjet site: site_01m8btxysdfecrrd2aay4jqe0w (all rules in DRY_RUN)
Prisma Postgres: DATABASE_URL (port 5432) + DIRECT_URL (port 5433) configured in `.env`; `prisma7.config.ts` uses DATABASE_URL; Prisma reads DIRECT_URL from `.env` for migrations; migration `init` applied

## Decisions made

- Arcjet: code-defined rules, DRY_RUN mode, fail-open on error
- Prisma: `@Global()` module per AGENTS.md, PrismaPg adapter for connection pooling
- Removed `@nestjs/observe` — placeholder credentials caused 429 telemetry rate-limit error

## Problems solved

- `@arcjet/node` exports `arcjet` factory function, not `Arcjet` class
- `useGlobalMiddlewares` doesn't exist — used `NestModule.configure()` pattern
- PrismaService import path: `../../generated/prisma/client.js` (from `src/lib/database/`)

## Current state

TypeScript compiles with zero errors. Arcjet middleware active globally. Prisma ORM connected via PrismaPg adapter, migration applied, client generated. App not yet tested end-to-end with database.

## Next session starts with

Test Prisma integration — inject PrismaService into a service/controller and perform CRUD operations on User/Post models.

## Open questions

- Whether to promote Arcjet rules from DRY_RUN to LIVE
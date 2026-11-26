# Memory — Arcjet Integration for HEKA NestJS

Last updated: 11/26/2026

## What was built

Integrated Arcjet request protection into the HEKA NestJS 11 project. Files created:
- `src/lib/arcjet/arcjet.service.ts` — ArcjetService wrapper initializing `arcjet()` with shield, detectBot, and fixedWindow rules; `protect()` method returns ArcjetDecision or null
- `src/lib/arcjet/arcjet.module.ts` — `@Global()` ArcjetModule providing ArcjetService
- `src/common/middleware/arcjet.middleware.ts` — ArcjetMiddleware (NestMiddleware) calling protect() on every request, returning 403 on denial, failing open on error

Files modified:
- `src/app.module.ts` — imports ArcjetModule, adds ArcjetMiddleware to providers, implements NestModule with `configure(consumer)` registering middleware globally on `*`
- `src/main.ts` — removed inline middleware registration (moved to AppModule.configure)
- `.env` — set real ARCJET_KEY (`ajkey_...`), fixed ARCJECT_ENV typo to ARCJET_ENV, ARCJET_MODE=DRY_RUN

Dependencies installed: `@arcjet/node`, `@nestjs/config`

Arcjet site created (via MCP): site_01m8btxysdfecrrd2aay4jqe0w, key `ajkey_...` — all rules in DRY_RUN

## Decisions made

- Code-defined rules (shield, bot, rate limit) in `arcjet()` call rather than remote rules — rules are version-controlled with code
- Middleware registered via `AppModule implements NestModule` with `consumer.apply(ArcjetMiddleware).forRoutes('*')` — NestJS-standard, not `useGlobalMiddlewares` (doesn't exist)
- All rules start in `DRY_RUN` mode — nothing blocked until explicitly promoted
- Fail-open behavior: Arcjet errors allow requests through

## Problems solved

- `@arcjet/node` exports `arcjet` (default factory function), not an `Arcjet` class — fixed import and instantiation
- `useGlobalMiddlewares` does not exist on `INestApplication` — switched to `NestModule.configure()` pattern
- `@nestjs/config` was not installed — installed and imported in ArcjetModule
- Express `Request` is not directly assignable to `ArcjetNodeRequest` — cast via `req as unknown as ArcjetNodeRequest`

## Current state

TypeScript compiles with zero errors (`npx tsc --noEmit` passes). Arcjet is wired into every route via global middleware. All three rules (shield, bot, rate limit) are active in DRY_RUN mode. The app is not yet running to test end-to-end.

## Next session starts with

Run the app (`npm run start:dev`), make test requests, then use Arcjet MCP tools (`arcjet__list-requests`, `arcjet__analyze-traffic`) to review DRY_RUN decisions before promoting rules to LIVE.

## Open questions

- Whether to migrate from code-defined rules to remote rules (managed via Arcjet dashboard) for runtime rule changes without redeploys
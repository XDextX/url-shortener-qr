# Plan 002 — Vercel deploy with Prisma on Postgres

## 1. Scope and coverage
- RF-1: `vercel.json` rewritten without the legacy `builds` key; `.vercelignore`
  deleted; the frontend's API client uses the page's own origin in production.
- RF-2: `BASE_URL` falls back to Vercel's production origin.
- RF-3: a root `api/index.ts` function serves `/:code`, `/api/*` and `/health`.
- RF-4: the `postgres` driver is backed by Neon, not the ephemeral filesystem.
- RF-5: `prisma-driver.ts` replaces `postgres-driver.ts`; a driver contract suite.
- RF-6: `schema.prisma` and an initial migration; `prisma migrate deploy` runs in
  the Vercel build.
- RF-7: the SQLite driver stays the default; `npm test` needs no database server.
- RF-8: the create handler tells a validation error (400) from a store error (500).

RF-1 to RF-4 and RF-6 settle only on Vercel, after the owner's push: they are
verified by hand (block 7), the rest by `npm test`.

## 2. Files
- `packages/database/prisma/schema.prisma` (create) — the `Url` model, the single
  definition of the production table, matching `UrlRecord`.
- `packages/database/prisma/migrations/<ts>_init/migration.sql` (create) — the
  first migration, written by `prisma migrate diff` from empty; no database needed.
- `packages/database/prisma.config.ts` (create) — points the CLI at the schema,
  the migrations and `DATABASE_URL_UNPOOLED` (Neon's direct URL; migrations do not
  go through the pooler).
- `packages/database/src/prisma-driver.ts` (create) — implements `DatabaseDriver`
  over the generated client and `PrismaPg`; connects on first use, so the SQLite
  path never needs a URL.
- `packages/database/src/postgres-driver.ts` (delete) — replaced by the above.
- `packages/database/src/index.ts` (modify) — registers the Prisma driver as
  `postgres`, so `DATABASE_DRIVER=postgres` keeps its meaning.
- `packages/database/package.json` (modify) — adds `prisma` (dev),
  `@prisma/client`, `@prisma/adapter-pg`, pinned to 7.10.1; drops `pg` and
  `@types/pg`; `build` runs `prisma generate` before `tsc`; adds `db:deploy` and
  a `test` script on vitest.
- `packages/database/tests/driver-contract.test.ts` (create) — one suite run
  against SQLite always and against Prisma when `TEST_DATABASE_URL` is set,
  reported as skipped otherwise.
- `packages/database/.env.example` (modify) — documents the Postgres variables.
- `.gitignore` (modify) — ignores the generated client.
- `packages/database/prisma/dev.db` stays: `npm test` writes to it, so the SQLite
  driver still uses it; moving it is the `dev.db` spec's job, not this one's.
- `api/index.ts` (create) — the Vercel function: exports the compiled Express app
  from `apps/backend/dist` and ensures the database once per instance.
- `apps/backend/vercel.ts` (delete) — replaced by `api/index.ts`.
- `vercel.json` (modify) — `buildCommand`, `outputDirectory: dist`,
  `framework: null`, and rewrites of `/api/(.*)`, `/health` and
  `/:code([^./]{1,64})` to `/api`; the filesystem answers first, so assets and
  `index.html` are never looked up as codes.
- `.vercelignore` (delete) — it excluded the sources the build compiles.
- `package.json` (modify) — `"type": "module"` so `api/index.ts` may use ESM
  imports; `db:deploy` forwarding to the database workspace.
- `apps/backend/src/config/env.ts` (modify) — decides the public origin:
  `BASE_URL`, else `https://$VERCEL_PROJECT_PRODUCTION_URL`, else localhost.
- `apps/backend/src/controllers/url.controller.ts` (modify) — decides the status
  of a failed create: 400 for invalid input, 500 for anything else, a `message`
  field only, no internal error text.
- `apps/backend/src/utils/url-validator.ts` (modify) — throws a dedicated
  `InvalidUrlError`, which is what the controller tells apart.
- `apps/frontend/src/api/client.ts` (modify) — decides the API origin: the
  variable if set, else the page's own origin in a production build, else
  localhost:3000.
- `apps/backend/tests/*`, `apps/frontend/src/api/client.test.ts` — see block 7.
- `README.md` (modify) — replaces the deploy section with the new steps (in
  English; the rest stays as is, out of scope).

## 3. Pure logic
- `resolveBaseUrl(env: Record<string, string | undefined>, port: number): string`
  — `BASE_URL` → `https://${VERCEL_PROJECT_PRODUCTION_URL}` → `http://localhost:${port}`.
- `resolveApiBaseUrl(env: { VITE_API_BASE_URL?: string; PROD: boolean }, origin: string): string`
  — variable → `origin` when `PROD` → `http://localhost:3000`.
Both take their inputs as parameters, so the tests pass objects instead of
mutating `process.env` or `import.meta.env`.

## 4. Algorithm
Prisma driver, per method:
- `ensure`: `SELECT 1` through the client — the schema belongs to migrations
  (RF-6), so the driver never creates tables.
- `insert`: `url.create`; `findByCode` / `findByOriginalUrl`: `url.findUnique`;
  `incrementHits`: `url.updateMany({ where: { code }, data: { hits: { increment: 1 } } })`
  and return `count > 0` (no throw on a missing code, same as SQLite);
  `clear`: `url.deleteMany()`.
- The client is created lazily on first call and reused for the instance's life.

Vercel build: `npm run build` (generate → tsc → vite → copy) then
`npm run db:deploy` (`prisma migrate deploy`). A failed migration fails the
deploy, so a schema mismatch never reaches visitors.

## 5. Interface
No visual change. In production the form posts to the same origin; an invalid
URL shows the existing 400 message, a store failure shows the existing generic
error state the form already renders on non-2xx.

## 6. Decisions
- **Prisma 7.10.1, not `latest`.** npm's `latest` tag points at `8.0.0-rc.28`, a
  release candidate. Discarded: following the tag, which would ship an RC.
- **Prisma behind the existing driver contract.** Discarded: replacing the
  registry (owner's decision, spec 002).
- **The migration owns the schema; `ensure` only checks the connection.**
  Discarded: `CREATE TABLE IF NOT EXISTS` in code as the old `pg` driver did,
  which is a second schema that drifts from `schema.prisma`.
- **Initial migration from `prisma migrate diff --from-empty`.** Discarded:
  `migrate dev`, which needs a live database and a shadow database.
- **Function imports compiled `apps/backend/dist`.** Discarded: importing the TS
  sources, which relies on Vercel's bundler resolving `.js` specifiers to `.ts`
  across workspaces.
- **Root `api/index.ts` with rewrites.** Discarded: keeping `builds`, which
  disables `buildCommand` and `outputDirectory`.
- **Delete `.vercelignore`.** Discarded: trimming it; everything it still lists
  is either ignored by Vercel already or harmless to upload.
- **Production origin from `VERCEL_PROJECT_PRODUCTION_URL`.** Discarded: a
  hand-set `BASE_URL`, which goes stale on a rename; `BASE_URL` still wins when set.
  Preview deploys then mint links on the production origin — accepted.
- **Same-origin API in production, so CORS never applies there.** Discarded:
  setting `VITE_API_BASE_URL` in Vercel, one more variable to keep in sync.
- **Previews share the production database.** Discarded: a Neon branch per
  preview, which the Marketplace offers but is optional; revisit if previews
  start writing junk.

## 7. Test strategy
Runner: vitest in each workspace (`npm test` runs them all since spec 001).
- RF-5, RF-7: `driver-contract.test.ts` — insert, find by code, find by URL,
  dedup lookup, increment on hit and on a missing code, clear. SQLite always;
  Prisma with `describe.skipIf(!TEST_DATABASE_URL)`. Run once by the owner or
  the agent against a Neon development branch. **Guard:** make `incrementHits`
  return `true` for a missing code, watch both drivers go red.
- RF-5 (no `pg`): a test in the database package scans `src/` with comments
  stripped and fails on an import of `pg`. **Guard:** add the import, see red.
- RF-8: backend route test registers a driver whose methods throw, selects it
  with `setDatabaseDriver`, posts a valid URL and expects 500 with only a
  `message`; an invalid URL still gets 400. **Guard:** revert the controller
  to a blanket 400, see red.
- RF-2: `resolveBaseUrl` unit test over the three inputs. **Guard:** swap the
  precedence, see red.
- RF-1 (client part): `resolveApiBaseUrl` unit test. **Guard:** same.
- By hand on Vercel after the push: RF-1 `GET /` 200; RF-2 `POST` 201 with the
  production origin; RF-3 `GET /<code>` 302; RF-6 the `_prisma_migrations` row
  in Neon; RF-4 redeploy, then RF-3 again on the same code.

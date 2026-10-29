# Spec 002 — Vercel deploy with Prisma on Postgres

**Status:** implemented (2026-10-29)
**Size:** L

## Context and goal
The app builds since spec 001 but has never been seen working in production. On
Vercel the filesystem is ephemeral, so the default SQLite store loses every short
URL on a cold start; production needs a managed Postgres. The owner wants that
database accessed through Prisma — the repo used Prisma before (removed in
`3b0c3c9` for the modular drivers), and Prisma brings a schema and migrations the
hand-written `pg` driver lacks. This spec puts the whole app — frontend, API and
redirects — on one Vercel origin, backed by Postgres through Prisma.

Found while reading the current configuration, to be confirmed by the plan:
- `.vercelignore` excludes `apps/backend/src/` and `packages/*/src/`, yet the
  build compiles them and `apps/backend/vercel.ts` imports `./src/app.js`.
- `vercel.json` uses the legacy `builds` key, which makes Vercel ignore
  `buildCommand` and `outputDirectory`, so the frontend may never be built.
- A Vercel project named `url-shortener-qr-backend` exists; the agent's access
  cannot list its deployments or variables.

## Definitions
- **Production origin:** the single HTTPS origin Vercel serves the app from.
- **Store:** the database the backend reads and writes short URLs in.

## Actors
- Visitor: creates and opens short URLs.
- Owner: sets the database and the Vercel variables, and pushes.

## User stories
- US-1: As a visitor, I want to shorten a URL on the production site so that I
  can share the short link and its QR.
- US-2: As a visitor, I want a short link to take me to the original URL, today
  and after any redeploy.
- US-3: As the owner, I want the schema versioned as migrations so that the
  production database changes only through reviewed files.

## Requirements (EARS)
- RF-1: THE SYSTEM serves the frontend at the production origin. — **Check:**
  `GET /` on the production origin returns 200 with the app's HTML.
- RF-2: WHEN a visitor submits a valid URL in production, THE SYSTEM returns a
  short URL on the production origin. — **Check:** `POST /api/v1/urls` returns
  201 and `shortUrl` starts with the production origin.
- RF-3: WHEN a visitor opens a short URL, THE SYSTEM redirects to its original
  URL. — **Check:** `GET /<code>` returns 302 with `Location` equal to the URL
  submitted in RF-2.
- RF-4: THE SYSTEM keeps short URLs across redeploys and cold starts. — **Check:**
  a code created before a redeploy still passes RF-3 after it.
- RF-5: WHILE `DATABASE_DRIVER` is `postgres`, THE SYSTEM reads and writes the
  store through Prisma. — **Check:** the driver contract suite passes against the
  Prisma driver on a Neon development branch, and no `pg` import remains in the
  package. Without a test database URL the suite reports itself skipped, never
  passed.
- RF-6: THE SYSTEM creates and changes the production schema only by applying
  versioned migrations from the repo. — **Check:** a deploy against an empty
  database ends with the `Url` table and an applied-migrations record matching
  the repo's migrations.
- RF-7: WHILE `DATABASE_DRIVER` is unset, THE SYSTEM keeps using SQLite, so local
  development and `npm test` need no database server. — **Check:** `npm test`
  passes with no database variable set.
- RF-8: IF the store is unreachable, THEN THE SYSTEM answers API requests with a
  5xx JSON message. — **Check:** a backend test with a failing store gets 5xx and
  a `message` field from `POST /api/v1/urls`.

## Non-functional requirements
- Secrets: the database URL lives only in Vercel's environment and local `.env`
  files, never in the repo or the frontend bundle (constitution 6).
- Cost: free tiers of Vercel and of the Postgres provider.
- New dependencies: `prisma`, `@prisma/client` and `@prisma/adapter-pg` only,
  with the reason written in the plan. Prisma 7 refuses to build a client without
  a driver adapter, so the adapter is part of "Prisma on Postgres", not an extra
  (amended 2026-10-29, pending the owner's approval with the plan).

## Edge cases
- Database unreachable or URL unset in production: RF-8.
- The same original URL submitted twice returns the same code (existing
  behaviour, kept by RF-5's contract suite).
- Paths that look like codes but are frontend assets (`/assets/...`) are served
  as files, not looked up (covered by RF-1's check loading the app).

## Out of scope
- A custom domain; the default `*.vercel.app` origin is enough.
- Tests mutating the tracked `dev.db` (its own spec).
- CI, pre-commit hook, lint.
- Rate limiting or abuse protection for the public `POST`.
- Translating README and `docs/architecture.md`.

## Done when
`npm ci`, `npm run build` and `npm test` exit 0; RF-1 to RF-4 are seen on the
production origin after the owner's push; RF-6 is seen on an empty database.

## Decisions (owner, 2026-10-29)
- Prisma for Postgres only; the SQLite driver stays for development and tests.
- Postgres on Neon through the Vercel Marketplace, which injects `DATABASE_URL`.
- A new Vercel project linked to the repo; the old `url-shortener-qr-backend`
  is left alone, and deleting it is the owner's call.

## Open questions
None.

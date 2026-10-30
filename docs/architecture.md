# Architecture

An npm workspaces monorepo: an Express API, a React client and a database package,
deployed as one Vercel project. The layering rule is in `docs/constitution.md`.

## Backend (`apps/backend`)

Each layer only calls the one below it:

- **Routes** (`apps/backend/src/routes`): map HTTP paths to controllers.
- **Controllers** (`apps/backend/src/controllers`): read the request, pick the status
  code, and enforce the creation limit.
- **Services** (`apps/backend/src/services`): the rules: which code a link gets, when
  it expires, whether a client is over the limit.
- **Repositories** (`apps/backend/src/repositories`): the only callers of the database
  package.

Beside them, `apps/backend/src/utils` validates URLs and aliases and generates QR
codes, and `apps/backend/src/config` reads the environment.

## Main flows

1. `POST /api/v1/urls`: the limit counts the client under a hash of its IP; the URL,
   alias and lifetime are validated; the link is stored or the existing one reused; the
   answer carries the short URL and a QR code as a data URL.
2. `GET /:code`: an expired link answers 410; otherwise the hit is counted and the
   answer is a 302 to the original URL.
3. `GET /api/v1/urls/:code`: the link with its hits, creation date and expiry. It does
   not count as a hit.

The README documents every route and status.

## Database package (`packages/database`)

One `DatabaseDriver` contract, chosen by `DATABASE_DRIVER`:

- `sqlite` (default): sql.js, for local development and tests. It creates its own
  tables, and adds columns that older local files lack.
- `postgres`: Prisma over Postgres, used in production on Neon. The schema is
  `packages/database/prisma/schema.prisma` and changes only through
  `packages/database/prisma/migrations`, applied by the deploy.

`packages/database/tests/driver-contract.test.ts` runs the same cases against both.

## Frontend (`apps/frontend`)

A React + Vite single page: the form, the result with its QR code, and the statistics
lookup. All visible text goes through i18next, in English and Spanish, and colours come
from theme variables, in light and dark. In a production build it calls the API on its
own origin.

## Deployment

`vercel.json` serves the built client as static files and rewrites `/api/*`, `/health`
and `/<code>` to the function in `api/index.ts`, which runs the compiled Express app. A
serverless instance keeps nothing between requests, so the rate limit's counts live in
the database too.

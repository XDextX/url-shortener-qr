# Tasks 002 — Vercel deploy with Prisma on Postgres

- [ ] **T-1 — Add the Prisma schema, config and initial migration**
  Covers: RF-6
  Files: `packages/database/prisma/schema.prisma`, `packages/database/prisma.config.ts`,
  `packages/database/prisma/migrations/*`, `packages/database/package.json`,
  `package-lock.json`, `.gitignore`
  Done when: `npm run build` exits 0 with the client generated, and the
  migration's SQL creates `Url` with the columns of `UrlRecord`.

- [ ] **T-2 — Driver contract suite**
  Covers: RF-5, RF-7
  Files: `packages/database/tests/driver-contract.test.ts`, `packages/database/package.json`
  Done when: root `npm test` runs it, SQLite passes, Prisma shows as skipped, and
  the `incrementHits` injection turns SQLite red.

  Before T-3, so the Prisma driver is written against a suite that already bites.

- [ ] **T-3 — Prisma driver replaces the `pg` driver**
  Covers: RF-5
  Files: `packages/database/src/prisma-driver.ts`, `packages/database/src/postgres-driver.ts`
  (delete), `packages/database/src/index.ts`, `packages/database/package.json`,
  `packages/database/tests/no-pg-import.test.ts`, `packages/database/.env.example`
  Done when: `npm test` and `npm run build` exit 0; the contract suite passes on
  Prisma with `TEST_DATABASE_URL` set to a Neon development branch; the `pg`
  import guard was seen red.

- [ ] **T-4 — Store errors answer 500, invalid input 400**
  Covers: RF-8
  Files: `apps/backend/src/controllers/url.controller.ts`,
  `apps/backend/src/utils/url-validator.ts`, `apps/backend/tests/url.routes.test.ts`
  Done when: the failing-store test gets 500 with only `message`, and the
  blanket-400 injection turns it red.

- [ ] **T-5 — Public origin and API origin**
  Covers: RF-1, RF-2
  Files: `apps/backend/src/config/env.ts`, `apps/backend/tests/env.test.ts`,
  `apps/frontend/src/api/client.ts`, `apps/frontend/src/api/client.test.ts`
  Done when: both resolver tests pass and the precedence injection turns each red.

- [ ] **T-6 — Vercel configuration**
  Covers: RF-1, RF-3
  Files: `vercel.json`, `api/index.ts`, `apps/backend/vercel.ts` (delete),
  `.vercelignore` (delete), `package.json`, `README.md`
  Done when: `npm ci && npm run build` exits 0; importing `api/index.ts` with
  `tsx` under the SQLite driver yields the Express app; the README deploy section
  lists the owner's steps.

- [ ] **T-7 — Deploy and verify in production** (owner + agent)
  Covers: RF-1, RF-2, RF-3, RF-4, RF-6
  Owner: create the Vercel project from the repo, add Neon from the Marketplace,
  merge and push. Agent: run the block-7 manual checks against the production
  origin and record the results here.
  Done when: every manual check in plan block 7 is recorded as passed.

  Last, because it needs the owner's push and every other task merged.

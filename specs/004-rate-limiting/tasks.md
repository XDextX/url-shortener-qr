# Tasks 004 — Rate limiting per IP

- [ ] **T-1 — Count per key and window in both drivers**
  Covers: RF-4
  Files: `packages/database/src/{contracts,index,sqlite-driver,prisma-driver}.ts`,
  `packages/database/prisma/schema.prisma`, a new migration,
  `packages/database/tests/driver-contract.test.ts`
  Done when: the contract cases pass on SQLite (and on Prisma with
  `TEST_DATABASE_URL`), and the constant-count injection turns them red.

- [ ] **T-2 — Limit link creation in the backend**
  Covers: RF-1, RF-2, RF-3, RF-6
  Files: `apps/backend/src/{app.ts,config/env.ts,routes/url.routes.ts}`,
  `apps/backend/src/services/rate-limit.service.ts`,
  `apps/backend/src/repositories/rate-limit.repository.ts`, backend tests
  Done when: the route and unit tests pass, and the off-by-one injection turns
  them red.

- [ ] **T-3 — Tell the visitor to wait**
  Covers: RF-5
  Files: `apps/frontend/src/api/client.ts`, `apps/frontend/src/components/UrlForm.tsx`,
  `apps/frontend/src/i18n/resources/{en,es}/common.json`, a form test
  Done when: the form test passes and the injection turns it red.

- [ ] **T-4 — Document, deploy and check live**
  Covers: RF-1, RF-2, RF-5
  Files: `README.md`, `specs/004-rate-limiting/*`
  Done when: the README guard passes; after merge and push the migration
  applies, the eleventh creation in a minute gets 429, and the form shows the
  message in both locales and themes.

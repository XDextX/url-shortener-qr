# Tasks 007 — Link expiry

- [x] **T-1 — Store an expiry in both drivers**
  Covers: RF-1, RF-5
  Files: `packages/database/src/*`, `packages/database/prisma/schema.prisma`,
  a new migration, `packages/database/tests/driver-contract.test.ts`
  Done when: the contract cases pass on SQLite and on Neon, and the mapping
  injection turns them red.

- [ ] **T-2 — Expire links in the API**
  Covers: RF-1, RF-2, RF-3, RF-4, RF-5
  Files: `apps/backend/src/{services/url.service,controllers/url.controller,repositories/url.repository}.ts`,
  `apps/backend/tests/expiry.test.ts`
  Done when: the expiry tests pass and the skipped-check injection turns RF-4
  red.

- [ ] **T-3 — Choose and show the expiry in the page**
  Covers: RF-6, RF-7
  Files: `apps/frontend/src/{api/client.ts,components/UrlForm.tsx,components/LinkStats.tsx}`,
  the locale files, frontend tests
  Done when: the frontend tests pass and the always-send injection turns RF-6
  red.

- [ ] **T-4 — Document, deploy and check live**
  Covers: RF-1, RF-7
  Files: `README.md`, `specs/007-link-expiry/*`
  Done when: the README guard passes; the migration applies on deploy; on the
  live demo a link with a lifetime shows its expiry in both locales and themes.

# Tasks 008 — Pending cleanup

- [x] **T-1 — Keep tests off any tracked database**
  Covers: RF-1
  Files: `apps/backend/vitest.config.ts`, `.gitignore`, `apps/backend/.env.example`,
  `packages/database/prisma/dev.db`
  Done when: `git ls-files` lists no `.db`, and `npm test` leaves `git status` clean.

- [x] **T-2 — Generic, English API errors**
  Covers: RF-2, RF-3
  Files: `apps/backend/src/controllers/url.controller.ts`,
  `apps/backend/src/utils/url-validator.ts`, `apps/backend/tests/url.routes.test.ts`
  Done when: the tests, seen red first, pass.

- [x] **T-3 — Translated form errors, clean lint**
  Covers: RF-4, RF-7
  Files: `apps/frontend/src/components/UrlForm.tsx`, `apps/frontend/src/api/client.ts`,
  `apps/frontend/src/components/UrlForm.test.tsx`
  Done when: the test passes, the raw-message injection turns it red, and
  `npm run lint` exits 0.

- [x] **T-4 — Licence and architecture document**
  Covers: RF-5, RF-6
  Files: `LICENSE`, `docs/architecture.md`, `README.md`, `apps/backend/tests/readme.test.ts`
  Done when: the guard passes and both injections turn it red.

- [ ] **T-5 — CI**
  Covers: RF-8
  Files: `.github/workflows/ci.yml`, `.gitignore`, `README.md`
  Done when: a run on GitHub is green, and a run with an injected failing test is red.

# Tasks 003 — README rewrite

- [x] **T-1 — Cover the error statuses the README will document**
  Covers: RF-4
  Files: `apps/backend/tests/url.routes.test.ts`
  Done when: backend tests assert `GET /:code` 404 for an unknown code, and
  500 from both `GET /api/v1/urls/:code` and `GET /:code` with the failing
  store; `npm test` exits 0.

  First, because RF-4's check traces every documented status to a test or the
  production run, and these three had neither.

- [x] **T-2 — Take the screenshot**
  Covers: RF-2
  Files: `docs/screenshot.jpg`
  Done when: the file shows the demo in its dark theme with a shortened URL and
  its QR, no local path or personal data in it, and it is under 300 KB.

- [x] **T-3 — Write the README guard, then rewrite the README**
  Covers: RF-1, RF-2, RF-3, RF-4, RF-5, RF-6, RF-7, RF-8
  Files: `apps/backend/tests/readme.test.ts`, `README.md`
  Done when: the guard, written first, fails against today's README; after the
  rewrite `npm test` and `npm run build` exit 0; the four injections in plan
  block 7 each turn the guard red and are reverted by explicit path; the
  README is viewed rendered with the screenshot; `git status` shows only the
  intended files.

  One task and one commit: the guard alone would leave `npm test` red on the
  branch until the rewrite lands.

- [ ] **T-4 — Validate by reading**
  Covers: RF-1, RF-2, RF-4, RF-5, RF-8
  Files: `specs/003-readme-rewrite/tasks.md`
  Done when: recorded here: no Spanish sentence left (RF-1); the demo link
  answers 200 (RF-2); each documented status traced to a backend test or the
  spec 002 production run (RF-4); no planned feature described outside the
  roadmap (RF-5); none of the roadmap items exists in the code (RF-8).

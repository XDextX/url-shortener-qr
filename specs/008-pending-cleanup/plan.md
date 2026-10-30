# Plan 008 — Pending cleanup

## 1. Scope and coverage
- RF-1: a backend vitest config forces SQLite in memory; the tracked file leaves git.
- RF-2, RF-3: the controller and the URL validator.
- RF-4, RF-7: the form's catch branch and the typed `t` parameter.
- RF-5, RF-6: `LICENSE`, `docs/architecture.md`, two new cases in the README guard.
- RF-8: a GitHub Actions workflow.

## 2. Files
- `apps/backend/vitest.config.ts` (create) — decides which store the backend tests use.
- `packages/database/prisma/dev.db` (untrack), `.gitignore` (modify) — ignores `*.db`;
  stops ignoring `.github/`.
- `apps/backend/.env.example` (modify) — points at the ignored local database.
- `apps/backend/src/controllers/url.controller.ts`, `apps/backend/src/utils/url-validator.ts`
  (modify) — what each failure says to an API client.
- `apps/frontend/src/components/UrlForm.tsx`, `apps/frontend/src/api/client.ts` (modify) —
  what a failed creation says to a visitor.
- `apps/backend/tests/url.routes.test.ts`, `apps/backend/tests/readme.test.ts`,
  `apps/frontend/src/components/UrlForm.test.tsx` (modify) — the checks.
- `LICENSE` (create), `docs/architecture.md` (rewrite), `README.md` (modify).
- `.github/workflows/ci.yml` (create) — the gate on every push and pull request.

## 3. Pure logic
None.

## 4. Algorithm
CI, in this order because the backend tests import the database package's compiled
output: `npm ci`, `npm run lint`, `npm run build`, `npm test`, then fail if
`git status --porcelain` prints anything, which keeps RF-1 true.

## 5. Interface
No new element. The form's existing error line shows `form.error.server`.

## 6. Decisions
- **Force `:memory:` in a vitest config.** Discarded: setting it in each test file, which
  the next test file forgets.
- **Every other failure shows the translated text.** Discarded: showing the API's message
  on a 400, which would be English for Spanish visitors; the form already validates the
  same rules before calling the API.
- **Copyright line `XDextX`** (owner). Discarded: the full name, which the repo otherwise
  keeps out.
- **Build before tests in CI.** Discarded: the order in RF-8's wording, which fails on a
  clean checkout because `dist` does not exist yet.

## 7. Test strategy
Runner: vitest, via `npm test`. New tests are written first and seen red.
- Backend: exact English messages for 400, 404 and 500; no driver text in the 500 bodies.
- Frontend: a 500 shows the translated text, not the API's. Injection: restore the raw
  message, see red.
- README guard: `LICENSE` names MIT; the paths in `docs/architecture.md` exist. Injection:
  rename the licence, name a missing path, see each red.
- RF-1: `npm test` from clean, then `git status` and the file's modification time.
- RF-8: read on GitHub after the owner's or an approved push, including one red run.

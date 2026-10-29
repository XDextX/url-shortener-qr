# Spec 001 — Green MVP

**Status:** implemented (2026-10-28)
**Size:** S

## Context and goal
The MVP cannot be deployed: `npm run build` stops at the database package because
the PostgreSQL driver imports a client library its workspace never declares. The
root `npm test` stays green because it runs only the backend suite, which hides a
failing frontend test as well. This spec makes the build and the whole test suite
green, so the gate in constitution 1 means something.

## User stories
- US-1: As the owner, I want `npm run build` to succeed on a clean install so that
  the app deploys.
- US-2: As the owner, I want `npm test` to cover every workspace so that a red test
  anywhere blocks a change.

## Requirements (EARS)
- RF-1: THE SYSTEM builds every workspace with `npm run build` after a clean
  install. — **Check:** `npm ci && npm run build` exits 0.
- RF-2: THE SYSTEM runs the backend and the frontend suites from the root
  `npm test`. — **Check:** the output lists both workspaces' test files, and a
  failing frontend assertion injected once turns the command red.
- RF-3: WHEN the visitor presses "Copy URL" on a result, THE SYSTEM writes the
  short URL to the clipboard and shows the copied label. — **Check:** the
  `ResultCard` test asserts the clipboard call and the label, and passes.

## Non-functional requirements
- No new runtime dependency beyond the PostgreSQL client the existing driver
  already uses, plus its type declarations.

## Edge cases
- Running the suite must not leave a tracked file modified (observed:
  `packages/database/prisma/dev.db`). Recorded here; fixed in a later spec.

## Out of scope
- Tests mutating the tracked `dev.db`.
- CI workflow and pre-commit hook.
- Lint configuration and outdated browserslist data.
- README and `docs/architecture.md` translation to English.

## Done when
`npm ci`, `npm run build` and `npm test` all exit 0; the RF-2 injection was seen red.

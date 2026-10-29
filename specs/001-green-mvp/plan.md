# Plan 001 — Green MVP

## 1. Scope and coverage
- RF-1: declare `pg` and `@types/pg` in `packages/database`.
- RF-2: root `test` script runs both workspace suites.
- RF-3: fix the `ResultCard` test's clipboard stub.

## 2. Files
- `packages/database/package.json` (modify) — declares the PostgreSQL client the
  driver imports, so the package compiles on a clean install.
- `package-lock.json` (modify) — records the resolved versions.
- `package.json` (modify) — decides which suites the gate runs.
- `apps/frontend/src/components/ResultCard.test.tsx` (modify) — stubs the
  clipboard after `userEvent.setup()`, which otherwise replaces the stub.

## 3. Pure logic
None: configuration and a test fix.

## 4. Algorithm
Trivial; none.

## 5. Interface
No visible change. The copy button behaves as before; only its test is corrected.

## 6. Decisions
- Declare `pg` rather than drop the PostgreSQL driver. Discarded: removing it,
  because the Vercel deploy guide (commit 4fcff02) relies on Postgres.
- Spy on `navigator.clipboard.writeText` after `userEvent.setup()`. Discarded:
  `userEvent.setup({ writeToClipboard: false })`, because it keeps the brittle
  `defineProperty` plumbing on `navigator` that the spy makes unnecessary.
- Root `test` runs workspaces with `--workspaces --if-present`. Discarded: listing
  each workspace, which a new workspace would silently skip.

## 7. Test strategy
Runner: vitest in each workspace. RF-1 is settled by the build command, RF-3 by
the existing `ResultCard` test. RF-2's guard is proven by injecting a failing
assertion into a frontend test, seeing root `npm test` go red, then reverting.

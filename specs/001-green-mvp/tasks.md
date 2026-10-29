# Tasks 001 — Green MVP

- [ ] **T-1 — Declare the PostgreSQL client in the database package**
  Covers: RF-1
  Files: `packages/database/package.json`, `package-lock.json`
  Done when: `npm run build` exits 0.

- [ ] **T-2 — Stub the clipboard after `userEvent.setup()`**
  Covers: RF-3
  Files: `apps/frontend/src/components/ResultCard.test.tsx`
  Done when: the frontend suite passes, 6/6.

- [ ] **T-3 — Run every workspace suite from the root `npm test`**
  Covers: RF-2
  Files: `package.json`
  Done when: root `npm test` lists backend and frontend files, and an injected
  frontend failure turns it red.

  Last, because before T-2 the frontend suite is red and the gate would fail.

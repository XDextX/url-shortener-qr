# Tasks 006 — Hit statistics view

- [x] **T-1 — Carry hits and the creation date in the API**
  Covers: RF-1
  Files: `apps/backend/src/services/url.service.ts`, `apps/backend/tests/stats.test.ts`
  Done when: the stats test passes and dropping `hits` turns it red.

- [x] **T-2 — The statistics lookup**
  Covers: RF-2, RF-3, RF-4, RF-5
  Files: `apps/frontend/src/api/client.ts`, `apps/frontend/src/components/LinkStats.tsx`,
  `apps/frontend/src/components/ResultCard.tsx`, `apps/frontend/src/App.tsx`,
  `apps/frontend/src/i18n/resources/{en,es}/common.json`, frontend tests
  Done when: the frontend tests pass and the untrimmed-input injection turns
  them red.

- [x] **T-3 — Document, deploy and check live**
  Covers: RF-2, RF-4
  Files: `README.md`, `specs/006-hit-statistics/*`
  Done when: the README guard passes; on the live demo a link opened twice
  shows 2 visits, in both locales and themes.

  Results on the live demo, 2026-10-29: View statistics on the result card
  filled the lookup and showed the original URL, "0 visits", the creation date
  and the expiry. The card's two buttons were misaligned, fixed in `fix(frontend):
  align the result card's actions`.

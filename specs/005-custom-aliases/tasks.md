# Tasks 005 — Custom aliases

- [x] **T-1 — Accept an alias in the API**
  Covers: RF-1, RF-2, RF-3, RF-4
  Files: `apps/backend/src/utils/alias-validator.ts`,
  `apps/backend/src/services/url.service.ts`,
  `apps/backend/src/controllers/url.controller.ts`, `apps/backend/tests/alias.test.ts`
  Done when: the alias tests pass and the skipped-check injection turns RF-3 red.

- [ ] **T-2 — Offer the alias in the form**
  Covers: RF-5, RF-6
  Files: `apps/frontend/src/api/client.ts`, `apps/frontend/src/components/UrlForm.tsx`,
  `apps/frontend/src/i18n/resources/{en,es}/common.json`, the form test
  Done when: the form tests pass and the always-send injection turns RF-5 red.

- [ ] **T-3 — Document, deploy and check live**
  Covers: RF-1, RF-6
  Files: `README.md`, `specs/005-custom-aliases/*`
  Done when: the README guard passes; on the live demo an alias link redirects,
  and the field and its messages show in both locales and themes.

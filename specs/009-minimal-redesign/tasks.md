# Tasks 009 — Minimal redesign

Each visual task stops for the owner's approval in light and dark before its commit.

- [x] **T-1 — Palette, font and design guard**
  Covers: RF-1, RF-2
  Files: `apps/frontend/src/index.css`, `apps/frontend/tailwind.config.js`,
  `apps/frontend/index.html`, `apps/frontend/public/fonts/*`,
  `apps/frontend/src/theme/design.test.ts`
  Done when: the guard passes, its value and contrast injections turn it red, and the font
  loads on the rendered page.

- [x] **T-2 — Button**
  Covers: RF-3, RF-4, RF-5
  Files: `apps/frontend/src/components/Button.tsx`, the guard
  Done when: approved in both themes.

- [x] **T-3 — Form**
  Covers: RF-3, RF-4, RF-5, RF-6
  Files: `apps/frontend/src/components/UrlForm.tsx`, `apps/frontend/src/index.css`, the guard
  Done when: approved in both themes, with an error showing.

- [x] **T-4 — Result card**
  Covers: RF-3, RF-6
  Files: `apps/frontend/src/components/ResultCard.tsx`, the guard
  Done when: approved in both themes; the QR code stays black on white.

- [ ] **T-5 — Statistics card**
  Covers: RF-3, RF-4, RF-6
  Files: `apps/frontend/src/components/LinkStats.tsx`, the guard
  Done when: approved in both themes, with found and not-found states.

- [ ] **T-6 — Header, switchers and layout**
  Covers: RF-3, RF-4, RF-5, RF-7
  Files: `apps/frontend/src/App.tsx`, `apps/frontend/src/components/ThemeSwitcher.tsx`,
  `apps/frontend/src/components/LanguageSwitcher.tsx`, the guard
  Done when: approved in both themes, with no horizontal scroll at 375, 768 and 1280 px.

- [ ] **T-7 — Ship**
  Covers: every RF
  Files: `docs/screenshot.jpg`, `README.md`, `specs/009-minimal-redesign/*`
  Done when: the gate passes from a clean clone, CI is green, and the live demo shows the
  new look.

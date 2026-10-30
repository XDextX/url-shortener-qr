# Plan 009 — Minimal redesign

## 1. Scope and coverage
- RF-1, RF-2: the tokens in `index.css` and a design guard test.
- RF-3, RF-6: the guard scans the components; each component task removes its own
  `shadow` and accent-coloured errors, and the guard's list grows task by task.
- RF-4, RF-5: one `.field` class and the button's classes.
- RF-7: the layout in `App.tsx`.

## 2. Files
- `apps/frontend/src/index.css` (modify) — holds the palette, the font face, and the one
  `.field` class the five form controls share, which repeat the same classes today.
- `apps/frontend/tailwind.config.js` (modify) — exposes the new error, control-border and
  focus tokens.
- `apps/frontend/index.html` (modify) — drops the hardcoded `bg-slate-100`.
- `apps/frontend/public/fonts/IBMPlexSans-latin.woff2` and its licence (create) — 45 KB,
  same file as the Portfolio; covers English and Spanish.
- `apps/frontend/src/theme/design.test.ts` (create) — decides whether the palette, the
  contrast and the no-shadow rule still hold.
- `Button`, `UrlForm`, `ResultCard`, `LinkStats`, `ThemeSwitcher`, `LanguageSwitcher`,
  `App` (modify) — classes only, no logic.
- `docs/screenshot.jpg` (replace), last.

## 3. Pure logic
In the test: `contrast(a: string, b: string): number`, the WCAG ratio of two hex colours,
checked against 21 for black on white, 1 for white on white, and 4.54 for `#767676` on
white, so a wrong formula cannot pass.

## 4. Algorithm
The guard parses `:root` and `[data-theme="dark"]` from `index.css`, turns each `r g b`
triplet into hex, compares it with the spec's table, then checks each text-on-surface pair.

## 5. Interface
- Page: the page colour, one column of `max-w-xl`, header on the same ground, with the
  title and the two switchers on one line from `sm` up.
- Cards: border only, 8px radius, no shadow.
- Fields: control border, 4px radius, border turns accent on hover.
- Button: accent fill and its ink; hover darkens nothing and lifts nothing, it shows a
  ring in the accent.
- Link: accent text, underlined on hover.
- States keep their current wording: empty, loading, result, not found, error.

## 6. Decisions
- **Keep the Tailwind tokens and change their values.** Discarded: porting the Portfolio's
  stylesheets, which brings rules this app has no use for.
- **One `.field` class.** Discarded: editing the same long class list in five places.
- **Page colour for the header too.** Discarded: the card colour as a band, which RF-7 rules out.
- **Latin subset only.** Discarded: the extended and italic files, which no text here uses.

## 7. Test strategy
Runner: vitest in the frontend, via `npm test`.
- Injections, each seen red: a changed token value, a low-contrast text colour, a `shadow`
  class in a component, an accent-coloured error.
- Rendered, one component at a time, at the owner's approval: light and dark at 1280 px on
  the local dev server. The last task also checks 375 and 768 px, hover and keyboard focus.
- The existing tests must pass untouched: they prove behaviour did not change.

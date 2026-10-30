# Plan 006 — Hit statistics view

## 1. Scope and coverage
- RF-1: the service's payload gains `hits` and `createdAt`; backend test.
- RF-2, RF-3, RF-4: a `LinkStats` component with its own lookup form, a
  `fetchLinkStats` client call; frontend tests.
- RF-5: the result card's "View statistics" button hands the code to
  `LinkStats` through `App`; frontend test on `App`.

## 2. Files
- `apps/backend/src/services/url.service.ts` (modify) — the payload carries
  `hits` and `createdAt` for creation and lookup alike.
- `apps/frontend/src/api/client.ts` (modify) — the response type gains the two
  fields; `fetchLinkStats(code)` calls `GET /api/v1/urls/:code`.
- `apps/frontend/src/components/LinkStats.tsx` (create) — decides what the
  lookup shows: nothing yet, loading, the statistics, not found, or an error.
- `apps/frontend/src/components/ResultCard.tsx` (modify) — the button.
- `apps/frontend/src/App.tsx` (modify) — passes the requested code down.
- `apps/frontend/src/i18n/resources/{en,es}/common.json` (modify) — the keys.
- `README.md` (modify) — the two fields, an overview line, the roadmap item.

## 3. Pure logic
- `codeFromInput(input: string): string` — trims; when the input parses as a
  URL, returns its last non-empty path segment; otherwise the trimmed input.

## 4. Algorithm
`LinkStats({ requestedCode })`: when `requestedCode` changes, fill the input
and look it up. On submit: `code = codeFromInput(input)`; empty → nothing;
else `fetchLinkStats(code)`; `ApiError` 404 → not found; other errors →
generic; success → show original URL, `t("stats.hits", { count: hits })`, and
the date with `Intl.DateTimeFormat(i18n.language, { dateStyle: "medium" })`.

## 5. Interface
A third card under the result: heading "Link statistics", a text field "Short
link or code", a "Show statistics" button, then either nothing, the three
values as a definition list, or one line of error text. Same surface, border
and text tokens as the other cards, so both themes follow.

## 6. Decisions
- **A lookup on the same page.** Discarded: a `/stats/:code` route, which the
  static hosting serves as a 404 because it has no SPA fallback, and adding
  one changes how every unknown path behaves.
- **i18next plurals (`_one`, `_other`).** Discarded: a hand-written
  `count === 1` branch, which is wrong for languages with other rules.
- **Public statistics.** Discarded: owner-only views, which need accounts.

## 7. Test strategy
Runner: vitest, via `npm test`.
- Backend: create, redirect twice, lookup gives `hits: 2` and a valid date.
  Injection: drop `hits` from the payload, see red.
- Frontend: `codeFromInput` cases; `LinkStats` with the client mocked shows
  the three values for a full short URL, "1 visit"/"2 visits", the 404 text;
  `App` with the client mocked: create, click "View statistics", stats show.
  Injection: return the input untrimmed from `codeFromInput`, see red.
- Rendered: the live demo in both locales and themes.

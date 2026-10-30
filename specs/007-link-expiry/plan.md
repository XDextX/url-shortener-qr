# Plan 007 — Link expiry

## 1. Scope and coverage
- RF-1, RF-5 (storage side): `expiresAt` on `UrlRecord`, `insert` and a new
  `renewExpiry` in both drivers, a column and its migration; contract suite.
- RF-1..RF-5 (behaviour): the service and controller; backend tests with the
  clock faked through `vi.useFakeTimers({ toFake: ["Date"] })`.
- RF-6, RF-7: the form's select and the statistics lines; frontend tests.

## 2. Files
- `packages/database/src/contracts.ts` (modify) — `expiresAt: Date | null` on
  `UrlRecord`, optional on `InsertUrlInput`; `renewExpiry(code, expiresAt)`.
- `packages/database/src/sqlite-driver.ts` (modify) — the column, added to an
  older file by `ALTER TABLE` when missing; `renewExpiry`.
- `packages/database/src/prisma-driver.ts`, `index.ts` (modify) — the same.
- `packages/database/prisma/schema.prisma`, a new migration (create) — the
  nullable `expiresAt` column.
- `apps/backend/src/services/url.service.ts` (modify) — decides a new link's
  expiry, whether a link redirects, and when an expired link is renewed.
- `apps/backend/src/controllers/url.controller.ts` (modify) — reads
  `expiresIn`, answers 410 for an expired redirect.
- `apps/backend/src/repositories/url.repository.ts` (modify) — passes the
  expiry through, and exposes `renewExpiry`.
- `apps/frontend/src/api/client.ts`, `components/UrlForm.tsx`,
  `components/LinkStats.tsx`, the locale files (modify).
- `README.md` (modify) — `expiresIn`, `expiresAt`, the 410, the roadmap.

## 3. Pure logic
- `LIFETIMES = { "1h": 3_600_000, "1d": 86_400_000, "7d": 604_800_000,
  "30d": 2_592_000_000 }`.
- `expiresAtFrom(now: number, expiresIn: string | undefined): Date | null` —
  null without a lifetime; throws `InvalidUrlError` for an unknown one.
- `isExpired(record: { expiresAt: Date | null }, now: number): boolean`.
`now` is a parameter; the controller passes `Date.now()`.

## 4. Algorithm
`createShortUrl(originalUrl, alias, expiresIn, now)`:
1. `expiresAt = expiresAtFrom(now, expiresIn)` (400 before any store call).
2. Alias conflicts as in spec 005.
3. `existing` and expired → `renewExpiry(existing.code, expiresAt)` and return
   it (RF-5); `existing` and live → return unchanged.
4. Otherwise insert with `expiresAt`.
`resolveOriginalUrl(code, now)`: not found → null; expired → `"expired"`
without counting a hit (RF-4); else count the hit and return the URL.

## 5. Interface
Under the alias field, a select "Expires" with Never (default), 1 hour, 1 day,
7 days, 30 days. In the statistics list, a row "Expires" with the date, or
"Expired on <date>", or "Never". Same tokens as the existing fields.

## 6. Decisions
- **A fixed set of lifetimes.** Discarded: any number of seconds, which needs
  bounds and units for no real gain.
- **410 Gone for an expired redirect.** Discarded: 404, which tells the visitor
  the link never existed.
- **Renew only an expired link.** Discarded: overwriting a live link's expiry,
  which would let anyone cut another person's link short.
- **Keep expired rows.** Discarded: deleting them, which frees aliases but
  loses their statistics and needs a scheduled job.
- **`ALTER TABLE` in the SQLite driver.** Discarded: deleting old `.db` files,
  which loses local data.

## 7. Test strategy
Runner: vitest, via `npm test`.
- Contract: insert with and without `expiresAt` round-trips it; `renewExpiry`
  changes it. Injection: drop `expiresAt` from SQLite's row mapping, see red.
- Backend: RF-1..RF-5 with the faked clock. Injection: skip the expiry check in
  the redirect, see RF-4 red.
- Frontend: RF-6 (select sends or omits), RF-7 (three texts). Injection: always
  send the select's value, see RF-6 red.
- Postgres: the contract suite against the Neon development branch, with the
  new column applied there first.
- Rendered: the live demo in both locales and themes.

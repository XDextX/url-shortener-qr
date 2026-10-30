# Plan 004 — Rate limiting per IP

## 1. Scope and coverage
- RF-1, RF-2, RF-3: a middleware on `POST /api/v1/urls`, backed by a service
  and a repository; covered by backend route tests.
- RF-4: a new `consumeRateLimit` method on the `DatabaseDriver` contract, in
  both drivers, with a `RateLimit` table and its migration; covered by the
  contract suite.
- RF-5: the client keeps the HTTP status on its error, and the form maps 429
  to a translated key; covered by a frontend test.
- RF-6: the service hashes the IP before it reaches the store; covered by a
  backend unit test.

## 2. Files
- `packages/database/src/contracts.ts` (modify) — adds `consumeRateLimit`.
- `packages/database/src/sqlite-driver.ts`, `prisma-driver.ts` (modify) — count
  per key and window, deleting the key's older windows; `clear` empties the
  counts too, so tests start clean.
- `packages/database/src/index.ts` (modify) — exports `consumeRateLimit`.
- `packages/database/prisma/schema.prisma` and a new migration (create) — the
  `RateLimit` table.
- `apps/backend/src/config/env.ts` (modify) — reads `RATE_LIMIT_MAX`.
- `apps/backend/src/repositories/rate-limit.repository.ts` (create) — the only
  backend caller of `consumeRateLimit`.
- `apps/backend/src/services/rate-limit.service.ts` (create) — decides whether
  a client may create a link now, and for how long it must wait otherwise.
- `apps/backend/src/routes/url.routes.ts` (modify) — puts the limit in front of
  creation; answers 429 or 500.
- `apps/backend/src/app.ts` (modify) — `trust proxy` set to one hop, so
  `req.ip` is the client Vercel reports rather than its proxy.
- `apps/frontend/src/api/client.ts` (modify) — the thrown error carries the
  response status.
- `apps/frontend/src/components/UrlForm.tsx` (modify) — shows the translated
  rate-limit text on 429.
- `apps/frontend/src/i18n/resources/{en,es}/common.json` (modify) — the key.
- `README.md` (modify) — the 429 status, the variable, the roadmap item gone.

## 3. Pure logic
- `windowStart(now: number, windowMs: number): Date` — the start of the fixed
  window holding `now`.
- `retryAfterSeconds(now: number, windowMs: number): number` — whole seconds
  to the next window, at least 1.
- `rateLimitKey(ip: string): string` — SHA-256 hex of the IP.
`now` is always a parameter; the middleware passes `Date.now()`.

## 4. Algorithm
Middleware, before the create handler:
1. `key = rateLimitKey(req.ip ?? "unknown")`.
2. `count = await consumeRateLimit(key, windowStart(now, 60_000))`; on a throw,
   answer 500 with the generic creation message and stop.
3. If `count > max`, set `Retry-After: retryAfterSeconds(now, 60_000)` and
   answer 429 `{ message }`; else `next()`.

Driver `consumeRateLimit(key, windowStart)`:
- delete the key's rows with an older `windowStart`;
- insert `(key, windowStart, 1)`, or add 1 on conflict; return the count.
SQLite: `INSERT … ON CONFLICT ("key","windowStart") DO UPDATE SET "count" =
"count" + 1 RETURNING "count"`. Prisma: `upsert` on the compound id with
`count: { increment: 1 }`, after a `deleteMany`.

## 5. Interface
The form's existing error line shows "Too many links in a short time. Wait a
minute and try again." / "Demasiados enlaces en poco tiempo. Espera un minuto
y vuelve a intentarlo." No new element; the line already renders in both
themes.

## 6. Decisions
- **Count in the database.** Discarded: an in-memory map, which every
  serverless instance would hold separately and lose on a cold start.
- **Fixed one-minute windows.** Discarded: a sliding window, more queries per
  request for a precision a demo does not need.
- **Fail closed on a store error.** Discarded: skipping the limit, which
  would let the limit vanish exactly when the store is struggling; creation
  needs the store anyway.
- **Hash the IP.** Discarded: storing it raw, which keeps personal data for no
  purpose the limit needs.
- **`trust proxy` one hop.** Discarded: `true`, which trusts any number of
  forwarded addresses and lets a client pick its own.
- **Map 429 in the client, not the API message.** Discarded: showing the API's
  text, which is one language.

## 7. Test strategy
Runner: vitest in each workspace, via `npm test`.
- Contract suite: the count rises 1, 2 in one window and restarts at 1 in the
  next; other keys are separate; `clear` empties counts. Injection: return a
  constant 1, see red.
- Backend: `RATE_LIMIT_MAX` lowered to 3 in the test; 3 × 201 then 429 with a
  `Retry-After` in 1..60; another `X-Forwarded-For` gets 201; the store failing
  gives 500. Unit tests for the three pure functions. Injection: compare with
  `>=` off by one, or skip the middleware, see red.
- Frontend: the form with the client mocked to reject with status 429 shows
  the English text. Injection: drop the 429 branch, see red.
- Rendered: the live demo after deploy, in both locales and themes.

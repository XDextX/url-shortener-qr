# Plan 005 — Custom aliases

## 1. Scope and coverage
- RF-1..RF-4: the create handler and service accept an optional `alias`;
  covered by backend route tests.
- RF-5, RF-6: the form gains an optional field, the client sends it, and the
  form maps 409 and the client-side rule to translated keys; covered by
  frontend tests.

## 2. Files
- `apps/backend/src/utils/alias-validator.ts` (create) — decides whether an
  alias is acceptable: the rule and the reserved words. Throws
  `InvalidUrlError`, so the controller's 400 path already handles it.
- `apps/backend/src/services/url.service.ts` (modify) — decides which code a
  new link gets, and raises `AliasConflictError` for RF-3 and RF-4.
- `apps/backend/src/controllers/url.controller.ts` (modify) — reads `alias`,
  validates it, answers 409 on a conflict.
- `apps/frontend/src/api/client.ts` (modify) — sends `alias` when given.
- `apps/frontend/src/components/UrlForm.tsx` (modify) — the optional field,
  the same rule client-side, the translated messages.
- `apps/frontend/src/i18n/resources/{en,es}/common.json` (modify) — label,
  hint, invalid and taken messages.
- `README.md` (modify) — `alias` in the request, the 409, the overview line,
  the roadmap item gone.

## 3. Pure logic
- `ALIAS_PATTERN = /^[A-Za-z0-9_-]{3,32}$/` and `RESERVED = ["api", "health",
  "assets"]`, in the backend validator and repeated in the form: two literals,
  noted in each file, because the workspaces share no code today.
- `validateAlias(alias: string): void` — throws on a broken rule.

## 4. Algorithm
Service `createShortUrl(originalUrl, alias?)`:
1. `existing = findByOriginalUrl(originalUrl)`.
2. No alias: return `existing` or a new record with a random code (today's path).
3. Alias and `existing`: if `existing.code === alias` return it; else throw
   `AliasConflictError` naming `existing.code` (RF-4).
4. Alias, no `existing`: if `findByCode(alias)` finds a link, throw
   `AliasConflictError` (RF-3); else insert with `code = alias` (RF-1).

## 5. Interface
Under the URL field, a second text field "Custom alias (optional)" with the
hint "3–32 letters, digits, - or _". The error line shows the translated
invalid or taken text. Same classes as the URL field, so both themes follow.

## 6. Decisions
- **Keep the URL unique and answer 409 for a second code.** Discarded:
  dropping the unique index, which changes deduplication for every caller.
- **Reuse `InvalidUrlError` for a bad alias.** Discarded: a new 400 error
  class, a second branch doing the same thing.
- **Repeat the rule in the client.** Discarded: a shared package for one
  regex; the API stays the authority either way.

## 7. Test strategy
Runner: vitest, via `npm test`.
- Backend: RF-1 (201, code, redirect), RF-2 (four 400s), RF-3 (409),
  RF-4 (409 naming the code), the same-alias edge (201). Injection: skip the
  taken check, see RF-3 red.
- Frontend: the client receives the alias or none (RF-5); a 409 and a bad
  alias show the English text (RF-6). Injection: always send the alias field,
  see RF-5 red.
- Rendered: the live demo in both locales and themes.

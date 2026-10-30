# Plan 003 — README rewrite

## 1. Scope and coverage
- RF-1 (English): the rewrite itself (block 4); checked by reading, as the
  last task.
- RF-2 (opening: what, demo, screenshot): the README's first lines, the
  screenshot file; the guard checks the image exists, its size and its alt
  text, and that the demo link and image come before the first `##`.
- RF-3 (sections in order): the outline in block 4; the guard reads the `##`
  headings and compares them with the expected list.
- RF-4 (every route documented): the API section; the guard compares the
  routes the Express app registers with the routes the README documents.
  Statuses are taken from the backend tests and the spec 002 production run,
  and recorded in `tasks.md`. Three had neither (`GET /:code` 404, and 500 on
  both GET routes), so `apps/backend/tests/url.routes.test.ts` gains them.
- RF-5 (no false claim): the guard checks every `npm run <script>` the README
  names exists in a `package.json`, and every repo path it names exists.
  "Planned" wording outside the roadmap is checked by reading.
- RF-6 (no generic sections, no decorative emoji): the guard fails on a
  heading or list item that starts with an emoji, and on the removed section
  titles.
- RF-7 (contact email, licence): the guard checks an email-shaped address and
  `MIT` are present, without spelling the address in the test (`AGENTS.md`
  allows the email in `README.md` only).
- RF-8 (roadmap, at most four new features): the guard counts the roadmap's
  items; that none exists yet is checked by reading against the code.
- NFR length: the guard fails over 250 lines.

## 2. Files
- `README.md` (rewrite) — the only page a visitor reads before deciding
  whether to look further.
- `docs/screenshot.png` (create) — shows the app with a shortened URL and its
  QR, taken from the live demo.
- `apps/backend/tests/url.routes.test.ts` (modify) — covers the three error
  statuses the README documents and no test produced yet.
- `apps/backend/tests/readme.test.ts` (create) — decides whether the README
  still matches the repository: routes, scripts, paths, sections, emoji,
  length, screenshot, roadmap size. It lives in the backend because RF-4 needs
  the Express app's registered routes, and the backend suite is what `npm test`
  already runs.

## 3. Pure logic
In the test file, no clock involved:
- `headings(md: string): string[]` — the `## ` headings in order.
- `section(md: string, title: string): string` — the text under one `## `
  heading up to the next.
- `documentedRoutes(md: string): string[]` — `METHOD path` pairs from the API
  section's `**METHOD** \`path\`` lines.
- `registeredRoutes(app): string[]` — `METHOD path` pairs from the Express
  router stack, the `/api/v1/urls` mount prefix joined to its sub-routes.
- `npmScripts(md: string): string[]` — every name after `npm run ` in a code
  block.
- `repoPaths(md: string): string[]` — every backticked token that contains a
  `/` and no space, and does not start with `/` (a route) or a scheme (a URL).

## 4. Algorithm
README outline, in this order (RF-3):
1. Title, one or two sentences on what the app does, the demo link, the
   screenshot (RF-2). No heading before them.
2. `## Overview` — features as plain bullets: shortening, QR, deduplication,
   hit counter, English and Spanish, light and dark theme.
3. `## Architecture` — the monorepo's three workspaces; the backend layers
   (routes → controllers → services → repositories → database package); the
   driver registry, SQLite locally and Postgres through Prisma in production;
   the one-origin Vercel layout. A short tree, only of folders that exist.
4. `## API` — each route: method and path, request, success status, error
   statuses, a `curl` example on the demo origin. `GET /` is listed too, as
   the API server's redirect to `FRONTEND_URL` when run alone; on Vercel the
   static frontend answers `/` first.
5. `## Running locally` — requirements, `npm install`, the `.env` variables
   that matter, `npm run dev`.
6. `## Testing` — `npm test`, `npm run build`, and what the database contract
   suite needs to run against Postgres.
7. `## Deploying` — the Vercel steps already written for spec 002, kept.
8. `## Roadmap` — at most four items, none built (RF-8): rate limiting per IP,
   custom aliases, a hit statistics view, link expiry.
9. `## License and contact` — MIT, the issue tracker, the contact email.

Route guard (RF-4): build the app with `createApp()`, walk `app._router.stack`;
for a layer with a `route`, take its path and methods; for a mounted router,
read the prefix from the layer's regexp source for `/api/v1/urls` and walk its
stack. Normalise to `GET /api/v1/urls/:code`. Compare as sets with the
documented list; report both differences.

## 5. Interface
No UI change. The README renders on GitHub in light and dark; the screenshot is
one image, the app in its dark theme, which reads on either GitHub theme.

## 6. Decisions
- **A guard test for the README.** Discarded: checking by reading alone, which
  is what let the old README promise a deploy months after the code changed;
  routes, scripts and paths drift silently.
- **The guard in the backend suite.** Discarded: a root-level test, which
  `npm test` (`--workspaces`) never runs, and a new workspace for one file.
- **Routes read from the Express app.** Discarded: a hardcoded list in the
  test, a second copy that drifts with the routes.
- **One screenshot, dark theme, PNG under `docs/`.** Discarded: one per theme
  (two binaries for one point), and a GIF (heavier, and the 300 KB cap).
- **Taken from the live demo with the built-in browser.** Discarded: the local
  dev server, whose `localhost` short URL would show in the picture.
- **Statuses recorded, not re-requested in the test.** Discarded: hitting the
  demo from the suite, which makes `npm test` depend on the network.

## 7. Test strategy
Runner: vitest (`apps/backend/package.json`, `vitest run`), via `npm test`.
- As data: `readme.test.ts` asserts sections, routes, scripts, paths, emoji,
  length, screenshot size and alt text, roadmap count, email and licence.
- As rendered output: the README viewed in a Markdown preview, screenshot
  included, before it is called done.
- Guard injections, each seen red then reverted by explicit path:
  - add an undocumented route to the app (`GET /api/v1/urls/:code/stats`);
  - name a script that does not exist (`npm run deploy`);
  - start a heading with an emoji;
  - add a fifth roadmap item.
- `git status` after `npm test`: `packages/database/prisma/dev.db` is
  reverted by explicit path, as before.

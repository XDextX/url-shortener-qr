# Spec 008 — Pending cleanup

**Status:** approved
**Approved:** 2026-10-30 · owner, with `XDextX` on the licence · 74 lines, 8 RF
**Size:** M

## Context and goal
Specs 001 to 007 left a list of known gaps. Running `npm test` rewrites a tracked
database file. Two API routes return internal error text on a 500. The API
answers in Spanish while constitution rule 7 makes the code English, and the form
shows that text to every visitor. The README says MIT with no licence file,
`docs/architecture.md` is in Spanish and predates the Postgres driver, `npm run
lint` fails, and nothing runs the gate on a push. This spec closes them.

## Actors
- Visitor: sees the form's error messages.
- API client: reads status codes and messages.
- Developer: runs the gate, or reads the repository.

## User stories
- US-1: As a developer, I want the gate to leave the working tree clean and to run
  on every push, so that a failure is found before it deploys.
- US-2: As the owner, I want no internal error text in a response, so that a
  failure reveals nothing about the infrastructure.

## Requirements (EARS)
- RF-1: THE SYSTEM keeps no database file under version control, and its test
  suites write to none. — **Check:** `git ls-files` lists no `.db` file; after
  `npm test`, `git status` shows no change and no file under
  `packages/database` has a new modification time.
- RF-2: IF the store fails during a lookup or a redirect, THEN THE SYSTEM answers
  500 with a generic message and no internal error text. — **Check:** backend
  tests with the failing store get 500 on both routes, and neither body contains
  the driver's error text.
- RF-3: THE SYSTEM's API messages are in English. — **Check:** backend tests assert
  the English text of each 400, 404 and 500 message.
- RF-4: IF creating a link fails for any reason other than the rate limit or a
  taken alias, THEN THE SYSTEM's form shows the translated server error instead of
  the API's text. — **Check:** a frontend test with the API answering 500 shows the
  English translation and not the API's text; the key exists in both locales.
- RF-5: THE SYSTEM's repository carries an MIT licence file. — **Check:** the README
  guard fails when the file is missing or does not name MIT.
- RF-6: THE SYSTEM's `docs/architecture.md` is in English and describes the current
  architecture. — **Check:** reading it, no Spanish sentence remains, and the
  README guard's path check passes on it.
- RF-7: THE SYSTEM passes its linter. — **Check:** `npm run lint` exits 0.
- RF-8: WHEN code is pushed to `main` or a pull request targets it, THE SYSTEM runs
  a clean install, lint, tests and build. — **Check:** a run on GitHub after the
  push finishes green, and a run with an injected failing test finishes red.

## Non-functional requirements
- No new dependency. The hook manager husky stays out: CI is the gate that cannot
  be skipped locally.
- Status codes do not change: only the bodies of the responses named above.

## Edge cases
- A developer's local data: the tracked file leaves git but stays on disk, and the
  default local database remains `packages/database/data/dev.db`.
- A network failure before any response reaches the form: RF-4's translated text.

## Out of scope
- Sharing the alias rule between the client and the API: one regex does not justify
  a new package, and the API stays the authority.
- The 19 ms between a link's `expiresAt` and its `createdAt` plus lifetime.
- The repository's description and homepage on GitHub, and deleting test links from
  the production database: both are the owner's, through their own accounts.

## Done when
- `npm ci`, `npm run lint`, `npm test` and `npm run build` pass from clean; each
  new guard has been seen red.
- The live demo answers the English messages after deploy.

## Open questions
None. The owner chose the GitHub handle `XDextX` for the licence's copyright line.

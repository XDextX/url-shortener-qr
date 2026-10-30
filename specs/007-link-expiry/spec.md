# Spec 007 — Link expiry

**Status:** implemented (2026-10-29)
**Approved:** 2026-10-29 · agent, in the owner's autonomous mode (roadmap item 4) · 75 lines, 7 RF
**Size:** L

## Context and goal
Every short link lives forever. A link made for one event keeps redirecting
long after the event, and the visitor has no way to say otherwise. The README's
roadmap lists links that expire after a chosen time. This spec lets the visitor
pick a lifetime when creating a link; once it passes, the link stops
redirecting, and its statistics say so.

## Definitions
- **Lifetime:** one of `1h`, `1d`, `7d`, `30d`, or none (the link never
  expires, as today).
- **Expired:** a link whose expiry moment is in the past.

## Actors
- Visitor: creates links, opens them, and looks up their statistics.

## User stories
- US-1: As a visitor, I want a link to stop working after a time I choose, so
  that it does not outlive its purpose.
- US-2: As someone opening an expired link, I want to be told it expired,
  rather than see a generic error.

## Requirements (EARS)
- RF-1: WHEN a creation carries a lifetime, THE SYSTEM stores the link's
  expiry moment as the creation moment plus that lifetime. — **Check:** a
  backend test creates with `1h` and the answer's `expiresAt` is one hour
  after its `createdAt`.
- RF-2: IF the lifetime is not one of the allowed values, THEN THE SYSTEM
  answers 400 with a `message`. — **Check:** a backend test with `2h` gets 400.
- RF-3: WHILE a link has not expired, THE SYSTEM redirects it as today. —
  **Check:** a backend test opens a `1h` link at once and gets 302.
- RF-4: IF a link has expired, THEN THE SYSTEM answers its redirect with 410.
  — **Check:** a backend test moves the clock past the expiry and gets 410,
  and the hit count does not change.
- RF-5: WHEN an expired link's URL is shortened again, THE SYSTEM renews that
  link with the new lifetime, keeping its code. — **Check:** a backend test
  shortens the URL again after expiry, gets the same code and a future
  `expiresAt`, and the redirect answers 302 again.
- RF-6: THE SYSTEM's form offers the lifetime as a choice that defaults to
  never, and sends it only when one is chosen. — **Check:** a frontend test
  picks `1d` and the client receives it; by default it receives none.
- RF-7: THE SYSTEM's statistics show when a link expires, or that it expired,
  or that it never does, in the visitor's language. — **Check:** frontend tests
  for a future, a past and a missing `expiresAt` each show their text; the keys
  exist in both locales.

## Non-functional requirements
- The expiry is stored in the database, so every instance agrees on it.
- Lookups still answer an expired link's statistics: only redirects stop.

## Edge cases
- An existing link that has not expired is returned unchanged when its URL is
  shortened again, whatever lifetime is asked: otherwise anyone could shorten
  another person's permanent link to an hour. Context of RF-5, no new RF.
- An expired link's alias stays taken: the code still exists.
- Links created before this spec have no expiry: RF-7's "never".

## Out of scope
- Deleting expired links from the database.
- Custom lifetimes beyond the four values, or expiry by hit count.
- Editing a live link's lifetime.

## Done when
- `npm test` and `npm run build` pass from clean; each guard injection in the
  plan has been seen red; the contract suite passes on Postgres.
- The migration applies on deploy; on the live demo a link created with a
  lifetime shows its expiry in the statistics, in both locales and themes.

## Open questions
None.

# Spec 004 — Rate limiting per IP

**Status:** implemented (2026-10-29)
**Approved:** 2026-10-29 · agent, in the owner's autonomous mode (roadmap item 1) · 74 lines, 6 RF
**Size:** M

## Context and goal
Anyone can create short links without limit, so one client can fill the
database or use the service to mass-produce redirects. The README's roadmap
lists rate limiting per IP first. This spec caps how many links one client can
create in a minute. The app runs on serverless functions, so the count has to
live in the database: an in-memory counter would be one per instance and reset
on every cold start.

## Definitions
- **Client:** the IP address a request comes from, as the hosting platform
  reports it.
- **Window:** a fixed minute; the count restarts at the next one.

## Actors
- Visitor: creates links through the form or the API.

## User stories
- US-1: As the owner, I want one client's link creation capped, so that no one
  can flood the database.
- US-2: As a visitor who hits the cap, I want to be told to wait, in my
  language, so that I know it is not broken.

## Requirements (EARS)
- RF-1: WHILE a client has created fewer links than the limit in the current
  window, THE SYSTEM accepts its next creation. — **Check:** a backend test
  creates the limit's number of links from one client and each gets 201.
- RF-2: IF a client exceeds the limit in the current window, THEN THE SYSTEM
  answers 429 with a `message` and a `Retry-After` header holding the seconds
  left in the window. — **Check:** a backend test's next request gets 429, a
  `message`, and a `Retry-After` between 1 and 60.
- RF-3: THE SYSTEM counts each client separately. — **Check:** after one client
  hits the limit, a backend test's request from another client gets 201.
- RF-4: THE SYSTEM keeps the count in the database, so every instance shares
  it. — **Check:** the driver contract suite counts through both drivers and
  sees the count rise and restart in a new window.
- RF-5: WHEN the API answers 429, THE SYSTEM shows the visitor a translated
  message asking them to wait. — **Check:** a frontend test renders the form,
  the API answers 429, and the English text appears; the key exists in both
  locales.
- RF-6: THE SYSTEM stores no raw IP address. — **Check:** a backend test of
  the key the service stores: 64 hex characters, not containing the IP.

## Non-functional requirements
- The limit is 10 creations per minute by default, set by configuration.
- Only link creation is limited; redirects and lookups are not.

## Edge cases
- The store fails while counting: the request answers 500 with the same
  generic `message` as RF-8 of spec 002, rather than skipping the limit.
- A request with no address the server can read is counted under one shared
  key: context, no RF.
- Old windows: each client's previous windows are deleted when it counts again,
  so the table holds one row per recently active client.

## Out of scope
- Limits on redirects or lookups.
- Sliding windows, per-user quotas, allow lists.
- Limits enforced at the platform edge (Vercel firewall rules).

## Done when
- `npm test` and `npm run build` pass from clean; the guard injections in the
  plan have each been seen red.
- The migration applies on deploy, and on the live demo the eleventh creation
  in a minute from one client gets 429 and the form shows the message in
  English and Spanish, in light and dark.

## Open questions
None.

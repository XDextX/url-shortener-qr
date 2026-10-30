# Spec 006 — Hit statistics view

**Status:** approved
**Approved:** 2026-10-29 · agent, in the owner's autonomous mode (roadmap item 3) · 66 lines, 5 RF
**Size:** M

## Context and goal
The app counts every redirect as a hit, but nobody can see the count: no API
response carries it and the page never shows it. The README's roadmap lists a
statistics view for each link's hits. This spec exposes a link's hits and
creation date in the API and adds a lookup to the page where a visitor pastes
a short link or code and sees its statistics.

## Definitions
- **Statistics:** a link's original URL, its hits, and when it was created.
- **Lookup input:** what the visitor pastes: a bare code, or a full short URL
  whose last path segment is the code.

## Actors
- Visitor: anyone holding a short link; statistics are public, as the links
  themselves are.

## User stories
- US-1: As someone who shared a short link, I want to see how many times it
  was opened, so that I know whether people used it.

## Requirements (EARS)
- RF-1: THE SYSTEM's link responses carry the link's `hits` and its
  `createdAt` as an ISO 8601 date. — **Check:** a backend test creates a link,
  opens it twice, and the lookup answers `hits: 2` and a `createdAt` that
  parses as a date.
- RF-2: WHEN the visitor looks up a code or a full short URL, THE SYSTEM shows
  its original URL, hits and creation date. — **Check:** a frontend test
  enters a full short URL, the client is asked for its code, and the three
  values appear.
- RF-3: IF no link has that code, THEN THE SYSTEM tells the visitor so, in
  their language. — **Check:** a frontend test with the client answering 404
  shows the English text; the key exists in both locales.
- RF-4: THE SYSTEM shows the hit count with the right plural, in the visitor's
  language. — **Check:** frontend tests show "1 visit" for 1 and "2 visits"
  for 2; the Spanish keys exist.
- RF-5: THE SYSTEM's creation result offers a way to the new link's
  statistics. — **Check:** a frontend test clicks it on the result card and
  the lookup shows that link's statistics.

## Non-functional requirements
- Lookups are not rate limited and do not count as hits.
- No database change: hits and the creation date are already stored.

## Edge cases
- A lookup input with spaces around it is trimmed: RF-2.
- An empty lookup does not call the API: context, no RF.
- The store fails during a lookup: the generic error text, as the form does.

## Out of scope
- Hits over time, referrers, countries, unique visitors.
- Private statistics or an owner-only view.

## Done when
- `npm test` and `npm run build` pass from clean; each guard injection in the
  plan has been seen red.
- On the live demo, a link opened twice shows 2 visits in the lookup, in both
  locales and both themes.

## Open questions
None.

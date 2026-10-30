# Spec 005 — Custom aliases

**Status:** approved
**Approved:** 2026-10-29 · agent, in the owner's autonomous mode (roadmap item 2) · 74 lines, 6 RF
**Size:** M

## Context and goal
Every short link gets a random 8-character code, which nobody can remember or
read aloud. The README's roadmap lists custom aliases: letting the visitor
choose the code, as in `/my-talk`. This spec adds an optional alias to link
creation, in the API and in the form.

## Definitions
- **Alias:** a code the visitor chooses instead of a random one: 3 to 32
  characters, letters, digits, `-` and `_`, case-sensitive.
- **Reserved word:** a path the app itself serves: `api`, `health`, `assets`.

## Actors
- Visitor: creates links through the form or the API.

## User stories
- US-1: As a visitor, I want to choose my link's code, so that people can
  remember and type it.
- US-2: As a visitor whose alias is taken or invalid, I want to be told why,
  in my language, so that I can pick another.

## Requirements (EARS)
- RF-1: WHEN a creation carries a valid, free alias, THE SYSTEM creates the
  link with that alias as its code. — **Check:** a backend test gets 201, its
  `code` equals the alias, and `GET /<alias>` redirects.
- RF-2: IF the alias does not follow the alias rule or is a reserved word,
  THEN THE SYSTEM answers 400 with a `message`. — **Check:** backend tests for
  too short, too long, a bad character, and `api` each get 400.
- RF-3: IF the alias is already some link's code, THEN THE SYSTEM answers 409
  with a `message`. — **Check:** a backend test creates an alias twice for two
  URLs and the second gets 409.
- RF-4: IF the URL already has a short link under another code and an alias is
  requested, THEN THE SYSTEM answers 409 with a `message` naming the existing
  code. — **Check:** a backend test shortens a URL, asks for an alias for it,
  gets 409, and the message contains the first code.
- RF-5: THE SYSTEM's form offers an optional alias field and sends the alias
  only when one is typed. — **Check:** a frontend test types an alias and the
  client is called with it; without one, it is called with none.
- RF-6: WHEN the API answers 409, or the typed alias breaks the alias rule,
  THE SYSTEM shows a translated message under the form. — **Check:** frontend
  tests for a 409 and for an alias with a space each show the English text;
  the keys exist in both locales.

## Non-functional requirements
- No change to the database schema: an alias is stored as the code.
- The alias rule is the same in the client and the API.

## Edge cases
- The same URL with the same alias it already has: 201 with the existing link
  (RF-1, no conflict with itself).
- An empty alias field counts as no alias: RF-5.
- Aliases differing only in case are different codes: the definition.
- Two requests claim the same free alias at the same instant: the store's
  unique code rejects the second, which answers the generic 500. Accepted for a
  demo; context, no RF.

## Out of scope
- Editing or deleting an alias after creation.
- Several codes for one URL: the URL stays unique, hence RF-4.
- Reserving aliases per user.

## Done when
- `npm test` and `npm run build` pass from clean; each guard injection in the
  plan has been seen red.
- On the live demo an alias link is created and redirects, and the form shows
  the field and its messages in both locales and both themes.

## Open questions
None.

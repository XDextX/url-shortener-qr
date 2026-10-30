# Spec 003 — README rewrite

**Status:** approved
**Approved:** 2026-10-29 · owner, after the roadmap question was settled · 94 lines, 8 RF
**Size:** M

## Context and goal
The README is the first thing a visitor to the repository reads, and today it
works against the project. It runs to 665 lines, in Spanish, although
constitution rule 7 makes every repo document English. It mixes what the
project is with generic material: contribution guidelines, troubleshooting,
a walkthrough of adding a `Button` component, and an emoji on every heading.
Until a quick fix landed alongside this spec, it also promised a deploy "soon"
and described SQLite as the store; the app now runs in production on Postgres
(spec 002). This spec rewrites the README so a reader learns in a minute what
the app does, sees it working, and knows how it is built and how to run it.

The owner chose: English only, one screenshot of the live app, the README
alone (`docs/architecture.md` stays as is), and a short roadmap.

## Definitions
- **Live demo:** the production origin set up by spec 002.
- **Claim:** any statement in the README a reader could check, such as a
  command, a path, a route, a status code or a feature.

## Actors
- Reader: someone evaluating the project, a recruiter among them, often only
  skimming.
- Developer: someone who clones the repository to run it.

## User stories
- US-1: As a reader, I want to see what the app does and try it in one click,
  so that I can judge it without cloning anything.
- US-2: As a reader, I want a short account of the architecture, so that I can
  judge the backend design.
- US-3: As a developer, I want commands that work as written, so that the app
  runs locally on the first try.

## Requirements (EARS)
- RF-1: THE SYSTEM's README is written in English. — **Check:** reading it,
  no Spanish sentence remains; Spanish appears only as the name of a locale.
- RF-2: THE SYSTEM's README opens with what the app does in one or two
  sentences, a link to the live demo, and a screenshot of the app with a
  shortened URL and its QR. — **Check:** all three come before the first
  section heading; the demo link answers 200; the image file exists and loads.
- RF-3: THE SYSTEM's README has these sections, in this order: overview,
  architecture, API, running locally, testing, deploying, roadmap, licence and
  contact. — **Check:** its headings, read in order.
- RF-4: THE SYSTEM's API section documents every route the backend serves,
  each with its method, path, success status and error statuses. — **Check:**
  the documented routes match the routes the backend registers; each documented
  status is produced by a request against the live demo or a backend test.
- RF-5: THE SYSTEM's README makes no claim that is false today. — **Check:**
  every npm script it names exists in a `package.json`; every path it names
  exists; nothing is described as planned or upcoming outside a section titled
  as a roadmap.
- RF-6: THE SYSTEM's README contains no contribution guidelines,
  troubleshooting, component how-to, or decorative emoji. — **Check:** none of
  those sections remain; no heading and no list item starts with an emoji.
- RF-7: THE SYSTEM's README keeps the owner's contact email and the licence.
  — **Check:** both present, the email being the one `AGENTS.md` allows.
- RF-8: THE SYSTEM's roadmap section lists at most four features, none of
  which the app already has. — **Check:** count the items; try each on the live
  demo or find it in the code, and none is there.

## Non-functional requirements
- Length: at most 250 lines, so a reader can skim it. Measured with `wc -l`.
- The screenshot is under 300 KB and carries descriptive alt text.
- No secret, no connection string, no local path with a user name.

## Edge cases
- Numbers that go stale (test counts, line counts, package versions) are left
  out rather than quoted: RF-5.
- The demo origin changes later (a custom domain): the link is written once,
  so changing it is one edit. Context, not a requirement.

## Out of scope
- `docs/architecture.md`, still in Spanish: its own change.
- The repository description and homepage on GitHub: set by the owner in the
  repository settings.
- New features from the roadmap (rate limiting, custom aliases, hit
  statistics): each is its own spec.
- Translating the README into Spanish.

## Done when
- `npm test` and `npm run build` pass, and `git status` shows no stray change
  (the README change is documentation, but the gate is the gate).
- Each RF's check is recorded as passed, with RF-4's statuses taken from the
  live demo or from the backend tests.
- The README is viewed rendered (GitHub or a Markdown preview), screenshot
  included, before it is called done.

## Open questions
None. The roadmap question was settled by the owner: a short section stays.

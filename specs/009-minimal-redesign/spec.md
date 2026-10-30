# Spec 009 — Minimal redesign

**Status:** approved
**Approved:** 2026-10-30 · owner, with IBM Plex Sans · 79 lines, 7 RF
**Size:** M

## Context and goal
The app wears Tailwind's default slate and indigo with a shadow on every card, so it
looks like a template and shares nothing with the owner's Portfolio. This spec gives the
whole app a minimalist look in the Portfolio's palette, in its light and dark themes.
Behaviour does not change.

## Definitions
- **Portfolio palette:** the values below, read from the Portfolio's theme files. They are
  copied, not linked: the two repositories share no code.

| Role | Light | Dark |
|---|---|---|
| Page | `#FBFCFD` | `#243972` |
| Card | `#FFFFFF` | `#2B4372` |
| Decorative border | `#DCE2E9` | `#3A578F` |
| Control border | `#848F9F` | `#7D93C2` |
| Text | `#16202C` | `#F5F7FA` |
| Secondary text | `#566274` | `#A9B6CD` |
| Accent (text, button fill) | `#7A5D10` | `#E3C770` |
| Ink on the accent fill | `#FFFFFF` | `#243972` |
| Error text | `#B3261E` | `#F2B8B5` |
| Focus ring | `#243972` | `#F5F7FA` |

## Actors
- Visitor: uses the app in either theme.

## User stories
- US-1: As a visitor, I want a calm page with one accent, so that the form and my link
  are what I notice.
- US-2: As the owner, I want this app to look related to my Portfolio, so that my work
  reads as one body.

## Requirements (EARS)
- RF-1: THE SYSTEM's theme tokens hold the Portfolio palette in both themes. — **Check:**
  a test reads each token's value in both themes and compares it with the table.
- RF-2: THE SYSTEM's text, accent and error colours reach 4.5:1 on the surfaces they sit
  on, and control borders reach 3:1. — **Check:** the same test computes WCAG contrast
  for each pair, with the function checked against known reference values.
- RF-3: THE SYSTEM draws no shadow on any element. — **Check:** a test scans the
  components for `shadow` classes.
- RF-4: WHEN a control is hovered, THE SYSTEM moves its border or fill to the accent, and
  nothing lifts. — **Check:** the rendered page, hovered, in both themes.
- RF-5: WHEN a control has keyboard focus, THE SYSTEM shows the focus ring. — **Check:**
  the computed outline on a tabbed-to field and button, in both themes.
- RF-6: THE SYSTEM shows errors in the error colour, not the accent. — **Check:** a test
  scans the components for error text using the accent token.
- RF-7: THE SYSTEM's page has one narrow column with no band behind the header. —
  **Check:** the rendered page at 375, 768 and 1280 px, with no horizontal scroll.

## Non-functional requirements
- No change to behaviour, routes, translations or the tests of either.
- No new dependency. Colours stay in theme variables (`AGENTS.md`).
- One component at a time, shown in light and dark and approved before the next.

## Edge cases
- The select's native arrow and option list in dark: `color-scheme` already set per theme;
  checked on the rendered page.
- The QR code stays black on white in both themes, so it still scans.

## Out of scope
- The Portfolio's gold glows, hero band and level colours: they are not minimal.
- Sharing tokens between the two repositories.
- Regenerating the README's screenshot until the last component is approved: it is the
  final task.

## Done when
- `npm run lint`, `npm run build` and `npm test` pass from clean; each new guard was seen
  red.
- Every component was approved by the owner in both themes.
- The live demo shows the new look, and the README's screenshot is retaken.

## Open questions
None. The owner chose IBM Plex Sans, self-hosted as in the Portfolio.

# AGENTS.md

Working rules, and nothing else. **A line that describes what the repo _is_ — an inventory, a how-to,
a story — belongs in `README.md` or `docs/architecture.md`, not here.** A rule carries the failure it
prevents whenever one is what makes it obeyable.

**`docs/constitution.md` outranks this file.** It holds the non-negotiable rules and is never
restated here.

**Language.** Every repo document is English, specs and TSDoc included; `Memory.md` is the agent's
call. Visitor-facing text goes through i18n in both locales.

## Workflow

### Before writing code

- **A feature, a fix that changes behaviour, or a refactor starts with a spec**, in
  `specs/NNN-<name>/spec.md`. Read the constitution and the active spec first.
- A typo, a rename, a comment or a formatting fix does not need a spec. When unsure, **ask**.
- **The spec template and its rules live in the `sdd` skill**, `.agents/skills/sdd/SKILL.md` — the
  only copy. It is gitignored and lives per machine; wire it with `powershell -File .agents/link.ps1`.
- **Every RF carries the check that settles it.** A requirement with no check is prose.
- **A spec never overrides the constitution or this file.** A contradiction is the finding: resolve
  it in those files first, then in the code.
- **Reference the spec in the commits it produces** (`fix(database): ... (spec 001)`).

### Verifying

- **`npm test` and `npm run build` are both the gate.** The tests were green while the build could
  not compile — a green suite says nothing about a module it never imports.
- **Running the tests must not modify a tracked file.** Check `git status` after `npm test`, and
  revert by explicit path.
- **Prove a new guard bites** by injecting the violation once, then revert by explicit path.

### Visual work

- Change **one** component, show it in light and dark, and wait for approval before the next.

### Git

- **NEVER push. NEVER commit unless asked.** If unsure whether to commit, ask.
- **A new spec is drafted from `main` and gets its own branch once approved**: `spec/NNN-<name>`.
- Conventional commits: `type(scope): description`. One logical change per commit.
- `AGENTS.md` and `docs/constitution.md` get their own `docs:` commit.
- **`git checkout -- .` destroys uncommitted work silently.** Revert explicit paths only.

### Memory

- **Read `Memory.md` before proposing anything** and update it after each task. Keep it under 50
  lines; it is gitignored.
- **Three homes, one rule each**: non-negotiables in the constitution, working rules here, state in
  `Memory.md`. Never duplicate a rule across two.

## Rules

### Code

- **TypeScript everywhere.** TSDoc on exported functions, services and contracts: what it does,
  inputs, outputs, side effects. Comment the why, never the obvious.
- **A module that imports a package declares it** in its own workspace's `package.json`. Hoisting
  hides the gap locally and the build breaks on a clean install.
- **Read configuration through `apps/backend/src/config`**, not scattered `process.env` reads.

### Database

- Drivers register through `registerDatabaseDriver` and are selected with `DATABASE_DRIVER`
  (`sqlite` default). A new driver implements the whole `DatabaseDriver` contract and ships tests.

### Frontend

- **Visible text never bypasses i18n**: keys in `src/i18n/resources/<lang>/common.json`, read with
  `useTranslation`, in every locale. Tests render through `renderWithI18n`.
- **Colours come from theme variables** (`--color-*` in `src/theme/themes.ts`, mapped in
  `tailwind.config.js`). A hardcoded colour does not follow the theme.

### Tests

- **Every new component or unit ships its tests.** If a case cannot be automated, write down why
  and what was checked by hand.
- **Stub a browser API after the library that installs its own.** `userEvent.setup()` replaces
  `navigator.clipboard`, so a stub defined before it is never called.

### Sensitive data

- **Never write paths with the real user name, emails, tokens, keys or passwords** into any repo
  document or commit message. Use placeholders: `C:\Users\<user>\...`, `<token>`.
- `.env` is gitignored; flag a secret's existence, never its value.
- **One exception: the owner's public contact email, in `README.md` only**, the same address
  across the owner's repos. Anywhere else, a commit message included, it is still an email.

### Agent tooling

- **Agent tooling is never tracked** — `.agents/`, `.claude/`, `.opencode/`, `Memory.md`,
  `bloque/`. Do not `git add -f` them.

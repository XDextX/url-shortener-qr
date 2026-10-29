# Constitution

Seven rules. Each names where it is decided: a test, a command, or a file to read.
Breaking one is a bug — the fix is the rule or an amendment, never a workaround
in the code. `AGENTS.md` elaborates these and yields to them on any conflict.

1. **Green means build and tests.** `npm test` runs every workspace's suite and
   `npm run build` compiles every workspace; a change is done only when both pass
   on a clean install. *Check:* both commands, exit code 0.
2. **Spec first.** Behaviour changes trace to `specs/NNN-*/spec.md`, and every RF
   names the check that settles it. *Check:* the commit names the spec.
3. **Layers stay apart.** Routes → controllers → services → repositories → the
   `@url-shortener/database` package; only that package talks to a database
   driver. *Check:* no driver import (`sql.js`, `pg`) outside `packages/database`.
4. **Every import is declared** in the `package.json` of the workspace that
   imports it. *Check:* `npm run build` after `npm ci`.
5. **A guard must fail once.** Never call a new test green before injecting the
   violation it exists for and watching it go red. *Check:* the commit names it.
6. **Secrets server-side.** `.env` files are gitignored; the database URL is read
   by the backend config and the database package only, never by the frontend
   bundle. *Check:* no `DATABASE_URL` under `apps/frontend/src`.
7. **Two languages, on purpose.** Code, comments and repo documents are English;
   visitor-facing text exists in English and Spanish through i18n. *Check:* every
   key in `en/common.json` exists in `es/common.json` and vice versa.

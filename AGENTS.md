# Repo Notes For Agents

The Astro app lives in `web/` (migrated from Next.js AppRouter; see
`web/SPECS.md` for the current architecture).

Primary agent docs:
- `web/AGENTS.md` — editing rules, auth model, Windows dev-server pattern
- `web/SPECS.md` — product + architecture + known SDK workarounds

<!-- NEON:START -->
## Neon backend

This project runs on [Neon](https://neon.com) (Lakebase Postgres) with
**Managed Better Auth** and the **Data API**.

- **Project:** `web-lduaChone` (`damp-cloud-58530633`), branch `production`, database `neondb`
- **Data API:** PostgREST-compatible endpoint; the browser talks to it with
  `@neon/neon-js` (`client.from(...)`, `client.rpc(...)`), using RLS for
  authorization.
- **Auth:** Neon Auth (Managed Better Auth). Users live in
  `neon_auth."user"`; app roles live in `public.profiles`.
- **Schema:** `migrations/20261124000000_neon-init.sql` is the source of truth.
  The older `migrations/insforge/` files are archived history.
- **CLI:** `neon link` writes `.neon`; `neon psql` runs SQL; `neon data-api
  refresh-schema` after DDL; `neon neon-auth ...` manages auth.
- **Credentials:** `.env.local` holds `DATABASE_URL*`, `NEON_AUTH_*`, and
  `PUBLIC_NEON_DB_URL`. Never commit or hardcode them.

Key patterns:

- RLS roles: `authenticated` (signed in) and `anonymous` (guests).
  Policies use `auth.uid()`, and admin checks use `public.is_admin()`.
- Inserts accept an array: `insert([{ ... }])`; updates take one object:
  `update({ ... })`.
- Public pages need `allowAnonymous: true` on the client (already configured in
  `web/src/lib/neon/client.ts`).
<!-- NEON:END -->

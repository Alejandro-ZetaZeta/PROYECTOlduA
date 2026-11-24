# Specs

## Product
Multi-event marketing + tournament-management site for LDU-A ULEAM. Event
landing pages are public; tournament registration and bracket are public;
admin panel is gated.

## Architecture
- **Astro 7** with `output: 'server'` (Vercel adapter `@astrojs/vercel@11`)
- **React 19** islands via `@astrojs/react` for the admin + registration
  client (`client:only="react"`)
- **Tailwind v4** via `@tailwindcss/vite` (CSS-first config in
  `src/styles/global.css`)
- **TypeScript strict** (extends `astro/tsconfigs/strict`)
- **Neon** backend: Lakebase Postgres + Managed Better Auth + Data API,
  accessed with `@neon/neon-js` (`client.from()`, `client.rpc()`)
- **Vercel** for deploy; static marketing pages opt into
  `export const prerender = true`

## Project layout
```
web/
  astro.config.mjs
  src/
    pages/                  # File-based routes
      index.astro           # Single-event fast path → full landing
      events/[slug].astro   # Per-event landing (prerendered)
      registro-torneo.astro # Public registration form (mounts <RegistrationClient>)
      tournament-registration.astro
      404.astro
    layouts/BaseLayout.astro
    components/             # .astro static + .tsx islands
    content.config.ts       # `events` collection (Zod schema, glob loader)
    content/events/*.json   # Event data (single source of truth)
    lib/neon/               # client.ts (Data API + auth), auth.ts (admin sign-in)
    styles/global.css
  public/
    icon.png                # Favicon (original Next.js asset)
  .env.local                # DATABASE_URL*, NEON_AUTH_*, PUBLIC_NEON_DB_URL
```

## Event contract
Each event is a JSON file in `src/content/events/<slug>.json` matching the
Zod schema in `src/content.config.ts`. The collection drives:
- `src/pages/index.astro` — when there's a single event, renders the full
  landing directly (Hero + Roadmap + CTA + EventFooter + timeline). When
  there are multiple, falls back to `HomeEventsGrid`.
- `src/pages/events/[slug].astro` — `getStaticPaths()` over the collection
  with `export const prerender = true`.

## Design
- Neutral, elegant palette (dark background, muted text, soft borders)
- Premium typography: Cinzel for display, Inter for body, Kunaroh for
  hand-drawn accents (loaded via `@fontsource-variable/*` and a local
  `@font-face` in `@layer base`)
- Sections should feel spaced and calm; avoid noisy gradients
- `body` has a subtle dark gradient and custom scrollbar

## Motion
- Framer Motion for reveal-on-scroll (`<Reveal client:load>`) and the
  tournament timeline (`TimelineIsland`)
- Durations ~0.5–0.7s, `easeOutQuint`
- View transitions enabled via `ClientRouter` in `BaseLayout`

## Auth & data (Neon)

- **Auth**: Managed Better Auth (`neon_auth` schema). The browser client at
  `src/lib/neon/client.ts` logs in with `neon.auth.signIn.email()` and
  restores sessions with `neon.auth.getSession()`. There are no auth API
  routes and no middleware.
- **Admin gate**: `src/lib/neon/auth.ts` → `signInAdmin()` signs in, reads
  the caller's row from `public.profiles`, and signs out anyone whose role
  is not `admin`.
- **Data**: Neon Data API (PostgREST-compatible). Client islands query with
  `neon.from("table").select/insert/update/delete` and `neon.rpc(...)`.
  Inserts take an array; updates take a single object.
- **Anonymous access**: `createClient(..., { auth: { allowAnonymous: true } })`
  fetches a short-lived guest JWT, so the public bracket, standings, and
  registration form work without a login. RLS limits guests to public reads
  and inserts.
- **RLS**: `authenticated` and `anonymous` roles. Policies use `auth.uid()`
  and `public.is_admin()`; the schema lives in
  `../migrations/20261124000000_neon-init.sql`.
- **Profiles**: `public.profiles(id uuid → neon_auth."user", role)`.
  Admin roles are assigned with SQL (`neon psql`), not from the app.

## Known quirks
- **Update takes an object, insert takes an array** (`postgrest-js`).
  Calling `update([...])` sends a JSON array and PostgREST rejects it.
- **Anonymous reads need a token.** If `allowAnonymous` is removed, public
  pages fail with `PGRST302` (missing bearer token).
- **Schema cache**: after DDL, run `neon data-api refresh-schema` or new
  tables/columns are invisible to the Data API.

## Build & dev
- `npm run build` — Vercel adapter output in `.vercel/output/`
- `npm run dev` — Astro dev server (see `AGENTS.md` → "Running dev
  servers" for the correct background-process pattern)
- `npm run check` — `astro check` (0 errors; unused-code hints only)

## Environment
`web/.env.local` (gitignored):
```
DATABASE_URL=postgresql://...        # pooled, for server/scripts
DATABASE_URL_UNPOOLED=postgresql://... # direct, for psql/pg_dump
NEON_AUTH_BASE_URL=https://...neonauth...
NEON_AUTH_JWKS_URL=https://.../.well-known/jwks.json
PUBLIC_NEON_DB_URL=https://ep-....c-9.us-east-2.aws.neon.tech/neondb
```
`PUBLIC_NEON_DB_URL` is inlined at build time. Set it in Vercel (Production
and Preview) before deploying, and add the deployed origin to Neon Auth's
trusted domains (`neon neon-auth domain add https://...`).

## Admin accounts

Sign-up is open on the Auth branch (email verification is off) but there is no
public sign-up UI. Create the account once, then grant the role:

```bash
curl -X POST "$NEON_AUTH_BASE_URL/sign-up/email" \
  -H "Origin: http://localhost:4321" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"...","name":"Admin"}'
```

The response contains the user `id` (a UUID). Then:

```sql
insert into public.profiles (id, role) values ('<user id>', 'admin');
```

Run it with `neon psql`. Auth users and `profiles` rows cascade together, so
deleting the auth user also removes the role.

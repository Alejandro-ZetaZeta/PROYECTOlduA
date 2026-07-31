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
- **InsForge** backend via `@insforge/sdk@^1.5.1` (`/ssr` subpath)
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
      api/auth/             # /api/auth/sign-in, sign-out, refresh
    layouts/BaseLayout.astro
    components/             # .astro static + .tsx islands
    content.config.ts       # `events` collection (Zod schema, glob loader)
    content/events/*.json   # Event data (single source of truth)
    lib/insforge/           # browser.ts, server.ts, cookieAdapter.ts
    middleware.ts           # updateSession + /admin/* guard
    styles/global.css
  public/
    icon.png                # Favicon (original Next.js asset)
  .env.local                # PUBLIC_INSFORGE_URL, PUBLIC_INSFORGE_ANON_KEY
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

## Auth (InsForge)
- **Cookies**: `insforge_access_token` (non-httpOnly, browser-readable) +
  `insforge_refresh_token` (httpOnly, server-owned)
- **Server actions** under `src/pages/api/auth/*`:
  - `POST /api/auth/sign-in` — `createAuthActions({ cookies }).signInWithPassword`
    + role check on `profiles.role === 'admin'` (returns 401/403/200)
  - `POST /api/auth/sign-out` — `createAuthActions({ cookies }).signOut()`
  - `POST /api/auth/refresh` — `refreshAuth({ request, cookies })` returns
    the SDK-built `result.response` (which already carries refreshed
    `Set-Cookie` headers)
- **Cookie adapter** `src/lib/insforge/cookieAdapter.ts` wraps Astro's
  unified `AstroCookies` to the SDK's `CookieStore`/`CookieWriter` shape
  via overloaded `set`/`delete` discrimination
- **Middleware** `src/middleware.ts` calls `updateSession()` on every
  request, then guards only `/admin/*` (redirects non-admins to `/?login=…`)
- **Browser client** `src/lib/insforge/browser.ts` calls
  `createBrowserClient({ refreshUrl: '/api/auth/refresh' })` with a
  **custom `fetch` wrapper** (see "Known SDK workarounds" below)

## Known SDK workarounds
- **Refresh endpoint is rewritten to the relative URL.** The SDK's
  `createBrowserClient` internally builds the refresh request as
  `${baseUrl}/api/auth/refresh` (absolute), then `ssrFetch` calls
  `fetchImpl(input, init)` on it — bypassing the app's relative
  `/api/auth/refresh` route. The browser would hit the InsForge backend
  directly, where the httpOnly refresh cookie isn't visible, getting 401.
  The `browser.ts` `fetchWithRefreshRewrite` intercepts any request whose
  URL ends in `/api/auth/refresh` and rewrites it to the relative path
  before delegating to `globalThis.fetch`.
- **`verifySession` is async** in client code (was `verifyAndExtendSession`
  in the old Next.js version). The `RegistrationClient` `useEffect`
  awaits it before each fetch.

## Build & dev
- `npm run build` — Vercel adapter output in `.vercel/output/`
- `npm run dev` — Astro dev server (see `AGENTS.md` → "Running dev
  servers" for the correct background-process pattern)
- `npm run check` — `astro check` (0 errors, 1 Zod-deprecation warning
  on `social: z.string()` in `content.config.ts`)

## Environment
`web/.env.local` (gitignored):
```
PUBLIC_INSFORGE_URL=https://tij96tn9.us-west.insforge.app
PUBLIC_INSFORGE_ANON_KEY=<jwt>
```

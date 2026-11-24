<!-- BEGIN:astro-agent-rules -->
# Project: Event landings + tournament admin (Astro + React + Tailwind)

## Goal
Public event landing pages + tournament registration + admin panel for
LDU-A ULEAM.

## Editing rules
- The app lives in `web/`.
- Event data lives in `src/content/events/<slug>.json` (Zod schema in
  `src/content.config.ts`). Do not hardcode event copy in components.
- Static sections live in `src/components/*.astro`. Interactive widgets
  (registration form, admin panel, timeline animations) live in
  `src/components/*.tsx` and are mounted as React islands.
- Marketing pages (`/`, `/events/<slug>`, `/404`) use
  `export const prerender = true`. The tournament pages are server-rendered
  (default under `output: 'server'`).
- Animations: subtle, elegant `framer-motion` (reveal, stagger, timeline).
  Use the existing `<Reveal client:load>` wrapper, not raw `motion.div`s.
- Visual style: neutral and elegant (dark background, muted text, soft
  borders, gentle blur). Tokens live in `src/styles/global.css`.

## Auth & data
- Neon Auth (Managed Better Auth) is called from the browser through
  `@/lib/neon/client` (`neon.auth.*`) and `@/lib/neon/auth`
  (`signInAdmin`). There are no auth API routes.
- Database reads/writes go through the Neon Data API with the same client:
  `neon.from("table")...` and `neon.rpc("fn")`. RLS enforces access, so
  writes must be checked against `public.is_admin()` in SQL, not only in UI.
- Users live in `neon_auth."user"`; roles live in `public.profiles`
  (`id` = auth user id). Do not add a second user table.
- `postgrest-js` shapes: inserts take an array, updates take one object.
- The middleware was removed; there are no server-gated routes. Public pages
  work because the client is created with `allowAnonymous: true`.

## Do not
- Do not delete or move `public/icon.png?icon.0zbxbt_8_e007.png` — it's
  the original favicon referenced in production.
- Do not commit `.env.local`, `.neon`, `.vercel/`, `.astro/`.
- Do not introduce a `.tsx` extension on imports (Astro/Vite handles
  this; explicit extensions break module resolution).
- Do not query the database from server code with the anon key; browser
  code uses `neon.from(...)`, and server-side SQL uses `neon psql`/a driver
  with `DATABASE_URL`.
<!-- END:astro-agent-rules -->



## Running dev servers (Windows)

`astro dev`, `next dev`, `vite`, and other long-running servers MUST run in
the background, never via `Start-Process`, `cmd.exe /c`, or piped
`Get-Content` on a log file. Those patterns block the PowerShell session and
cause the tool to time out.

- In this harness, use the shell tool's background mode:
  `cd web; npm run dev`.
- Astro 7 daemonizes the dev server and prints the PID plus `astro dev
  status` / `astro dev logs` / `astro dev stop` commands.
- Verify the server is up in a separate call:
  `Test-NetConnection -ComputerName localhost -Port 4321`.
- If you must use PowerShell jobs in a single session, `Start-Job` returns
  immediately — do not wait on it in the same call.
- `curl` from PowerShell is `curl.exe` (the real one). `Invoke-WebRequest`
  has incompatible flag names.

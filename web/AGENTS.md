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
  `export const prerender = true`. The tournament pages and auth API
  routes are server-rendered (default under `output: 'server'`).
- Animations: subtle, elegant `framer-motion` (reveal, stagger, timeline).
  Use the existing `<Reveal client:load>` wrapper, not raw `motion.div`s.
- Visual style: neutral and elegant (dark background, muted text, soft
  borders, gentle blur). Tokens live in `src/styles/global.css`.

## Auth
- Server actions under `src/pages/api/auth/*`; do NOT call the InsForge
  backend directly from client code.
- Use the browser client from `@/lib/insforge/browser` for SDK reads
  (`insforge.database.from(...)`, `insforge.auth.getCurrentUser()`).
- Use the server client from `@/lib/insforge/server` for SSR data
  fetches; it reads the request's `insforge_access_token` cookie.
- The middleware (`src/middleware.ts`) only guards `/admin/*`. Public
  pages do not require a session.

## Do not
- Do not delete or move `public/icon.png?icon.0zbxbt_8_e007.png` — it's
  the original favicon referenced in production.
- Do not commit `.env.local`, `.insforge/`, `.vercel/`, or `.astro/`.
- Do not introduce a `.tsx` extension on imports (Astro/Vite handles
  this; explicit extensions break module resolution).
- Do not call the InsForge backend directly from the browser — always
  proxy through the app's `/api/auth/*` routes or `insforge.*` SDK calls.
<!-- END:astro-agent-rules -->

<!-- INSFORGE:START -->
## InsForge backend

This project uses [InsForge](https://insforge.dev): an all-in-one, open-source Postgres-based backend (BaaS) that gives this app a database, authentication, file storage, edge functions, realtime, an AI model gateway, and payments through one platform.

- **Project:** **ProyectoLDUA** (API base `https://tij96tn9.us-west.insforge.app`)
- **Skills:** these InsForge skills are installed for supported coding agents. Reach for them before implementing any InsForge feature instead of guessing the API:
  - `insforge`: app code with the `@insforge/sdk` client (database CRUD, auth, storage, edge functions, realtime, AI, email, and Stripe payments).
  - `insforge-cli`: backend and infrastructure via the `insforge` CLI (projects, SQL, migrations, RLS policies, storage buckets, functions, secrets, payment setup, schedules, deploys).
  - `insforge-debug`: diagnosing failures (SDK/HTTP errors, RLS denials, login/OAuth/auth errors) and running security or performance audits.
  - `insforge-integrations`: wiring external auth providers (Clerk, Auth0, WorkOS, Better Auth, etc.) for JWT-based RLS, or the OKX x402 payment facilitator.
  - `find-skills`: discovering additional skills on demand.
- **Credentials:** app code reads keys from `.env.local`; the CLI reads `.insforge/project.json`. Never hardcode or commit keys.

Key patterns:

- Database inserts take an array: `insert([{ ... }])`.
- Reference users with `auth.users(id)`; use `auth.uid()` in RLS policies.
- For storage uploads, persist both the returned `url` and `key`.
<!-- INSFORGE:END -->

## Running dev servers (Windows)

`astro dev`, `next dev`, `vite`, and other long-running servers MUST be
launched in a background job, never via `Start-Process`, `cmd.exe /c`,
or piped `Get-Content` on a log file. Those patterns block the
PowerShell session and cause the opencode tool to time out.

Correct pattern:

```powershell
Start-Job -ScriptBlock {
  Set-Location "C:\Users\Alejandro-md\Desktop\ProyectoLDUa\web"
  npx astro dev --port 4321 > $null 2>&1
}
```

- `Start-Job` returns immediately with a job object — do not wait on it
  in the same call.
- Verify the server is up in a separate call:
  `Test-NetConnection -ComputerName localhost -Port 4321`
- To stop: `Get-Process node | Stop-Process -Force` then
  `Get-Job | Stop-Job -PassThru | Remove-Job`.
- For logs you need to read, redirect to a file:
  `npx astro dev --port 4321 *> "C:\path\to\dev.log"` (note the `*>` for
  merged stdout+stderr in PowerShell).
- `curl` from PowerShell is `curl.exe` (the real one). `Invoke-WebRequest`
  has incompatible flag names.

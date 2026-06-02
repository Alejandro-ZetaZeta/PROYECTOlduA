<!-- BEGIN:nextjs-agent-rules -->
# Project: Event landings (Next.js + Tailwind)

## Goal
Static landing pages per event for LDU-A ULEAM.

## Editing rules
- The app lives in `web/`.
- Each event is its own route under `app/events/<slug>/`.
- Keep all event copy and schedule data in `content.ts` (single source of truth).
- Do not implement registrations yet.
- Animations: subtle, elegant `framer-motion` (reveal, stagger, timeline).
- Visual style: neutral and elegant (dark background, soft borders, gentle blur).

## Per-event convention
Minimum structure:
- `app/events/<slug>/page.tsx`
- `app/events/<slug>/content.ts`
- `app/events/<slug>/sections/*`
- `app/events/<slug>/components/*` (only when event-specific)

## Global
- Home page event cards are driven by `lib/events.ts`.
<!-- END:nextjs-agent-rules -->

<!-- INSFORGE:START -->
## InsForge backend

This project uses [InsForge](https://insforge.dev): an all-in-one, open-source Postgres-based backend (BaaS) that gives this app a database, authentication, file storage, edge functions, realtime, an AI model gateway, and payments through one platform.

- **Project:** **ProyectoLDUA** (API base `https://tij96tn9.us-west.insforge.app`)
- **Skills:** these InsForge skills are installed for supported coding agents. Reach for them before implementing any InsForge feature instead of guessing the API:
  - `insforge`: app code with the `@insforge/sdk` client (database CRUD, auth, storage, edge functions, realtime, AI, email, and Stripe payments).
  - `insforge-cli`: backend and infrastructure via the `insforge` CLI (projects, SQL, migrations, RLS policies, storage buckets, functions, secrets, payment setup, schedules, deploys).
  - `insforge-debug`: diagnosing failures (SDK/HTTP errors, RLS denials, auth and OAuth issues) and running security or performance audits.
  - `insforge-integrations`: wiring external auth providers (Clerk, Auth0, WorkOS, Better Auth, etc.) for JWT-based RLS, or the OKX x402 payment facilitator.
  - `find-skills`: discovering additional skills on demand.
- **Credentials:** app code reads keys from `.env.local`; the CLI reads `.insforge/project.json`. Never hardcode or commit keys.

Key patterns:

- Database inserts take an array: `insert([{ ... }])`.
- Reference users with `auth.users(id)`; use `auth.uid()` in RLS policies.
- For storage uploads, persist both the returned `url` and `key`.
<!-- INSFORGE:END -->

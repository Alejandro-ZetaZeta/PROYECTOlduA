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

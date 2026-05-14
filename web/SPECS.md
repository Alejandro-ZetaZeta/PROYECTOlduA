# Specs

## Product
Multi-event static marketing site for LDU-A ULEAM.

## Architecture
- Next.js App Router
- Tailwind CSS v4 (CSS-first config in `app/globals.css`)
- Event routes live under `app/events/<slug>/`
- Home page lists events and links to their landing pages

## Event contract
Each event must have:
- `content.ts`: all copy + structured data (timeline stops, contacts)
- `page.tsx`: composes sections using only `content.ts`

## Design
- Neutral, elegant palette (dark background, muted text, soft borders)
- Premium typography: display font for headings, sans for body
- Sections should feel spaced and calm; avoid noisy gradients

## Motion
- Use Framer Motion for:
  - Reveal on scroll (fade + slight Y)
  - Timeline progress fill
- Keep durations ~0.5-0.7s and avoid large parallax

## Backend
Insforge will be integrated later. Do not add registration flows yet.

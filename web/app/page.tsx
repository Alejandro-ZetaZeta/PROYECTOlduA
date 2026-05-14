import Link from "next/link";

import { events } from "@/lib/events";

export default function Home() {
  return (
    <div className="flex flex-1">
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 py-16 sm:px-10">
        <header className="flex flex-col gap-4">
          <p className="text-sm tracking-[0.25em] text-muted">
            LDU-A ULEAM · Extensión Chone
          </p>
          <h1 className="text-balance font-[var(--font-display)] text-4xl leading-[1.05] tracking-tight sm:text-6xl">
            Eventos
          </h1>
          <p className="max-w-2xl text-pretty text-base leading-7 text-muted sm:text-lg">
            Actividades para impulsar el deporte, la integración estudiantil y la
            comunidad.
          </p>
        </header>

        <section className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <Link
              key={event.slug}
              href={event.href}
              className="group relative overflow-hidden rounded-2xl border border-card-border bg-card p-6 transition-transform duration-300 hover:-translate-y-1"
            >
              <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <div className="absolute -left-24 -top-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                <div className="absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
              </div>

              <div className="relative flex h-full flex-col gap-3">
                <p className="text-xs tracking-[0.22em] text-muted">
                  {event.dateRange.toUpperCase()}
                </p>
                <h2 className="font-[var(--font-display)] text-3xl tracking-tight">
                  {event.title}
                </h2>
                <p className="text-sm leading-6 text-muted">{event.tagline}</p>
                <div className="mt-2 inline-flex w-fit items-center gap-2 rounded-full border border-card-border bg-white/5 px-4 py-2 text-sm">
                  Ver landing
                  <span className="transition-transform duration-300 group-hover:translate-x-0.5">
                    →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </section>
      </main>
    </div>
  );
}

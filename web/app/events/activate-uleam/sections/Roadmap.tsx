import { Reveal } from "../components/Reveal";
import { Timeline } from "../components/Timeline";
import type { activateUleam } from "../content";

type Props = {
  roadmap: (typeof activateUleam)["roadmap"];
};

export function Roadmap({ roadmap }: Props) {
  return (
    <section className="relative mx-auto w-full max-w-6xl px-6 py-16 sm:px-10 sm:py-24">
      <Reveal>
        <p className="text-xs tracking-[0.32em] text-gold">
          {roadmap.kicker.toUpperCase()}
        </p>
      </Reveal>

      <Reveal delay={0.06}>
        <h2 className="mt-5 font-[var(--font-display)] text-3xl tracking-tight text-foreground sm:text-4xl">
          {roadmap.title}
        </h2>
      </Reveal>

      <Reveal delay={0.12}>
        <p className="mt-4 max-w-2xl text-pretty text-sm leading-[1.8] text-muted sm:text-base">
          Una secuencia cronológica de actividades para activar el campus y
          fortalecer nuestra comunidad.
        </p>
      </Reveal>

      <Timeline stops={roadmap.stops} />
    </section>
  );
}

import { Reveal } from "../components/Reveal";
import type { activateUleam } from "../content";

type Props = {
  cta: (typeof activateUleam)["cta"];
};

export function CTA({ cta }: Props) {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 pb-16 sm:px-10 sm:pb-20">
      <div className="relative overflow-hidden rounded-3xl border border-card-border bg-card p-8 sm:p-12">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        </div>

        <div className="relative">
          <Reveal>
            <p className="text-xs tracking-[0.25em] text-muted">CIERRE</p>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="mt-4 text-balance font-[var(--font-display)] text-3xl tracking-tight sm:text-4xl">
              {cta.title}
            </h2>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="mt-6 flex flex-wrap gap-2">
              {cta.pillars.map((p) => (
                <span
                  key={p}
                  className="rounded-full border border-card-border bg-white/5 px-4 py-2 text-sm text-foreground/90"
                >
                  {p}
                </span>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

import { Reveal } from "../components/Reveal";
import type { activateUleam } from "../content";

type Props = {
  cta: (typeof activateUleam)["cta"];
};

export function CTA({ cta }: Props) {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 pb-16 sm:px-10 sm:pb-24">
      <div
        className="relative overflow-hidden rounded-2xl border p-5 backdrop-blur-sm sm:rounded-3xl sm:p-14"
        style={{
          borderColor: "rgba(196,163,90,0.22)",
          background:
            "linear-gradient(135deg, rgba(196,163,90,0.06) 0%, rgba(255,255,255,0.03) 60%, rgba(196,163,90,0.04) 100%)",
        }}
      >
        {/* Subtle inner glow */}
        <div
          className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full blur-3xl"
          style={{ background: "rgba(196,163,90,0.08)" }}
        />
        <div
          className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full blur-3xl"
          style={{ background: "rgba(196,163,90,0.06)" }}
        />

        <div className="relative">
          <Reveal>
            <div className="flex items-center gap-3">
              <div
                className="h-px w-8"
                style={{ background: "rgba(196,163,90,0.55)" }}
              />
              <p className="text-[0.65rem] tracking-[0.34em] text-gold">
                CIERRE
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.06}>
            <h2 className="mt-6 text-balance font-[var(--font-display)] text-3xl tracking-tight text-foreground sm:text-4xl">
              {cta.title}
            </h2>
          </Reveal>

          <Reveal delay={0.12}>
            <div className="mt-8 flex flex-wrap gap-3">
              {cta.pillars.map((p) => (
                <span
                  key={p}
                  className="rounded-full border px-5 py-2 text-sm tracking-wide text-foreground/85"
                  style={{ borderColor: "rgba(196,163,90,0.28)" }}
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

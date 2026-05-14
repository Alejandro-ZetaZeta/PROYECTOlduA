import Link from "next/link";

import { Reveal } from "../components/Reveal";
import type { activateUleam } from "../content";

type Props = {
  hero: (typeof activateUleam)["hero"];
};

export function Hero({ hero }: Props) {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 -top-32 h-[520px] w-[520px] rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -right-28 top-10 h-[460px] w-[460px] rounded-full bg-white/10 blur-3xl" />
      </div>

      <div className="mx-auto w-full max-w-6xl px-6 pt-10 sm:px-10">
        <header className="flex items-center justify-between">
          <Link href="/" className="text-sm text-muted hover:text-foreground">
            ← Eventos
          </Link>
          <p className="text-xs tracking-[0.25em] text-muted">
            LDU-A ULEAM
          </p>
        </header>
      </div>

      <div className="mx-auto flex w-full max-w-6xl flex-col px-6 pb-16 pt-14 sm:px-10 sm:pb-24 sm:pt-20">
        <Reveal>
          <p className="text-sm tracking-[0.25em] text-muted">
            {hero.subtitle1}
          </p>
        </Reveal>

        <Reveal delay={0.05}>
          <h1 className="mt-5 text-balance font-[var(--font-display)] text-4xl leading-[0.98] tracking-tight sm:text-7xl lg:text-8xl">
            {hero.title}
          </h1>
        </Reveal>

        <Reveal delay={0.1}>
          <p className="mt-5 max-w-2xl text-pretty text-base leading-7 text-muted sm:text-lg">
            {hero.subtitle2}
          </p>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="mt-8 inline-flex w-fit flex-col gap-3 rounded-2xl border border-card-border bg-card px-5 py-4">
            <p className="text-xs tracking-[0.22em] text-muted">
              PRESENTA
            </p>
            <p className="max-w-2xl text-sm leading-6 text-foreground/90">
              {hero.presentedBy}
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

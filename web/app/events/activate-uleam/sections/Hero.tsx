"use client";

import { motion } from "framer-motion";

import { easeOutQuint } from "@/lib/animations";
import { Reveal } from "../components/Reveal";
import type { activateUleam } from "../content";

type Props = {
  hero: (typeof activateUleam)["hero"];
};

export function Hero({ hero }: Props) {
  return (
    <section className="relative pb-20 pt-12 sm:pb-28 sm:pt-20 lg:pb-36 lg:pt-28">
      <div className="mx-auto w-full max-w-6xl px-6 sm:px-10">

        {/* Institution logos — slide in from each end */}
        <div className="mb-8 flex items-center justify-between sm:mb-10">
          <motion.img
            src="/LOGO-ULEAM.svg"
            alt="ULEAM"
            className="h-12 w-auto opacity-80 invert md:h-16 lg:h-24"
            initial={{ opacity: 0, x: -28 }}
            whileInView={{ opacity: 0.8, x: 0 }}
            viewport={{ once: false, margin: "0px 0px -6% 0px" }}
            transition={{ duration: 0.6, ease: easeOutQuint }}
          />
          <motion.img
            src="/LDUA_BLANCO.png"
            alt="LDU-A"
            className="h-12 w-auto opacity-80 md:h-16 lg:h-24"
            initial={{ opacity: 0, x: 28 }}
            whileInView={{ opacity: 0.8, x: 0 }}
            viewport={{ once: false, margin: "0px 0px -6% 0px" }}
            transition={{ duration: 0.6, ease: easeOutQuint }}
          />
        </div>

        {/* Kicker: reduced tracking on mobile to prevent overflow */}
        <Reveal>
          <p className="text-[0.6rem] tracking-[0.18em] text-gold sm:text-xs sm:tracking-[0.32em]">
            LDU-A ULEAM &nbsp;·&nbsp; {hero.subtitle1}
          </p>
        </Reveal>

        <Reveal delay={0.07}>
          <h1 className="mt-7 text-balance text-center font-kunaroh text-5xl leading-[0.94] tracking-[0.04em] text-foreground sm:text-7xl lg:text-[7rem] xl:text-[8rem]">
            {hero.title}
          </h1>
        </Reveal>

        <Reveal delay={0.14}>
          <p className="mt-5 max-w-xl text-pretty text-sm leading-[1.8] text-muted sm:mt-7 sm:text-base lg:text-lg">
            {hero.subtitle2}
          </p>
        </Reveal>

        <Reveal delay={0.2}>
          <div className="mt-8 inline-flex flex-col gap-2 border-l-2 border-gold/40 pl-5 sm:mt-10">
            <p className="text-[0.6rem] tracking-[0.3em] text-gold/70 sm:text-[0.65rem] sm:tracking-[0.34em]">
              PRESENTA
            </p>
            <p className="max-w-lg text-xs leading-[1.75] text-foreground/75 sm:text-sm">
              {hero.presentedBy}
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.26}>
          <div className="mt-10 h-px w-20 bg-gradient-to-r from-gold/50 to-transparent sm:mt-12" />
        </Reveal>

      </div>
    </section>
  );
}

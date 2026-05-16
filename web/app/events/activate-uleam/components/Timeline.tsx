"use client";

import { motion } from "framer-motion";

import type { RoadmapStop } from "../content";
import { easeOutQuint } from "@/lib/animations";

export function Timeline({ stops }: { stops: RoadmapStop[] }) {
  return (
    <div className="relative mt-14 pl-10 sm:pl-0">
      {/* Track */}
      <div className="absolute left-3 top-0 h-full w-px bg-white/8 sm:left-1/2 sm:-translate-x-1/2" />
      {/* Fill */}
      <motion.div
        className="absolute left-3 top-0 h-full w-px origin-top sm:left-1/2 sm:-translate-x-1/2"
        initial={{ scaleY: 0 }}
        whileInView={{ scaleY: 1 }}
        viewport={{ once: false, margin: "0px 0px -15% 0px" }}
        transition={{ duration: 1.4, ease: easeOutQuint }}
        style={{
          background:
            "linear-gradient(to bottom, #c4a35a 0%, rgba(196,163,90,0.25) 100%)",
        }}
      />

      <div className="flex flex-col gap-6 sm:gap-9">
        {stops.map((stop, idx) => {
          const isLeft = idx % 2 === 0;
          const wrapperClass = isLeft
            ? "sm:w-[calc(50%-1rem)] sm:pr-10"
            : "sm:w-[calc(50%-1rem)] sm:pl-10 sm:ml-auto";

          return (
            <motion.div
              key={`${stop.date}-${stop.title}`}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, margin: "0px 0px -8% 0px" }}
              transition={{ duration: 0.58, ease: easeOutQuint }}
              className={`relative w-full ${wrapperClass}`}
            >
              <div className="flex w-full flex-col">
                <div
                  className="rounded-2xl border border-card-border bg-card p-5 backdrop-blur-sm sm:max-w-[520px]"
                >
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                    <p className="text-[0.65rem] tracking-[0.28em] text-gold">
                      {stop.date.toUpperCase()}
                    </p>
                    {stop.highlight ? (
                      <span className="rounded-full border border-gold/30 bg-gold/10 px-3 py-0.5 text-[0.6rem] tracking-[0.18em] text-gold">
                        {stop.highlight}
                      </span>
                    ) : null}
                  </div>

                  <h3 className="mt-3 font-[var(--font-display)] text-xl tracking-tight text-foreground sm:text-[1.35rem]">
                    {stop.title}
                  </h3>

                  {(stop.location || stop.time || stop.details) && (
                    <div className="mt-3 flex flex-col gap-1.5 text-sm leading-[1.75] text-muted">
                      {stop.location ? <p>{stop.location}</p> : null}
                      {stop.time ? <p>{stop.time}</p> : null}
                      {stop.details ? <p>{stop.details}</p> : null}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

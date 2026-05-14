"use client";

import * as React from "react";
import { motion, useScroll, useTransform } from "framer-motion";

import type { RoadmapStop } from "../content";
import { easeOutQuint } from "@/lib/animations";

export function Timeline({ stops }: { stops: RoadmapStop[] }) {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.85", "end 0.25"],
  });
  const lineScale = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <div ref={ref} className="relative mt-10 pl-10 sm:pl-0">
      <div className="absolute left-3 top-0 h-full w-px bg-white/10 sm:left-1/2 sm:-translate-x-1/2" />
      <motion.div
        className="absolute left-3 top-0 h-full w-px origin-top bg-white/40 sm:left-1/2 sm:-translate-x-1/2"
        style={{ scaleY: lineScale }}
      />

      <div className="flex flex-col gap-6">
        {stops.map((stop, idx) => {
          const side = idx % 2 === 0 ? "sm:pr-12 sm:items-end" : "sm:pl-12";
          const cardSide =
            idx % 2 === 0
              ? "sm:mr-[calc(50%+12px)]"
              : "sm:ml-[calc(50%+12px)]";

          return (
            <motion.div
              key={`${stop.date}-${stop.title}`}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-12% 0px -12% 0px" }}
              transition={{ duration: 0.55, ease: easeOutQuint }}
              className={`relative flex w-full ${cardSide}`}
            >
              <span className="absolute left-3 top-8 h-2 w-2 rounded-full bg-white/70 sm:left-1/2 sm:-translate-x-1/2" />
              <div className={`flex w-full flex-col ${side}`}>
                <div className="relative rounded-2xl border border-card-border bg-card p-5 sm:max-w-[520px]">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                    <p className="text-xs tracking-[0.22em] text-muted">
                      {stop.date.toUpperCase()}
                    </p>
                    {stop.highlight ? (
                      <span className="rounded-full border border-card-border bg-white/5 px-3 py-1 text-xs tracking-[0.18em]">
                        {stop.highlight}
                      </span>
                    ) : null}
                  </div>

                  <h3 className="mt-3 font-[var(--font-display)] text-xl tracking-tight sm:text-2xl">
                    {stop.title}
                  </h3>

                  <div className="mt-3 flex flex-col gap-1.5 text-sm leading-6 text-muted">
                    {stop.location ? <p>{stop.location}</p> : null}
                    {stop.time ? <p>{stop.time}</p> : null}
                    {stop.details ? <p>+ {stop.details}</p> : null}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

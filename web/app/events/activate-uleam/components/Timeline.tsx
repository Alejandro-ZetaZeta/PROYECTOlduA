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
    <div ref={ref} className="relative mt-14 pl-10 sm:pl-0">
      {/* Track */}
      <div className="absolute left-3 top-0 h-full w-px bg-white/8 sm:left-1/2 sm:-translate-x-1/2" />
      {/* Fill */}
      <motion.div
        className="absolute left-3 top-0 h-full w-px origin-top sm:left-1/2 sm:-translate-x-1/2"
        style={{
          scaleY: lineScale,
          background:
            "linear-gradient(to bottom, #c4a35a 0%, rgba(196,163,90,0.25) 100%)",
        }}
      />

      <div className="flex flex-col gap-6 sm:gap-9">
        {stops.map((stop, idx) => {
          const side = idx % 2 === 0 ? "sm:pr-12 sm:items-end" : "sm:pl-12";
          const cardSide =
            idx % 2 === 0
              ? "sm:mr-[calc(50%+12px)]"
              : "sm:ml-[calc(50%+12px)]";

          return (
            <motion.div
              key={`${stop.date}-${stop.title}`}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-12% 0px -12% 0px" }}
              transition={{ duration: 0.58, ease: easeOutQuint }}
              className={`relative flex w-full ${cardSide}`}
            >
              {/* Dot */}
              <span
                className="absolute left-3 top-[1.85rem] h-2.5 w-2.5 rounded-full border border-gold bg-background sm:left-1/2 sm:-translate-x-1/2"
                style={{ boxShadow: "0 0 10px rgba(196,163,90,0.45)" }}
              />

              <div className={`flex w-full flex-col ${side}`}>
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

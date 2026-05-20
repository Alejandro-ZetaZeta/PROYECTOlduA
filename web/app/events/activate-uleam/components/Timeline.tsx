"use client";

import * as React from "react";
import { motion, useScroll, useTransform } from "framer-motion";

import type { RoadmapStop } from "../content";
import { easeOutQuint } from "@/lib/animations";

// May 22 2026 17:00 Guayaquil time (UTC-5)
const SEMINAR_TARGET = new Date("2026-05-22T22:00:00Z");

function useCountdown(target: Date) {
  const calc = () => Math.max(0, Math.floor((target.getTime() - Date.now()) / 1000));
  const [secs, setSecs] = React.useState(calc);
  React.useEffect(() => {
    const id = setInterval(() => setSecs(calc), 1000);
    return () => clearInterval(id);
  }, []);
  return {
    days: Math.floor(secs / 86400),
    hours: Math.floor((secs % 86400) / 3600),
    minutes: Math.floor((secs % 3600) / 60),
    seconds: secs % 60,
    done: secs === 0,
  };
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="min-w-[2ch] rounded-md border border-gold/25 bg-gold/8 px-2 py-1 text-center font-mono text-base font-semibold tabular-nums text-gold sm:text-lg">
        {String(value).padStart(2, "0")}
      </span>
      <span className="text-[0.55rem] tracking-[0.18em] text-muted/70 uppercase">{label}</span>
    </div>
  );
}

function SeminarCountdown() {
  const { days, hours, minutes, seconds, done } = useCountdown(SEMINAR_TARGET);
  return (
    <div className="mt-4 border-t border-white/8 pt-4">
      {done ? (
        <p className="text-center text-xs text-gold">¡El evento ha comenzado!</p>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <p className="text-[0.6rem] tracking-[0.22em] text-muted/60 uppercase">Comienza en</p>
          <div className="flex gap-2.5">
            <CountdownUnit value={days} label="días" />
            <CountdownUnit value={hours} label="horas" />
            <CountdownUnit value={minutes} label="min" />
            <CountdownUnit value={seconds} label="seg" />
          </div>
        </div>
      )}
    </div>
  );
}

export function Timeline({ stops }: { stops: RoadmapStop[] }) {
  const ref = React.useRef<HTMLDivElement>(null);

  // useScroll() with no target tracks window scroll — no container check, no warning.
  // We compute the fill range from the element's measured document position instead.
  const { scrollY } = useScroll();
  const [range, setRange] = React.useState<[number, number]>([0, 1]);

  React.useEffect(() => {
    const update = () => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const top = rect.top + window.scrollY;
      const vh = window.innerHeight;
      setRange([top - vh * 0.85, top + rect.height - vh * 0.25]);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const lineScale = useTransform(scrollY, range, [0, 1], { clamp: true });

  return (
    <div ref={ref} className="relative mt-14 pl-10 sm:pl-0">
      {/* Track */}
      <div className="absolute left-3 top-0 h-full w-0.5 bg-white/8 sm:left-1/2 sm:-translate-x-1/2" />
      {/* Fill — gradient bright at bottom so the leading tip glows */}
      <motion.div
        className="absolute left-3 top-0 h-full w-0.5 origin-top sm:left-1/2 sm:-translate-x-1/2"
        style={{
          scaleY: lineScale,
          background: "linear-gradient(to bottom, rgba(196,163,90,0.3) 0%, #c4a35a 70%, #f0d485 100%)",
          boxShadow: "0 0 8px 2px rgba(196,163,90,0.6)",
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
                    {idx > 0 && (
                      <span className="rounded-full border border-white/15 bg-white/5 px-3 py-0.5 text-[0.6rem] tracking-[0.18em] text-muted/80">
                        PRÓXIMAMENTE
                      </span>
                    )}
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
                  {idx === 0 && <SeminarCountdown />}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

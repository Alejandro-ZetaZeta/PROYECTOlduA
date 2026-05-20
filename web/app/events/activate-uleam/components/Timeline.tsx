"use client";

import * as React from "react";
import Image from "next/image";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";

import type { RoadmapStop } from "../content";
import { easeOutQuint } from "@/lib/animations";

// May 22 2026 17:00 Guayaquil time (UTC-5)
const SEMINAR_TARGET = new Date("2026-05-22T22:00:00Z");

function useCountdown(target: Date) {
  const calc = () => Math.max(0, Math.floor((target.getTime() - Date.now()) / 1000));
  const [secs, setSecs] = React.useState(0);
  React.useEffect(() => {
    setSecs(calc());
    const id = setInterval(() => setSecs(calc()), 1000);
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

const SEMINAR_IMG = "/SEMINARIO_DEFE.jpeg";

function ImageLightbox({ open, onClose }: { open: boolean; onClose: () => void }) {
  React.useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.88, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.88, opacity: 0 }}
            transition={{ duration: 0.28, ease: easeOutQuint }}
            className="relative max-h-[90vh] max-w-[90vw]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={SEMINAR_IMG}
              alt="Seminario de autodefensa"
              width={1200}
              height={900}
              className="max-h-[85vh] w-auto rounded-xl object-contain shadow-2xl"
              priority
            />
            <button
              onClick={onClose}
              className="absolute -right-3 -top-3 flex h-7 w-7 items-center justify-center rounded-full border border-white/20 bg-black/70 text-white/80 hover:text-white"
              aria-label="Cerrar"
            >
              ✕
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function SeminarImagePanel({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label="Ver imagen del seminario"
      className="group relative hidden h-full w-full cursor-zoom-in overflow-hidden rounded-2xl md:block"
    >
      <Image
        src={SEMINAR_IMG}
        alt="Seminario de autodefensa"
        fill
        loading="eager"
        className="object-contain transition-transform duration-500 group-hover:scale-105"
        sizes="(max-width: 1280px) 40vw, 30vw"
      />
      <div className="absolute inset-0 bg-black/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    </button>
  );
}

function CardInner({
  stop,
  idx,
  onEyeClick,
}: {
  stop: RoadmapStop;
  idx: number;
  onEyeClick: () => void;
}) {
  return (
    <div className="relative rounded-2xl border border-card-border bg-card p-5 backdrop-blur-sm sm:max-w-[520px]">
      {idx === 0 && (
        <button
          onClick={onEyeClick}
          aria-label="Ver imagen del seminario"
          className="absolute right-3 top-3 flex items-center justify-center rounded-full border border-white/15 bg-white/5 p-1.5 text-muted/80 transition-colors hover:border-gold/30 hover:text-gold md:hidden"
        >
          <EyeIcon />
        </button>
      )}
      <div className={`flex flex-wrap items-center gap-x-3 gap-y-2 ${idx === 0 ? "pr-10 md:pr-0" : ""}`}>
        <p className="text-[0.65rem] tracking-[0.28em] text-gold">{stop.date.toUpperCase()}</p>
        {stop.highlight ? (
          <span className="rounded-full border border-gold/30 bg-gold/10 px-3 py-0.5 text-[0.6rem] tracking-[0.18em] text-gold">
            {stop.highlight}
          </span>
        ) : null}
        {idx > 0 && (
          <span className="rounded-full border border-gold/30 bg-gold/20 px-3 py-0.5 text-[0.6rem] tracking-[0.18em] text-muted/80">
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
  );
}

function EyeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function Timeline({ stops }: { stops: RoadmapStop[] }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [lightboxOpen, setLightboxOpen] = React.useState(false);

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
    <>
    <ImageLightbox open={lightboxOpen} onClose={() => setLightboxOpen(false)} />
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

          // For the seminar card (idx===0): expand to full width so the image
          // can occupy the opposite half of the timeline on xl screens.
          const motionClass = idx === 0 ? "relative w-full" : `relative w-full ${wrapperClass}`;

          // Card slot always uses its normal half-column classes.
          // Image slot mirrors the opposite half.
          const imageSlotClass = isLeft
            ? "sm:w-[calc(50%-1rem)] sm:pl-10 sm:ml-auto"
            : "sm:w-[calc(50%-1rem)] sm:pr-10";

          return (
            <motion.div
              key={`${stop.date}-${stop.title}`}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, margin: "0px 0px -8% 0px" }}
              transition={{ duration: 0.58, ease: easeOutQuint }}
              className={motionClass}
            >
              {/* xl: card in its half + image in the opposite half */}
              {idx === 0 && (
                <div className={`hidden md:flex items-stretch gap-0 ${isLeft ? "flex-row" : "flex-row-reverse"}`}>
                  {/* Card half */}
                  <div className={`${wrapperClass} flex flex-col`}>
                    <CardInner stop={stop} idx={idx} onEyeClick={() => setLightboxOpen(true)} />
                  </div>
                  {/* Image half */}
                  <div className={`${imageSlotClass} flex items-center justify-center`}>
                    <SeminarImagePanel onClick={() => setLightboxOpen(true)} />
                  </div>
                </div>
              )}

              {/* Below xl (or non-seminar cards): normal layout */}
              <div className={idx === 0 ? "md:hidden" : ""}>
                <CardInner stop={stop} idx={idx} onEyeClick={() => setLightboxOpen(true)} />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
    </>
  );
}

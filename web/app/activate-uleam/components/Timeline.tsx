"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";

import type { RoadmapStop } from "../content";
import { easeOutQuint } from "@/lib/animations";

// May 22 2026 17:00 Guayaquil time (UTC-5)
const SEMINAR_TARGET = new Date("2026-05-22T22:00:00Z");

// June 13 2026 09:00 UTC-5
const TOURNAMENT_TARGET = new Date("2026-06-13T14:00:00Z");

function useCountdown(target: Date) {
  const calc = () => Math.max(0, Math.floor((target.getTime() - Date.now()) / 1000));
  const [secs, setSecs] = React.useState<number | null>(null);
  
  React.useEffect(() => {
    setSecs(calc());
    const id = setInterval(() => setSecs(calc()), 1000);
    return () => clearInterval(id);
  }, []);

  if (secs === null) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, done: false, isReady: false };
  }

  return {
    days: Math.floor(secs / 86400),
    hours: Math.floor((secs % 86400) / 3600),
    minutes: Math.floor((secs % 3600) / 60),
    seconds: secs % 60,
    done: secs === 0,
    isReady: true,
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
  const { days, hours, minutes, seconds, done, isReady } = useCountdown(SEMINAR_TARGET);
  
  return (
    <div className="mt-4 border-t border-white/8 pt-4">
      {!isReady ? (
        <div className="h-[60px]" /> /* Skeleton / space placeholder */
      ) : done ? (
        <p className="text-center text-xs text-gold">El evento ya pasó.</p>
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

function TournamentCountdown() {
  const { days, hours, minutes, seconds, done, isReady } = useCountdown(TOURNAMENT_TARGET);

  return (
    <div className="mt-4 border-t border-white/8 pt-4">
      {!isReady ? (
        <div className="h-[60px]" />
      ) : done ? (
        <p className="text-center text-xs text-gold">El evento ya pasó.</p>
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

const TOURNAMENT_IMG_HOR = "/RELAMPAGO_HOR.jpeg";
const TOURNAMENT_IMG_VER = "/RELAMPAGO_VER.jpeg";
const RACE_IMG = "/5kPROX.jpeg";
const SEMINAR_VIDEO_ID = "xacpk5u";
const SEMINAR_EMBED = `https://www.dailymotion.com/embed/video/${SEMINAR_VIDEO_ID}?quality=2160`;

function ImageLightbox({
  open,
  onClose,
  srcHor,
  srcVer,
  alt,
}: {
  open: boolean;
  onClose: () => void;
  srcHor: string;
  srcVer: string;
  alt: string;
}) {
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
            {/* Desktop: horizontal image */}
            <div className="hidden md:block">
              <Image
                src={srcHor}
                alt={alt}
                width={1200}
                height={900}
                className="max-h-[85vh] w-auto rounded-xl object-contain shadow-2xl"
              />
            </div>
            {/* Mobile: vertical image */}
            <div className="block md:hidden">
              <Image
                src={srcVer}
                alt={alt}
                width={900}
                height={1200}
                className="max-h-[80vh] w-auto rounded-xl object-contain shadow-2xl"
              />
            </div>
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

function VideoModal({ open, onClose }: { open: boolean; onClose: () => void }) {
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8"
          style={{ backdropFilter: "blur(20px)", background: "rgba(0,0,0,0.75)" }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.88, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.88, opacity: 0 }}
            transition={{ duration: 0.3, ease: easeOutQuint }}
            className="relative w-full max-w-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full overflow-hidden rounded-2xl shadow-2xl" style={{ paddingBottom: "56.25%" }}>
              <iframe
                src={SEMINAR_EMBED}
                title="Seminario de defensa personal"
                allow="autoplay; fullscreen"
                referrerPolicy="strict-origin-when-cross-origin"
                className="absolute inset-0 h-full w-full border-0"
              />
            </div>
            <button
              onClick={onClose}
              className="absolute -right-3 -top-3 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-black/80 text-white/80 transition-colors hover:text-white"
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

function SeminarVideoPanel({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label="Reproducir video del seminario"
      className="group relative hidden h-full w-full min-h-[220px] cursor-pointer overflow-hidden rounded-2xl md:block"
    >
      {/* Thumbnail */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`https://www.dailymotion.com/thumbnail/video/${SEMINAR_VIDEO_ID}`}
        alt="Seminario de defensa personal"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      {/* Scrim */}
      <div className="absolute inset-0 bg-black/35 transition-opacity duration-300 group-hover:bg-black/50" />
      {/* Play button */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-white/70 bg-black/50 shadow-xl transition-all duration-300 group-hover:scale-110 group-hover:border-white group-hover:bg-black/70">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="ml-1 h-7 w-7 text-white">
            <polygon points="5,3 19,12 5,21" />
          </svg>
        </div>
      </div>
    </button>
  );
}

function TournamentImagePanel({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label="Ver imagen del torneo"
      className="group relative hidden h-full w-full cursor-zoom-in overflow-hidden rounded-2xl md:block"
    >
      <Image
        src={TOURNAMENT_IMG_HOR}
        alt="Torneo relámpago de fútbol"
        fill
        loading="eager"
        className="object-contain transition-transform duration-500 group-hover:scale-105"
        sizes="(max-width: 1280px) 40vw, 30vw"
      />
      <div className="absolute inset-0 bg-black/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    </button>
  );
}

function RaceImagePanel({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label="Ver imagen de la carrera"
      className="group relative hidden h-full w-full cursor-zoom-in overflow-hidden rounded-2xl md:block"
    >
      <Image
        src={RACE_IMG}
        alt="Gran carrera LDU 5K"
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
      {(idx === 0 || idx === 1 || idx === 2) && (
        <button
          onClick={onEyeClick}
          aria-label={idx === 0 ? "Ver video del seminario" : idx === 1 ? "Ver imagen del torneo" : "Ver imagen de la carrera"}
          className="absolute right-3 top-3 flex items-center justify-center rounded-full border border-white/15 bg-white/5 p-1.5 text-muted/80 transition-colors hover:border-gold/30 hover:text-gold md:hidden"
        >
          <EyeIcon />
        </button>
      )}
      <div className={`flex flex-wrap items-center gap-x-3 gap-y-2 ${(idx === 0 || idx === 1 || idx === 2) ? "pr-10 md:pr-0" : ""}`}>
        <p className="text-[0.65rem] tracking-[0.28em] text-gold">{stop.date.toUpperCase()}</p>
        {stop.highlight ? (
          <span className="rounded-full border border-gold/30 bg-gold/10 px-3 py-0.5 text-[0.6rem] tracking-[0.18em] text-gold">
            {stop.highlight}
          </span>
        ) : null}
        {idx > 0 && idx !== 1 && (
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
          {stop.details ? (
            <p>
              {stop.details.split("<br>").map((line, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <br />}
                  {line}
                </React.Fragment>
              ))}
            </p>
          ) : null}
        </div>
      )}
      {idx === 0 && <SeminarCountdown />}
      {idx === 1 && (
        <>
          <TournamentCountdown />
          <div className="mt-4 flex justify-center">
            <Link
              href="/activate-uleam/registro-torneo"
              className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-5 py-2 text-xs tracking-[0.18em] text-gold transition-colors hover:bg-gold/20 hover:border-gold/70"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z" />
              </svg>
              INSCRIBIRME
            </Link>
          </div>
        </>
      )}
      {idx === 2 && (
        <div className="mt-4 flex justify-center">
          <a
            href="https://jplayraces.com/event/5k-kilometros-de-vida/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-5 py-2 text-xs tracking-[0.18em] text-gold transition-colors hover:bg-gold/20 hover:border-gold/70"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            INSCRIBIRSE
          </a>
        </div>
      )}
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
  const [tournamentLightboxOpen, setTournamentLightboxOpen] = React.useState(false);
  const [raceLightboxOpen, setRaceLightboxOpen] = React.useState(false);

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
    <VideoModal open={lightboxOpen} onClose={() => setLightboxOpen(false)} />
    <ImageLightbox
      open={tournamentLightboxOpen}
      onClose={() => setTournamentLightboxOpen(false)}
      srcHor={TOURNAMENT_IMG_HOR}
      srcVer={TOURNAMENT_IMG_VER}
      alt="Torneo relámpago de fútbol"
    />
    <ImageLightbox
      open={raceLightboxOpen}
      onClose={() => setRaceLightboxOpen(false)}
      srcHor={RACE_IMG}
      srcVer={RACE_IMG}
      alt="Gran carrera LDU 5K"
    />
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

          // idx===0, idx===1 and idx===2 expand to full width so the image occupies the opposite half.
          const motionClass = (idx === 0 || idx === 1 || idx === 2) ? "relative w-full" : `relative w-full ${wrapperClass}`;

          // Image slot mirrors the opposite half of the card.
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
              {/* Desktop: card in its half + image in the opposite half */}
              {idx === 0 && (
                <div className={`hidden md:flex items-stretch gap-0 ${isLeft ? "flex-row" : "flex-row-reverse"}`}>
                  <div className={`${wrapperClass} flex flex-col`}>
                    <CardInner stop={stop} idx={idx} onEyeClick={() => setLightboxOpen(true)} />
                  </div>
                  <div className={`${imageSlotClass} flex items-center justify-center`}>
                    <SeminarVideoPanel onClick={() => setLightboxOpen(true)} />
                  </div>
                </div>
              )}
              {idx === 1 && (
                <div className="hidden md:flex flex-row items-stretch gap-0">
                  {/* Image left, card right */}
                  <div className={`${imageSlotClass} flex items-center justify-center`}>
                    <TournamentImagePanel onClick={() => setTournamentLightboxOpen(true)} />
                  </div>
                  <div className={`${wrapperClass} flex flex-col`}>
                    <CardInner stop={stop} idx={idx} onEyeClick={() => setTournamentLightboxOpen(true)} />
                  </div>
                </div>
              )}
              {idx === 2 && (
                <div className={`hidden md:flex items-stretch gap-0 ${isLeft ? "flex-row" : "flex-row-reverse"}`}>
                  <div className={`${wrapperClass} flex flex-col`}>
                    <CardInner stop={stop} idx={idx} onEyeClick={() => setRaceLightboxOpen(true)} />
                  </div>
                  <div className={`${imageSlotClass} flex items-center justify-center`}>
                    <RaceImagePanel onClick={() => setRaceLightboxOpen(true)} />
                  </div>
                </div>
              )}

              {/* Mobile: normal single-column layout */}
              <div className={(idx === 0 || idx === 1 || idx === 2) ? "md:hidden" : ""}>
                <CardInner
                  stop={stop}
                  idx={idx}
                  onEyeClick={
                    idx === 0
                      ? () => setLightboxOpen(true)
                      : idx === 1
                      ? () => setTournamentLightboxOpen(true)
                      : () => setRaceLightboxOpen(true)
                  }
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
    </>
  );
}

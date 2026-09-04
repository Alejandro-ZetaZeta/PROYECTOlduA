"use client";

import * as React from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";

import { easeOutQuint } from "@/lib/animations";

interface RoadmapStop {
  date: string;
  title: string;
  period?: string;
  historical?: boolean;
  location?: string;
  time?: string;
  highlight?: string;
  tags?: string[];
  route?: string;
  details?: string;
  videoUrl?: string;
  videoThumbnail?: string;
}

// Each pre-optimized image comes as a { src, width, height } bundle built
// by `getImage()` in Roadmap.astro. The component receives both the WebP
// and the fallback raster so it can emit a <picture> with proper
// intrinsic dimensions — zero CLS, modern format preferred.
interface OptimizedImage {
  src: string;
  width: number;
  height: number;
}

// May 22 2026 17:00 Guayaquil time (UTC-5)
const SEMINAR_TARGET = new Date("2026-05-22T22:00:00Z");

// June 13 2026 09:00 UTC-5
const TOURNAMENT_TARGET = new Date("2026-06-13T14:00:00Z");

// July 4 2026 07:00 UTC-5
const RACE_TARGET = new Date("2026-07-04T12:00:00Z");

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
        <div className="h-[60px]" />
      ) : done ? null : (
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
      ) : done ? null : (
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

function RaceCountdown() {
  const { days, hours, minutes, seconds, done, isReady } = useCountdown(RACE_TARGET);

  return (
    <div className="mt-4 border-t border-white/8 pt-4">
      {!isReady ? (
        <div className="h-[60px]" />
      ) : done ? null : (
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

function ImageLightbox({
  open,
  onClose,
  srcHor,
  srcHorFallback,
  srcVer,
  srcVerFallback,
  alt,
  widthHor,
  heightHor,
  widthVer,
  heightVer,
}: {
  open: boolean;
  onClose: () => void;
  srcHor: string;
  srcHorFallback: string;
  srcVer: string;
  srcVerFallback: string;
  alt: string;
  widthHor: number;
  heightHor: number;
  widthVer: number;
  heightVer: number;
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
            {/* Desktop: horizontal image — explicit dimensions prevent CLS. */}
            <picture>
              <source srcSet={srcHor} type="image/webp" />
              <img
                src={srcHorFallback}
                alt={alt}
                width={widthHor}
                height={heightHor}
                loading="lazy"
                decoding="async"
                className="hidden md:block max-h-[85vh] w-auto rounded-xl object-contain shadow-2xl"
              />
            </picture>
            {/* Mobile: vertical image */}
            <picture>
              <source srcSet={srcVer} type="image/webp" />
              <img
                src={srcVerFallback}
                alt={alt}
                width={widthVer}
                height={heightVer}
                loading="lazy"
                decoding="async"
                className="block md:hidden max-h-[80vh] w-auto rounded-xl object-contain shadow-2xl"
              />
            </picture>
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

function SeminarVideoPanel({
  videoUrl,
  videoThumbnail,
  videoThumbnailFallback,
  width,
  height,
}: {
  videoUrl: string;
  videoThumbnail?: string;
  videoThumbnailFallback?: string;
  width?: number;
  height?: number;
}) {
  return (
    <a
      href={videoUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Ver video del seminario en Instagram"
      className="group relative hidden h-full w-full min-h-[220px] cursor-pointer overflow-hidden rounded-2xl md:block"
    >
      {videoThumbnail ? (
        <picture>
          <source srcSet={videoThumbnail} type="image/webp" />
          {videoThumbnailFallback ? (
            <img
              src={videoThumbnailFallback}
              alt="Vista previa del seminario de defensa personal"
              width={width}
              height={height}
              loading="eager"
              decoding="async"
              fetchPriority="high"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : null}
        </picture>
      ) : (
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(196,163,90,0.18) 0%, rgba(0,0,0,0.85) 70%)",
          }}
        />
      )}
      <div className="absolute inset-0 bg-black/35 transition-opacity duration-300 group-hover:bg-black/50" />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
        {/* Instagram logo icon */}
        <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-white/70 bg-black/50 shadow-xl transition-all duration-300 group-hover:scale-110 group-hover:border-white group-hover:bg-black/70">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-7 w-7 text-white"
          >
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
            <circle cx="12" cy="12" r="4" />
            <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
          </svg>
        </div>
        <span className="rounded-full border border-white/15 bg-black/40 px-3 py-1 text-[0.6rem] tracking-[0.22em] text-white/80 uppercase backdrop-blur-sm">
          Ver en Instagram
        </span>
      </div>
    </a>
  );
}

function TournamentImagePanel({
  onClick,
  srcHor,
  srcHorFallback,
  width,
  height,
}: {
  onClick: () => void;
  srcHor: string;
  srcHorFallback: string;
  width: number;
  height: number;
}) {
  return (
    <button
      onClick={onClick}
      aria-label="Ver imagen del torneo"
      className="group relative hidden h-full w-full cursor-zoom-in overflow-hidden rounded-2xl md:block"
    >
      <picture>
        <source srcSet={srcHor} type="image/webp" />
        <img
          src={srcHorFallback}
          alt="Torneo relámpago de fútbol"
          width={width}
          height={height}
          loading="eager"
          decoding="async"
          fetchPriority="high"
          className="absolute inset-0 h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
        />
      </picture>
      <div className="absolute inset-0 bg-black/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    </button>
  );
}

function RaceTikTokPanel({
  videoUrl,
  videoThumbnail,
  videoThumbnailFallback,
  width,
  height,
}: {
  videoUrl: string;
  videoThumbnail?: string;
  videoThumbnailFallback?: string;
  width?: number;
  height?: number;
}) {
  return (
    <a
      href={videoUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Ver fotos de la carrera LDU 5K en TikTok"
      className="group relative hidden h-full w-full min-h-[220px] cursor-pointer overflow-hidden rounded-2xl md:block"
    >
      {videoThumbnail ? (
        <picture>
          <source srcSet={videoThumbnail} type="image/webp" />
          {videoThumbnailFallback ? (
            <img
              src={videoThumbnailFallback}
              alt="Vista previa de la carrera LDU 5K"
              width={width}
              height={height}
              loading="eager"
              decoding="async"
              fetchPriority="high"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : null}
        </picture>
      ) : (
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(196,163,90,0.18) 0%, rgba(0,0,0,0.85) 70%)",
          }}
        />
      )}
      <div className="absolute inset-0 bg-black/35 transition-opacity duration-300 group-hover:bg-black/50" />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
        {/* TikTok logo icon */}
        <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-white/70 bg-black/50 shadow-xl transition-all duration-300 group-hover:scale-110 group-hover:border-white group-hover:bg-black/70">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-8 w-8 text-white"
          >
            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.29 6.29 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z" />
          </svg>
        </div>
        <span className="rounded-full border border-white/15 bg-black/40 px-3 py-1 text-[0.6rem] tracking-[0.22em] text-white/80 uppercase backdrop-blur-sm">
          Ver en TikTok
        </span>
      </div>
    </a>
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
      {(idx === 1 || (idx === 0 && stop.videoUrl) || (idx === 2 && stop.videoUrl)) &&
        ((idx === 0 || idx === 2) && stop.videoUrl ? (
          <a
            href={stop.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={
              idx === 0 ? "Ver video del seminario en Instagram" : "Ver fotos de la carrera en TikTok"
            }
            className="absolute right-3 top-3 flex items-center justify-center rounded-full border border-white/15 bg-white/5 p-1.5 text-muted/80 transition-colors hover:border-gold/30 hover:text-gold md:hidden"
          >
            <EyeIcon />
          </a>
        ) : (
          <button
            onClick={onEyeClick}
            aria-label={idx === 1 ? "Ver imagen del torneo" : ""}
            className="absolute right-3 top-3 flex items-center justify-center rounded-full border border-white/15 bg-white/5 p-1.5 text-muted/80 transition-colors hover:border-gold/30 hover:text-gold md:hidden"
          >
            <EyeIcon />
          </button>
        ))}
      <div
        className={`flex flex-wrap items-center gap-x-3 gap-y-2 ${idx === 0 || idx === 1 || idx === 2 ? "pr-10 md:pr-0" : ""}`}
      >
        <p className="text-[0.65rem] tracking-[0.28em] text-gold">{stop.date.toUpperCase()}</p>
        {stop.highlight ? (
          <span className="rounded-full border border-gold/30 bg-gold/10 px-3 py-0.5 text-[0.6rem] tracking-[0.18em] text-gold">
            {stop.highlight}
          </span>
        ) : null}
        {stop.tags?.map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-gold/25 bg-gold/5 px-3 py-0.5 text-[0.6rem] tracking-[0.18em] text-gold/80"
          >
            {tag}
          </span>
        ))}
        {idx > 4 && (
          <span className="rounded-full border border-gold/30 bg-gold/20 px-3 py-0.5 text-[0.6rem] tracking-[0.18em] text-muted/80">
            PRÓXIMAMENTE
          </span>
        )}
      </div>
      <h3 className="mt-3 font-display text-xl tracking-tight text-foreground sm:text-[1.35rem]">
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
      {idx === 0 && stop.videoUrl && (
        <a
          href={stop.videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 transition-colors hover:border-gold/30 hover:bg-gold/5 md:hidden"
        >
          <div className="flex items-center gap-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.6}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4 shrink-0 text-gold/70"
            >
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
            </svg>
            <span className="text-[0.72rem] leading-snug text-muted/80">
              ¿Te lo perdiste?{" "}
              <span className="text-gold/90 font-medium">Mira el video del seminario</span>
            </span>
          </div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-3.5 w-3.5 shrink-0 text-muted/50"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        </a>
      )}
      {idx === 1 && (
        <>
          <TournamentCountdown />
          <div className="mt-4 flex justify-center">
            <a
              href="/registro-torneo"
              className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-5 py-2 text-xs tracking-[0.18em] text-gold transition-colors hover:bg-gold/20 hover:border-gold/70"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-3.5 w-3.5"
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z" />
              </svg>
              ENTRAR AL EVENTO
            </a>
          </div>
        </>
      )}
      {stop.route && idx !== 1 && (
        <div className="mt-4 flex justify-center">
          <a
            href={stop.route}
            className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-5 py-2 text-xs tracking-[0.18em] text-gold transition-colors hover:bg-gold/20 hover:border-gold/70"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-3.5 w-3.5"
            >
              <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8Z" />
            </svg>
            VER DISCIPLINAS
          </a>
        </div>
      )}
      {idx === 2 && (
        <>
          <RaceCountdown />
          <div className="mt-4 flex justify-center">
            <a
              href="https://jplayraces.com/event/5k-kilometros-de-vida/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-5 py-2 text-xs tracking-[0.18em] text-gold transition-colors hover:bg-gold/20 hover:border-gold/70"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-3.5 w-3.5"
              >
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
              VER RESULTADOS
            </a>
          </div>
          {stop.videoUrl && (
            <a
              href={stop.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 transition-colors hover:border-gold/30 hover:bg-gold/5 md:hidden"
            >
              <div className="flex items-center gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-4 w-4 shrink-0 text-gold/70"
                >
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.29 6.29 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z" />
                </svg>
                <span className="text-[0.72rem] leading-snug text-muted/80">
                  ¡Revive la carrera!{" "}
                  <span className="text-gold/90 font-medium">Ver fotos en TikTok</span>
                </span>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-3.5 w-3.5 shrink-0 text-muted/50"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </a>
          )}
        </>
      )}
    </div>
  );
}

function EyeIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

type MediaImages = {
  tournamentHor: OptimizedImage;
  tournamentHorFallback: OptimizedImage;
  tournamentVer: OptimizedImage;
  tournamentVerFallback: OptimizedImage;
  seminarThumb: OptimizedImage;
  seminarThumbFallback: OptimizedImage;
  raceThumb: OptimizedImage;
  raceThumbFallback: OptimizedImage;
};

type IndexedStop = { stop: RoadmapStop; idx: number };

function PeriodSection({
  label,
  open,
  onToggle,
  items,
  media,
  onOpenTournament,
}: {
  label: string;
  open: boolean;
  onToggle: () => void;
  items: IndexedStop[];
  media: MediaImages;
  onOpenTournament: () => void;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const [range, setRange] = React.useState<[number, number]>([0, 1]);

  const hasItems = items.length > 0;

  React.useEffect(() => {
    if (!open || !hasItems) return;
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
  }, [open, hasItems]);

  const lineScale = useTransform(scrollY, range, [0, 1], { clamp: true });

  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="group flex w-full items-center justify-center gap-4 border-b border-white/10 pb-4 text-center"
      >
        <span
          className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border transition-colors ${
            open
              ? "border-gold/40 bg-gold/10 text-gold"
              : "border-white/15 bg-white/5 text-muted group-hover:border-gold/30 group-hover:text-gold"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`h-3.5 w-3.5 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </span>
        <span className="font-display text-xl tracking-tight text-foreground sm:text-2xl">
          Periodo {label}
        </span>
        {!hasItems && (
          <span className="ml-auto text-xs tracking-[0.2em] text-muted/50 uppercase">
            Sin actividades
          </span>
        )}
      </button>

      {open && hasItems && (
        <div ref={ref} className="relative mt-10 pl-10 sm:pl-0">
          {/* Track */}
          <div className="absolute left-3 top-0 h-full w-0.5 bg-white/8 sm:left-1/2 sm:-translate-x-1/2" />
          {/* Fill — gradient bright at bottom so the leading tip glows */}
          <motion.div
            className="absolute left-3 top-0 h-full w-0.5 origin-top sm:left-1/2 sm:-translate-x-1/2"
            style={{
              scaleY: lineScale,
              background:
                "linear-gradient(to bottom, rgba(196,163,90,0.3) 0%, #c4a35a 70%, #f0d485 100%)",
              boxShadow: "0 0 8px 2px rgba(196,163,90,0.6)",
            }}
          />

          <div className="flex flex-col gap-6 sm:gap-9">
            {items.map(({ stop, idx }) => {
              const isLeft = idx % 2 === 0;
              const wrapperClass = isLeft
                ? "sm:w-[calc(50%-1rem)] sm:pr-10"
                : "sm:w-[calc(50%-1rem)] sm:pl-10 sm:ml-auto";

              const motionClass =
                idx === 0 || idx === 1 || idx === 2
                  ? "relative w-full"
                  : `relative w-full ${wrapperClass}`;

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
                    <div
                      className={`hidden md:flex items-stretch gap-0 ${isLeft ? "flex-row" : "flex-row-reverse"}`}
                    >
                      <div className={`${wrapperClass} flex flex-col`}>
                        <CardInner stop={stop} idx={idx} onEyeClick={() => {}} />
                      </div>
                      <div className={`${imageSlotClass} flex items-center justify-center`}>
                        {stop.videoUrl && (
                          <SeminarVideoPanel
                            videoUrl={stop.videoUrl}
                            videoThumbnail={media.seminarThumb.src}
                            videoThumbnailFallback={media.seminarThumbFallback.src}
                            width={media.seminarThumb.width}
                            height={media.seminarThumb.height}
                          />
                        )}
                      </div>
                    </div>
                  )}
                  {idx === 1 && (
                    <div className="hidden md:flex flex-row items-stretch gap-0">
                      <div className={`${imageSlotClass} flex items-center justify-center`}>
                        <TournamentImagePanel
                          onClick={onOpenTournament}
                          srcHor={media.tournamentHor.src}
                          srcHorFallback={media.tournamentHorFallback.src}
                          width={media.tournamentHor.width}
                          height={media.tournamentHor.height}
                        />
                      </div>
                      <div className={`${wrapperClass} flex flex-col`}>
                        <CardInner
                          stop={stop}
                          idx={idx}
                          onEyeClick={onOpenTournament}
                        />
                      </div>
                    </div>
                  )}
                  {idx === 2 && (
                    <div
                      className={`hidden md:flex items-stretch gap-0 ${isLeft ? "flex-row" : "flex-row-reverse"}`}
                    >
                      <div className={`${wrapperClass} flex flex-col`}>
                        <CardInner stop={stop} idx={idx} onEyeClick={() => {}} />
                      </div>
                      <div className={`${imageSlotClass} flex items-center justify-center`}>
                        {stop.videoUrl && (
                          <RaceTikTokPanel
                            videoUrl={stop.videoUrl}
                            videoThumbnail={media.raceThumb.src}
                            videoThumbnailFallback={media.raceThumbFallback.src}
                            width={media.raceThumb.width}
                            height={media.raceThumb.height}
                          />
                        )}
                      </div>
                    </div>
                  )}

                  {/* Mobile: normal single-column layout */}
                  <div className={idx === 0 || idx === 1 || idx === 2 ? "md:hidden" : ""}>
                    <CardInner
                      stop={stop}
                      idx={idx}
                      onEyeClick={idx === 1 ? onOpenTournament : () => {}}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Timeline({
  stops,
  tournamentHor,
  tournamentHorFallback,
  tournamentVer,
  tournamentVerFallback,
  seminarThumb,
  seminarThumbFallback,
  raceThumb,
  raceThumbFallback,
}: {
  stops: RoadmapStop[];
  tournamentHor: OptimizedImage;
  tournamentHorFallback: OptimizedImage;
  tournamentVer: OptimizedImage;
  tournamentVerFallback: OptimizedImage;
  seminarThumb: OptimizedImage;
  seminarThumbFallback: OptimizedImage;
  raceThumb: OptimizedImage;
  raceThumbFallback: OptimizedImage;
}) {
  const [tournamentLightboxOpen, setTournamentLightboxOpen] = React.useState(false);

  // Group stops by period, preserving insertion order.
  const groups = React.useMemo(() => {
    const order: { label: string; items: IndexedStop[] }[] = [];
    const byLabel = new Map<string, { label: string; items: IndexedStop[] }>();
    stops.forEach((stop, idx) => {
      const label = stop.period?.trim() || "Actividades";
      let group = byLabel.get(label);
      if (!group) {
        group = { label, items: [] };
        byLabel.set(label, group);
        order.push(group);
      }
      group.items.push({ stop, idx });
    });
    return order;
  }, [stops]);

  const media: MediaImages = {
    tournamentHor,
    tournamentHorFallback,
    tournamentVer,
    tournamentVerFallback,
    seminarThumb,
    seminarThumbFallback,
    raceThumb,
    raceThumbFallback,
  };

  // Historical periods stay collapsed by default; the rest are open.
  const openSet = React.useMemo(
    () =>
      new Set<string>(
        groups.filter((g) => !g.items.some((i) => i.stop.historical)).map((g) => g.label),
      ),
    [groups],
  );
  const [openLabels, setOpenLabels] = React.useState<Set<string>>(openSet);

  const toggle = (label: string) =>
    setOpenLabels((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });

  return (
    <>
      <ImageLightbox
        open={tournamentLightboxOpen}
        onClose={() => setTournamentLightboxOpen(false)}
        srcHor={tournamentHor.src}
        srcHorFallback={tournamentHorFallback.src}
        srcVer={tournamentVer.src}
        srcVerFallback={tournamentVerFallback.src}
        alt="Torneo relámpago de fútbol"
        widthHor={tournamentHor.width}
        heightHor={tournamentHor.height}
        widthVer={tournamentVer.width}
        heightVer={tournamentVer.height}
      />

      <div className="mt-14 flex flex-col gap-14">
        {groups.map((group) => (
          <PeriodSection
            key={group.label}
            label={group.label}
            open={openLabels.has(group.label)}
            onToggle={() => toggle(group.label)}
            items={group.items}
            media={media}
            onOpenTournament={() => setTournamentLightboxOpen(true)}
          />
        ))}
      </div>
    </>
  );
}

"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { insforge } from "@/lib/insforge/browser";
import {
  DISCIPLINAS,
  CARRERAS,
  AREAS,
  NIVELES,
  INSCRIPCIONES_ABIERTAS,
  getDisciplina,
  type DisciplinaId,
  type DisciplinaConfig,
} from "@/data/olimpiadas";
import StandingsTable from "./olimpiadas/StandingsTable";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type FormState = "idle" | "submitting" | "success" | "error";

interface FormValues {
  nombres: string;
  representante: string;
  numero: string;
  cedula: string;
  nombre_equipo: string;
  carrera: string;
  area_conocimiento: string;
  nivel: string;
  categoria: string;
}

const EMPTY_FORM: FormValues = {
  nombres: "",
  representante: "",
  numero: "",
  cedula: "",
  nombre_equipo: "",
  carrera: "",
  area_conocimiento: "",
  nivel: "",
  categoria: "",
};

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

function validarCedula(cedula: string): boolean {
  if (!/^\d{10}$/.test(cedula)) return false;
  const provincia = parseInt(cedula.slice(0, 2), 10);
  if (provincia < 1 || provincia > 24) return false;
  if (parseInt(cedula[2], 10) >= 6) return false;
  const coef = [2, 1, 2, 1, 2, 1, 2, 1, 2];
  const suma = coef.reduce((acc, c, i) => {
    let v = parseInt(cedula[i], 10) * c;
    if (v >= 10) v -= 9;
    return acc + v;
  }, 0);
  const verificador = suma % 10 === 0 ? 0 : 10 - (suma % 10);
  return verificador === parseInt(cedula[9], 10);
}

// ---------------------------------------------------------------------------
// Decorative background icons (per discipline)
// ---------------------------------------------------------------------------

function DecorativeIcon({
  name,
  className,
  style,
}: {
  name: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const common = {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
    style,
  };
  switch (name) {
    case "futbol":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7.5 15.5 9.5v4L12 15.5l-3.5-2v-4L12 7.5Z" />
          <path d="M12 7.5V3M15.5 9.5l4.8-1.6M15.5 13.5l4 2.6M12 15.5v5.5M8.5 13.5l-4 2.6M8.5 9.5 3.7 7.9" />
        </svg>
      );
    case "basket":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 3v18M3 12h18" />
          <path d="M3 12a9 9 0 0 1 18 0M3 12a9 9 0 0 0 18 0" />
        </svg>
      );
    case "ecuavoley":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M6.5 6.5c4-1 7 2 11-1M4 12c4-2 7 1 11-2M6.5 17.5c3-3 6-1 10-4" />
        </svg>
      );
    case "ajedrez":
      return (
        <svg {...common}>
          <path d="M9 3h6M9.5 3c0 1 .5 1.5 1 2h3c.5-.5 1-1 1-2M8.5 8.5h7" />
          <path d="M9.5 5h5l.8 3.5H8.7L9.5 5Z" />
          <path d="M9 10.5h6l1 4H8l1-4ZM8.5 14.5l-.8 3M15.5 14.5l.8 3M6.5 20.5h11" />
          <path d="M8.5 20.5h7l.5 2h-8l.5-2Z" />
        </svg>
      );
    case "trophy":
      return (
        <svg {...common}>
          <path d="M8 21h8M12 17v4" />
          <path d="M7 4h10v7a5 5 0 0 1-10 0V4Z" />
          <path d="M7 6H4v1a4 4 0 0 0 4 4M17 6h3v1a4 4 0 0 1-4 4" />
        </svg>
      );
    case "medal":
      return (
        <svg {...common}>
          <circle cx="12" cy="9" r="6" />
          <path d="m9 14-2 7 5-3 5 3-2-7" />
          <path d="M10 9l1.5 1.5L14.5 7" />
        </svg>
      );
    case "whistle":
      return (
        <svg {...common}>
          <path d="M4 14a7 7 0 0 0 14 0V9a5 5 0 0 0-10 0v1H4v4Z" />
          <path d="M8 9h4" />
          <path d="M20 9v2M20 9a1.5 1.5 0 1 1 0 3a1.5 1.5 0 0 1 0-3Z" />
        </svg>
      );
    case "trophy-2":
      return (
        <svg {...common}>
          <path d="M7 4h10v7a5 5 0 0 1-10 0V4Z" />
          <path d="M7 6H3v1a4 4 0 0 0 4 4M17 6h4v1a4 4 0 0 1-4 4M12 16v3M8 21h8" />
        </svg>
      );
    case "medal-2":
      return (
        <svg {...common}>
          <circle cx="12" cy="14" r="6" />
          <path d="m9 9 3-6 3 6" />
          <path d="m9 9 3 3 3-3" />
        </svg>
      );
    case "pawn":
      return (
        <svg {...common}>
          <circle cx="12" cy="5" r="2.2" />
          <path d="M12 7.5V11M10.5 11h3M10 21h4M9 14h6l1.5 4.5h-9L9 14Z" />
        </svg>
      );
    default:
      return null;
  }
}

const IMAGE_DECOR: Record<string, { src: string; className: string; size: number; delay: number }[]> = {
  futbol: [
    { src: "/fut1.svg", className: "left-[6%] top-[14%]", size: 120, delay: 0 },
    { src: "/fut2.svg", className: "right-[8%] top-[20%]", size: 90, delay: 0.8 },
    { src: "/fut3.svg", className: "left-[16%] bottom-[16%]", size: 82, delay: 1.4 },
    { src: "/fut4.svg", className: "right-[14%] bottom-[8%]", size: 96, delay: 0.4 },
  ],
  basket: [
    { src: "/basket1.svg", className: "left-[4%] top-[10%]", size: 150, delay: 0 },
    { src: "/basket2.svg", className: "right-[6%] top-[16%]", size: 115, delay: 0.8 },
    { src: "/basket3.svg", className: "left-[22%] bottom-[14%]", size: 92, delay: 1.3 },
    { src: "/basket4.svg", className: "right-[18%] bottom-[8%]", size: 140, delay: 0.4 },
  ],
  ecuavoley: [
    { src: "/ecuavo1.svg", className: "left-[4%] top-[10%]", size: 150, delay: 0 },
    { src: "/ecuavo2.svg", className: "right-[6%] top-[16%]", size: 115, delay: 0.8 },
    { src: "/ecuavo3.svg", className: "left-[22%] bottom-[14%]", size: 92, delay: 1.3 },
    { src: "/ecuavo4.svg", className: "right-[18%] bottom-[8%]", size: 140, delay: 0.4 },
  ],
  ajedrez: [
    { src: "/aje1.svg", className: "left-[4%] top-[10%]", size: 150, delay: 0 },
    { src: "/aje2.svg", className: "right-[6%] top-[16%]", size: 115, delay: 0.8 },
    { src: "/aje3.svg", className: "left-[22%] bottom-[14%]", size: 92, delay: 1.3 },
    { src: "/aje4.svg", className: "right-[18%] bottom-[8%]", size: 140, delay: 0.4 },
  ],
  pingpong: [
    { src: "/pingpong1.svg", className: "left-[4%] top-[10%]", size: 150, delay: 0 },
    { src: "/pingpong2.svg", className: "right-[6%] top-[16%]", size: 115, delay: 0.8 },
    { src: "/pingpong3.svg", className: "left-[22%] bottom-[14%]", size: 92, delay: 1.3 },
    { src: "/pingpong4.svg", className: "right-[18%] bottom-[8%]", size: 140, delay: 0.4 },
  ],
};

const HEADER_IMG: Record<string, string> = {
  futbol: "/fut1.svg",
  basket: "/basket1.svg",
  ecuavoley: "/ecuavo1.svg",
  ajedrez: "/aje1.svg",
  pingpong: "/pingpong1.svg",
};

const GOLD_FILTER =
  "invert(0.72) sepia(0.78) saturate(6.5) hue-rotate(8deg) brightness(0.92) contrast(0.95)";

function GoldImg({
  src,
  className,
  style,
}: {
  src: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <img
      src={src}
      alt=""
      aria-hidden
      className={className}
      style={{ ...style, filter: GOLD_FILTER }}
    />
  );
}

const GRID_COLS = 6;
const CELL_H = 130;
const GRID_ROWS = 8;

function backgroundGridTiles(
  srcs?: string[],
  icons?: string[],
): { src?: string; icon?: string; size: number; opacity: number; delay: number }[] {
  const count = GRID_COLS * GRID_ROWS;
  return Array.from({ length: count }, (_, i) => ({
    src: srcs?.[i % srcs.length],
    icon: icons?.[i % icons.length],
    size: 48 + ((i * 7) % 4) * 10,
    opacity: 0.09 + (i % 5) * 0.02,
    delay: (i % 6) * 0.4,
  }));
}

function BackgroundGrid({
  tiles,
}: {
  tiles: { src?: string; icon?: string; size: number; opacity: number; delay: number }[];
}) {
  return (
    <div
      aria-hidden
      className="absolute inset-0 hidden lg:grid"
      style={{ gridTemplateColumns: "repeat(6, 1fr)", gridAutoRows: `${CELL_H}px` }}
    >
        {tiles.map((t, i) => (
          <div key={i} className="flex items-center justify-center">
            <div
              style={{
                width: t.size,
                height: t.size,
                opacity: t.opacity,
                animation: `olyFloat ${5 + (i % 4)}s ease-in-out ${t.delay}s infinite`,
              }}
            >
              {t.src ? (
                <img
                  src={t.src}
                  alt=""
                  aria-hidden
                  style={{ width: "100%", height: "100%", filter: GOLD_FILTER }}
                />
              ) : (
                <DecorativeIcon name={t.icon!} style={{ width: t.size, height: t.size }} className="text-gold" />
              )}
            </div>
          </div>
        ))}
      </div>
  );
}

function BackgroundDecor({ id }: { id: DisciplinaId }) {
  if (IMAGE_DECOR[id]) {
    const srcs = IMAGE_DECOR[id].map((d) => d.src);
    return (
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <BackgroundGrid tiles={backgroundGridTiles(srcs)} />

        {/* Prominent scattered icons on all screens */}
        <motion.div
          key={id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0"
        >
          {IMAGE_DECOR[id].map((d, i) => (
            <motion.div
              key={i}
              className={`absolute ${d.className}`}
              style={{ opacity: 0.12 }}
              initial={{ y: 0, rotate: 0 }}
              animate={{ y: [0, -12, 0], rotate: [0, 6, 0] }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
                delay: d.delay,
              }}
            >
              <GoldImg src={d.src} style={{ width: d.size, height: d.size }} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    );
  }
  return null;
}

// ---------------------------------------------------------------------------
// Small UI bits
// ---------------------------------------------------------------------------

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-baseline gap-1.5 text-[0.7rem] tracking-[0.18em] text-white/55 uppercase">
        {label}
        {required && <span className="text-gold">*</span>}
      </span>
      {children}
      {hint ? <span className="mt-1 block text-[0.65rem] text-white/35">{hint}</span> : null}
    </label>
  );
}

const inputClass =
  "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/25 outline-none transition-colors focus:border-gold/50 focus:bg-white/7";

const selectClass =
  "w-full appearance-none rounded-xl border border-white/10 bg-[#141414] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-gold/50";

function Chevron() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function Select({
  value,
  onChange,
  placeholder,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: readonly string[];
}) {
  return (
    <div className="relative">
      <select value={value} onChange={(e) => onChange(e.target.value)} className={selectClass}>
        <option value="" disabled className="bg-[#141414]">
          {placeholder}
        </option>
        {options.map((o) => (
          <option key={o} value={o} className="bg-[#141414]">
            {o}
          </option>
        ))}
      </select>
      <Chevron />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Upcoming Schedule (public-facing)
// ---------------------------------------------------------------------------

interface PartidoSchedule {
  id: string;
  equipo_local: string;
  equipo_visitante: string;
  goles_local: number;
  goles_visitante: number;
  penales_local?: number | null;
  penales_visitante?: number | null;
  estado: "pendiente" | "en_curso" | "finalizado";
  disciplina?: string;
  categoria?: string | null;
  grupo?: string | null;
  fecha?: number | null;
}

const DISCIPLINA_LABEL_PUB: Record<string, string> = {
  futbol: "Fútbol",
  basket: "Basket",
  ecuavoley: "Ecuavoley",
  ajedrez: "Ajedrez",
  pingpong: "Ping Pong",
};

function TrophyMiniIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className ?? "h-3.5 w-3.5"}
    >
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.45 1-1 1H8v2h8v-2h-1c-.55 0-1-.45-1-1v-2.34" />
      <path d="M6 4h12a2 2 0 0 1 2 2v3a6 6 0 0 1-6 6h0a6 6 0 0 1-6-6V6a2 2 0 0 1 2-2Z" />
    </svg>
  );
}

function getMatchOutcome(p: PartidoSchedule) {
  const isFinished = p.estado === "finalizado";
  const isLive = p.estado === "en_curso";
  const isStarted = isLive || isFinished;

  let localWon = false;
  let visitanteWon = false;
  let isTie = false;

  if (isFinished) {
    if (p.goles_local > p.goles_visitante) {
      localWon = true;
    } else if (p.goles_visitante > p.goles_local) {
      visitanteWon = true;
    } else if (p.penales_local != null && p.penales_visitante != null) {
      if (p.penales_local > p.penales_visitante) {
        localWon = true;
      } else if (p.penales_visitante > p.penales_local) {
        visitanteWon = true;
      } else {
        isTie = true;
      }
    } else {
      isTie = true;
    }
  }

  return { isFinished, isLive, isStarted, localWon, visitanteWon, isTie };
}

function UpcomingSchedule() {
  const [matches, setMatches] = React.useState<PartidoSchedule[]>([]);
  const [loaded, setLoaded] = React.useState(false);

  const cargar = React.useCallback(async () => {
    const { data: schRows } = await insforge.database
      .from("olimpiadas_schedule")
      .select("partido_id, posicion")
      .order("posicion", { ascending: true });

    if (!Array.isArray(schRows) || schRows.length === 0) {
      setMatches([]);
      setLoaded(true);
      return;
    }

    const typedRows = schRows as { partido_id: string; posicion: number }[];
    const ids = typedRows.map((r) => r.partido_id);

    const { data: pData } = await insforge.database
      .from("partidos_olimpiadas")
      .select("*")
      .in("id", ids);

    if (Array.isArray(pData)) {
      const pMap = new Map(
        (pData as PartidoSchedule[]).map((p) => [p.id, p]),
      );
      const ordered = typedRows
        .sort((a, b) => a.posicion - b.posicion)
        .map((r) => pMap.get(r.partido_id))
        .filter(Boolean) as PartidoSchedule[];
      setMatches(ordered);
    }
    setLoaded(true);
  }, []);

  React.useEffect(() => {
    void cargar();
  }, [cargar]);

  React.useEffect(() => {
    const onSchedule = () => void cargar();
    const onVisible = () => {
      if (document.visibilityState === "visible") void cargar();
    };
    window.addEventListener("olimpiadas:schedule", onSchedule);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("olimpiadas:schedule", onSchedule);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [cargar]);

  // Zero footprint if not loaded yet or schedule is empty
  if (!loaded || matches.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mt-10"
    >
      {/* Section header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-[0.6rem] tracking-[0.3em] text-gold uppercase">Próximos Partidos</p>
          <p className="mt-0.5 text-[0.65rem] text-white/35">Calendario de las proxima fechas</p>
        </div>
        <span className="flex h-7 w-7 items-center justify-center rounded-full border border-gold/25 bg-gold/8 text-[0.6rem] font-medium text-gold">
          {matches.length}
        </span>
      </div>

      {/* Match cards */}
      <div className="flex flex-col gap-2.5">
        {matches.map((p, idx) => {
          const outcome = getMatchOutcome(p);

          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              className="rounded-2xl border border-white/8 bg-white/3 p-3.5 backdrop-blur-sm transition-colors hover:border-white/15 sm:p-4"
            >
              {/* Card Meta & Status Header */}
              <div className="mb-3 flex items-center justify-between gap-2 border-b border-white/5 pb-2.5">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[0.58rem] font-medium text-white/50 tabular-nums">
                    #{idx + 1}
                  </span>
                  <p className="truncate text-[0.65rem] font-medium text-white/50">
                    {p.disciplina ? (DISCIPLINA_LABEL_PUB[p.disciplina] ?? p.disciplina) : "Partido"}
                    {p.categoria ? ` · ${p.categoria}` : ""}
                    {p.grupo ? ` · Grupo ${p.grupo}` : ""}
                    {p.fecha != null ? ` · Fecha ${p.fecha}` : ""}
                  </p>
                </div>

                {/* Status chip */}
                <div className="shrink-0">
                  {outcome.isLive ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/10 px-2.5 py-0.5 text-[0.55rem] font-bold tracking-wider text-gold uppercase shadow-[0_0_10px_rgba(212,175,55,0.15)]">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold opacity-75"></span>
                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-gold"></span>
                      </span>
                      En Curso
                    </span>
                  ) : outcome.isFinished ? (
                    <span className="rounded-full border border-white/12 bg-white/5 px-2.5 py-0.5 text-[0.55rem] font-medium tracking-wider text-white/50 uppercase">
                      Finalizado
                    </span>
                  ) : (
                    <span className="rounded-full border border-white/8 bg-white/3 px-2.5 py-0.5 text-[0.55rem] font-medium tracking-wider text-white/35 uppercase">
                      Sin iniciar
                    </span>
                  )}
                </div>
              </div>

              {/* Mobile layout (< sm) */}
              <div className="flex flex-col gap-2 sm:hidden">
                {/* Local Team Row */}
                <div
                  className={`flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 transition-all ${
                    outcome.localWon
                      ? "border border-gold/30 bg-gold/8 shadow-[0_0_15px_rgba(212,175,55,0.08)]"
                      : "border border-white/5 bg-white/2"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    {outcome.localWon && (
                      <div className="mb-1 flex items-center gap-1.5">
                        <span className="inline-flex items-center gap-1 rounded-full bg-gold/15 px-1.5 py-0.5 text-[0.5rem] font-bold tracking-wide text-gold uppercase">
                          <TrophyMiniIcon className="h-2.5 w-2.5 text-gold" />
                          Ganador
                        </span>
                      </div>
                    )}
                    <p
                      className={`line-clamp-2 wrap-break-word text-sm leading-snug ${
                        outcome.localWon
                          ? "font-bold text-gold"
                          : outcome.visitanteWon
                            ? "font-normal text-white/40"
                            : "font-semibold text-white"
                      }`}
                    >
                      {p.equipo_local}
                    </p>
                  </div>

                  {outcome.isStarted && (
                    <div className="flex shrink-0 items-center gap-1.5">
                      {p.penales_local != null && (
                        <span className="text-[0.58rem] font-mono text-amber-400">({p.penales_local})</span>
                      )}
                      <span
                        className={`flex h-8 min-w-8 items-center justify-center rounded-lg px-2 font-display text-base font-bold tabular-nums ${
                          outcome.localWon
                            ? "border border-gold/50 bg-gold/20 text-gold shadow-[0_0_12px_rgba(212,175,55,0.25)]"
                            : outcome.visitanteWon
                              ? "border border-white/6 bg-white/3 text-white/40"
                              : "border border-white/12 bg-white/6 text-white"
                        }`}
                      >
                        {p.goles_local}
                      </span>
                    </div>
                  )}
                </div>

                {/* Matchup separator */}
                <div className="-my-0.5 flex items-center justify-center gap-2 px-2">
                  <div className="h-px flex-1 bg-white/6" />
                  <span className="text-[0.55rem] font-bold tracking-widest text-white/25 uppercase">
                    {outcome.isFinished && outcome.isTie ? "Empate" : "vs"}
                  </span>
                  <div className="h-px flex-1 bg-white/6" />
                </div>

                {/* Visitante Team Row */}
                <div
                  className={`flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 transition-all ${
                    outcome.visitanteWon
                      ? "border border-gold/30 bg-gold/8 shadow-[0_0_15px_rgba(212,175,55,0.08)]"
                      : "border border-white/5 bg-white/2"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    {outcome.visitanteWon && (
                      <div className="mb-1 flex items-center gap-1.5">
                        <span className="inline-flex items-center gap-1 rounded-full bg-gold/15 px-1.5 py-0.5 text-[0.5rem] font-bold tracking-wide text-gold uppercase">
                          <TrophyMiniIcon className="h-2.5 w-2.5 text-gold" />
                          Ganador
                        </span>
                      </div>
                    )}
                    <p
                      className={`line-clamp-2 wrap-break-word text-sm leading-snug ${
                        outcome.visitanteWon
                          ? "font-bold text-gold"
                          : outcome.localWon
                            ? "font-normal text-white/40"
                            : "font-semibold text-white"
                      }`}
                    >
                      {p.equipo_visitante}
                    </p>
                  </div>

                  {outcome.isStarted && (
                    <div className="flex shrink-0 items-center gap-1.5">
                      {p.penales_visitante != null && (
                        <span className="text-[0.58rem] font-mono text-amber-400">({p.penales_visitante})</span>
                      )}
                      <span
                        className={`flex h-8 min-w-8 items-center justify-center rounded-lg px-2 font-display text-base font-bold tabular-nums ${
                          outcome.visitanteWon
                            ? "border border-gold/50 bg-gold/20 text-gold shadow-[0_0_12px_rgba(212,175,55,0.25)]"
                            : outcome.localWon
                              ? "border border-white/6 bg-white/3 text-white/40"
                              : "border border-white/12 bg-white/6 text-white"
                        }`}
                      >
                        {p.goles_visitante}
                      </span>
                    </div>
                  )}
                </div>

                {p.penales_local != null && p.penales_visitante != null && (
                  <p className="text-center font-mono text-[0.6rem] text-amber-400/80">
                    Tanda de penales: {p.penales_local} – {p.penales_visitante}
                  </p>
                )}
              </div>

              {/* Desktop layout (>= sm) */}
              <div className="hidden sm:flex sm:items-center sm:gap-4 sm:py-1">
                {/* Local Team (Right-aligned) */}
                <div className="min-w-0 flex-1 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {outcome.localWon && <TrophyMiniIcon className="h-4 w-4 shrink-0 text-gold" />}
                    <p
                      className={`line-clamp-2 wrap-break-word text-sm leading-tight sm:text-base ${
                        outcome.localWon
                          ? "font-bold text-gold"
                          : outcome.visitanteWon
                            ? "font-normal text-white/40"
                            : "font-semibold text-white"
                      }`}
                      title={p.equipo_local}
                    >
                      {p.equipo_local}
                    </p>
                  </div>
                  {outcome.localWon && (
                    <div className="mt-0.5 flex items-center justify-end">
                      <span className="text-[0.55rem] font-bold tracking-wider text-gold uppercase">Ganador</span>
                    </div>
                  )}
                </div>

                {/* Center Scoreboard */}
                <div className="flex shrink-0 flex-col items-center justify-center px-2">
                  {outcome.isStarted ? (
                    <>
                      <div className="flex items-center gap-2">
                        {/* Local score */}
                        <span
                          className={`flex h-10 min-w-10 items-center justify-center rounded-xl px-2.5 font-display text-lg font-bold tabular-nums ${
                            outcome.localWon
                              ? "border border-gold/50 bg-gold/20 text-gold shadow-[0_0_15px_rgba(212,175,55,0.25)]"
                              : outcome.visitanteWon
                                ? "border border-white/6 bg-white/3 text-white/40"
                                : "border border-white/15 bg-white/8 text-white"
                          }`}
                        >
                          {p.goles_local}
                        </span>

                        <span className={`text-xs font-bold ${outcome.isLive ? "animate-pulse text-gold" : "text-white/30"}`}>
                          {outcome.isLive ? ":" : "–"}
                        </span>

                        {/* Visitante score */}
                        <span
                          className={`flex h-10 min-w-10 items-center justify-center rounded-xl px-2.5 font-display text-lg font-bold tabular-nums ${
                            outcome.visitanteWon
                              ? "border border-gold/50 bg-gold/20 text-gold shadow-[0_0_15px_rgba(212,175,55,0.25)]"
                              : outcome.localWon
                                ? "border border-white/6 bg-white/3 text-white/40"
                                : "border border-white/15 bg-white/8 text-white"
                          }`}
                        >
                          {p.goles_visitante}
                        </span>
                      </div>

                      {p.penales_local != null && p.penales_visitante != null ? (
                        <span className="mt-1 font-mono text-[0.58rem] tracking-wider text-amber-400/90">
                          Pen. {p.penales_local} – {p.penales_visitante}
                        </span>
                      ) : outcome.isFinished && outcome.isTie ? (
                        <span className="mt-1 text-[0.55rem] tracking-wider text-white/35 uppercase">
                          Empate
                        </span>
                      ) : null}
                    </>
                  ) : (
                    <span className="rounded-xl border border-white/10 bg-white/5 px-4 py-1.5 font-display text-xs font-bold tracking-widest text-white/40">
                      VS
                    </span>
                  )}
                </div>

                {/* Visitante Team (Left-aligned) */}
                <div className="min-w-0 flex-1 text-left">
                  <div className="flex items-center justify-start gap-2">
                    <p
                      className={`line-clamp-2 wrap-break-word text-sm leading-tight sm:text-base ${
                        outcome.visitanteWon
                          ? "font-bold text-gold"
                          : outcome.localWon
                            ? "font-normal text-white/40"
                            : "font-semibold text-white"
                      }`}
                      title={p.equipo_visitante}
                    >
                      {p.equipo_visitante}
                    </p>
                    {outcome.visitanteWon && <TrophyMiniIcon className="h-4 w-4 shrink-0 text-gold" />}
                  </div>
                  {outcome.visitanteWon && (
                    <div className="mt-0.5 flex items-center justify-start">
                      <span className="text-[0.55rem] font-bold tracking-wider text-gold uppercase">Ganador</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function OlimpiadasClient() {
  const [disciplina, setDisciplina] = React.useState<DisciplinaId>("futbol");
  const [form, setForm] = React.useState<FormValues>(EMPTY_FORM);
  const [state, setState] = React.useState<FormState>("idle");
  const [cedulaError, setCedulaError] = React.useState("");
  const [errorMsg, setErrorMsg] = React.useState("");
  const cfg = getDisciplina(disciplina);

  const set = (field: keyof FormValues) => (value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    if (field === "cedula") setCedulaError("");
  };

  function handleCedulaChange(raw: string) {
    const digits = raw.replace(/\D/g, "").slice(0, 10);
    set("cedula")(digits);
    if (digits.length === 10) {
      setCedulaError(validarCedula(digits) ? "" : "Cédula ecuatoriana inválida.");
    } else if (digits.length > 0) {
      setCedulaError("La cédula debe tener 10 dígitos.");
    } else {
      setCedulaError("");
    }
  }

  function handleNumeroChange(raw: string) {
    set("numero")(raw.replace(/\D/g, "").slice(0, 10));
  }

  function isFormValid(c: DisciplinaConfig): boolean {
    if (form.cedula.length !== 10 || !validarCedula(form.cedula)) return false;
    if (form.numero.length < 7) return false;
    if (c.tipo === "equipo") {
      if (!form.representante.trim() || !form.nombre_equipo.trim() || !form.categoria) return false;
      if (c.id === "futbol" && !form.carrera) return false;
      if ((c.id === "basket" || c.id === "ecuavoley") && !form.area_conocimiento) return false;
    } else {
      if (!form.nombres.trim() || !form.carrera || !form.nivel) return false;
    }
    return true;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.cedula.length !== 10 || !validarCedula(form.cedula)) {
      setCedulaError("Cédula ecuatoriana inválida.");
      return;
    }
    setState("submitting");
    setErrorMsg("");

    const payload: Record<string, string> =
      cfg.tipo === "equipo"
        ? {
            representante: form.representante,
            numero: form.numero,
            cedula: form.cedula,
            nombre_equipo: form.nombre_equipo,
            categoria: form.categoria,
            ...(cfg.id === "futbol" ? { carrera: form.carrera } : {}),
            ...(cfg.id === "basket" || cfg.id === "ecuavoley"
              ? { area_conocimiento: form.area_conocimiento }
              : {}),
          }
        : {
            nombres: form.nombres,
            numero: form.numero,
            cedula: form.cedula,
            carrera: form.carrera,
            nivel: form.nivel,
          };

    const { error } = await insforge.database.from(cfg.table).insert([payload]);
    if (error) {
      setState("error");
      if (error.code === "23505") {
        setCedulaError("Esta cédula ya está registrada en esta disciplina.");
      } else if (error.code === "EQ001" && error.message) {
        setErrorMsg(error.message);
      } else {
        setErrorMsg("No se pudo guardar tu inscripción. Intenta de nuevo.");
      }
      return;
    }
    setState("success");
    setForm(EMPTY_FORM);
  }

  function switchDisciplina(id: DisciplinaId) {
    setDisciplina(id);
    setForm(EMPTY_FORM);
    setCedulaError("");
    setErrorMsg("");
    setState("idle");
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a0a0a]">
      <BackgroundDecor id={disciplina} />

      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-72 w-96 -translate-x-1/2 rounded-full bg-gold/6 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 h-48 w-64 rounded-full bg-gold/4 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-3xl px-5 py-14 sm:px-8">
        <a
          href="/"
          className="inline-flex items-center gap-2 text-[0.7rem] tracking-[0.18em] text-white/35 transition-colors hover:text-white/70"
        >
          <BackArrow />VOLVER AL EVENTO
        </a>

        {/* Header */}
        <div className="mt-10 text-center">
          <p className="text-[0.65rem] tracking-[0.32em] text-gold">OLIMPIADAS ULEAM CHONE · 2026</p>
          <h1 className="mt-4 font-display text-3xl tracking-tight text-white sm:text-4xl">
            Elige tu disciplina
          </h1>
          <p className="mx-auto mt-4 max-w-md text-sm leading-[1.85] text-white/45">
            Inscripciones abiertas para {INSCRIPCIONES_ABIERTAS.join(" y ")}. Fútbol, Basket y Ecuavoley
            cerraron sus registros; aquí publicamos su calendario y sus tablas clasificatorias.
          </p>
        </div>

        {/* Venue map preview */}
        <div className="mt-8 overflow-hidden rounded-2xl border border-white/10">
          <div className="relative h-52 w-full sm:h-64">
            <iframe
              src="https://maps.google.com/maps?q=-0.6864735,-80.1115369&t=k&output=embed&z=16"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Ubicación Chone Park"
            />
          </div>
          <a
            href="https://maps.app.goo.gl/B1JtjHdTEie1jNZ99"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between gap-3 border-t border-white/8 bg-white/3 px-5 py-3 transition-colors hover:bg-white/6"
          >
            <div className="flex min-w-0 items-center gap-2.5">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 shrink-0 text-gold">
                <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="3" />
              </svg>
              <span className="truncate text-xs text-white/60">Chone Park · Chone</span>
            </div>
            <span className="shrink-0 text-[0.65rem] tracking-[0.15em] text-gold/70 hover:text-gold">VER EN MAPS →</span>
          </a>
        </div>

        {/* Upcoming matches schedule */}
        <UpcomingSchedule />

        {/* Discipline selector */}
        <div className="mt-10 flex flex-wrap justify-center gap-2">
          {DISCIPLINAS.map((d) => (
            <button
              key={d.id}
              onClick={() => switchDisciplina(d.id)}
              className={`rounded-full border px-4 py-2 text-[0.68rem] tracking-[0.16em] uppercase transition-all ${
                disciplina === d.id
                  ? "border-gold/50 bg-gold/15 text-gold"
                  : "border-white/10 bg-white/3 text-white/40 hover:border-white/25 hover:text-white/70"
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>

        {/* Active discipline panel */}
        <AnimatePresence mode="wait">
          <motion.div
            key={disciplina}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            className="mt-8"
          >
            {/* Info card */}
            <div className="rounded-2xl border border-white/10 bg-white/4 p-6 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-gold/30 bg-gold/10 text-gold">
                  {HEADER_IMG[cfg.id] ? (
                    <GoldImg src={HEADER_IMG[cfg.id]} className="h-6 w-6" />
                  ) : (
                    <DecorativeIcon name={cfg.id} className="h-6 w-6" />
                  )}
                </span>
                <div>
                  <h2 className="font-display text-2xl tracking-tight text-white">{cfg.label}</h2>
                  {cfg.tipo === "equipo" ? (
                    <p className="text-[0.68rem] tracking-[0.18em] text-gold/70 uppercase">
                      {cfg.categorias.join(" / ")}
                    </p>
                  ) : (
                    <p className="text-[0.68rem] tracking-[0.18em] text-gold/70 uppercase">Individual</p>
                  )}
                </div>
              </div>
              {cfg.inscripcionAbierta && (
                <p className="mt-4 text-sm leading-[1.85] text-white/50">{cfg.descripcion}</p>
              )}
            </div>

            {/* Form */}
            {!cfg.inscripcionAbierta ? (
              <div className="mt-6 rounded-2xl border border-white/10 bg-white/3 p-8 text-center backdrop-blur-sm">
                <p className="text-[0.62rem] tracking-[0.3em] text-gold uppercase">Registros cerrados</p>
                <p className="mt-3 text-sm text-white/45">
                  Todavía puedes inscribirte en {INSCRIPCIONES_ABIERTAS.join(" y ")}.
                </p>
              </div>
            ) : (
            <form onSubmit={handleSubmit} className="mt-6 rounded-2xl border border-white/10 bg-white/3 p-6 backdrop-blur-sm sm:p-8">
              {state === "success" ? (
                <div className="flex flex-col items-center gap-4 py-8 text-center">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full border border-gold/40 bg-gold/10 text-gold">
                    <DecorativeIcon name="medal" className="h-7 w-7" />
                  </span>
                  <div>
                    <p className="text-lg text-white">¡Inscripción registrada!</p>
                    <p className="mt-1 text-sm text-white/45">
                      Te contactaremos con los detalles de la disciplina {cfg.label}.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setState("idle");
                      setForm(EMPTY_FORM);
                    }}
                    className="rounded-full border border-gold/40 bg-gold/10 px-5 py-2 text-xs tracking-[0.18em] text-gold transition-colors hover:bg-gold/20"
                  >
                    NUEVA INSCRIPCIÓN
                  </button>
                </div>
              ) : (
                <div className="grid gap-5 sm:grid-cols-2">
                  {cfg.tipo === "equipo" ? (
                    <>
                      <div className="sm:col-span-2">
                        <Field label="Categoría" required>
                          <div className="flex gap-1 rounded-xl border border-white/10 bg-white/2 p-1">
                            {cfg.categorias.map((cat) => (
                              <button
                                key={cat}
                                type="button"
                                onClick={() => set("categoria")(cat)}
                                className={`flex-1 rounded-lg px-4 py-2 text-[0.65rem] tracking-[0.18em] uppercase transition-all ${
                                  form.categoria === cat
                                    ? "bg-gold/15 text-gold border border-gold/30"
                                    : "text-white/40 hover:text-white/70"
                                }`}
                              >
                                {cat}
                              </button>
                            ))}
                          </div>
                        </Field>
                      </div>
                      <div className="sm:col-span-2">
                        <Field label="Nombre del equipo" required>
                          <input
                            className={inputClass}
                            value={form.nombre_equipo}
                            onChange={(e) => set("nombre_equipo")(e.target.value)}
                            placeholder="Nombre de tu equipo"
                          />
                        </Field>
                      </div>
                      <Field label="Nombre del representante" required>
                        <input
                          className={inputClass}
                          value={form.representante}
                          onChange={(e) => set("representante")(e.target.value)}
                          placeholder="Nombre completo"
                        />
                      </Field>
                      <Field label="Número del representante" required hint="Solo dígitos, máximo 10.">
                        <input
                          className={inputClass}
                          inputMode="numeric"
                          value={form.numero}
                          onChange={(e) => handleNumeroChange(e.target.value)}
                          placeholder="09xxxxxxxx"
                        />
                      </Field>
                      <div className="sm:col-span-2">
                        <Field label="Cédula del representante" required hint="Validación automática en tiempo real.">
                          <input
                            className={`${inputClass} ${cedulaError ? "border-red-500/60" : ""}`}
                            inputMode="numeric"
                            value={form.cedula}
                            onChange={(e) => handleCedulaChange(e.target.value)}
                            placeholder="10 dígitos"
                          />
                          {cedulaError ? (
                            <span className="mt-1 block text-[0.68rem] text-red-400">{cedulaError}</span>
                          ) : null}
                        </Field>
                      </div>
                      <div className="sm:col-span-2">
                        {cfg.id === "futbol" ? (
                          <Field label="Carrera" required>
                            <Select
                              value={form.carrera}
                              onChange={set("carrera")}
                              placeholder="Selecciona tu carrera"
                              options={CARRERAS}
                            />
                          </Field>
                        ) : (
                          <Field label="Área del conocimiento" required>
                            <Select
                              value={form.area_conocimiento}
                              onChange={set("area_conocimiento")}
                              placeholder="Selecciona tu área"
                              options={AREAS}
                            />
                          </Field>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="sm:col-span-2">
                        <Field label="Nombres completos del participante" required>
                          <input
                            className={inputClass}
                            value={form.nombres}
                            onChange={(e) => set("nombres")(e.target.value)}
                            placeholder="Nombres y apellidos"
                          />
                        </Field>
                      </div>
                      <Field label="Número" required hint="Solo dígitos, máximo 10.">
                        <input
                          className={inputClass}
                          inputMode="numeric"
                          value={form.numero}
                          onChange={(e) => handleNumeroChange(e.target.value)}
                          placeholder="09xxxxxxxx"
                        />
                      </Field>
                      <Field label="Cédula" required hint="Validación automática en tiempo real.">
                        <input
                          className={`${inputClass} ${cedulaError ? "border-red-500/60" : ""}`}
                          inputMode="numeric"
                          value={form.cedula}
                          onChange={(e) => handleCedulaChange(e.target.value)}
                          placeholder="10 dígitos"
                        />
                        {cedulaError ? (
                          <span className="mt-1 block text-[0.68rem] text-red-400">{cedulaError}</span>
                        ) : null}
                      </Field>
                      <Field label="Carrera" required>
                        <Select
                          value={form.carrera}
                          onChange={set("carrera")}
                          placeholder="Selecciona tu carrera"
                          options={CARRERAS}
                        />
                      </Field>
                      <Field label="Nivel" required>
                        <Select
                          value={form.nivel}
                          onChange={set("nivel")}
                          placeholder="Selecciona tu nivel"
                          options={NIVELES}
                        />
                      </Field>
                    </>
                  )}

                  <div className="sm:col-span-2 mt-2">
                    {errorMsg ? (
                      <p className="mb-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-300">
                        {errorMsg}
                      </p>
                    ) : null}
                    <button
                      type="submit"
                      disabled={!isFormValid(cfg) || state === "submitting"}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-gold/50 bg-gold/15 px-6 py-3 text-sm tracking-[0.18em] text-gold uppercase transition-all hover:bg-gold/25 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {state === "submitting" ? "Registrando..." : `Inscribirme en ${cfg.label}`}
                    </button>
                  </div>
                </div>
              )}
            </form>
            )}

            {cfg.tablaActiva ? (
              <div className="mt-6">
                <StandingsTable disciplina={cfg.id} />
              </div>
            ) : (
              <div className="mt-6 rounded-2xl border border-dashed border-white/15 bg-white/2 p-6 text-center">
                <p className="text-[0.65rem] tracking-[0.28em] text-white/30 uppercase">Tabla clasificatoria</p>
                <p className="mt-2 text-sm text-white/40">
                  {cfg.label} · las posiciones y resultados de esta disciplina se publicarán aquí.
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function BackArrow() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
      <path d="M19 12H5M12 5l-7 7 7 7" />
    </svg>
  );
}



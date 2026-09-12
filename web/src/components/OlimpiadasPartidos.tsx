"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { insforge } from "@/lib/insforge/browser";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type AccionTipo =
  | "gol_local"
  | "gol_visitante"
  | "amarilla_local"
  | "amarilla_visitante"
  | "roja_local"
  | "roja_visitante";

interface Accion {
  t: AccionTipo;
}

type EstadoPartido = "pendiente" | "en_curso" | "finalizado";

interface PartidoOlimpiadas {
  id: string;
  equipo_local: string;
  equipo_visitante: string;
  goles_local: number;
  goles_visitante: number;
  amarillas_local: number;
  amarillas_visitante: number;
  rojas_local: number;
  rojas_visitante: number;
  duracion_tiempo: number;
  segundos_restantes: number;
  num_tiempos: number;
  tiempo_actual: number;
  penales_local: number | null;
  penales_visitante: number | null;
  en_curso: boolean;
  estado: EstadoPartido;
  historial: Accion[];
  created_at: string;
  updated_at: string;
}

type CampoConteo =
  | "goles_local"
  | "goles_visitante"
  | "amarillas_local"
  | "amarillas_visitante"
  | "rojas_local"
  | "rojas_visitante";

const ACCION_FIELD: Record<AccionTipo, CampoConteo> = {
  gol_local: "goles_local",
  gol_visitante: "goles_visitante",
  amarilla_local: "amarillas_local",
  amarilla_visitante: "amarillas_visitante",
  roja_local: "rojas_local",
  roja_visitante: "rojas_visitante",
};

const ACCION_LABEL: Record<AccionTipo, string> = {
  gol_local: "GOL · Local",
  gol_visitante: "GOL · Visitante",
  amarilla_local: "Amarilla · Local",
  amarilla_visitante: "Amarilla · Visitante",
  roja_local: "Roja · Local",
  roja_visitante: "Roja · Visitante",
};

const ESTADO_LABEL: Record<EstadoPartido, string> = {
  pendiente: "SIN INICIAR",
  en_curso: "EN CURSO",
  finalizado: "FINALIZADO",
};

function formatTime(totalSec: number): string {
  const s = Math.max(0, Math.floor(totalSec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  }
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

// ---------------------------------------------------------------------------
// Icons
// ---------------------------------------------------------------------------

function MaximizeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <path d="M8 3H5a2 2 0 0 0-2 2v3" />
      <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
      <path d="M3 16v3a2 2 0 0 0 2 2h3" />
      <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
    </svg>
  );
}

function MinimizeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <path d="M8 3v3a2 2 0 0 1-2 2H3" />
      <path d="M21 8h-3a2 2 0 0 1-2-2V3" />
      <path d="M3 16h3a2 2 0 0 1 2 2v3" />
      <path d="M16 21v-3a2 2 0 0 1 2-2h3" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
      <path d="M8 5.14v13.72a1 1 0 0 0 1.5.86l11-6.86a1 1 0 0 0 0-1.72l-11-6.86a1 1 0 0 0-1.5.86Z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
      <rect x="6" y="4" width="4" height="16" rx="1" />
      <rect x="14" y="4" width="4" height="16" rx="1" />
    </svg>
  );
}

function RotateIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  );
}

function UndoIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
      <path d="M9 14 4 9l5-5" />
      <path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v0a5.5 5.5 0 0 1-5.5 5.5H11" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
      <path d="M3 6h18" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function CardIcon({ color }: { color: "yellow" | "red" }) {
  return (
    <span
      className={`inline-block h-4 w-3 rounded-[3px] border ${
        color === "yellow"
          ? "border-yellow-300/70 bg-yellow-400/70"
          : "border-red-400/70 bg-red-500/70"
      }`}
    />
  );
}

// ---------------------------------------------------------------------------
// Match control modal (fullscreen-capable)
// ---------------------------------------------------------------------------

function MatchControlModal({
  matchId,
  onClose,
  onSaved,
}: {
  matchId: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [match, setMatch] = React.useState<PartidoOlimpiadas | null>(null);
  const [remaining, setRemaining] = React.useState(0);
  const [running, setRunning] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [fullscreen, setFullscreen] = React.useState(false);
  const [armReset, setArmReset] = React.useState(false);
  const [penales, setPenales] = React.useState({ local: 0, visitante: 0 });
  const [showPenales, setShowPenales] = React.useState(false);
  const modalRef = React.useRef<HTMLDivElement>(null);

  const matchRef = React.useRef<PartidoOlimpiadas | null>(null);
  const remainingRef = React.useRef(0);
  const runningRef = React.useRef(false);

  remainingRef.current = remaining;
  runningRef.current = running;

  // Writes any patch plus the current timer snapshot. Timer is persisted so
  // a reload (or closing the modal) never resets the clock mid-game.
  const persist = React.useCallback(
    async (patch: Record<string, unknown>) => {
      if (!matchRef.current) return;
      await insforge.database
        .from("partidos_olimpiadas")
        .update([
          {
            ...patch,
            segundos_restantes: remainingRef.current,
            en_curso: runningRef.current,
          },
        ])
        .eq("id", matchId);
    },
    [matchId],
  );

  React.useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await insforge.database
        .from("partidos_olimpiadas")
        .select("*")
        .eq("id", matchId)
        .single();
      if (!active) return;
      if (!data) {
        setLoading(false);
        return;
      }
      const m = data as PartidoOlimpiadas;
      let rem = m.segundos_restantes;
      let run = m.en_curso;
      if (run) {
        const elapsed = Math.floor((Date.now() - new Date(m.updated_at).getTime()) / 1000);
        rem = Math.max(0, rem - elapsed);
        if (rem === 0) run = false;
      }
      matchRef.current = m;
      remainingRef.current = rem;
      runningRef.current = run;
      setMatch(m);
      setRemaining(rem);
      setRunning(run);
      setPenales({ local: m.penales_local ?? 0, visitante: m.penales_visitante ?? 0 });
      setShowPenales(false);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [matchId]);

  // Countdown tick
  React.useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setRemaining((prev) => {
        const next = prev - 1;
        if (next <= 0) {
          setRunning(false);
          runningRef.current = false;
          persist({});
          return 0;
        }
        return next;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [running, persist]);

  // Heartbeat: keeps the countdown fresh in the DB while running, so a tab
  // close / reload doesn't lose the running clock.
  React.useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      if (matchRef.current) persist({});
    }, 5000);
    return () => window.clearInterval(id);
  }, [running, persist]);

  // Best-effort timer save when the modal unmounts.
  React.useEffect(() => {
    return () => {
      if (matchRef.current) {
        insforge.database
          .from("partidos_olimpiadas")
          .update([
            {
              segundos_restantes: remainingRef.current,
              en_curso: runningRef.current,
            },
          ])
          .eq("id", matchId);
      }
    };
  }, [matchId]);

  // Fullscreen API
  React.useEffect(() => {
    const onFs = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  function toggleFullscreen() {
    if (!modalRef.current) return;
    try {
      if (document.fullscreenElement) {
        void document.exitFullscreen();
      } else {
        void modalRef.current.requestFullscreen();
      }
    } catch {
      /* fullscreen unavailable */
    }
  }

  function aplicarAccion(tipo: AccionTipo) {
    if (!match) return;
    const field = ACCION_FIELD[tipo];
    const nextVal = (match[field] as number) + 1;
    const historia = [...match.historial, { t: tipo }];
    setMatch((m) => (m ? { ...m, [field]: nextVal, historial: historia } : m));
    void persist({ [field]: nextVal, historial: historia });
  }

  function quitarDirecto(field: CampoConteo) {
    if (!match) return;
    const nextVal = Math.max(0, (match[field] as number) - 1);
    setMatch((m) => (m ? { ...m, [field]: nextVal } : m));
    void persist({ [field]: nextVal });
  }

  function deshacer() {
    if (!match || match.historial.length === 0) return;
    const historia = [...match.historial];
    const ultima = historia.pop()!;
    const field = ACCION_FIELD[ultima.t];
    const nextVal = Math.max(0, (match[field] as number) - 1);
    setMatch((m) => (m ? { ...m, [field]: nextVal, historial: historia } : m));
    void persist({ [field]: nextVal, historial: historia });
  }

  function toggleTimer() {
    if (!match) return;
    if (remainingRef.current <= 0) {
      const m = matchRef.current;
      if (m && m.tiempo_actual >= m.num_tiempos) setShowPenales(true);
      return;
    }
    const next = !runningRef.current;
    runningRef.current = next;
    setRunning(next);
    const patch: Record<string, unknown> = {};
    if (next && matchRef.current?.estado === "pendiente") {
      patch.estado = "en_curso";
      setMatch((m) => (m ? { ...m, estado: "en_curso" } : m));
    }
    void persist(patch);
  }

  function selectTiempo(n: number) {
    if (!match || n === match.tiempo_actual) return;
    runningRef.current = false;
    remainingRef.current = match.duracion_tiempo;
    setRunning(false);
    setRemaining(match.duracion_tiempo);
    setMatch((m) => (m ? { ...m, tiempo_actual: n } : m));
    void persist({ tiempo_actual: n });
  }

  function resetTimer() {
    if (!match) return;
    runningRef.current = false;
    remainingRef.current = match.duracion_tiempo;
    setRunning(false);
    setRemaining(match.duracion_tiempo);
    void persist({});
  }

  function ajustarTiempo(deltaSec: number) {
    if (!match) return;
    const next = Math.max(0, remainingRef.current + deltaSec);
    remainingRef.current = next;
    setRemaining(next);
    void persist({});
  }

  async function guardarFinal(patch: Record<string, unknown>) {
    if (!match) return;
    runningRef.current = false;
    setRunning(false);
    setMatch((m) => (m ? { ...m, estado: "finalizado", ...patch } : m));
    await persist({ ...patch, estado: "finalizado" });
    onSaved();
  }

  async function finalizar() {
    if (!match) return;
    const empatado = match.goles_local === match.goles_visitante;
    if (empatado && match.tiempo_actual >= match.num_tiempos) {
      // Regulation is over and it's a tie → force the penalty shootout.
      setShowPenales(true);
      return;
    }
    await guardarFinal({ penales_local: null, penales_visitante: null });
  }

  async function guardarPenales() {
    if (!match) return;
    await guardarFinal({
      penales_local: penales.local,
      penales_visitante: penales.visitante,
    });
  }

  async function resetCompleto() {
    if (!match) return;
    runningRef.current = false;
    remainingRef.current = match.duracion_tiempo;
    setRunning(false);
    setRemaining(match.duracion_tiempo);
    setArmReset(false);
    setShowPenales(false);
    setPenales({ local: 0, visitante: 0 });
    const limpio = {
      goles_local: 0,
      goles_visitante: 0,
      amarillas_local: 0,
      amarillas_visitante: 0,
      rojas_local: 0,
      rojas_visitante: 0,
      tiempo_actual: 1,
      penales_local: null,
      penales_visitante: null,
      historial: [],
      estado: "en_curso" as EstadoPartido,
    };
    setMatch((m) => (m ? { ...m, ...limpio } : m));
    await persist({ ...limpio });
    onSaved();
  }

  const accionesRecientes = match?.historial.slice(-4).reverse() ?? [];
  const ultimoTiempo = !!match && match.tiempo_actual >= match.num_tiempos;
  const empatado = !!match && match.goles_local === match.goles_visitante;

  return (
    <AnimatePresence>
      <motion.div
        ref={modalRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[70] flex flex-col bg-[#0a0a0a]"
      >
        {/* Header */}
        <div className="shrink-0 border-b border-white/8 px-4 py-2.5 sm:px-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-gold/30 bg-gold/10 text-gold">
                <ClockIcon />
              </span>
              <div className="min-w-0">
                <p className="text-[0.58rem] tracking-[0.26em] text-gold uppercase">Control de partido</p>
                {loading ? (
                  <p className="mt-0.5 text-[0.62rem] text-white/30">Cargando…</p>
                ) : match ? (
                  <p className="truncate text-[0.7rem] text-white/60">
                    {match.equipo_local} <span className="text-white/25">vs</span> {match.equipo_visitante}
                  </p>
                ) : null}
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              {match && (
                <span
                  className={`hidden rounded-full border px-3 py-1 text-[0.58rem] tracking-[0.2em] uppercase sm:block ${
                    match.estado === "en_curso"
                      ? "border-gold/40 bg-gold/10 text-gold"
                      : "border-white/15 bg-white/5 text-white/40"
                  }`}
                >
                  {ESTADO_LABEL[match.estado]}
                </span>
              )}
              <button
                onClick={toggleFullscreen}
                title={fullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
                aria-label={fullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/50 transition-colors hover:border-gold/40 hover:text-gold"
              >
                {fullscreen ? <MinimizeIcon /> : <MaximizeIcon />}
              </button>
              <button
                onClick={onClose}
                title="Cerrar"
                aria-label="Cerrar"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/50 transition-colors hover:text-white"
              >
                ✕
              </button>
            </div>
          </div>
        </div>

        {/* Body — compact, fits a single viewport without scrolling */}
        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden px-3 py-3 sm:px-5 sm:py-4">
          {loading || !match ? (
            <div className="flex h-full items-center justify-center text-xs text-white/30">Cargando partido…</div>
          ) : (
            <>
              {/* Scoreboard + timer share the row */}
              <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 sm:grid-cols-[1.15fr_1fr]">
                {/* Scoreboard */}
                <div className="flex min-h-0 flex-col justify-center rounded-2xl border border-white/10 bg-white/4 px-4 py-4 sm:px-6">
                  <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4">
                    <div className="flex flex-col items-center gap-2">
                      <p className="w-full truncate text-center font-[var(--font-display)] text-sm text-white">
                        {match.equipo_local}
                      </p>
                      <p className="font-[var(--font-display)] text-6xl text-white tabular-nums sm:text-7xl">
                        {match.goles_local}
                      </p>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => quitarDirecto("goles_local")}
                          disabled={match.goles_local === 0}
                          title="Quitar gol"
                          aria-label="Quitar gol al equipo local"
                          className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/4 text-xl text-white/60 transition-colors hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-25"
                        >
                          −
                        </button>
                        <button
                          onClick={() => aplicarAccion("gol_local")}
                          title="Marcar gol"
                          aria-label="Marcar gol al equipo local"
                          className="flex h-9 w-9 items-center justify-center rounded-xl border border-gold/40 bg-gold/10 text-xl text-gold transition-all hover:border-gold/70 hover:bg-gold/20 active:scale-95"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <p className="text-[0.55rem] tracking-[0.18em] text-white/25 uppercase">vs</p>
                    <div className="flex flex-col items-center gap-2">
                      <p className="w-full truncate text-center font-[var(--font-display)] text-sm text-white">
                        {match.equipo_visitante}
                      </p>
                      <p className="font-[var(--font-display)] text-6xl text-white tabular-nums sm:text-7xl">
                        {match.goles_visitante}
                      </p>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => quitarDirecto("goles_visitante")}
                          disabled={match.goles_visitante === 0}
                          title="Quitar gol"
                          aria-label="Quitar gol al equipo visitante"
                          className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/4 text-xl text-white/60 transition-colors hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-25"
                        >
                          −
                        </button>
                        <button
                          onClick={() => aplicarAccion("gol_visitante")}
                          title="Marcar gol"
                          aria-label="Marcar gol al equipo visitante"
                          className="flex h-9 w-9 items-center justify-center rounded-xl border border-gold/40 bg-gold/10 text-xl text-gold transition-all hover:border-gold/70 hover:bg-gold/20 active:scale-95"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Timer */}
                <div className="flex min-h-0 flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/4 px-4 py-4 text-center">
                  <div className="flex items-center gap-1.5">
                    <span className="mr-0.5 text-[0.55rem] tracking-[0.18em] text-white/35 uppercase">
                      Tiempo
                    </span>
                    {Array.from({ length: match.num_tiempos }, (_, i) => i + 1).map((n) => (
                      <button
                        key={n}
                        onClick={() => selectTiempo(n)}
                        title={`Tiempo ${n}`}
                        aria-label={`Seleccionar tiempo ${n}`}
                        className={`flex h-7 w-7 items-center justify-center rounded-full border text-[0.62rem] font-medium transition-all ${
                          match.tiempo_actual === n
                            ? "border-gold/60 bg-gold/20 text-gold"
                            : "border-white/12 bg-white/4 text-white/40 hover:border-white/30 hover:text-white/70"
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                  <p
                    className={`mt-1 font-[var(--font-display)] text-6xl tabular-nums sm:text-7xl ${
                      remaining === 0 && !running ? "animate-pulse text-red-400" : "text-white"
                    }`}
                  >
                    {formatTime(remaining)}
                  </p>
                  <p className="mt-0.5 text-[0.58rem] tracking-[0.22em] text-white/30 uppercase">
                    {running
                      ? "En juego"
                      : remaining === 0 && ultimoTiempo
                        ? "Regulación terminada"
                        : remaining === 0
                          ? "Tiempo cumplido"
                          : "Detenido"}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5">
                    {!(remaining === 0) && (
                      <button
                        onClick={toggleTimer}
                        className="inline-flex min-w-[110px] items-center justify-center gap-1.5 rounded-xl border border-gold/40 bg-gold/10 px-4 py-1.5 text-[0.64rem] tracking-[0.2em] text-gold uppercase transition-all hover:border-gold/70 hover:bg-gold/20"
                      >
                        {running ? (
                          <>
                            <PauseIcon /> Pausar
                          </>
                        ) : (
                          <>
                            <PlayIcon /> Iniciar
                          </>
                        )}
                      </button>
                    )}
                    {remaining === 0 && ultimoTiempo && (
                      <button
                        onClick={() => setShowPenales(true)}
                        disabled={!empatado}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-gold/50 bg-gold/15 px-4 py-1.5 text-[0.64rem] tracking-[0.2em] text-gold uppercase transition-all hover:bg-gold/25 disabled:cursor-not-allowed disabled:opacity-40"
                        title={empatado ? "Empate — abrir tanda de penales" : "No hay empate, puedes finalizar"}
                      >
                        {empatado ? "Tanda de penales" : "Sin empate"}
                      </button>
                    )}
                    <button
                      onClick={resetTimer}
                      title="Reiniciar el tiempo de este período sin tocar marcador ni tarjetas"
                      className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/3 px-3 py-1.5 text-[0.64rem] tracking-[0.2em] text-white/50 uppercase transition-colors hover:border-white/25 hover:text-white"
                    >
                      <RotateIcon /> Tiempo
                    </button>
                    <button
                      onClick={() => ajustarTiempo(-60)}
                      className="rounded-xl border border-white/10 bg-white/3 px-3 py-1.5 text-[0.64rem] tracking-[0.15em] text-white/50 transition-colors hover:text-white"
                    >
                      −1:00
                    </button>
                    <button
                      onClick={() => ajustarTiempo(60)}
                      className="rounded-xl border border-white/10 bg-white/3 px-3 py-1.5 text-[0.64rem] tracking-[0.15em] text-white/50 transition-colors hover:text-white"
                    >
                      +1:00
                    </button>
                  </div>
                </div>
              </div>

              {/* Penalties */}
              {(showPenales || (ultimoTiempo && empatado)) && match.estado !== "finalizado" && (
                <div className="flex-none rounded-2xl border border-gold/30 bg-gold/6 px-4 py-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-col">
                      <p className="text-[0.6rem] tracking-[0.24em] text-gold uppercase">Tanda de penales</p>
                      <p className="mt-0.5 text-[0.58rem] text-white/40">
                        Marcador empatado — registra el resultado de los penales.
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-4">
                      <PenalCounter
                        equipo={match.equipo_local}
                        count={penales.local}
                        onInc={() => setPenales((p) => ({ ...p, local: p.local + 1 }))}
                        onDec={() => setPenales((p) => ({ ...p, local: Math.max(0, p.local - 1) }))}
                      />
                      <PenalCounter
                        equipo={match.equipo_visitante}
                        count={penales.visitante}
                        onInc={() => setPenales((p) => ({ ...p, visitante: p.visitante + 1 }))}
                        onDec={() => setPenales((p) => ({ ...p, visitante: Math.max(0, p.visitante - 1) }))}
                      />
                      <div className="flex flex-col gap-1.5">
                        <button
                          onClick={guardarPenales}
                          className="rounded-xl border border-gold/60 bg-gold/20 px-4 py-2 text-[0.64rem] tracking-[0.18em] text-gold uppercase transition-colors hover:bg-gold/30"
                        >
                          Guardar y finalizar
                        </button>
                        <button
                          onClick={() => setShowPenales(false)}
                          className="rounded-xl border border-white/10 bg-white/3 px-4 py-1.5 text-[0.6rem] tracking-[0.16em] text-white/50 uppercase transition-colors hover:text-white"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Cards — one row per team */}
              <div className="grid flex-none grid-cols-1 gap-3 sm:grid-cols-2">
                {(
                  [
                    { equipo: match.equipo_local, amarillas: match.amarillas_local, rojas: match.rojas_local, suf: "local" as const },
                    { equipo: match.equipo_visitante, amarillas: match.amarillas_visitante, rojas: match.rojas_visitante, suf: "visitante" as const },
                  ]
                ).map((t) => (
                  <div key={t.suf} className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/3 px-4 py-2">
                    <p className="w-0 flex-1 truncate font-[var(--font-display)] text-sm text-white">
                      {t.equipo}
                    </p>
                    <div className="flex shrink-0 items-center gap-5 sm:gap-7">
                      <CardCounter
                        label="Amarillas"
                        color="yellow"
                        count={t.amarillas}
                        onInc={() => aplicarAccion(`amarilla_${t.suf}` as AccionTipo)}
                        onDec={() => quitarDirecto(`amarillas_${t.suf}` as CampoConteo)}
                      />
                      <CardCounter
                        label="Rojas"
                        color="red"
                        count={t.rojas}
                        onInc={() => aplicarAccion(`roja_${t.suf}` as AccionTipo)}
                        onDec={() => quitarDirecto(`rojas_${t.suf}` as CampoConteo)}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Undo */}
              <div className="flex flex-none flex-wrap items-center justify-between gap-2 rounded-2xl border border-white/10 bg-white/3 px-4 py-2">
                <button
                  onClick={deshacer}
                  disabled={match.historial.length === 0}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3.5 py-1.5 text-[0.64rem] tracking-[0.18em] text-white/70 uppercase transition-colors hover:border-gold/40 hover:text-gold disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <UndoIcon /> Deshacer última acción
                </button>
                <div className="flex min-w-0 items-center gap-2">
                  <p className="hidden text-[0.58rem] text-white/35 lg:block">
                    Anula goles o tarjetas sin tocar el tiempo ({match.historial.length} acciones)
                  </p>
                  {accionesRecientes.length > 0 && (
                    <div className="flex flex-wrap justify-end gap-1.5">
                      {accionesRecientes.map((a, i) => (
                        <span
                          key={`${a.t}-${i}`}
                          className="rounded-full border border-white/10 bg-white/4 px-2.5 py-0.5 text-[0.55rem] tracking-[0.12em] text-white/50 uppercase"
                        >
                          {ACCION_LABEL[a.t]}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Bottom bar */}
        <div className="shrink-0 border-t border-white/8 px-4 py-2 sm:px-5">
          <div className="flex flex-wrap items-center justify-end gap-2">
            {armReset ? (
              <>
                <button
                  onClick={resetCompleto}
                  className="rounded-xl border border-red-500/50 bg-red-500/15 px-4 py-2 text-[0.64rem] tracking-[0.18em] text-red-300 uppercase transition-colors hover:bg-red-500/25"
                >
                  Sí, reiniciar todo
                </button>
                <button
                  onClick={() => setArmReset(false)}
                  className="rounded-xl border border-white/10 bg-white/3 px-4 py-2 text-[0.64rem] tracking-[0.18em] text-white/60 uppercase transition-colors hover:text-white"
                >
                  Cancelar
                </button>
              </>
            ) : (
              <button
                onClick={() => setArmReset(true)}
                disabled={match?.estado === "finalizado"}
                title="Reinicia marcador, tarjetas y tiempo"
                className="rounded-xl border border-white/10 bg-white/3 px-4 py-2 text-[0.64rem] tracking-[0.18em] text-white/50 uppercase transition-colors hover:border-red-500/40 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-30"
              >
                Reset completo
              </button>
            )}
            <button
              onClick={finalizar}
              disabled={match?.estado === "finalizado"}
              className="rounded-xl border border-gold/50 bg-gold/15 px-5 py-2 text-[0.64rem] tracking-[0.18em] text-gold uppercase transition-all hover:bg-gold/25 disabled:cursor-not-allowed disabled:opacity-30"
            >
              Finalizar partido
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function CardCounter({
  label,
  color,
  count,
  onInc,
  onDec,
}: {
  label: string;
  color: "yellow" | "red";
  count: number;
  onInc: () => void;
  onDec: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex items-center gap-1.5">
        <CardIcon color={color} />
        <span className="font-[var(--font-display)] text-2xl text-white tabular-nums">{count}</span>
      </div>
      <div className="flex gap-1">
        <button
          onClick={onInc}
          aria-label={`Sumar ${label}`}
          className="flex h-6 w-6 items-center justify-center rounded-lg border border-white/10 bg-white/4 text-white/60 transition-colors hover:border-gold/40 hover:text-gold"
        >
          +
        </button>
        <button
          onClick={onDec}
          disabled={count === 0}
          aria-label={`Quitar ${label}`}
          className="flex h-6 w-6 items-center justify-center rounded-lg border border-white/10 bg-white/4 text-white/60 transition-colors hover:border-red-500/40 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-25"
        >
          −
        </button>
      </div>
      <span className="text-[0.5rem] tracking-[0.16em] text-white/35 uppercase">{label}</span>
    </div>
  );
}

function PenalCounter({
  equipo,
  count,
  onInc,
  onDec,
}: {
  equipo: string;
  count: number;
  onInc: () => void;
  onDec: () => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex flex-col items-center">
        <span className="max-w-[90px] truncate text-[0.6rem] text-white/70">{equipo}</span>
        <div className="mt-1 flex items-center gap-1.5">
          <button
            onClick={onDec}
            disabled={count === 0}
            aria-label="Quitar penal"
            className="flex h-6 w-6 items-center justify-center rounded-lg border border-white/10 bg-white/4 text-white/60 transition-colors hover:border-red-500/40 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-25"
          >
            −
          </button>
          <span className="w-8 text-center font-[var(--font-display)] text-2xl text-white tabular-nums">
            {count}
          </span>
          <button
            onClick={onInc}
            aria-label="Sumar penal"
            className="flex h-6 w-6 items-center justify-center rounded-lg border border-white/10 bg-white/4 text-white/60 transition-colors hover:border-gold/40 hover:text-gold"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Partidos panel (list + create form) shown inside the admin panel
// ---------------------------------------------------------------------------

const DUR_PRESETS: { minutos: number; label: string }[] = [
  { minutos: 10, label: "10 min" },
  { minutos: 15, label: "15 min" },
  { minutos: 20, label: "20 min" },
  { minutos: 30, label: "30 min" },
  { minutos: 0, label: "Personalizado" },
];

export default function PartidosPanel({ onCountChange }: { onCountChange: (n: number) => void }) {
  const [partidos, setPartidos] = React.useState<PartidoOlimpiadas[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [showForm, setShowForm] = React.useState(false);
  const [local, setLocal] = React.useState("");
  const [visitante, setVisitante] = React.useState("");
  const [durPreset, setDurPreset] = React.useState(15);
  const [numTiempos, setNumTiempos] = React.useState(2);
  const [customMin, setCustomMin] = React.useState("0");
  const [customSec, setCustomSec] = React.useState("0");
  const [creando, setCreando] = React.useState(false);
  const [error, setError] = React.useState("");
  const [controlId, setControlId] = React.useState<string | null>(null);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  async function loadPartidos() {
    setLoading(true);
    const { data } = await insforge.database
      .from("partidos_olimpiadas")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) {
      const list = data as PartidoOlimpiadas[];
      setPartidos(list);
      onCountChange(list.length);
    }
    setLoading(false);
  }

  React.useEffect(() => {
    void loadPartidos();
  }, []);

  function getDuracionSeg(): number {
    if (durPreset !== 0) return durPreset * 60;
    const m = Math.max(0, parseInt(customMin || "0", 10) || 0);
    const s = Math.min(59, Math.max(0, parseInt(customSec || "0", 10) || 0));
    const total = m * 60 + s;
    return total > 0 ? total : 900;
  }

  async function handleCrear(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!local.trim() || !visitante.trim()) {
      setError("Ingresa ambos nombres de equipo.");
      return;
    }
    const dur = getDuracionSeg();
    setCreando(true);
    const { error: err } = await insforge.database
      .from("partidos_olimpiadas")
      .insert([
        {
          equipo_local: local.trim(),
          equipo_visitante: visitante.trim(),
          duracion_tiempo: dur,
          segundos_restantes: dur,
          num_tiempos: numTiempos,
          tiempo_actual: 1,
        },
      ]);
    if (err) {
      setError("No se pudo crear el partido. Intenta de nuevo.");
    } else {
      setLocal("");
      setVisitante("");
      setCustomMin("0");
      setCustomSec("0");
      setShowForm(false);
      await loadPartidos();
    }
    setCreando(false);
  }

  async function handleEliminar(id: string) {
    setDeletingId(id);
    const { error: err } = await insforge.database
      .from("partidos_olimpiadas")
      .delete()
      .eq("id", id);
    if (!err) await loadPartidos();
    setDeletingId(null);
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[0.7rem] text-white/40">
          Controla el marcador, tiempo y tarjetas de cada partido. El estado se guarda automáticamente.
        </p>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="rounded-xl border border-gold/40 bg-gold/10 px-4 py-2 text-[0.65rem] tracking-[0.18em] text-gold uppercase transition-all hover:border-gold/70 hover:bg-gold/20"
        >
          {showForm ? "Cancelar" : "+ Nuevo partido"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCrear}
          className="rounded-2xl border border-white/10 bg-white/3 p-5"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-[0.6rem] tracking-[0.2em] text-white/40 uppercase">Equipo local</label>
              <input
                value={local}
                onChange={(e) => setLocal(e.target.value)}
                placeholder="Ej. Ingeniería Civil"
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/25 outline-none transition-colors focus:border-gold/50"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[0.6rem] tracking-[0.2em] text-white/40 uppercase">Equipo visitante</label>
              <input
                value={visitante}
                onChange={(e) => setVisitante(e.target.value)}
                placeholder="Ej. Medicina"
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/25 outline-none transition-colors focus:border-gold/50"
              />
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-2">
            <label className="text-[0.6rem] tracking-[0.2em] text-white/40 uppercase">Duración de cada tiempo</label>
            <div className="flex flex-wrap gap-1.5">
              {DUR_PRESETS.map((p) => (
                <button
                  key={p.minutos}
                  type="button"
                  onClick={() => setDurPreset(p.minutos)}
                  className={`rounded-lg border px-3 py-1.5 text-[0.62rem] tracking-[0.15em] uppercase transition-all ${
                    durPreset === p.minutos
                      ? "border-gold/40 bg-gold/10 text-gold"
                      : "border-white/10 bg-white/3 text-white/40 hover:text-white/70"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            {durPreset === 0 && (
              <div className="mt-2 flex items-center gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[0.55rem] tracking-[0.18em] text-white/35 uppercase">Minutos</label>
                  <input
                    type="number"
                    min={0}
                    max={999}
                    value={customMin}
                    onChange={(e) => setCustomMin(e.target.value.replace(/[^\d]/g, ""))}
                    className="w-24 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-gold/50"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[0.55rem] tracking-[0.18em] text-white/35 uppercase">Segundos</label>
                  <input
                    type="number"
                    min={0}
                    max={59}
                    value={customSec}
                    onChange={(e) => setCustomSec(e.target.value.replace(/[^\d]/g, ""))}
                    className="w-24 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-gold/50"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 flex flex-col gap-2">
            <label className="text-[0.6rem] tracking-[0.2em] text-white/40 uppercase">Número de tiempos</label>
            <div className="flex flex-wrap gap-1.5">
              {[1, 2, 3, 4].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setNumTiempos(n)}
                  className={`rounded-lg border px-3 py-1.5 text-[0.62rem] tracking-[0.15em] uppercase transition-all ${
                    numTiempos === n
                      ? "border-gold/40 bg-gold/10 text-gold"
                      : "border-white/10 bg-white/3 text-white/40 hover:text-white/70"
                  }`}
                >
                  {n} {n === 1 ? "tiempo" : "tiempos"}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="mt-3 text-xs text-red-400">{error}</p>}

          <div className="mt-4 flex justify-end">
            <button
              type="submit"
              disabled={creando}
              className="rounded-xl border border-gold/50 bg-gold/15 px-5 py-2 text-[0.65rem] tracking-[0.18em] text-gold uppercase transition-all hover:bg-gold/25 disabled:opacity-50"
            >
              {creando ? "Creando…" : "Crear partido"}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex h-40 items-center justify-center text-xs text-white/30">Cargando partidos…</div>
      ) : partidos.length === 0 ? (
        <div className="flex h-40 items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/2 text-xs text-white/30 italic">
          Aún no hay partidos. Crea uno para empezar a controlarlo.
        </div>
      ) : (
        <div className="w-full overflow-x-auto rounded-2xl border border-white/8">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-white/8">
                {["Partido", "Marcador", "Tiempo", "Estado", "Tarjetas", ""].map((h, i) => (
                  <th key={i} className="px-3 py-3 text-center text-[0.6rem] tracking-[0.2em] font-medium text-white/35 uppercase">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {partidos.map((p) => (
                <tr key={p.id} className="border-b border-white/4 last:border-0 hover:bg-white/2">
                  <td className="max-w-[220px] px-3 py-3 text-center text-xs text-white">
                    <span className="block truncate">{p.equipo_local}</span>
                    <span className="block text-[0.6rem] text-white/25">vs</span>
                    <span className="block truncate">{p.equipo_visitante}</span>
                  </td>
                  <td className="px-3 py-3 text-center font-[var(--font-display)] text-base text-white tabular-nums">
                    {p.goles_local} – {p.goles_visitante}
                    {p.penales_local != null && (
                      <span className="mt-0.5 block text-[0.55rem] tracking-[0.12em] text-white/35 uppercase">
                        Penales {p.penales_local} – {p.penales_visitante}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-3 text-center text-[0.62rem] text-white/50">
                    {p.tiempo_actual}/{p.num_tiempos}
                  </td>
                  <td className="px-3 py-3 text-center">
                    <span
                      className={`inline-block rounded-full border px-2.5 py-1 text-[0.55rem] tracking-[0.15em] uppercase ${
                        p.estado === "finalizado"
                          ? "border-white/15 bg-white/5 text-white/40"
                          : p.estado === "en_curso"
                            ? "border-gold/40 bg-gold/10 text-gold"
                            : "border-white/15 bg-white/5 text-white/40"
                      }`}
                    >
                      {ESTADO_LABEL[p.estado]}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-center text-[0.65rem] text-white/50 tabular-nums">
                    {p.amarillas_local + p.amarillas_visitante} amar.
                    <span className="mx-1 text-white/20">·</span>
                    {p.rojas_local + p.rojas_visitante} rojas
                  </td>
                  <td className="px-3 py-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => setControlId(p.id)}
                        className="rounded-lg border border-gold/40 bg-gold/10 px-3 py-1.5 text-[0.6rem] tracking-[0.15em] text-gold uppercase transition-colors hover:bg-gold/20"
                      >
                        Controlar
                      </button>
                      <button
                        onClick={() => handleEliminar(p.id)}
                        disabled={deletingId === p.id}
                        title="Eliminar partido"
                        aria-label="Eliminar partido"
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/3 text-white/40 transition-colors hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-400 disabled:opacity-40"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {controlId && (
        <MatchControlModal
          matchId={controlId}
          onClose={() => setControlId(null)}
          onSaved={() => {
            setControlId(null);
            void loadPartidos();
          }}
        />
      )}
    </div>
  );
}
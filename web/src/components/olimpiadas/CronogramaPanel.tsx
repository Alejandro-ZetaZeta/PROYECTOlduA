"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { insforge } from "@/lib/insforge/browser";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PartidoOlimpiadas {
  id: string;
  equipo_local: string;
  equipo_visitante: string;
  goles_local: number;
  goles_visitante: number;
  estado: "pendiente" | "en_curso" | "finalizado";
  disciplina?: string;
  categoria?: string | null;
  grupo?: string | null;
  fecha?: number | null;
}

// ---------------------------------------------------------------------------
// Icons
// ---------------------------------------------------------------------------

function ChevronUpIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
      <path d="m18 15-6-6-6 6" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
      <path d="M5 12h14M12 5v14" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

function SaveIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const DISCIPLINA_LABEL: Record<string, string> = {
  futbol: "Fútbol",
  basket: "Basket",
  ecuavoley: "Ecuavoley",
  ajedrez: "Ajedrez",
  pingpong: "Ping Pong",
};

function partidoLabel(p: PartidoOlimpiadas): string {
  return `${p.equipo_local} vs ${p.equipo_visitante}`;
}

function partidoBadge(p: PartidoOlimpiadas): string {
  const parts: string[] = [];
  if (p.disciplina) parts.push(DISCIPLINA_LABEL[p.disciplina] ?? p.disciplina);
  if (p.categoria) parts.push(p.categoria);
  if (p.grupo) parts.push(`Grupo ${p.grupo}`);
  if (p.fecha != null) parts.push(`Fecha ${p.fecha}`);
  return parts.join(" · ");
}

const ESTADO_LABEL: Record<string, string> = {
  pendiente: "Sin iniciar",
  en_curso: "En curso",
  finalizado: "Finalizado",
};

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function CronogramaPanel() {
  const [partidos, setPartidos] = React.useState<PartidoOlimpiadas[]>([]);
  const [schedule, setSchedule] = React.useState<PartidoOlimpiadas[]>([]);
  const [loadingPartidos, setLoadingPartidos] = React.useState(true);
  const [loadingSchedule, setLoadingSchedule] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [savedAt, setSavedAt] = React.useState<Date | null>(null);
  const [saveError, setSaveError] = React.useState("");

  const scheduledIds = React.useMemo(
    () => new Set(schedule.map((p) => p.id)),
    [schedule],
  );

  async function loadPartidos() {
    setLoadingPartidos(true);
    const { data } = await insforge.database
      .from("partidos_olimpiadas")
      .select("*")
      .order("created_at", { ascending: false });
    if (Array.isArray(data)) setPartidos(data as PartidoOlimpiadas[]);
    setLoadingPartidos(false);
  }

  async function loadSchedule() {
    setLoadingSchedule(true);
    const { data: schRows } = await insforge.database
      .from("olimpiadas_schedule")
      .select("partido_id, posicion")
      .order("posicion", { ascending: true });

    if (!Array.isArray(schRows) || schRows.length === 0) {
      setSchedule([]);
      setLoadingSchedule(false);
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
        (pData as PartidoOlimpiadas[]).map((p) => [p.id, p]),
      );
      const ordered = typedRows
        .sort((a, b) => a.posicion - b.posicion)
        .map((r) => pMap.get(r.partido_id))
        .filter(Boolean) as PartidoOlimpiadas[];
      setSchedule(ordered);
    }
    setLoadingSchedule(false);
  }

  React.useEffect(() => {
    void loadPartidos();
    void loadSchedule();
  }, []);

  function addToSchedule(p: PartidoOlimpiadas) {
    if (scheduledIds.has(p.id)) return;
    setSchedule((prev) => [...prev, p]);
  }

  function removeFromSchedule(id: string) {
    setSchedule((prev) => prev.filter((p) => p.id !== id));
  }

  function moveUp(idx: number) {
    if (idx === 0) return;
    setSchedule((prev) => {
      const next = [...prev];
      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
      return next;
    });
  }

  function moveDown(idx: number) {
    setSchedule((prev) => {
      if (idx >= prev.length - 1) return prev;
      const next = [...prev];
      [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
      return next;
    });
  }

  async function handleSave() {
    setSaving(true);
    setSaveError("");

    // Delete all existing schedule rows
    const { error: delErr } = await insforge.database
      .from("olimpiadas_schedule")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");

    if (delErr) {
      setSaveError("No se pudo limpiar el cronograma anterior. Intenta de nuevo.");
      setSaving(false);
      return;
    }

    // Re-insert in order
    if (schedule.length > 0) {
      const rows = schedule.map((p, i) => ({
        partido_id: p.id,
        posicion: i + 1,
      }));
      const { error: insErr } = await insforge.database
        .from("olimpiadas_schedule")
        .insert(rows);
      if (insErr) {
        setSaveError("No se pudo guardar el cronograma. Intenta de nuevo.");
        setSaving(false);
        return;
      }
    }

    setSaving(false);
    setSavedAt(new Date());
    // Notify public page to refresh
    window.dispatchEvent(new CustomEvent("olimpiadas:schedule"));
  }

  const loading = loadingPartidos || loadingSchedule;

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[0.7rem] text-white/40">
          Selecciona y ordena los partidos que aparecerán como "Próximos Partidos" en la página pública.
        </p>
        <div className="flex items-center gap-3">
          {savedAt && !saving && (
            <span className="text-[0.6rem] text-green-400/80">
              ✓ Guardado {savedAt.toLocaleTimeString("es-EC", { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-xl border border-gold/40 bg-gold/10 px-4 py-2 text-[0.65rem] tracking-[0.18em] text-gold uppercase transition-all hover:border-gold/70 hover:bg-gold/20 disabled:opacity-50"
          >
            <SaveIcon />
            {saving ? "Guardando…" : "Guardar cronograma"}
          </button>
        </div>
      </div>

      {saveError && (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs text-red-300">
          {saveError}
        </p>
      )}

      {loading ? (
        <div className="flex h-40 items-center justify-center text-xs text-white/30">Cargando…</div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {/* LEFT — Available matches */}
          <div className="flex flex-col gap-2">
            <p className="text-[0.6rem] tracking-[0.24em] text-white/35 uppercase">
              Partidos disponibles ({partidos.length})
            </p>
            {partidos.length === 0 ? (
              <div className="flex h-24 items-center justify-center rounded-2xl border border-dashed border-white/15 text-xs text-white/30 italic">
                No hay partidos creados aún.
              </div>
            ) : (
              <div className="flex max-h-[520px] flex-col gap-1.5 overflow-y-auto rounded-2xl border border-white/8 p-3">
                {partidos.map((p) => {
                  const alreadyIn = scheduledIds.has(p.id);
                  return (
                    <button
                      key={p.id}
                      onClick={() => addToSchedule(p)}
                      disabled={alreadyIn}
                      className={`flex w-full items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-left transition-all ${
                        alreadyIn
                          ? "border-gold/20 bg-gold/5 opacity-50 cursor-not-allowed"
                          : "border-white/8 bg-white/3 hover:border-gold/30 hover:bg-white/5"
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs text-white">{partidoLabel(p)}</p>
                        <p className="mt-0.5 truncate text-[0.6rem] text-white/40">{partidoBadge(p)}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <span
                          className={`rounded-full border px-2 py-0.5 text-[0.55rem] tracking-[0.12em] uppercase ${
                            p.estado === "en_curso"
                              ? "border-gold/40 bg-gold/10 text-gold"
                              : p.estado === "finalizado"
                                ? "border-white/15 bg-white/5 text-white/40"
                                : "border-white/15 bg-white/5 text-white/35"
                          }`}
                        >
                          {ESTADO_LABEL[p.estado] ?? p.estado}
                        </span>
                        {!alreadyIn && (
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-gold/30 bg-gold/10 text-gold">
                            <PlusIcon />
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* RIGHT — Schedule */}
          <div className="flex flex-col gap-2">
            <p className="text-[0.6rem] tracking-[0.24em] text-white/35 uppercase">
              Cronograma público ({schedule.length})
            </p>
            {schedule.length === 0 ? (
              <div className="flex h-24 items-center justify-center rounded-2xl border border-dashed border-white/15 text-xs text-white/30 italic">
                Agrega partidos desde la lista de la izquierda.
              </div>
            ) : (
              <div className="flex max-h-[520px] flex-col gap-1.5 overflow-y-auto rounded-2xl border border-white/8 p-3">
                <AnimatePresence initial={false}>
                  {schedule.map((p, idx) => (
                    <motion.div
                      key={p.id}
                      layout
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.18 }}
                      className="flex items-center gap-2 rounded-xl border border-gold/20 bg-gold/8 px-3 py-2.5"
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-gold/30 bg-gold/15 text-[0.6rem] font-medium text-gold tabular-nums">
                        {idx + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs text-white">{partidoLabel(p)}</p>
                        <p className="mt-0.5 truncate text-[0.6rem] text-white/40">{partidoBadge(p)}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          onClick={() => moveUp(idx)}
                          disabled={idx === 0}
                          aria-label="Subir"
                          className="flex h-6 w-6 items-center justify-center rounded-lg border border-white/10 bg-white/3 text-white/50 transition-colors hover:border-gold/40 hover:text-gold disabled:cursor-not-allowed disabled:opacity-25"
                        >
                          <ChevronUpIcon />
                        </button>
                        <button
                          onClick={() => moveDown(idx)}
                          disabled={idx === schedule.length - 1}
                          aria-label="Bajar"
                          className="flex h-6 w-6 items-center justify-center rounded-lg border border-white/10 bg-white/3 text-white/50 transition-colors hover:border-gold/40 hover:text-gold disabled:cursor-not-allowed disabled:opacity-25"
                        >
                          <ChevronDownIcon />
                        </button>
                        <button
                          onClick={() => removeFromSchedule(p.id)}
                          aria-label="Quitar del cronograma"
                          className="flex h-6 w-6 items-center justify-center rounded-lg border border-white/10 bg-white/3 text-white/40 transition-colors hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400"
                        >
                          <XIcon />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

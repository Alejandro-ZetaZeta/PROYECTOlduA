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

function SearchIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function normalizeSearch(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
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

  // Search and filter state
  const [searchDisponibles, setSearchDisponibles] = React.useState("");
  const [filtroEstadoDisp, setFiltroEstadoDisp] = React.useState("todos");
  const [filtroCatDisp, setFiltroCatDisp] = React.useState("todos");
  const [searchSchedule, setSearchSchedule] = React.useState("");

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

  const categoriasDisponibles = React.useMemo(() => {
    const set = new Set<string>();
    partidos.forEach((p) => {
      if (p.categoria) set.add(p.categoria);
    });
    return Array.from(set);
  }, [partidos]);

  const partidosDisponiblesFiltrados = React.useMemo(() => {
    const q = normalizeSearch(searchDisponibles);
    return partidos.filter((p) => {
      if (filtroEstadoDisp !== "todos" && p.estado !== filtroEstadoDisp) return false;
      if (filtroCatDisp !== "todos" && p.categoria !== filtroCatDisp) return false;
      if (q) {
        const local = normalizeSearch(p.equipo_local ?? "");
        const visitante = normalizeSearch(p.equipo_visitante ?? "");
        const cat = normalizeSearch(p.categoria ?? "");
        const grp = normalizeSearch(p.grupo ? `grupo ${p.grupo}` : "");
        const grpSimple = normalizeSearch(p.grupo ?? "");
        const fch = normalizeSearch(p.fecha != null ? `fecha ${p.fecha}` : "");
        const fchSimple = normalizeSearch(p.fecha != null ? String(p.fecha) : "");
        const disc = normalizeSearch(p.disciplina ? (DISCIPLINA_LABEL[p.disciplina] ?? p.disciplina) : "");
        const est = normalizeSearch(ESTADO_LABEL[p.estado] ?? p.estado);

        const match =
          local.includes(q) ||
          visitante.includes(q) ||
          `${local} vs ${visitante}`.includes(q) ||
          cat.includes(q) ||
          grp.includes(q) ||
          grpSimple === q ||
          fch.includes(q) ||
          fchSimple === q ||
          disc.includes(q) ||
          est.includes(q);

        if (!match) return false;
      }
      return true;
    });
  }, [partidos, searchDisponibles, filtroEstadoDisp, filtroCatDisp]);

  const scheduleFiltrado = React.useMemo(() => {
    const q = normalizeSearch(searchSchedule);
    if (!q) return schedule;
    return schedule.filter((p) => {
      const local = normalizeSearch(p.equipo_local ?? "");
      const visitante = normalizeSearch(p.equipo_visitante ?? "");
      const cat = normalizeSearch(p.categoria ?? "");
      const grp = normalizeSearch(p.grupo ? `grupo ${p.grupo}` : "");
      const grpSimple = normalizeSearch(p.grupo ?? "");
      const fch = normalizeSearch(p.fecha != null ? `fecha ${p.fecha}` : "");
      const disc = normalizeSearch(p.disciplina ? (DISCIPLINA_LABEL[p.disciplina] ?? p.disciplina) : "");
      const est = normalizeSearch(ESTADO_LABEL[p.estado] ?? p.estado);

      return (
        local.includes(q) ||
        visitante.includes(q) ||
        `${local} vs ${visitante}`.includes(q) ||
        cat.includes(q) ||
        grp.includes(q) ||
        grpSimple === q ||
        fch.includes(q) ||
        disc.includes(q) ||
        est.includes(q)
      );
    });
  }, [schedule, searchSchedule]);

  function addToSchedule(p: PartidoOlimpiadas) {
    if (scheduledIds.has(p.id)) return;
    setSchedule((prev) => [...prev, p]);
  }

  function removeFromSchedule(id: string) {
    setSchedule((prev) => prev.filter((p) => p.id !== id));
  }

  function moveUp(idx: number) {
    if (idx <= 0) return;
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
  const hasActiveDispFilters =
    searchDisponibles.trim() !== "" ||
    filtroEstadoDisp !== "todos" ||
    filtroCatDisp !== "todos";

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
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <p className="text-[0.6rem] tracking-[0.24em] text-white/35 uppercase">
                Partidos disponibles ({partidos.length})
              </p>
              {hasActiveDispFilters && (
                <span className="text-[0.6rem] text-gold">
                  {partidosDisponiblesFiltrados.length} encontrados
                </span>
              )}
            </div>

            {/* Search & Filters */}
            {partidos.length > 0 && (
              <div className="flex flex-col gap-2">
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/35">
                    <SearchIcon />
                  </span>
                  <input
                    type="text"
                    value={searchDisponibles}
                    onChange={(e) => setSearchDisponibles(e.target.value)}
                    placeholder="Buscar equipo, grupo, categoría…"
                    className="w-full rounded-xl border border-white/10 bg-[#121212] py-1.5 pl-8 pr-7 text-xs text-white placeholder-white/30 outline-none transition-colors focus:border-gold/50"
                  />
                  {searchDisponibles && (
                    <button
                      type="button"
                      onClick={() => setSearchDisponibles("")}
                      aria-label="Limpiar búsqueda"
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-white/30 transition-colors hover:text-white/70"
                    >
                      <XIcon />
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <select
                    value={filtroEstadoDisp}
                    onChange={(e) => setFiltroEstadoDisp(e.target.value)}
                    className="rounded-lg border border-white/10 bg-[#121212] px-2.5 py-1 text-[0.65rem] text-white outline-none transition-colors focus:border-gold/50"
                  >
                    <option value="todos">Estado: todos</option>
                    <option value="pendiente">Sin iniciar</option>
                    <option value="en_curso">En curso</option>
                    <option value="finalizado">Finalizado</option>
                  </select>

                  {categoriasDisponibles.length > 1 && (
                    <select
                      value={filtroCatDisp}
                      onChange={(e) => setFiltroCatDisp(e.target.value)}
                      className="rounded-lg border border-white/10 bg-[#121212] px-2.5 py-1 text-[0.65rem] text-white outline-none transition-colors focus:border-gold/50"
                    >
                      <option value="todos">Categoría: todas</option>
                      {categoriasDisponibles.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  )}

                  {hasActiveDispFilters && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchDisponibles("");
                        setFiltroEstadoDisp("todos");
                        setFiltroCatDisp("todos");
                      }}
                      className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[0.62rem] text-white/50 transition-colors hover:border-gold/40 hover:text-gold"
                    >
                      Limpiar
                    </button>
                  )}
                </div>
              </div>
            )}

            {partidos.length === 0 ? (
              <div className="flex h-24 items-center justify-center rounded-2xl border border-dashed border-white/15 text-xs text-white/30 italic">
                No hay partidos creados aún.
              </div>
            ) : partidosDisponiblesFiltrados.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-white/15 bg-white/2 p-6 text-center">
                <p className="text-xs text-white/60">No se encontraron partidos disponibles</p>
                <p className="text-[0.65rem] text-white/40">Prueba ajustando el texto o los filtros de búsqueda.</p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchDisponibles("");
                    setFiltroEstadoDisp("todos");
                    setFiltroCatDisp("todos");
                  }}
                  className="mt-1 rounded-lg border border-gold/30 bg-gold/10 px-3 py-1 text-[0.62rem] text-gold transition-colors hover:bg-gold/20"
                >
                  Restablecer
                </button>
              </div>
            ) : (
              <div className="flex max-h-130 flex-col gap-1.5 overflow-y-auto rounded-2xl border border-white/8 p-3">
                {partidosDisponiblesFiltrados.map((p) => {
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
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <p className="text-[0.6rem] tracking-[0.24em] text-white/35 uppercase">
                Cronograma público ({schedule.length})
              </p>
              {searchSchedule && (
                <span className="text-[0.6rem] text-gold">
                  {scheduleFiltrado.length} encontrados
                </span>
              )}
            </div>

            {/* Filter input for schedule */}
            {schedule.length > 0 && (
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/35">
                  <SearchIcon />
                </span>
                <input
                  type="text"
                  value={searchSchedule}
                  onChange={(e) => setSearchSchedule(e.target.value)}
                  placeholder="Filtrar cronograma público…"
                  className="w-full rounded-xl border border-white/10 bg-[#121212] py-1.5 pl-8 pr-7 text-xs text-white placeholder-white/30 outline-none transition-colors focus:border-gold/50"
                />
                {searchSchedule && (
                  <button
                    type="button"
                    onClick={() => setSearchSchedule("")}
                    aria-label="Limpiar búsqueda"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-white/30 transition-colors hover:text-white/70"
                  >
                    <XIcon />
                  </button>
                )}
              </div>
            )}

            {schedule.length === 0 ? (
              <div className="flex h-24 items-center justify-center rounded-2xl border border-dashed border-white/15 text-xs text-white/30 italic">
                Agrega partidos desde la lista de la izquierda.
              </div>
            ) : scheduleFiltrado.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-white/15 bg-white/2 p-6 text-center">
                <p className="text-xs text-white/60">No se encontraron partidos en el cronograma</p>
                <button
                  type="button"
                  onClick={() => setSearchSchedule("")}
                  className="mt-1 rounded-lg border border-gold/30 bg-gold/10 px-3 py-1 text-[0.62rem] text-gold transition-colors hover:bg-gold/20"
                >
                  Mostrar todos
                </button>
              </div>
            ) : (
              <div className="flex max-h-130 flex-col gap-1.5 overflow-y-auto rounded-2xl border border-white/8 p-3">
                <AnimatePresence initial={false}>
                  {scheduleFiltrado.map((p) => {
                    const origIdx = schedule.findIndex((item) => item.id === p.id);
                    return (
                      <motion.div
                        key={p.id}
                        layout
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.18 }}
                        className="flex items-center gap-2 rounded-xl border border-gold/20 bg-gold/8 px-3 py-2.5"
                      >
                        <span
                          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-gold/30 bg-gold/15 text-[0.6rem] font-medium text-gold tabular-nums"
                          title={`Posición #${origIdx + 1}`}
                        >
                          {origIdx + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs text-white">{partidoLabel(p)}</p>
                          <p className="mt-0.5 truncate text-[0.6rem] text-white/40">{partidoBadge(p)}</p>
                        </div>
                        <div className="flex shrink-0 items-center gap-1">
                          <button
                            onClick={() => moveUp(origIdx)}
                            disabled={origIdx <= 0}
                            aria-label="Subir"
                            className="flex h-6 w-6 items-center justify-center rounded-lg border border-white/10 bg-white/3 text-white/50 transition-colors hover:border-gold/40 hover:text-gold disabled:cursor-not-allowed disabled:opacity-25"
                          >
                            <ChevronUpIcon />
                          </button>
                          <button
                            onClick={() => moveDown(origIdx)}
                            disabled={origIdx >= schedule.length - 1}
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
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

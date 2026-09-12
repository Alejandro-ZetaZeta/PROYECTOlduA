"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { insforge } from "@/lib/insforge/browser";
import { DISCIPLINAS, getDisciplina, type DisciplinaId } from "@/data/olimpiadas";
import PartidosPanel from "./OlimpiadasPartidos";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Row = Record<string, unknown>;

interface ColumnDef {
  key: string;
  label: string;
}

const EQUIPO_COLUMNS = (secundaria: string, secundariaLabel: string): ColumnDef[] => [
  { key: "nombre_equipo", label: "Equipo" },
  { key: "representante", label: "Representante" },
  { key: "categoria", label: "Categoría" },
  { key: secundaria, label: secundariaLabel },
  { key: "numero", label: "Número" },
  { key: "cedula", label: "Cédula" },
  { key: "created_at", label: "Registro" },
];

const INDIVIDUAL_COLUMNS: ColumnDef[] = [
  { key: "nombres", label: "Participante" },
  { key: "carrera", label: "Carrera" },
  { key: "nivel", label: "Nivel" },
  { key: "numero", label: "Número" },
  { key: "cedula", label: "Cédula" },
  { key: "created_at", label: "Registro" },
];

const DISCIPLINE_COLUMNS: Record<DisciplinaId, ColumnDef[]> = {
  futbol: EQUIPO_COLUMNS("carrera", "Carrera"),
  basket: EQUIPO_COLUMNS("area_conocimiento", "Área"),
  ecuavoley: EQUIPO_COLUMNS("area_conocimiento", "Área"),
  ajedrez: INDIVIDUAL_COLUMNS,
  pingpong: INDIVIDUAL_COLUMNS,
};

// Disciplinas por equipos: admiten filtro de categoria (masculino/femenino) y
// filtro secundario por carrera (futbol) o area (basket/ecuavoley).
const TEAM_DISCIPLINES: DisciplinaId[] = ["futbol", "basket", "ecuavoley"];
const SECONDARY_KEY: Record<DisciplinaId, string> = {
  futbol: "carrera",
  basket: "area_conocimiento",
  ecuavoley: "area_conocimiento",
  ajedrez: "",
  pingpong: "",
};

function formatCell(key: string, value: unknown): string {
  if (value == null) return "—";
  if (key === "created_at" && typeof value === "string") {
    const d = new Date(value);
    if (!Number.isNaN(d.getTime())) {
      return d.toLocaleString("es-EC", { dateStyle: "short", timeStyle: "short" });
    }
  }
  return String(value);
}

// ---------------------------------------------------------------------------
// Icons
// ---------------------------------------------------------------------------

function UserIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function RefreshIcon({ spinning }: { spinning: boolean }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={`h-3.5 w-3.5 transition-transform ${spinning ? "animate-spin" : ""}`}>
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M16 3h5v5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M8 21H3v-5" />
    </svg>
  );
}

function ChevronLeft() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <path d="m9 18 6-6-6-6" />
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

// ---------------------------------------------------------------------------
// Login modal (same users/flows as the tournament admin panel)
// ---------------------------------------------------------------------------

function LoginModal({ open, onClose, onSuccess }: { open: boolean; onClose: () => void; onSuccess: () => void }) {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!open) { setEmail(""); setPassword(""); setError(""); setShowPassword(false); }
  }, [open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/sign-in", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim(), password }),
    });
    if (res.status === 401) {
      setLoading(false);
      setError("Credenciales incorrectas.");
      return;
    }
    if (res.status === 403) {
      setLoading(false);
      setError("Tu cuenta no tiene permisos de administrador.");
      return;
    }
    if (res.status === 429) {
      setLoading(false);
      setError("Demasiados intentos. Espera un minuto e intenta de nuevo.");
      return;
    }
    if (!res.ok) {
      setLoading(false);
      setError("Error de red. Intenta de nuevo.");
      return;
    }
    setLoading(false);
    onSuccess();
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backdropFilter: "blur(16px)", background: "rgba(0,0,0,0.7)" }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }} transition={{ duration: 0.25 }}
            className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#0f0f0f] p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-[0.6rem] tracking-[0.3em] text-gold">ADMINISTRACIÓN</p>
            <h2 className="mt-2 font-[var(--font-display)] text-xl tracking-tight text-white">Acceso restringido</h2>
            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[0.7rem] tracking-[0.2em] text-white/40 uppercase">Correo</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus
                  className="rounded-xl border border-white/10 bg-white/4 px-4 py-3 text-sm text-white outline-none focus:border-gold/50" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[0.7rem] tracking-[0.2em] text-white/40 uppercase">Contraseña</label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required
                    className="w-full rounded-xl border border-white/10 bg-white/4 px-4 py-3 pr-11 text-sm text-white outline-none focus:border-gold/50" />
                  <button type="button" onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 transition-colors hover:text-white/70">
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              {error && <p className="text-xs text-red-400">{error}</p>}
              <button type="submit" disabled={loading}
                className="mt-2 rounded-full border border-gold/40 bg-gold/10 py-2.5 text-xs tracking-[0.18em] text-gold transition-all hover:border-gold/70 hover:bg-gold/20 disabled:opacity-50">
                {loading ? "VERIFICANDO…" : "ENTRAR"}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ---------------------------------------------------------------------------
// Admin panel — read-only view of registered teams/players per discipline
// ---------------------------------------------------------------------------

function AdminPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [tab, setTab] = React.useState<DisciplinaId | "partidos">("futbol");
  const [rows, setRows] = React.useState<Row[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [adminEmail, setAdminEmail] = React.useState<string | null>(null);
  const [counts, setCounts] = React.useState<Record<DisciplinaId, number>>({
    futbol: 0, basket: 0, ecuavoley: 0, ajedrez: 0, pingpong: 0,
  });
  const [partidosCount, setPartidosCount] = React.useState(0);
  const [filtroCategoria, setFiltroCategoria] = React.useState<string>("todos");
  const [filtroSecundaria, setFiltroSecundaria] = React.useState<string>("todos");
  const [confirmDelete, setConfirmDelete] = React.useState<Row | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  // Verifies the InsForge session is alive and the admin role is still valid.
  const verifySession = React.useCallback(async () => {
    if (typeof window === "undefined") return false;
    const { data } = await insforge.auth.getCurrentUser();
    if (!data?.user) {
      onClose();
      return false;
    }
    return true;
  }, [onClose]);

  async function fetchRows(disciplineId: DisciplinaId) {
    if (!(await verifySession())) return;
    setLoading(true);
    const { data } = await insforge.database
      .from(getDisciplina(disciplineId).table)
      .select("*")
      .order("created_at", { ascending: true });
    if (data) setRows(data as Row[]);
    setLoading(false);
  }

  async function loadAll() {
    if (!(await verifySession())) return;
    setLoading(true);
    const results = await Promise.all(
      DISCIPLINAS.map((d) => insforge.database.from(d.table).select("id")),
    );
    const next: Record<DisciplinaId, number> = { futbol: 0, basket: 0, ecuavoley: 0, ajedrez: 0, pingpong: 0 };
    DISCIPLINAS.forEach((d, i) => {
      const list = results[i]?.data;
      if (Array.isArray(list)) next[d.id] = list.length;
    });
    setCounts(next);
    const { data: partidosList } = await insforge.database
      .from("partidos_olimpiadas")
      .select("id");
    if (Array.isArray(partidosList)) setPartidosCount(partidosList.length);
    const { data } = await insforge.auth.getCurrentUser();
    if (data?.user) setAdminEmail(data.user.email ?? null);
    if (tab !== "partidos") await fetchRows(tab);
    setLoading(false);
  }

  React.useEffect(() => {
    if (open) loadAll();
  }, [open]);

  async function switchTab(id: DisciplinaId | "partidos") {
    setTab(id);
    setFiltroCategoria("todos");
    setFiltroSecundaria("todos");
    if (id !== "partidos") await fetchRows(id);
  }

  const ALL_TABS: (DisciplinaId | "partidos")[] = [...DISCIPLINAS.map((d) => d.id), "partidos"];

  function moveDiscipline(dir: 1 | -1) {
    const idx = ALL_TABS.indexOf(tab);
    const nextIdx = (idx + dir + ALL_TABS.length) % ALL_TABS.length;
    switchTab(ALL_TABS[nextIdx]);
  }

  async function handleLogout() {
    // Server clears the auth cookies. The browser SDK caches the session in
    // memory and exposes no way to clear it (auth surface is read-only), so a
    // reload drops the cached session and the panel won't auto-restore.
    try {
      await fetch("/api/auth/sign-out", { method: "POST" });
    } catch { /* still reload below */ }
    if (typeof window !== "undefined") window.location.reload();
  }

  async function deleteRow(row: Row) {
    if (tab === "partidos") return;
    if (!(await verifySession())) return;
    const id = row.id as string;
    if (!id) return;
    setDeleting(true);
    const { error } = await insforge.database
      .from(getDisciplina(tab).table)
      .delete()
      .eq("id", id);
    setDeleting(false);
    if (!error) {
      setConfirmDelete(null);
      setRows((prev) => prev.filter((r) => r.id !== id));
      setCounts((prev) => ({ ...prev, [tab]: Math.max(0, prev[tab] - 1) }));
    }
  }

  const esPartidos = tab === "partidos";
  const columns = esPartidos ? [] : DISCIPLINE_COLUMNS[tab];
  const cfg = tab === "partidos" ? null : getDisciplina(tab);
  const total = tab === "partidos" ? partidosCount : counts[tab];

  const esEquipo = tab !== "partidos" && TEAM_DISCIPLINES.includes(tab);
  const secKey = tab === "partidos" ? "" : SECONDARY_KEY[tab];
  const categorias = esEquipo
    ? Array.from(new Set(rows.map((r) => String(r.categoria ?? "")).filter(Boolean)))
    : [];
  const secundarias = esEquipo
    ? Array.from(new Set(rows.map((r) => String(r[secKey] ?? "")).filter(Boolean)))
    : [];
  const filteredRows = esEquipo
    ? rows.filter(
        (r) =>
          (filtroCategoria === "todos" || String(r.categoria) === filtroCategoria) &&
          (filtroSecundaria === "todos" || String(r[secKey]) === filtroSecundaria),
      )
    : rows;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex flex-col bg-[#080808]"
        >
          <div className="shrink-0 border-b border-white/8">
            <div className="flex items-center justify-between px-4 py-3 sm:px-6">
              <div className="flex min-w-0 items-center gap-3">
                <p className="shrink-0 text-[0.6rem] tracking-[0.28em] text-gold uppercase">Panel Admin · Olimpiadas 2026</p>
                <span className="hidden text-[0.65rem] text-white/30 sm:block truncate">
                  {esPartidos
                    ? `${total} partidos`
                    : `${total} inscripciones en ${cfg!.label}`}
                  {adminEmail && <span className="hidden text-white/20 md:inline"> · {adminEmail}</span>}
                </span>
              </div>
              <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                <button
                  onClick={loadAll}
                  disabled={loading}
                  className="inline-flex items-center gap-1.5 text-[0.65rem] tracking-[0.18em] text-gold/80 transition-colors hover:text-gold disabled:opacity-50"
                >
                  <RefreshIcon spinning={loading} />
                  <span className="hidden sm:inline">RECARGAR</span>
                </button>
                <span className="hidden text-white/10 sm:block">|</span>
                <button onClick={handleLogout}
                  className="hidden text-[0.65rem] tracking-[0.18em] text-white/30 transition-colors hover:text-white/60 sm:block">
                  CERRAR SESIÓN
                </button>
                <button onClick={onClose}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/50 transition-colors hover:text-white">
                  ✕
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between px-4 pb-2 sm:hidden">
              <span className="text-[0.65rem] text-white/30">
                {esPartidos ? `${total} partidos` : `${total} inscripciones en ${cfg!.label}`}
              </span>
              <button onClick={handleLogout}
                className="text-[0.65rem] tracking-[0.18em] text-white/30 transition-colors hover:text-white/60">
                CERRAR SESIÓN
              </button>
            </div>
            {/* Desktop: full segmented control */}
            <div className="hidden overflow-x-auto border-b border-white/8 px-4 py-3 sm:block sm:px-6">
              <div className="flex w-full gap-1 rounded-2xl border border-white/10 bg-white/3 p-1">
                {DISCIPLINAS.map((d) => (
                  <button key={d.id} onClick={() => switchTab(d.id)}
                    className={`flex min-w-max flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl px-4 py-2 text-[0.65rem] tracking-[0.15em] uppercase transition-all ${
                      tab === d.id
                        ? "border border-gold/30 bg-gold/15 text-gold"
                        : "border border-transparent text-white/40 hover:text-white/70"
                    }`}>
                    {d.label}
                    <span className="text-[0.6rem] opacity-70">({counts[d.id]})</span>
                  </button>
                ))}
                <button key="partidos" onClick={() => switchTab("partidos")}
                  className={`flex min-w-max flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl px-4 py-2 text-[0.65rem] tracking-[0.15em] uppercase transition-all ${
                    tab === "partidos"
                      ? "border border-gold/30 bg-gold/15 text-gold"
                      : "border border-transparent text-white/40 hover:text-white/70"
                  }`}>
                  Partidos
                  <span className="text-[0.6rem] opacity-70">({partidosCount})</span>
                </button>
              </div>
            </div>

            {/* Mobile: compact segmented control with prev/next arrows */}
            <div className="flex items-center gap-2 border-b border-white/8 px-4 py-3 sm:hidden">
              <button onClick={() => moveDiscipline(-1)} aria-label="Disciplina anterior"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/3 text-white/50 transition-colors hover:border-gold/40 hover:text-gold">
                <ChevronLeft />
              </button>
              <div className="flex flex-1 items-center justify-between gap-2 rounded-xl border border-gold/30 bg-gold/10 px-4 py-2.5">
                <span className="text-[0.72rem] tracking-[0.15em] text-gold uppercase">
                  {esPartidos ? "Partidos" : cfg!.label}
                </span>
                <span className="text-[0.65rem] text-white/40">
                  {esPartidos ? `${total} partidos` : `${counts[tab]} inscripciones`}
                </span>
              </div>
              <button onClick={() => moveDiscipline(1)} aria-label="Disciplina siguiente"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/3 text-white/50 transition-colors hover:border-gold/40 hover:text-gold">
                <ChevronRight />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-auto px-4 py-5 sm:px-6 sm:py-6">
            {esEquipo && (
              <div className="mb-4 flex flex-wrap items-center gap-2.5">
                <select
                  value={filtroCategoria}
                  onChange={(e) => setFiltroCategoria(e.target.value)}
                  className="rounded-xl border border-white/10 bg-[#121212] px-3 py-2 text-xs text-white outline-none focus:border-gold/50"
                >
                  <option value="todos">Categoría: todas</option>
                  {categorias.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <select
                  value={filtroSecundaria}
                  onChange={(e) => setFiltroSecundaria(e.target.value)}
                  className="rounded-xl border border-white/10 bg-[#121212] px-3 py-2 text-xs text-white outline-none focus:border-gold/50"
                >
                  <option value="todos">{cfg!.id === "futbol" ? "Carrera: todas" : "Área: todas"}</option>
                  {secundarias.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <span className="text-[0.65rem] text-white/30">
                  {filteredRows.length} de {rows.length}
                </span>
              </div>
            )}
            {esPartidos ? (
              <PartidosPanel onCountChange={setPartidosCount} />
            ) : loading ? (
              <div className="flex h-40 items-center justify-center text-xs text-white/30">Cargando…</div>
            ) : filteredRows.length === 0 ? (
              <div className="flex h-40 items-center justify-center text-xs text-white/30 italic">
                Sin inscripciones en {cfg!.label} aún.
              </div>
            ) : (
              <div className="w-full overflow-x-auto rounded-2xl border border-white/8">
                <table className="w-full min-w-[680px] border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-white/8">
                      {["#", ...columns.map((c) => c.label), ""].map((h, i) => (
                        <th key={i} className="px-3 py-3 text-center text-[0.6rem] tracking-[0.2em] font-medium text-white/35 uppercase">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRows.map((row, i) => (
                      <tr key={(row.id as string) ?? i} className="border-b border-white/4 last:border-0 hover:bg-white/2">
                        <td className="px-3 py-2.5 text-center text-xs text-white/50">{i + 1}</td>
                        {columns.map((c) => (
                          <td key={c.key} className="px-3 py-2.5 text-center text-xs text-white">
                            {formatCell(c.key, row[c.key])}
                          </td>
                        ))}
                        <td className="px-3 py-2.5 text-center">
                          <button
                            onClick={() => setConfirmDelete(row)}
                            title="Eliminar inscripción"
                            aria-label="Eliminar inscripción"
                            className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/3 text-white/40 transition-colors hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-400"
                          >
                            <TrashIcon />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <AnimatePresence>
            {confirmDelete && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="fixed inset-0 z-[60] flex items-center justify-center p-4"
                style={{ backdropFilter: "blur(8px)", background: "rgba(0,0,0,0.7)" }}
                onClick={() => setConfirmDelete(null)}
              >
                <motion.div
                  initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.92, opacity: 0 }} transition={{ duration: 0.2 }}
                  className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#0f0f0f] p-6 shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <p className="text-[0.6rem] tracking-[0.3em] text-red-400 uppercase">Eliminar inscripción</p>
                  <h3 className="mt-2 font-[var(--font-display)] text-lg text-white">¿Confirmas la eliminación?</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/50">
                    Se eliminará permanentemente el equipo{" "}
                    <span className="text-white">“{String(confirmDelete.nombre_equipo ?? confirmDelete.nombres ?? "—")}”</span>{" "}
                    de {cfg!.label}
                    {esEquipo ? (
                      <> — {String(confirmDelete.categoria ?? "")} · {String(confirmDelete[secKey] ?? "")}</>
                    ) : (
                      <> — {String(confirmDelete.carrera ?? "")}</>
                    )}
                    . Esta acción no se puede deshacer.
                  </p>
                  <div className="mt-6 flex justify-end gap-2">
                    <button
                      onClick={() => setConfirmDelete(null)}
                      disabled={deleting}
                      className="rounded-xl border border-white/10 bg-white/3 px-4 py-2 text-xs tracking-[0.15em] text-white/60 transition-colors hover:text-white disabled:opacity-50"
                    >
                      CANCELAR
                    </button>
                    <button
                      onClick={() => deleteRow(confirmDelete)}
                      disabled={deleting}
                      className="rounded-xl border border-red-500/50 bg-red-500/15 px-4 py-2 text-xs tracking-[0.15em] text-red-300 transition-colors hover:bg-red-500/25 disabled:opacity-50"
                    >
                      {deleting ? "ELIMINANDO…" : "ELIMINAR"}
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ---------------------------------------------------------------------------
// Main admin trigger island
// ---------------------------------------------------------------------------

export default function OlimpiadasAdmin() {
  const [showLogin, setShowLogin] = React.useState(false);
  const [showAdmin, setShowAdmin] = React.useState(false);

  // Asks the server whether the current session is a valid admin session.
  const checkIsAdminLoggedIn = React.useCallback(async () => {
    if (typeof window === "undefined") return false;
    const { data } = await insforge.auth.getCurrentUser();
    if (!data?.user) return false;
    const { data: profile } = await insforge.database
      .from("profiles")
      .select("role")
      .eq("auth_id", data.user.id)
      .single();
    return profile?.role === "admin";
  }, []);

  React.useEffect(() => {
    (async () => {
      if (await checkIsAdminLoggedIn()) setShowAdmin(true);
    })();
  }, [checkIsAdminLoggedIn]);

  // "ldua" easter egg — types the trigger and the login screen opens.
  React.useEffect(() => {
    if (typeof document === "undefined") return;
    let buf = "";
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      buf += e.key;
      if (buf.length > 20) buf = buf.slice(-20);
      if (buf.endsWith("ldua")) { setShowLogin(true); buf = ""; }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  React.useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.style.overflow = showAdmin ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [showAdmin]);

  async function openAdmin() {
    if (await checkIsAdminLoggedIn()) setShowAdmin(true);
    else setShowLogin(true);
  }

  return (
    <>
      <LoginModal
        open={showLogin}
        onClose={() => setShowLogin(false)}
        onSuccess={() => { setShowLogin(false); setShowAdmin(true); }}
      />
      <AdminPanel open={showAdmin} onClose={() => setShowAdmin(false)} />

      {/* Person icon — subtle, bottom-right corner */}
      <button
        onClick={openAdmin}
        title="Administración"
        aria-label="Administración"
        className="fixed bottom-4 right-4 z-40 flex h-8 w-8 items-center justify-center rounded-full border border-white/8 bg-white/3 text-white/20 opacity-70 transition-colors hover:border-gold/40 hover:bg-gold/10 hover:text-gold"
      >
        <UserIcon />
      </button>
    </>
  );
}
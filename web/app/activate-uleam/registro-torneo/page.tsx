"use client";

import * as React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { insforge } from "@/lib/insforge";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type FormState = "idle" | "submitting" | "success" | "error";
type AdminTab = "inscripciones" | "partidos";

interface FormData {
  cedula: string;
  email: string;
  whatsapp: string;
  carrera: string;
  nivel: string;
  nombre_equipo: string;
  genero: string;
}

interface Registration {
  id: string;
  cedula: string;
  email: string;
  whatsapp: string;
  carrera: string;
  nivel: string;
  nombre_equipo: string;
  genero: string;
  aprobado: boolean;
  created_at: string;
}

interface Partido {
  id: string;
  equipo_local: string;
  equipo_visitante: string;
  goles_local: number;
  goles_visitante: number;
  genero: string;
  created_at: string;
}

interface TeamStats {
  nombre: string;
  pj: number;
  pg: number;
  pe: number;
  pp: number;
  gf: number;
  gc: number;
  dg: number;
  pts: number;
}

// ---------------------------------------------------------------------------
// Standings computation
// ---------------------------------------------------------------------------

function computeStandings(equipos: string[], partidos: Partido[]): TeamStats[] {
  const map = new Map<string, TeamStats>();

  for (const e of equipos) {
    map.set(e, { nombre: e, pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, dg: 0, pts: 0 });
  }

  for (const p of partidos) {
    if (!map.has(p.equipo_local))
      map.set(p.equipo_local, { nombre: p.equipo_local, pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, dg: 0, pts: 0 });
    if (!map.has(p.equipo_visitante))
      map.set(p.equipo_visitante, { nombre: p.equipo_visitante, pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, dg: 0, pts: 0 });

    const local = map.get(p.equipo_local)!;
    const visit = map.get(p.equipo_visitante)!;

    local.pj++;
    visit.pj++;
    local.gf += p.goles_local;
    local.gc += p.goles_visitante;
    visit.gf += p.goles_visitante;
    visit.gc += p.goles_local;

    if (p.goles_local > p.goles_visitante) {
      local.pg++;
      local.pts += 3;
      visit.pp++;
    } else if (p.goles_local < p.goles_visitante) {
      visit.pg++;
      visit.pts += 3;
      local.pp++;
    } else {
      local.pe++;
      visit.pe++;
      local.pts++;
      visit.pts++;
    }
  }

  for (const s of map.values()) s.dg = s.gf - s.gc;

  return [...map.values()].sort(
    (a, b) => b.pts - a.pts || b.dg - a.dg || b.gf - a.gf
  );
}

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
// Icons
// ---------------------------------------------------------------------------

function BackArrow() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
      <path d="M19 12H5M12 5l-7 7 7 7" />
    </svg>
  );
}

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

function TrashIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4h6v2" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Form inputs
// ---------------------------------------------------------------------------

function FieldInput({ label, id, type = "text", placeholder, value, onChange, hint, error }: {
  label: string; id: string; type?: string; placeholder: string;
  value: string; onChange: (v: string) => void; hint?: string; error?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[0.7rem] tracking-[0.2em] text-white/50 uppercase">{label}</label>
      <input
        id={id} type={type} placeholder={placeholder} value={value}
        onChange={(e) => onChange(e.target.value)} required
        className={`w-full rounded-xl border px-4 py-3 text-sm text-white placeholder-white/25 outline-none transition-colors ${
          error
            ? "border-red-500/60 bg-red-500/5 focus:border-red-500/80"
            : "border-white/10 bg-white/4 focus:border-gold/50 focus:bg-white/6"
        }`}
      />
      {error && <p className="text-[0.65rem] text-red-400">{error}</p>}
      {!error && hint && <p className="text-[0.65rem] text-white/30">{hint}</p>}
    </div>
  );
}

function SelectInput({ label, id, value, onChange, options, placeholder }: {
  label: string; id: string; value: string; onChange: (v: string) => void;
  options: string[]; placeholder: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[0.7rem] tracking-[0.2em] text-white/50 uppercase">{label}</label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} required
        className="w-full appearance-none rounded-xl border border-white/10 bg-[#111] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-gold/50">
        <option value="" disabled>{placeholder}</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Standings table
// ---------------------------------------------------------------------------

function StandingsTable({ rows, loading }: { rows: TeamStats[]; loading: boolean }) {
  const MIN_ROWS = 8;
  const displayed = rows.length >= MIN_ROWS
    ? rows
    : [...rows, ...Array.from({ length: MIN_ROWS - rows.length }, () => null)];

  const cols = [
    { key: "pos",    label: "#",   title: "Posición" },
    { key: "equipo", label: "Equipo", title: "Nombre del equipo" },
    { key: "pj",     label: "PJ",  title: "Partidos jugados" },
    { key: "pg",     label: "PG",  title: "Partidos ganados" },
    { key: "pe",     label: "PE",  title: "Partidos empatados" },
    { key: "pp",     label: "PP",  title: "Partidos perdidos" },
    { key: "gf",     label: "GF",  title: "Goles a favor" },
    { key: "gc",     label: "GC",  title: "Goles en contra" },
    { key: "dg",     label: "DG",  title: "Diferencia de goles" },
    { key: "pts",    label: "PTS", title: "Puntos" },
  ] as const;

  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-white/8 bg-white/2">
      <table className="w-full min-w-[580px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-white/8">
            {cols.map((col) => (
              <th key={col.key} title={col.title}
                className={`px-3 py-3 text-[0.6rem] tracking-[0.22em] font-medium text-white/40 uppercase ${
                  col.key === "equipo" ? "text-left" : "text-center"
                }`}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {displayed.map((row, i) => {
            const pos = i + 1;
            return (
              <tr key={i} className={`border-b border-white/4 transition-colors hover:bg-white/3 last:border-0 ${pos === 1 && row ? "bg-gold/4" : ""}`}>
                <td className="px-3 py-3 text-center">
                  <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                    pos === 1 ? "bg-gold/20 text-gold"
                    : pos === 2 ? "bg-white/10 text-white/60"
                    : pos === 3 ? "bg-amber-900/20 text-amber-600/80"
                    : "text-white/30"
                  }`}>
                    {pos}
                  </span>
                </td>
                <td className={`px-3 py-3 text-left text-xs ${row ? "text-white font-medium" : "text-white/25 italic"}`}>
                  {loading
                    ? <span className="inline-block h-3 w-24 animate-pulse rounded bg-white/10" />
                    : (row?.nombre ?? "—")}
                </td>
                {(["pj", "pg", "pe", "pp", "gf", "gc", "dg", "pts"] as const).map((k) => {
                  const val = row?.[k] ?? null;
                  const colorClass = k === "pts"
                    ? "font-semibold text-white"
                    : k === "dg" && val !== null
                      ? val > 0 ? "text-emerald-400" : val < 0 ? "text-red-400" : "text-white/40"
                    : row ? "text-white" : "text-white/20";
                  const display = val === null ? "—" : k === "dg" && val > 0 ? `+${val}` : val;
                  return (
                    <td key={k} className={`px-3 py-3 text-center text-xs ${colorClass}`}>
                      {loading && row
                        ? <span className="inline-block h-3 w-5 animate-pulse rounded bg-white/10" />
                        : display}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="px-4 py-3 text-center text-[0.6rem] tracking-[0.18em] text-white/20 uppercase">
        Tabla se actualiza al inicio del torneo · 13 de junio de 2026
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Login modal
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
    const { data: authData, error: authError } = await insforge.auth.signInWithPassword({ email, password });
    if (authError || !authData?.user) { setLoading(false); setError("Credenciales incorrectas."); return; }

    const { data: profile } = await insforge.database
      .from("profiles")
      .select("role")
      .eq("auth_id", authData.user.id)
      .single();

    if (!profile || profile.role !== "admin") {
      await insforge.auth.signOut();
      setLoading(false);
      setError("Tu cuenta no tiene permisos de administrador.");
      return;
    }

    if (typeof window !== "undefined") {
      localStorage.setItem("is_admin", String(Date.now() + 30 * 60 * 1000));
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
// Match panel
// ---------------------------------------------------------------------------

function MatchPanel({ equipos, partidos, loading, onPartidoAdded, onPartidoDeleted }: {
  equipos: { nombre_equipo: string; genero: string }[];
  partidos: Partido[];
  loading: boolean;
  onPartidoAdded: () => void;
  onPartidoDeleted: (id: string) => void;
}) {
  const [tabGenero, setTabGenero] = React.useState<"masculino" | "femenino">("masculino");
  const [equipoLocal, setEquipoLocal] = React.useState("");
  const [equipoVisitante, setEquipoVisitante] = React.useState("");
  const [golesLocal, setGolesLocal] = React.useState("0");
  const [golesVisitante, setGolesVisitante] = React.useState("0");
  const [submitting, setSubmitting] = React.useState(false);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [formError, setFormError] = React.useState("");

  const equiposFiltrados = equipos
    .filter((e) => e.genero === tabGenero)
    .map((e) => e.nombre_equipo);
  const partidosFiltrados = partidos.filter((p) => p.genero === tabGenero);

  function resetForm() {
    setEquipoLocal("");
    setEquipoVisitante("");
    setGolesLocal("0");
    setGolesVisitante("0");
    setFormError("");
  }

  async function handleAddPartido(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    if (equipoLocal === equipoVisitante) {
      setFormError("Los equipos deben ser diferentes.");
      return;
    }
    setSubmitting(true);
    const { error } = await insforge.database.from("partidos_torneo").insert([{
      equipo_local: equipoLocal,
      equipo_visitante: equipoVisitante,
      goles_local: parseInt(golesLocal, 10),
      goles_visitante: parseInt(golesVisitante, 10),
      genero: tabGenero,
    }]);
    if (error) {
      setFormError("Error al registrar el partido. Inténtalo de nuevo.");
    } else {
      resetForm();
      onPartidoAdded();
    }
    setSubmitting(false);
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    await insforge.database.from("partidos_torneo").delete().eq("id", id);
    onPartidoDeleted(id);
    setDeletingId(null);
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Gender switcher */}
      <div className="flex gap-1 rounded-xl border border-white/8 bg-white/2 p-1 w-fit">
        {(["masculino", "femenino"] as const).map((g) => (
          <button key={g} onClick={() => { setTabGenero(g); resetForm(); }}
            className={`rounded-lg px-4 py-1.5 text-[0.65rem] tracking-[0.18em] uppercase transition-all ${
              tabGenero === g ? "bg-gold/15 text-gold border border-gold/30" : "text-white/35 hover:text-white/60"
            }`}>
            {g === "masculino" ? "Masculino" : "Femenino"}
          </button>
        ))}
      </div>

      {/* Add match form */}
      <div className="rounded-2xl border border-white/8 bg-white/2 p-5">
        <p className="mb-4 text-[0.65rem] tracking-[0.25em] text-white/40 uppercase">Registrar resultado</p>
        {equiposFiltrados.length < 2 ? (
          <p className="text-xs text-white/30 italic">
            Necesitas al menos 2 equipos aprobados en esta categoría para registrar un partido.
          </p>
        ) : (
          <form onSubmit={handleAddPartido} className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-[0.7rem] tracking-[0.2em] text-white/50 uppercase">Equipo local</label>
                <select value={equipoLocal} onChange={(e) => setEquipoLocal(e.target.value)} required
                  className="w-full appearance-none rounded-xl border border-white/10 bg-[#111] px-4 py-3 text-sm text-white outline-none focus:border-gold/50">
                  <option value="" disabled>Seleccionar equipo</option>
                  {equiposFiltrados.map((eq) => <option key={eq} value={eq}>{eq}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[0.7rem] tracking-[0.2em] text-white/50 uppercase">Equipo visitante</label>
                <select value={equipoVisitante} onChange={(e) => setEquipoVisitante(e.target.value)} required
                  className="w-full appearance-none rounded-xl border border-white/10 bg-[#111] px-4 py-3 text-sm text-white outline-none focus:border-gold/50">
                  <option value="" disabled>Seleccionar equipo</option>
                  {equiposFiltrados.filter((eq) => eq !== equipoLocal).map((eq) => <option key={eq} value={eq}>{eq}</option>)}
                </select>
              </div>
            </div>

            <div className="flex items-end gap-3">
              <div className="flex flex-col gap-1.5 flex-1">
                <label className="text-[0.7rem] tracking-[0.2em] text-white/50 uppercase">Goles local</label>
                <input type="number" min="0" max="99" value={golesLocal}
                  onChange={(e) => setGolesLocal(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/4 px-4 py-3 text-center text-lg font-semibold text-white outline-none focus:border-gold/50" />
              </div>
              <span className="pb-3 text-lg text-white/20">—</span>
              <div className="flex flex-col gap-1.5 flex-1">
                <label className="text-[0.7rem] tracking-[0.2em] text-white/50 uppercase">Goles visitante</label>
                <input type="number" min="0" max="99" value={golesVisitante}
                  onChange={(e) => setGolesVisitante(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/4 px-4 py-3 text-center text-lg font-semibold text-white outline-none focus:border-gold/50" />
              </div>
            </div>

            {formError && <p className="text-xs text-red-400">{formError}</p>}

            <button type="submit" disabled={submitting}
              className="self-end rounded-full border border-gold/40 bg-gold/10 px-5 py-2 text-xs tracking-[0.18em] text-gold transition-all hover:border-gold/70 hover:bg-gold/20 disabled:opacity-40">
              {submitting ? "GUARDANDO…" : "REGISTRAR PARTIDO"}
            </button>
          </form>
        )}
      </div>

      {/* Match list */}
      <div className="rounded-2xl border border-white/8 bg-white/2">
        <div className="border-b border-white/8 px-4 py-3">
          <p className="text-[0.65rem] tracking-[0.25em] text-white/40 uppercase">
            Partidos jugados · {tabGenero === "masculino" ? "Masculino" : "Femenino"}
          </p>
        </div>
        {loading ? (
          <div className="flex h-20 items-center justify-center text-xs text-white/30">Cargando…</div>
        ) : partidosFiltrados.length === 0 ? (
          <div className="flex h-20 items-center justify-center text-xs text-white/30 italic">
            No hay partidos registrados aún.
          </div>
        ) : (
          <table className="w-full border-collapse">
            <tbody>
              {partidosFiltrados.map((p) => (
                <tr key={p.id} className="border-b border-white/4 last:border-0 hover:bg-white/2">
                  <td className="px-4 py-3 text-left text-xs font-medium text-white">{p.equipo_local}</td>
                  <td className="px-2 py-3 text-center">
                    <span className="font-mono text-sm font-semibold text-white">
                      {p.goles_local} — {p.goles_visitante}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-xs font-medium text-white">{p.equipo_visitante}</td>
                  <td className="px-3 py-3 text-center">
                    <button onClick={() => handleDelete(p.id)} disabled={deletingId === p.id}
                      title="Eliminar partido"
                      className="rounded-full p-1.5 text-white/20 transition-colors hover:bg-red-500/10 hover:text-red-400 disabled:opacity-40">
                      {deletingId === p.id ? <span className="text-xs">…</span> : <TrashIcon />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Admin panel
// ---------------------------------------------------------------------------

function AdminPanel({ open, onClose, onApprovalChange, equipos }: {
  open: boolean;
  onClose: () => void;
  onApprovalChange: () => void;
  equipos: { nombre_equipo: string; genero: string }[];
}) {
  const [tab, setTab] = React.useState<AdminTab>("inscripciones");
  const [registrations, setRegistrations] = React.useState<Registration[]>([]);
  const [partidos, setPartidos] = React.useState<Partido[]>([]);
  const [loadingRegs, setLoadingRegs] = React.useState(false);
  const [loadingPartidos, setLoadingPartidos] = React.useState(false);
  const [togglingId, setTogglingId] = React.useState<string | null>(null);
  const [adminEmail, setAdminEmail] = React.useState<string | null>(null);

  const verifyAndExtendSession = React.useCallback(() => {
    if (typeof window === "undefined") return false;
    const expiry = localStorage.getItem("is_admin");
    if (!expiry) return false;
    const expiryNum = parseInt(expiry, 10);
    if (isNaN(expiryNum) || Date.now() > expiryNum) {
      localStorage.removeItem("is_admin");
      insforge.auth.signOut();
      onClose();
      return false;
    }
    localStorage.setItem("is_admin", String(Date.now() + 30 * 60 * 1000));
    return true;
  }, [onClose]);

  async function fetchRegistrations() {
    if (!verifyAndExtendSession()) return;
    setLoadingRegs(true);
    const { data } = await insforge.database
      .from("inscripciones_torneo")
      .select("*")
      .order("created_at", { ascending: true });
    if (data) setRegistrations(data as Registration[]);
    setLoadingRegs(false);
  }

  async function fetchPartidos() {
    if (!verifyAndExtendSession()) return;
    setLoadingPartidos(true);
    const { data } = await insforge.database
      .from("partidos_torneo")
      .select("*")
      .order("created_at", { ascending: true });
    if (data) setPartidos(data as Partido[]);
    setLoadingPartidos(false);
  }

  React.useEffect(() => {
    if (open) {
      if (!verifyAndExtendSession()) return;
      fetchRegistrations();
      fetchPartidos();
      insforge.auth.getCurrentUser().then(({ data }) => {
        if (data?.user) setAdminEmail(data.user.email ?? null);
      });
    }
  }, [open]);

  async function toggle(reg: Registration) {
    if (!verifyAndExtendSession()) return;
    setTogglingId(reg.id);
    await insforge.database
      .from("inscripciones_torneo")
      .update([{ aprobado: !reg.aprobado }])
      .eq("id", reg.id);
    await fetchRegistrations();
    onApprovalChange();
    setTogglingId(null);
  }

  async function handleLogout() {
    await insforge.auth.signOut();
    if (typeof window !== "undefined") localStorage.removeItem("is_admin");
    onClose();
  }

  function handlePartidoChange() {
    fetchPartidos();
    onApprovalChange();
  }

  const aprobados = registrations.filter((r) => r.aprobado).length;
  const isLoading = tab === "inscripciones" ? loadingRegs : loadingPartidos;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex flex-col bg-[#080808]"
        >
          {/* Header — mobile-first layout */}
          <div className="shrink-0 border-b border-white/8">

            {/* Top row: title + actions */}
            <div className="flex items-center justify-between px-4 py-3 sm:px-6">
              <div className="flex min-w-0 items-center gap-3">
                <p className="shrink-0 text-[0.6rem] tracking-[0.28em] text-gold uppercase">Panel Admin</p>
                <span className="hidden sm:block text-[0.65rem] text-white/30 truncate">
                  {aprobados} aprobados · {registrations.length} total
                  {adminEmail && (
                    <span className="hidden md:inline text-white/20"> · {adminEmail}</span>
                  )}
                </span>
              </div>
              <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                <button
                  onClick={tab === "inscripciones" ? fetchRegistrations : fetchPartidos}
                  disabled={isLoading}
                  className="inline-flex items-center gap-1.5 text-[0.65rem] tracking-[0.18em] text-gold/80 transition-colors hover:text-gold disabled:opacity-50"
                >
                  <RefreshIcon spinning={isLoading} />
                  <span className="hidden sm:inline">RECARGAR</span>
                </button>
                <span className="hidden text-white/10 sm:block">|</span>
                <button onClick={handleLogout}
                  className="hidden sm:block text-[0.65rem] tracking-[0.18em] text-white/30 transition-colors hover:text-white/60">
                  CERRAR SESIÓN
                </button>
                <button onClick={onClose}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/50 transition-colors hover:text-white">
                  ✕
                </button>
              </div>
            </div>

            {/* Mobile-only: stats + logout */}
            <div className="flex items-center justify-between px-4 pb-2 sm:hidden">
              <span className="text-[0.65rem] text-white/30">
                {aprobados} aprobados · {registrations.length} total
              </span>
              <button onClick={handleLogout}
                className="text-[0.65rem] tracking-[0.18em] text-white/30 transition-colors hover:text-white/60">
                CERRAR SESIÓN
              </button>
            </div>

            {/* Tab bar */}
            <div className="flex px-4 sm:px-6">
              {(
                [
                  { key: "inscripciones" as AdminTab, label: "Inscripciones" },
                  { key: "partidos" as AdminTab, label: "Partidos" },
                ]
              ).map(({ key, label }) => (
                <button key={key} onClick={() => setTab(key)}
                  className={`border-b-2 px-4 py-2.5 text-[0.65rem] tracking-[0.15em] uppercase transition-colors ${
                    tab === key
                      ? "border-gold text-gold"
                      : "border-transparent text-white/35 hover:text-white/60"
                  }`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto px-4 py-5 sm:px-6 sm:py-6">
            {tab === "inscripciones" ? (
              loadingRegs ? (
                <div className="flex h-40 items-center justify-center text-xs text-white/30">Cargando…</div>
              ) : registrations.length === 0 ? (
                <div className="flex h-40 items-center justify-center text-xs text-white/30 italic">Sin inscripciones aún.</div>
              ) : (
                <div className="w-full overflow-x-auto rounded-2xl border border-white/8">
                  <table className="w-full min-w-[660px] border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-white/8">
                        {["#", "Equipo", "Cédula", "WhatsApp", "Carrera", "Nivel", "Categ.", "Estado", ""].map((h, i) => (
                          <th key={i} className={`px-3 py-3 text-[0.6rem] tracking-[0.2em] font-medium text-white/35 uppercase ${i <= 1 ? "text-left" : "text-center"}`}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {registrations.map((reg, i) => (
                        <tr key={reg.id} className="border-b border-white/4 last:border-0 hover:bg-white/2">
                          <td className="px-3 py-2.5 text-center text-xs text-white/50">{i + 1}</td>
                          <td className="px-3 py-2.5 text-left text-xs font-medium text-white">{reg.nombre_equipo}</td>
                          <td className="px-3 py-2.5 text-center text-xs font-mono text-white">{reg.cedula}</td>
                          <td className="px-3 py-2.5 text-center text-xs text-white">{reg.whatsapp}</td>
                          <td className="px-3 py-2.5 text-center text-xs text-white">{reg.carrera}</td>
                          <td className="px-3 py-2.5 text-center text-xs text-white">{reg.nivel}</td>
                          <td className="px-3 py-2.5 text-center text-xs capitalize text-white">{reg.genero}</td>
                          <td className="px-3 py-2.5 text-center">
                            <span className={`inline-flex rounded-full px-2 py-0.5 text-[0.6rem] tracking-[0.12em] ${
                              reg.aprobado ? "bg-emerald-500/15 text-emerald-400" : "bg-white/6 text-white/30"
                            }`}>
                              {reg.aprobado ? "APROBADO" : "PENDIENTE"}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            <button onClick={() => toggle(reg)} disabled={togglingId === reg.id}
                              className={`rounded-full border px-2.5 py-1 text-[0.6rem] tracking-[0.12em] transition-all disabled:opacity-40 ${
                                reg.aprobado
                                  ? "border-red-500/30 text-red-400/70 hover:border-red-500/60 hover:text-red-400"
                                  : "border-gold/30 text-gold/70 hover:border-gold/60 hover:text-gold"
                              }`}>
                              {togglingId === reg.id ? "…" : reg.aprobado ? "REVOCAR" : "APROBAR"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            ) : (
              <MatchPanel
                equipos={equipos}
                partidos={partidos}
                loading={loadingPartidos}
                onPartidoAdded={handlePartidoChange}
                onPartidoDeleted={(id) => {
                  setPartidos((prev) => prev.filter((p) => p.id !== id));
                  onApprovalChange();
                }}
              />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

const EMPTY_FORM: FormData = {
  cedula: "", email: "", whatsapp: "", carrera: "", nivel: "", nombre_equipo: "", genero: "",
};
const NIVELES = ["1°","2°","3°","4°","5°","6°","7°","8°","9°","10°"];

export default function RegistroTorneoPage() {
  const [showForm, setShowForm]   = React.useState(false);
  const [form, setForm]           = React.useState<FormData>(EMPTY_FORM);
  const [state, setState]         = React.useState<FormState>("idle");
  const [errorMsg, setErrorMsg]   = React.useState("");
  const [cedulaError, setCedulaError] = React.useState("");

  const [showLogin, setShowLogin] = React.useState(false);
  const [showAdmin, setShowAdmin] = React.useState(false);

  const [equipos, setEquipos]     = React.useState<{ nombre_equipo: string; genero: string }[]>([]);
  const [partidos, setPartidos]   = React.useState<Partido[]>([]);
  const [loadingData, setLoadingData] = React.useState(true);
  const [tabGenero, setTabGenero] = React.useState<"masculino" | "femenino">("masculino");

  const checkIsAdminLoggedIn = React.useCallback(() => {
    if (typeof window === "undefined") return false;
    const expiry = localStorage.getItem("is_admin");
    if (!expiry) return false;
    const expiryNum = parseInt(expiry, 10);
    if (isNaN(expiryNum) || Date.now() > expiryNum) {
      localStorage.removeItem("is_admin");
      return false;
    }
    return true;
  }, []);

  async function fetchData() {
    setLoadingData(true);
    const [{ data: eqData }, { data: pData }] = await Promise.all([
      insforge.database.rpc("get_equipos_aprobados"),
      insforge.database.from("partidos_torneo").select("*").order("created_at", { ascending: true }),
    ]);
    if (eqData) setEquipos(eqData as { nombre_equipo: string; genero: string }[]);
    if (pData) setPartidos(pData as Partido[]);
    setLoadingData(false);
  }

  React.useEffect(() => {
    fetchData();
    if (checkIsAdminLoggedIn()) {
      insforge.auth.getCurrentUser().then(async ({ data }) => {
        if (!data?.user) { localStorage.removeItem("is_admin"); return; }
        const { data: profile } = await insforge.database
          .from("profiles").select("role").eq("auth_id", data.user.id).single();
        if (profile?.role === "admin") {
          setShowAdmin(true);
        } else {
          localStorage.removeItem("is_admin");
        }
      }).catch(() => { localStorage.removeItem("is_admin"); });
    }
  }, [checkIsAdminLoggedIn]);

  React.useEffect(() => {
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

  function set(field: keyof FormData) {
    return (value: string) => {
      setForm((f) => ({ ...f, [field]: value }));
      if (field === "cedula") setCedulaError("");
    };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validarCedula(form.cedula)) {
      setCedulaError("Cédula ecuatoriana inválida. Verifica el número.");
      return;
    }
    setState("submitting");
    setErrorMsg("");
    const { error } = await insforge.database.from("inscripciones_torneo").insert([{ ...form }]);
    if (error) {
      setState("error");
      if (error.code === "23505") {
        setCedulaError("Esta cédula ya tiene un equipo registrado.");
      } else {
        setErrorMsg("No se pudo guardar tu inscripción. Intenta de nuevo.");
      }
      return;
    }
    setState("success");
    setForm(EMPTY_FORM);
    setShowForm(false);
  }

  const equiposFiltrados = equipos
    .filter((e) => e.genero === tabGenero)
    .map((e) => e.nombre_equipo);
  const partidosFiltrados = partidos.filter((p) => p.genero === tabGenero);
  const standingsRows = computeStandings(equiposFiltrados, partidosFiltrados);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a0a0a]">
      <LoginModal
        open={showLogin}
        onClose={() => setShowLogin(false)}
        onSuccess={() => { setShowLogin(false); setShowAdmin(true); }}
      />
      <AdminPanel
        open={showAdmin}
        onClose={() => setShowAdmin(false)}
        onApprovalChange={fetchData}
        equipos={equipos}
      />

      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-72 w-96 -translate-x-1/2 rounded-full bg-gold/6 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 h-48 w-64 rounded-full bg-gold/4 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-3xl px-5 py-14 sm:px-8">
        {/* Nav */}
        <Link href="/"
          className="inline-flex items-center gap-2 text-[0.7rem] tracking-[0.18em] text-white/35 transition-colors hover:text-white/70">
          <BackArrow />VOLVER AL EVENTO
        </Link>

        {/* Header */}
        <div className="mt-10 text-center">
          <p className="text-[0.65rem] tracking-[0.32em] text-gold">TORNEO RELÁMPAGO DE FÚTBOL · 13 DE JUNIO</p>
          <h1 className="mt-4 font-[var(--font-display)] text-3xl tracking-tight text-white sm:text-4xl">
            Inscripción de equipos
          </h1>
          <p className="mx-auto mt-4 max-w-md text-sm leading-[1.85] text-white/45">
            Cancha sintética "El Camping" · 9:00 a. m.
          </p>
        </div>

        {/* Notice banner */}
        <div className="mt-8 flex items-start gap-3 rounded-2xl border border-gold/20 bg-gold/6 px-5 py-4">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 h-4 w-4 shrink-0 text-gold">
            <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
          </svg>
          <div className="text-sm leading-[1.8] text-gold/80">
            <span className="font-semibold text-gold">Solo el líder del equipo debe registrarse.</span>{" "}
            Una vez enviado el formulario, nos pondremos en contacto contigo vía WhatsApp para confirmar tu inscripción y coordinar los detalles del torneo.
          </div>
        </div>

        {/* Primary CTA */}
        <div className="mt-8 flex flex-col items-center gap-4">
          {state === "success" && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="flex w-full items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-4 text-sm text-emerald-400">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 shrink-0">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <span><strong>¡Inscripción recibida!</strong> Te contactaremos pronto por WhatsApp.</span>
            </motion.div>
          )}
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => setShowForm((v) => !v)}
            className="inline-flex items-center gap-2.5 rounded-full border border-gold/50 bg-gold/15 px-7 py-3.5 text-sm font-medium tracking-[0.15em] text-gold shadow-[0_0_24px_rgba(196,163,90,0.15)] transition-all hover:border-gold/80 hover:bg-gold/25 hover:shadow-[0_0_32px_rgba(196,163,90,0.25)]">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            {showForm ? "CANCELAR" : "REGISTRAR MI EQUIPO"}
          </motion.button>
        </div>

        {/* Registration form */}
        <AnimatePresence>
          {showForm && (
            <motion.div key="form" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden">
              <form onSubmit={handleSubmit}
                className="mt-6 rounded-2xl border border-white/8 bg-white/2 p-6 backdrop-blur-sm sm:p-8">
                <p className="mb-6 text-[0.65rem] tracking-[0.25em] text-white/35 uppercase">Datos del líder del equipo</p>
                <div className="grid gap-5 sm:grid-cols-2">
                  <FieldInput label="Cédula de identidad" id="cedula" placeholder="1312345678"
                    value={form.cedula} onChange={set("cedula")} hint="10 dígitos, sin espacios" error={cedulaError} />
                  <FieldInput label="Correo electrónico" id="email" type="email" placeholder="tu@correo.com"
                    value={form.email} onChange={set("email")} />
                  <FieldInput label="Número de WhatsApp" id="whatsapp" type="tel" placeholder="0991234567"
                    value={form.whatsapp} onChange={set("whatsapp")} hint="Te contactaremos aquí para confirmar" />
                  <FieldInput label="Carrera" id="carrera" placeholder="Ej. Ingeniería de Sistemas"
                    value={form.carrera} onChange={set("carrera")} />
                  <SelectInput label="Nivel / semestre" id="nivel" value={form.nivel} onChange={set("nivel")}
                    options={NIVELES} placeholder="Selecciona tu nivel" />
                  <SelectInput label="Categoría" id="genero" value={form.genero} onChange={set("genero")}
                    options={["masculino", "femenino"]} placeholder="Selecciona categoría" />
                  <FieldInput label="Nombre del equipo" id="nombre_equipo" placeholder="Ej. Los Cracks del Bloque C"
                    value={form.nombre_equipo} onChange={set("nombre_equipo")} />
                </div>
                {state === "error" && <p className="mt-4 text-xs text-red-400">{errorMsg}</p>}
                <div className="mt-8 flex items-center justify-end gap-4">
                  <button type="button" onClick={() => setShowForm(false)}
                    className="text-xs tracking-[0.15em] text-white/30 transition-colors hover:text-white/60">CANCELAR</button>
                  <motion.button type="submit" disabled={state === "submitting"}
                    whileHover={{ scale: state === "submitting" ? 1 : 1.02 }}
                    whileTap={{ scale: state === "submitting" ? 1 : 0.98 }}
                    className="inline-flex items-center gap-2 rounded-full border border-gold/50 bg-gold/15 px-6 py-2.5 text-xs tracking-[0.18em] text-gold transition-all hover:border-gold/80 hover:bg-gold/25 disabled:opacity-50">
                    {state === "submitting" ? (
                      <><svg className="h-3.5 w-3.5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>ENVIANDO…</>
                    ) : "ENVIAR INSCRIPCIÓN"}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Standings */}
        <div className="mt-16">
          <div className="mb-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-white/6" />
            <p className="text-[0.65rem] tracking-[0.28em] text-white/30 uppercase">Tabla de posiciones</p>
            <div className="h-px flex-1 bg-white/6" />
          </div>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-[var(--font-display)] text-xl tracking-tight text-white">Grupo único</h2>
              <p className="mt-1 text-xs text-white/30">Fase de grupos · Torneo relámpago 2026</p>
            </div>
            <span className="rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-[0.6rem] tracking-[0.2em] text-gold">
              {partidos.length > 0 ? "EN CURSO" : "POR COMENZAR"}
            </span>
          </div>

          {/* Gender tab */}
          <div className="mb-5 flex gap-1 rounded-xl border border-white/8 bg-white/2 p-1 w-fit">
            {(["masculino", "femenino"] as const).map((g) => (
              <button key={g} onClick={() => setTabGenero(g)}
                className={`rounded-lg px-5 py-2 text-[0.65rem] tracking-[0.18em] uppercase transition-all ${
                  tabGenero === g ? "bg-gold/15 text-gold border border-gold/30" : "text-white/35 hover:text-white/60"
                }`}>
                {g === "masculino" ? "Masculino" : "Femenino"}
              </button>
            ))}
          </div>

          <StandingsTable rows={standingsRows} loading={loadingData} />

          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
            {[
              ["PJ", "Partidos jugados"], ["PG", "Ganados"], ["PE", "Empatados"], ["PP", "Perdidos"],
              ["GF", "Goles a favor"], ["GC", "Goles en contra"], ["DG", "Diferencia de goles"], ["PTS", "Puntos"],
            ].map(([abbr, full]) => (
              <p key={abbr} className="text-[0.6rem] text-white/25">
                <span className="font-medium text-white/40">{abbr}</span> · {full}
              </p>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 flex items-center justify-between border-t border-white/5 pt-8">
          <Link href="/"
            className="inline-flex items-center gap-2 text-[0.7rem] tracking-[0.18em] text-white/30 transition-colors hover:text-white/60">
            <BackArrow />VOLVER AL EVENTO
          </Link>
          <button
            onClick={() => {
              if (checkIsAdminLoggedIn()) setShowAdmin(true);
              else setShowLogin(true);
            }}
            title="Administración"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/4 text-white/30 transition-colors hover:border-gold/40 hover:bg-gold/10 hover:text-gold"
          >
            <UserIcon />
          </button>
        </div>
      </div>
    </div>
  );
}

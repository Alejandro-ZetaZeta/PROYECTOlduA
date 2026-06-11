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

interface TorneoConfig {
  id: string;
  finalizado: boolean;
}

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
  penales_local?: number | null;
  penales_visitante?: number | null;
  genero: string;
  ronda: number;
  estado: "pendiente" | "finalizado";
  created_at: string;
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
// Helpers
// ---------------------------------------------------------------------------

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ---------------------------------------------------------------------------
// Simple standings (knockout — no GD, no points)
// ---------------------------------------------------------------------------

function computeSimpleStandings(
  equipos: string[],
  partidos: Partido[]
): { nombre: string; pj: number; pg: number; pp: number }[] {
  const map = new Map<string, { pj: number; pg: number; pp: number }>();
  for (const e of equipos) map.set(e, { pj: 0, pg: 0, pp: 0 });

  for (const p of partidos) {
    if (p.estado !== "finalizado" || p.equipo_visitante === "BYE") continue;
    if (!map.has(p.equipo_local) || !map.has(p.equipo_visitante)) continue;
    const local = map.get(p.equipo_local)!;
    const visit = map.get(p.equipo_visitante)!;
    local.pj++; visit.pj++;
    if (p.goles_local > p.goles_visitante) {
      local.pg++;
      visit.pp++;
    } else if (p.goles_visitante > p.goles_local) {
      visit.pg++;
      local.pp++;
    } else if (p.penales_local != null && p.penales_visitante != null) {
      if (p.penales_local > p.penales_visitante) {
        local.pg++;
        visit.pp++;
      } else {
        visit.pg++;
        local.pp++;
      }
    }
    map.set(p.equipo_local, local);
    map.set(p.equipo_visitante, visit);
  }

  return [...map.entries()]
    .map(([nombre, s]) => ({ nombre, ...s }))
    .sort((a, b) => b.pg - a.pg || a.pp - b.pp);
}

function SimpleStandingsTable({ rows, loading, minRows }: { rows: { nombre: string; pj: number; pg: number; pp: number }[]; loading: boolean; minRows: number }) {
  const displayed = rows.length >= minRows
    ? rows
    : [...rows, ...Array.from({ length: minRows - rows.length }, () => null)];

  return (
    <div className="w-full rounded-2xl border border-white/8 bg-white/2">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-white/8">
            {(["#", "Equipo", "PJ", "PG", "PP"] as const).map((h, i) => (
              <th key={h} className={`px-3 py-3 text-[0.6rem] tracking-[0.22em] font-medium text-white/40 uppercase ${i === 1 ? "text-left" : "text-center"}`}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {displayed.map((row, i) => {
            const isFirst = i === 0;
            const isSecond = i === 1;
            const rowBg = isFirst
              ? "border-b border-gold/20 last:border-0 bg-gold/5 hover:bg-gold/8"
              : isSecond
              ? "border-b border-white/10 last:border-0 bg-white/3 hover:bg-white/5"
              : "border-b border-white/4 last:border-0 hover:bg-white/2";
            const rankColor = isFirst ? "text-gold font-semibold" : isSecond ? "text-white/50 font-medium" : "text-white/25";
            return (
              <tr key={row?.nombre ?? i} className={rowBg}>
                <td className={`px-3 py-2.5 text-center text-xs ${rankColor}`}>{i + 1}</td>
                <td className="px-3 py-2.5 text-left text-xs font-medium">
                  {loading
                    ? <span className="inline-block h-3 w-28 animate-pulse rounded bg-white/8" />
                    : row
                      ? <span className={isFirst ? "text-gold" : isSecond ? "text-white/80" : "text-white"}>{row.nombre}</span>
                      : <span className="text-white/15">—</span>}
                </td>
                {(["pj","pg","pp"] as const).map((k) => (
                  <td key={k} className="px-3 py-2.5 text-center text-xs">
                    {loading
                      ? <span className="inline-block h-3 w-4 animate-pulse rounded bg-white/8" />
                      : row
                        ? <span className={k === "pg" ? "text-emerald-400" : k === "pp" ? "text-red-400/70" : "text-white"}>{row[k]}</span>
                        : <span className="text-white/15">—</span>}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Icons (continued)
// ---------------------------------------------------------------------------

function TrophyIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
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
// Match panel (single-elimination bracket)
// ---------------------------------------------------------------------------

function MatchPanel({ equipos, partidos, loading, finalizado, finalizando, onPartidoAdded, onPartidoDeleted, onToggleFinalizado }: {
  equipos: { nombre_equipo: string; genero: string }[];
  partidos: Partido[];
  loading: boolean;
  finalizado: boolean;
  finalizando: boolean;
  onPartidoAdded: () => void;
  onPartidoDeleted: (id: string) => void;
  onToggleFinalizado: () => void;
}) {
  const [tabGenero, setTabGenero] = React.useState<"masculino" | "femenino">("masculino");
  const [generating, setGenerating] = React.useState(false);
  const [genError, setGenError] = React.useState("");
  const [scores, setScores] = React.useState<Record<string, { local: string; visitante: string }>>({});
  const [savingId, setSavingId] = React.useState<string | null>(null);
  const [saveErrors, setSaveErrors] = React.useState<Record<string, string>>({});
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [penaltyOpen, setPenaltyOpen] = React.useState<string | null>(null);
  const [penaltyScores, setPenaltyScores] = React.useState<Record<string, { local: string; visitante: string }>>({});
  const [savingPenaltyId, setSavingPenaltyId] = React.useState<string | null>(null);
  const [penaltyErrors, setPenaltyErrors] = React.useState<Record<string, string>>();

  const allTeams = equipos.filter((e) => e.genero === tabGenero).map((e) => e.nombre_equipo);
  const pFiltered = partidos.filter((p) => p.genero === tabGenero);
  const rondas = [...new Set(pFiltered.map((p) => p.ronda))].sort((a, b) => a - b);
  const maxRonda = rondas.length > 0 ? Math.max(...rondas) : 0;
  // Only check the current (latest) round — prior rounds are already baked into bracket advancement
  const currentRoundMatches = pFiltered.filter((p) => p.ronda === maxRonda);
  const hasPending = currentRoundMatches.some((p) => p.estado === "pendiente");
  const hasUnresolvedTie = currentRoundMatches.some(
    (p) =>
      p.estado === "finalizado" &&
      p.goles_local === p.goles_visitante &&
      p.equipo_visitante !== "BYE" &&
      (p.penales_local == null || p.penales_visitante == null)
  );
  const isRoundResolved = !hasPending && !hasUnresolvedTie;

  function getWinner(p: Partido): string {
    if (p.equipo_visitante === "BYE") return p.equipo_local;
    if (p.goles_local === p.goles_visitante) {
      // Decide by penalty shootout result
      if (p.penales_local != null && p.penales_visitante != null) {
        return p.penales_local > p.penales_visitante ? p.equipo_local : p.equipo_visitante;
      }
      // Tie without penalties recorded yet — no winner
      return "";
    }
    return p.goles_local > p.goles_visitante ? p.equipo_local : p.equipo_visitante;
  }

  function getNextTeams(): string[] {
    if (pFiltered.length === 0) return allTeams;
    // Find the last round where EVERY match is finalizado
    const lastCompletedRonda = [...rondas].reverse().find(
      (r) => pFiltered.filter((p) => p.ronda === r).every((p) => p.estado === "finalizado")
    );
    if (lastCompletedRonda == null) return allTeams;
    return pFiltered
      .filter((p) => p.ronda === lastCompletedRonda)
      .map(getWinner)
      .filter(Boolean);
  }

  function getRoundLabel(ronda: number): string {
    const real = pFiltered.filter((p) => p.ronda === ronda && p.equipo_visitante !== "BYE");
    const byes  = pFiltered.filter((p) => p.ronda === ronda && p.equipo_visitante === "BYE");
    const teams  = real.length * 2 + byes.length;
    if (teams === 2) return "Final";
    if (teams === 4) return "Semifinales";
    if (teams === 8) return "Cuartos de final";
    return `Ronda ${ronda}`;
  }

  const nextTeams = getNextTeams();
  const isChampionDetermined = isRoundResolved && nextTeams.length === 1 && maxRonda > 0;

  async function handleGenerate() {
    setGenError("");
    if (nextTeams.length < 2) { setGenError("Se necesitan al menos 2 equipos."); return; }
    const nextRonda = maxRonda + 1;
    let teamsToPair = [...nextTeams];
    if (nextRonda === 1) {
      teamsToPair = shuffleArray(teamsToPair);
    }
    const toInsert: Omit<Partido, "id" | "created_at">[] = [];
    for (let i = 0; i + 1 < teamsToPair.length; i += 2) {
      toInsert.push({ equipo_local: teamsToPair[i], equipo_visitante: teamsToPair[i + 1], goles_local: 0, goles_visitante: 0, genero: tabGenero, ronda: nextRonda, estado: "pendiente" });
    }
    if (teamsToPair.length % 2 !== 0) {
      const bye = teamsToPair[teamsToPair.length - 1];
      toInsert.push({ equipo_local: bye, equipo_visitante: "BYE", goles_local: 1, goles_visitante: 0, genero: tabGenero, ronda: nextRonda, estado: "finalizado" });
    }
    setGenerating(true);
    const { error } = await insforge.database.from("partidos_torneo").insert(toInsert);
    if (error) setGenError("Error al generar partidos.");
    else { onPartidoAdded(); }
    setGenerating(false);
  }

  function getScore(id: string, side: "local" | "visitante") { return scores[id]?.[side] ?? ""; }
  function setScore(id: string, side: "local" | "visitante", val: string) {
    setScores((prev) => ({ ...prev, [id]: { ...prev[id], [side]: val } }));
    setSaveErrors((prev) => ({ ...prev, [id]: "" }));
  }

  async function handleSave(p: Partido) {
    const sc = scores[p.id];
    const gl = parseInt(sc?.local ?? "", 10);
    const gv = parseInt(sc?.visitante ?? "", 10);
    if (isNaN(gl) || isNaN(gv)) { setSaveErrors((prev) => ({ ...prev, [p.id]: "Ingresa ambos resultados." })); return; }
    setSavingId(p.id);
    const { error } = await insforge.database.from("partidos_torneo").update([{ goles_local: gl, goles_visitante: gv, estado: "finalizado", penales_local: null, penales_visitante: null }]).eq("id", p.id);
    if (error) { setSaveErrors((prev) => ({ ...prev, [p.id]: "Error al guardar." })); }
    else { setScores((prev) => { const n = { ...prev }; delete n[p.id]; return n; }); onPartidoAdded(); }
    setSavingId(null);
  }

  async function handleSavePenalties(p: Partido) {
    const sc = penaltyScores[p.id];
    const pl = parseInt(sc?.local ?? "", 10);
    const pv = parseInt(sc?.visitante ?? "", 10);
    if (isNaN(pl) || isNaN(pv)) { setPenaltyErrors((prev) => ({ ...prev, [p.id]: "Ingresa ambos resultados de penales." })); return; }
    if (pl === pv) { setPenaltyErrors((prev) => ({ ...prev, [p.id]: "Los penales tampoco pueden terminar en empate." })); return; }
    setSavingPenaltyId(p.id);
    const { error } = await insforge.database.from("partidos_torneo").update([{ penales_local: pl, penales_visitante: pv }]).eq("id", p.id);
    if (error) { setPenaltyErrors((prev) => ({ ...prev, [p.id]: "Error al guardar penales." })); }
    else {
      setPenaltyOpen(null);
      setPenaltyScores((prev) => { const n = { ...prev }; delete n[p.id]; return n; });
      setPenaltyErrors((prev) => ({ ...prev, [p.id]: "" }));
      onPartidoAdded();
    }
    setSavingPenaltyId(null);
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    const { error } = await insforge.database.from("partidos_torneo").delete().eq("id", id);
    if (!error) onPartidoDeleted(id);
    setDeletingId(null);
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Gender switcher */}
      <div className="flex gap-1 rounded-xl border border-white/8 bg-white/2 p-1 w-fit">
        {(["masculino", "femenino"] as const).map((g) => (
          <button key={g} onClick={() => { setTabGenero(g); setGenError(""); }}
            className={`rounded-lg px-4 py-1.5 text-[0.65rem] tracking-[0.18em] uppercase transition-all ${
              tabGenero === g ? "bg-gold/15 text-gold border border-gold/30" : "text-white/35 hover:text-white/60"
            }`}>
            {g === "masculino" ? "Masculino" : "Femenino"}
          </button>
        ))}
      </div>

      {/* Champion banner */}
      {isChampionDetermined && (
        <div className="flex items-center gap-3 rounded-2xl border border-gold/30 bg-gold/8 px-5 py-4">
          <span className="text-gold"><TrophyIcon /></span>
          <div>
            <p className="text-[0.6rem] tracking-[0.2em] text-gold/60 uppercase">Campeón · {tabGenero}</p>
            <p className="mt-0.5 text-sm font-semibold text-gold">{nextTeams[0]}</p>
          </div>
        </div>
      )}

      {/* Generate button */}
      {isRoundResolved && !isChampionDetermined && (
        <div className="flex flex-col gap-2">
          {allTeams.length < 2 ? (
            <p className="text-xs text-white/30 italic">Necesitas al menos 2 equipos aprobados en esta categoría.</p>
          ) : (
            <button onClick={handleGenerate} disabled={generating || loading}
              className="self-start rounded-full border border-gold/40 bg-gold/10 px-5 py-2.5 text-xs tracking-[0.18em] text-gold transition-all hover:border-gold/70 hover:bg-gold/20 disabled:opacity-40">
              {generating ? "GENERANDO…" : rondas.length === 0 ? `GENERAR RONDA 1 · ${allTeams.length} EQUIPOS` : `GENERAR RONDA ${maxRonda + 1} · ${nextTeams.length} EQUIPOS`}
            </button>
          )}
          {genError && <p className="text-xs text-red-400">{genError}</p>}
        </div>
      )}

      {/* Bracket rounds */}
      {loading ? (
        <div className="flex h-20 items-center justify-center text-xs text-white/30">Cargando…</div>
      ) : (
        <div className="flex flex-col gap-4">
          {rondas.map((ronda) => {
            const matches = pFiltered.filter((p) => p.ronda === ronda);
            const allDone = matches.every((m) => m.estado === "finalizado");
            return (
              <div key={ronda} className="rounded-2xl border border-white/8 bg-white/2">
                <div className="flex items-center justify-between border-b border-white/8 px-4 py-3">
                  <p className="text-[0.65rem] tracking-[0.25em] text-white/40 uppercase">{getRoundLabel(ronda)}</p>
                  <span className={`text-[0.6rem] tracking-[0.15em] ${allDone ? "text-emerald-400" : "text-gold/60"}`}>
                    {allDone ? "✓ COMPLETADO" : "EN CURSO"}
                  </span>
                </div>
                <div className="divide-y divide-white/4">
                  {matches.map((p) => {
                    if (p.equipo_visitante === "BYE") {
                      return (
                        <div key={p.id} className="flex items-center gap-3 px-4 py-3">
                          <span className="min-w-0 flex-1 truncate text-xs font-medium text-white">{p.equipo_local}</span>
                          <span className="shrink-0 text-[0.6rem] italic text-white/25">pase directo</span>
                          <button onClick={() => handleDelete(p.id)} disabled={deletingId === p.id}
                            className="shrink-0 rounded-full p-1.5 text-white/20 transition-colors hover:bg-red-500/10 hover:text-red-400 disabled:opacity-40">
                            {deletingId === p.id ? <span className="text-xs">…</span> : <TrashIcon />}
                          </button>
                        </div>
                      );
                    }

                    if (p.estado === "finalizado") {
                      const isDraw = p.goles_local === p.goles_visitante;
                      const hasPenalties = p.penales_local !== null && p.penales_visitante !== null;
                      const localWon = isDraw
                        ? (hasPenalties && p.penales_local! > p.penales_visitante!)
                        : p.goles_local > p.goles_visitante;
                      const penaltyPanelOpen = penaltyOpen === p.id;
                      return (
                        <div key={p.id} className="flex flex-col divide-y divide-white/4">
                          {/* Score row */}
                          <div className="flex items-center gap-2 px-4 py-3 hover:bg-white/2">
                            <span className={`min-w-0 flex-1 truncate text-right text-xs font-medium ${
                              isDraw && !hasPenalties ? "text-white" : localWon ? "text-white" : "text-white/30 line-through"
                            }`}>{p.equipo_local}</span>
                            <div className="flex shrink-0 flex-col items-center">
                              <span className="font-mono text-sm font-semibold tabular-nums text-white/70">
                                {p.goles_local}<span className="mx-1 text-white/25">—</span>{p.goles_visitante}
                              </span>
                              {isDraw && hasPenalties && (
                                <span className="text-[0.55rem] tracking-[0.15em] text-white/30">
                                  pen. {p.penales_local} – {p.penales_visitante}
                                </span>
                              )}
                              {isDraw && !hasPenalties && (
                                <span className="text-[0.55rem] tracking-[0.15em] text-amber-400/70">empate</span>
                              )}
                            </div>
                            <span className={`min-w-0 flex-1 truncate text-left text-xs font-medium ${
                              isDraw && !hasPenalties ? "text-white" : !localWon ? "text-white" : "text-white/30 line-through"
                            }`}>{p.equipo_visitante}</span>
                            {/* Penalties button — only for drawn finalized matches without penalties yet */}
                            {isDraw && !hasPenalties && (
                              <button
                                onClick={() => setPenaltyOpen(penaltyPanelOpen ? null : p.id)}
                                className={`ml-1 shrink-0 rounded-full border px-2.5 py-1 text-[0.6rem] tracking-[0.12em] transition-colors ${
                                  penaltyPanelOpen
                                    ? "border-amber-400/50 bg-amber-400/10 text-amber-300"
                                    : "border-amber-400/30 bg-amber-400/5 text-amber-400/70 hover:border-amber-400/60 hover:text-amber-300"
                                }`}
                              >
                                PENALES
                              </button>
                            )}
                            <button onClick={() => handleDelete(p.id)} disabled={deletingId === p.id}
                              className="ml-1 shrink-0 rounded-full p-1.5 text-white/20 transition-colors hover:bg-red-500/10 hover:text-red-400 disabled:opacity-40">
                              {deletingId === p.id ? <span className="text-xs">…</span> : <TrashIcon />}
                            </button>
                          </div>
                          {/* Inline penalty entry panel */}
                          {penaltyPanelOpen && (
                            <div className="flex flex-col gap-2 bg-amber-400/3 px-4 py-3">
                              <p className="text-[0.6rem] tracking-[0.22em] text-amber-400/70 uppercase">Tanda de penales</p>
                              <div className="flex items-center gap-2">
                                <span className="min-w-0 flex-1 truncate text-right text-xs text-white/60">{p.equipo_local}</span>
                                <div className="flex shrink-0 items-center gap-1.5">
                                  <input
                                    type="number" min="0" max="99" placeholder="0"
                                    value={penaltyScores[p.id]?.local ?? ""}
                                    onChange={(e) => setPenaltyScores((prev) => ({ ...prev, [p.id]: { ...prev[p.id], local: e.target.value } }))}
                                    className="w-11 rounded-lg border border-amber-400/30 bg-amber-400/5 py-1.5 text-center text-sm font-semibold text-amber-200 outline-none focus:border-amber-400/60"
                                  />
                                  <span className="text-white/25">—</span>
                                  <input
                                    type="number" min="0" max="99" placeholder="0"
                                    value={penaltyScores[p.id]?.visitante ?? ""}
                                    onChange={(e) => setPenaltyScores((prev) => ({ ...prev, [p.id]: { ...prev[p.id], visitante: e.target.value } }))}
                                    className="w-11 rounded-lg border border-amber-400/30 bg-amber-400/5 py-1.5 text-center text-sm font-semibold text-amber-200 outline-none focus:border-amber-400/60"
                                  />
                                </div>
                                <span className="min-w-0 flex-1 truncate text-left text-xs text-white/60">{p.equipo_visitante}</span>
                                <button
                                  onClick={() => handleSavePenalties(p)}
                                  disabled={savingPenaltyId === p.id}
                                  className="ml-1 shrink-0 rounded-full border border-amber-400/40 bg-amber-400/10 px-3 py-1.5 text-[0.6rem] tracking-[0.12em] text-amber-300 transition-colors hover:border-amber-400/70 disabled:opacity-40"
                                >
                                  {savingPenaltyId === p.id ? "…" : "OK"}
                                </button>
                              </div>
                              {penaltyErrors?.[p.id] && (
                                <p className="text-center text-[0.65rem] text-red-400">{penaltyErrors[p.id]}</p>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    }

                    // Pending — score inputs
                    return (
                      <div key={p.id} className="flex flex-col gap-2 px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="min-w-0 flex-1 truncate text-right text-xs font-medium text-white">{p.equipo_local}</span>
                          <div className="flex shrink-0 items-center gap-1.5">
                            <input type="number" min="0" max="99" placeholder="0"
                              value={getScore(p.id, "local")} onChange={(e) => setScore(p.id, "local", e.target.value)}
                              className="w-11 rounded-lg border border-white/15 bg-white/6 py-1.5 text-center text-sm font-semibold text-white outline-none focus:border-gold/50" />
                            <span className="text-white/25">—</span>
                            <input type="number" min="0" max="99" placeholder="0"
                              value={getScore(p.id, "visitante")} onChange={(e) => setScore(p.id, "visitante", e.target.value)}
                              className="w-11 rounded-lg border border-white/15 bg-white/6 py-1.5 text-center text-sm font-semibold text-white outline-none focus:border-gold/50" />
                          </div>
                          <span className="min-w-0 flex-1 truncate text-left text-xs font-medium text-white">{p.equipo_visitante}</span>
                          <button onClick={() => handleSave(p)} disabled={savingId === p.id}
                            className="ml-1 shrink-0 rounded-full border border-emerald-500/30 bg-emerald-500/8 px-3 py-1.5 text-[0.6rem] tracking-[0.12em] text-emerald-400 transition-colors hover:border-emerald-500/60 disabled:opacity-40">
                            {savingId === p.id ? "…" : "OK"}
                          </button>
                          <button onClick={() => handleDelete(p.id)} disabled={deletingId === p.id}
                            className="shrink-0 rounded-full p-1.5 text-white/20 transition-colors hover:bg-red-500/10 hover:text-red-400 disabled:opacity-40">
                            {deletingId === p.id ? <span className="text-xs">…</span> : <TrashIcon />}
                          </button>
                        </div>
                        {saveErrors[p.id] && <p className="text-center text-[0.65rem] text-red-400">{saveErrors[p.id]}</p>}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Finalizar torneo */}
      <div className={`rounded-2xl border p-4 ${finalizado ? "border-emerald-500/20 bg-emerald-500/5" : "border-white/8 bg-white/2"}`}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[0.65rem] tracking-[0.25em] text-white/40 uppercase">Estado del torneo</p>
            <p className={`mt-1 text-xs font-medium ${finalizado ? "text-emerald-400" : "text-white/50"}`}>
              {finalizado ? "Campeonato finalizado — campeones visibles públicamente" : "En curso"}
            </p>
          </div>
          <button onClick={onToggleFinalizado} disabled={finalizando}
            className={`shrink-0 rounded-full border px-4 py-2 text-[0.65rem] tracking-[0.18em] transition-all disabled:opacity-40 ${
              finalizado
                ? "border-white/20 text-white/40 hover:border-white/40 hover:text-white/70"
                : "border-emerald-500/40 bg-emerald-500/10 text-emerald-400 hover:border-emerald-500/70 hover:bg-emerald-500/20"
            }`}>
            {finalizando ? "…" : finalizado ? "REABRIR" : "FINALIZAR TORNEO"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Admin panel
// ---------------------------------------------------------------------------

function AdminPanel({ open, onClose, onApprovalChange, equipos, finalizado, onFinalizadoChange }: {
  open: boolean;
  onClose: () => void;
  onApprovalChange: () => void;
  equipos: { nombre_equipo: string; genero: string }[];
  finalizado: boolean;
  onFinalizadoChange: (v: boolean) => void;
}) {
  const [tab, setTab] = React.useState<AdminTab>("inscripciones");
  const [registrations, setRegistrations] = React.useState<Registration[]>([]);
  const [partidos, setPartidos] = React.useState<Partido[]>([]);
  const [loadingRegs, setLoadingRegs] = React.useState(false);
  const [loadingPartidos, setLoadingPartidos] = React.useState(false);
  const [togglingId, setTogglingId] = React.useState<string | null>(null);
  const [adminEmail, setAdminEmail] = React.useState<string | null>(null);
  const [finalizando, setFinalizando] = React.useState(false);

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

  async function deleteRegistration(id: string) {
    if (!verifyAndExtendSession()) return;
    setTogglingId(id);
    const { error } = await insforge.database.from("inscripciones_torneo").delete().eq("id", id);
    if (!error) {
      setRegistrations((prev) => prev.filter((r) => r.id !== id));
      onApprovalChange();
    }
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

  async function handleToggleFinalizado() {
    if (!verifyAndExtendSession()) return;
    setFinalizando(true);
    const next = !finalizado;
    await insforge.database
      .from("torneo_config")
      .update([{ finalizado: next, updated_at: new Date().toISOString() }])
      .eq("id", "default");
    onFinalizadoChange(next);
    setFinalizando(false);
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
                        {["#", "Equipo", "Cédula", "WhatsApp", "Carrera", "Nivel", "Categ.", "Estado", "", ""].map((h, i) => (
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
                          <td className="px-3 py-2.5 text-center">
                            <button onClick={() => deleteRegistration(reg.id)} disabled={togglingId === reg.id}
                              title="Eliminar inscripción"
                              className="rounded-full p-1.5 text-white/20 transition-colors hover:bg-red-500/10 hover:text-red-400 disabled:opacity-40">
                              {togglingId === reg.id ? <span className="text-xs">…</span> : <TrashIcon />}
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
                finalizado={finalizado}
                finalizando={finalizando}
                onPartidoAdded={handlePartidoChange}
                onPartidoDeleted={(id) => {
                  setPartidos((prev) => prev.filter((p) => p.id !== id));
                  onApprovalChange();
                }}
                onToggleFinalizado={handleToggleFinalizado}
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
  const [finalizado, setFinalizado] = React.useState(false);

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
    const [{ data: eqData }, { data: pData }, { data: cfgData }] = await Promise.all([
      insforge.database.rpc("get_equipos_aprobados"),
      insforge.database.from("partidos_torneo").select("*").order("created_at", { ascending: true }),
      insforge.database.from("torneo_config").select("finalizado").eq("id", "default").single(),
    ]);
    if (eqData) setEquipos(eqData as { nombre_equipo: string; genero: string }[]);
    if (pData) setPartidos(pData as Partido[]);
    if (cfgData) setFinalizado((cfgData as TorneoConfig).finalizado);
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
    if (typeof document === "undefined") return;
    document.body.style.overflow = showAdmin ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [showAdmin]);

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

  function getChampion(genero: string): string | null {
    const finished = partidos.filter((p) => p.genero === genero && p.estado === "finalizado");
    if (finished.length === 0) return null;
    const maxR = Math.max(...finished.map((p) => p.ronda));
    const real = finished.filter((p) => p.ronda === maxR && p.equipo_visitante !== "BYE");
    if (real.length !== 1) return null;
    const f = real[0];
    if (f.goles_local === f.goles_visitante) {
      if (f.penales_local != null && f.penales_visitante != null) {
        return f.penales_local > f.penales_visitante ? f.equipo_local : f.equipo_visitante;
      }
      return null;
    }
    return f.goles_local > f.goles_visitante ? f.equipo_local : f.equipo_visitante;
  }

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
        finalizado={finalizado}
        onFinalizadoChange={setFinalizado}
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

        {/* Public standings */}
        <div className="mt-16">
          <div className="mb-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-white/6" />
            <p className="text-[0.65rem] tracking-[0.28em] text-white/30 uppercase">Equipos inscritos</p>
            <div className="h-px flex-1 bg-white/6" />
          </div>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-1 rounded-xl border border-white/8 bg-white/2 p-1">
              {(["masculino", "femenino"] as const).map((g) => (
                <button key={g} onClick={() => setTabGenero(g)}
                  className={`rounded-lg px-5 py-2 text-[0.65rem] tracking-[0.18em] uppercase transition-all ${
                    tabGenero === g ? "bg-gold/15 text-gold border border-gold/30" : "text-white/35 hover:text-white/60"
                  }`}>
                  {g === "masculino" ? "Masculino" : "Femenino"}
                </button>
              ))}
            </div>
            <span className="rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-[0.6rem] tracking-[0.2em] text-gold">
              {partidos.filter((p) => p.estado === "finalizado").length > 0 ? "EN CURSO" : "POR COMENZAR"}
            </span>
          </div>
          <SimpleStandingsTable
            rows={computeSimpleStandings(
              equipos.filter((e) => e.genero === tabGenero).map((e) => e.nombre_equipo),
              partidos.filter((p) => p.genero === tabGenero)
            )}
            loading={loadingData}
            minRows={tabGenero === "masculino" ? 10 : 6}
          />
          <div className="mt-3 flex gap-6">
            {[["PJ","Partidos jugados"],["PG","Ganados"],["PP","Perdidos"]].map(([a,f]) => (
              <p key={a} className="text-[0.6rem] text-white/25"><span className="font-medium text-white/40">{a}</span> · {f}</p>
            ))}
          </div>
        </div>

        {/* Champion display — only shown when tournament is marked finished */}
        {finalizado && (
          <div className="mt-16">
            <div className="mb-6 flex items-center gap-4">
              <div className="h-px flex-1 bg-white/6" />
              <p className="text-[0.65rem] tracking-[0.28em] text-white/30 uppercase">Campeones</p>
              <div className="h-px flex-1 bg-white/6" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {(["masculino", "femenino"] as const).map((g) => {
                const champion = getChampion(g);
                return (
                  <div key={g} className={`flex items-center gap-4 rounded-2xl border px-5 py-5 ${champion ? "border-gold/25 bg-gold/6" : "border-white/8 bg-white/2"}`}>
                    <span className={champion ? "text-gold" : "text-white/20"}><TrophyIcon /></span>
                    <div>
                      <p className="text-[0.6rem] tracking-[0.22em] text-white/35 uppercase">{g === "masculino" ? "Masculino" : "Femenino"}</p>
                      <p className={`mt-1 text-sm font-semibold ${champion ? "text-gold" : "text-white/25 italic"}`}>
                        {champion ?? "Por determinar"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

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

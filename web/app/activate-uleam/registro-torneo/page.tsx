"use client";

import * as React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { insforge } from "@/lib/insforge";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type FormState = "idle" | "submitting" | "success" | "error";

interface FormData {
  cedula: string;
  email: string;
  whatsapp: string;
  carrera: string;
  nivel: string;
  nombre_equipo: string;
}

interface Registration {
  id: string;
  cedula: string;
  email: string;
  whatsapp: string;
  carrera: string;
  nivel: string;
  nombre_equipo: string;
  aprobado: boolean;
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
// Sub-components
// ---------------------------------------------------------------------------

function BackArrow() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
      <path d="M19 12H5M12 5l-7 7 7 7" />
    </svg>
  );
}

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
          error ? "border-red-500/60 bg-red-500/5 focus:border-red-500/80"
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

function StandingsTable({ equipos, loading }: { equipos: string[]; loading: boolean }) {
  const MIN_ROWS = 8;
  const totalRows = Math.max(MIN_ROWS, equipos.length);

  const cols = [
    { key: "pos",   label: "#",    title: "Posición" },
    { key: "equipo",label: "Equipo",title: "Nombre del equipo" },
    { key: "pj",    label: "PJ",   title: "Partidos jugados" },
    { key: "pg",    label: "PG",   title: "Partidos ganados" },
    { key: "pe",    label: "PE",   title: "Partidos empatados" },
    { key: "pp",    label: "PP",   title: "Partidos perdidos" },
    { key: "gf",    label: "GF",   title: "Goles a favor" },
    { key: "gc",    label: "GC",   title: "Goles en contra" },
    { key: "dg",    label: "DG",   title: "Diferencia de goles" },
    { key: "pts",   label: "PTS",  title: "Puntos" },
  ] as const;

  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-white/8 bg-white/2">
      <table className="w-full min-w-[580px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-white/8">
            {cols.map((col) => (
              <th key={col.key} title={col.title}
                className={`px-3 py-3 text-[0.6rem] tracking-[0.22em] font-medium text-white/40 uppercase ${col.key === "equipo" ? "text-left" : "text-center"}`}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: totalRows }).map((_, i) => {
            const nombre = equipos[i] ?? null;
            const pos = i + 1;
            return (
              <tr key={i} className={`border-b border-white/4 transition-colors hover:bg-white/3 last:border-0 ${pos === 1 && nombre ? "bg-gold/4" : ""}`}>
                <td className="px-3 py-3 text-center">
                  <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                    pos === 1 ? "bg-gold/20 text-gold"
                    : pos === 2 ? "bg-white/10 text-white/60"
                    : pos === 3 ? "bg-amber-900/20 text-amber-600/80"
                    : "text-white/30"}`}>
                    {pos}
                  </span>
                </td>
                <td className={`px-3 py-3 text-left text-xs ${nombre ? "text-white/80 font-medium" : "text-white/25 italic"}`}>
                  {loading ? <span className="inline-block h-3 w-24 animate-pulse rounded bg-white/10" /> : (nombre ?? "—")}
                </td>
                {(["pj","pg","pe","pp","gf","gc","dg","pts"] as const).map((k) => (
                  <td key={k} className={`px-3 py-3 text-center text-white/25 ${k === "pts" ? "font-semibold text-white/40" : ""}`}>0</td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="px-4 py-3 text-center text-[0.6rem] tracking-[0.18em] text-white/20 uppercase">
        Tabla se actualiza al inicio del torneo · 20 de junio de 2026
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
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!open) { setEmail(""); setPassword(""); setError(""); }
  }, [open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { data: authData, error: authError } = await insforge.auth.signInWithPassword({ email, password });
    if (authError || !authData?.user) { setLoading(false); setError("Credenciales incorrectas."); return; }

    // Verify admin role in profiles table
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
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                  className="rounded-xl border border-white/10 bg-white/4 px-4 py-3 text-sm text-white outline-none focus:border-gold/50" />
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
// Admin panel
// ---------------------------------------------------------------------------

function AdminPanel({ open, onClose, onApprovalChange }: {
  open: boolean; onClose: () => void; onApprovalChange: () => void;
}) {
  const [registrations, setRegistrations] = React.useState<Registration[]>([]);
  const [loadingRegs, setLoadingRegs] = React.useState(false);
  const [togglingId, setTogglingId] = React.useState<string | null>(null);

  async function fetchRegistrations() {
    setLoadingRegs(true);
    const { data } = await insforge.database
      .from("inscripciones_torneo")
      .select("*")
      .order("created_at", { ascending: true });
    if (data) setRegistrations(data as Registration[]);
    setLoadingRegs(false);
  }

  React.useEffect(() => {
    if (open) fetchRegistrations();
  }, [open]);

  async function toggle(reg: Registration) {
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
    onClose();
  }

  const aprobados = registrations.filter((r) => r.aprobado).length;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex flex-col bg-[#080808]"
        >
          {/* Header */}
          <div className="flex shrink-0 items-center justify-between border-b border-white/8 px-6 py-4">
            <div className="flex items-center gap-4">
              <p className="text-[0.6rem] tracking-[0.28em] text-gold uppercase">Panel Admin</p>
              <span className="text-[0.65rem] text-white/30">
                {aprobados} aprobados · {registrations.length} total
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={handleLogout}
                className="text-[0.65rem] tracking-[0.18em] text-white/30 transition-colors hover:text-white/60">
                CERRAR SESIÓN
              </button>
              <button onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/50 transition-colors hover:text-white">
                ✕
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-auto px-6 py-6">
            {loadingRegs ? (
              <div className="flex h-40 items-center justify-center text-xs text-white/30">Cargando…</div>
            ) : registrations.length === 0 ? (
              <div className="flex h-40 items-center justify-center text-xs text-white/30">Sin inscripciones aún.</div>
            ) : (
              <div className="w-full overflow-x-auto rounded-2xl border border-white/8">
                <table className="w-full min-w-[780px] border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-white/8">
                      {["#", "Equipo", "Cédula", "WhatsApp", "Carrera", "Nivel", "Estado", ""].map((h, i) => (
                        <th key={i} className={`px-4 py-3 text-[0.6rem] tracking-[0.2em] font-medium text-white/35 uppercase ${i <= 1 ? "text-left" : "text-center"}`}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {registrations.map((reg, i) => (
                      <tr key={reg.id} className="border-b border-white/4 last:border-0 hover:bg-white/2">
                        <td className="px-4 py-3 text-center text-xs text-white/30">{i + 1}</td>
                        <td className="px-4 py-3 text-left text-xs font-medium text-white/80">{reg.nombre_equipo}</td>
                        <td className="px-4 py-3 text-center text-xs text-white/40 font-mono">{reg.cedula}</td>
                        <td className="px-4 py-3 text-center text-xs text-white/40">{reg.whatsapp}</td>
                        <td className="px-4 py-3 text-center text-xs text-white/40">{reg.carrera}</td>
                        <td className="px-4 py-3 text-center text-xs text-white/40">{reg.nivel}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[0.6rem] tracking-[0.15em] ${
                            reg.aprobado ? "bg-emerald-500/15 text-emerald-400" : "bg-white/6 text-white/30"
                          }`}>
                            {reg.aprobado ? "APROBADO" : "PENDIENTE"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => toggle(reg)}
                            disabled={togglingId === reg.id}
                            className={`rounded-full border px-3 py-1 text-[0.6rem] tracking-[0.15em] transition-all disabled:opacity-40 ${
                              reg.aprobado
                                ? "border-red-500/30 text-red-400/70 hover:border-red-500/60 hover:text-red-400"
                                : "border-gold/30 text-gold/70 hover:border-gold/60 hover:text-gold"
                            }`}
                          >
                            {togglingId === reg.id ? "…" : reg.aprobado ? "REVOCAR" : "APROBAR"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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

const EMPTY_FORM: FormData = { cedula: "", email: "", whatsapp: "", carrera: "", nivel: "", nombre_equipo: "" };
const NIVELES = ["1°","2°","3°","4°","5°","6°","7°","8°","9°","10°"];

export default function RegistroTorneoPage() {
  const [showForm, setShowForm]     = React.useState(false);
  const [form, setForm]             = React.useState<FormData>(EMPTY_FORM);
  const [state, setState]           = React.useState<FormState>("idle");
  const [errorMsg, setErrorMsg]     = React.useState("");
  const [cedulaError, setCedulaError] = React.useState("");

  const [showLogin, setShowLogin]   = React.useState(false);
  const [showAdmin, setShowAdmin]   = React.useState(false);

  const [equipos, setEquipos]       = React.useState<string[]>([]);
  const [loadingEquipos, setLoadingEquipos] = React.useState(true);

  // Fetch approved team names (public RPC — returns only nombre_equipo)
  async function fetchEquipos() {
    setLoadingEquipos(true);
    const { data } = await insforge.database.rpc("get_equipos_aprobados");
    if (data) setEquipos((data as { nombre_equipo: string }[]).map((r) => r.nombre_equipo));
    setLoadingEquipos(false);
  }

  // Check existing session on mount
  React.useEffect(() => {
    fetchEquipos();
    insforge.auth.getCurrentUser().then(async ({ data }) => {
      if (!data?.user) return;
      const { data: profile } = await insforge.database
        .from("profiles").select("role").eq("auth_id", data.user.id).single();
      if (profile?.role === "admin") setShowAdmin(true);
    });
  }, []);

  // Keyboard easter egg: type /login anywhere (not in inputs)
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
    if (error) { setState("error"); setErrorMsg("No se pudo guardar tu inscripción. Intenta de nuevo."); return; }
    setState("success");
    setForm(EMPTY_FORM);
    setShowForm(false);
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a0a0a]">
      {/* Modals */}
      <LoginModal
        open={showLogin}
        onClose={() => setShowLogin(false)}
        onSuccess={() => { setShowLogin(false); setShowAdmin(true); }}
      />
      <AdminPanel
        open={showAdmin}
        onClose={() => setShowAdmin(false)}
        onApprovalChange={fetchEquipos}
      />

      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-72 w-96 -translate-x-1/2 rounded-full bg-gold/6 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 h-48 w-64 rounded-full bg-gold/4 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-3xl px-5 py-14 sm:px-8">
        {/* Nav */}
        <Link href="/activate-uleam"
          className="inline-flex items-center gap-2 text-[0.7rem] tracking-[0.18em] text-white/35 transition-colors hover:text-white/70">
          <BackArrow />VOLVER AL EVENTO
        </Link>

        {/* Header */}
        <div className="mt-10 text-center">
          <p className="text-[0.65rem] tracking-[0.32em] text-gold">TORNEO RELÁMPAGO DE FÚTBOL · 20 DE JUNIO</p>
          <h1 className="mt-4 font-[var(--font-display)] text-3xl tracking-tight text-white sm:text-4xl">Inscripción de equipos</h1>
          <p className="mx-auto mt-4 max-w-md text-sm leading-[1.85] text-white/45">Cancha sintética "El Camping" · 9:00 a. m.</p>
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

        {/* Standings section */}
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
              POR COMENZAR
            </span>
          </div>
          <StandingsTable equipos={equipos} loading={loadingEquipos} />
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
            {[["PJ","Partidos jugados"],["PG","Ganados"],["PE","Empatados"],["PP","Perdidos"],
              ["GF","Goles a favor"],["GC","Goles en contra"],["DG","Diferencia de goles"],["PTS","Puntos"]
            ].map(([abbr, full]) => (
              <p key={abbr} className="text-[0.6rem] text-white/25">
                <span className="font-medium text-white/40">{abbr}</span> · {full}
              </p>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-14 text-center">
          <Link href="/activate-uleam"
            className="inline-flex items-center gap-2 text-[0.7rem] tracking-[0.18em] text-white/30 transition-colors hover:text-white/60">
            <BackArrow />VOLVER AL EVENTO
          </Link>
        </div>
      </div>
    </div>
  );
}

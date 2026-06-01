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

// ---------------------------------------------------------------------------
// Standings mock data
// ---------------------------------------------------------------------------

const MOCK_TEAMS = [
  { pos: 1, equipo: "—", pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, dg: 0, pts: 0 },
  { pos: 2, equipo: "—", pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, dg: 0, pts: 0 },
  { pos: 3, equipo: "—", pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, dg: 0, pts: 0 },
  { pos: 4, equipo: "—", pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, dg: 0, pts: 0 },
  { pos: 5, equipo: "—", pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, dg: 0, pts: 0 },
  { pos: 6, equipo: "—", pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, dg: 0, pts: 0 },
  { pos: 7, equipo: "—", pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, dg: 0, pts: 0 },
  { pos: 8, equipo: "—", pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, dg: 0, pts: 0 },
];

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function BackArrow() {
  return (
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
      <path d="M19 12H5M12 5l-7 7 7 7" />
    </svg>
  );
}

function FieldInput({
  label,
  id,
  type = "text",
  placeholder,
  value,
  onChange,
  hint,
}: {
  label: string;
  id: string;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[0.7rem] tracking-[0.2em] text-white/50 uppercase">
        {label}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        className="w-full rounded-xl border border-white/10 bg-white/4 px-4 py-3 text-sm text-white placeholder-white/25 outline-none transition-colors focus:border-gold/50 focus:bg-white/6"
      />
      {hint && <p className="text-[0.65rem] text-white/30">{hint}</p>}
    </div>
  );
}

function SelectInput({
  label,
  id,
  value,
  onChange,
  options,
  placeholder,
}: {
  label: string;
  id: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[0.7rem] tracking-[0.2em] text-white/50 uppercase">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        className="w-full rounded-xl border border-white/10 bg-[#111] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-gold/50 appearance-none"
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

function StandingsTable() {
  const cols = [
    { key: "pos", label: "#", title: "Posición" },
    { key: "equipo", label: "Equipo", title: "Nombre del equipo" },
    { key: "pj", label: "PJ", title: "Partidos jugados" },
    { key: "pg", label: "PG", title: "Partidos ganados" },
    { key: "pe", label: "PE", title: "Partidos empatados" },
    { key: "pp", label: "PP", title: "Partidos perdidos" },
    { key: "gf", label: "GF", title: "Goles a favor" },
    { key: "gc", label: "GC", title: "Goles en contra" },
    { key: "dg", label: "DG", title: "Diferencia de goles" },
    { key: "pts", label: "PTS", title: "Puntos" },
  ] as const;

  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-white/8 bg-white/2">
      <table className="w-full min-w-[580px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-white/8">
            {cols.map((col) => (
              <th
                key={col.key}
                title={col.title}
                className={`px-3 py-3 text-[0.6rem] tracking-[0.22em] font-medium text-white/40 uppercase ${
                  col.key === "equipo" ? "text-left" : "text-center"
                }`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {MOCK_TEAMS.map((row, i) => (
            <tr
              key={i}
              className={`border-b border-white/4 transition-colors hover:bg-white/3 last:border-0 ${
                row.pos === 1 ? "bg-gold/4" : ""
              }`}
            >
              <td className="px-3 py-3 text-center">
                <span
                  className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                    row.pos === 1
                      ? "bg-gold/20 text-gold"
                      : row.pos === 2
                      ? "bg-white/10 text-white/60"
                      : row.pos === 3
                      ? "bg-amber-900/20 text-amber-600/80"
                      : "text-white/30"
                  }`}
                >
                  {row.pos}
                </span>
              </td>
              <td className="px-3 py-3 text-left text-white/30 text-xs italic">
                {row.equipo}
              </td>
              {(["pj", "pg", "pe", "pp", "gf", "gc", "dg", "pts"] as const).map((k) => (
                <td key={k} className={`px-3 py-3 text-center text-white/25 ${k === "pts" ? "font-semibold text-white/40" : ""}`}>
                  {row[k]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="px-4 py-3 text-center text-[0.6rem] tracking-[0.18em] text-white/20 uppercase">
        Tabla se actualiza al inicio del torneo · 20 de junio de 2026
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

const EMPTY_FORM: FormData = {
  cedula: "",
  email: "",
  whatsapp: "",
  carrera: "",
  nivel: "",
  nombre_equipo: "",
};

const NIVELES = ["1°", "2°", "3°", "4°", "5°", "6°", "7°", "8°", "9°", "10°"];

export default function RegistroTorneoPage() {
  const [showForm, setShowForm] = React.useState(false);
  const [form, setForm] = React.useState<FormData>(EMPTY_FORM);
  const [state, setState] = React.useState<FormState>("idle");
  const [errorMsg, setErrorMsg] = React.useState("");

  function set(field: keyof FormData) {
    return (value: string) => setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("submitting");
    setErrorMsg("");

    const { error } = await insforge.database
      .from("inscripciones_torneo")
      .insert([{ ...form }]);

    if (error) {
      setState("error");
      setErrorMsg("No se pudo guardar tu inscripción. Intenta de nuevo.");
      return;
    }

    setState("success");
    setForm(EMPTY_FORM);
    setShowForm(false);
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a0a0a]">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-72 w-96 -translate-x-1/2 rounded-full bg-gold/6 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 h-48 w-64 rounded-full bg-gold/4 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-3xl px-5 py-14 sm:px-8">
        {/* Nav */}
        <Link
          href="/activate-uleam"
          className="inline-flex items-center gap-2 text-[0.7rem] tracking-[0.18em] text-white/35 transition-colors hover:text-white/70"
        >
          <BackArrow />
          VOLVER AL EVENTO
        </Link>

        {/* Header */}
        <div className="mt-10 text-center">
          <p className="text-[0.65rem] tracking-[0.32em] text-gold">
            TORNEO RELÁMPAGO DE FÚTBOL · 20 DE JUNIO
          </p>
          <h1 className="mt-4 font-[var(--font-display)] text-3xl tracking-tight text-white sm:text-4xl">
            Inscripción de equipos
          </h1>
          <p className="mx-auto mt-4 max-w-md text-sm leading-[1.85] text-white/45">
            Cancha sintética "El Camping" · 9:00 a. m.
          </p>
        </div>

        {/* Notice banner */}
        <div className="mt-8 flex items-start gap-3 rounded-2xl border border-gold/20 bg-gold/6 px-5 py-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mt-0.5 h-4 w-4 shrink-0 text-gold"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4M12 16h.01" />
          </svg>
          <div className="text-sm leading-[1.8] text-gold/80">
            <span className="font-semibold text-gold">Solo el líder del equipo debe registrarse.</span>{" "}
            Una vez enviado el formulario, nos pondremos en contacto contigo vía WhatsApp para confirmar tu inscripción y coordinar los detalles del torneo.
          </div>
        </div>

        {/* Primary CTA */}
        <div className="mt-8 flex flex-col items-center gap-4">
          {state === "success" && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex w-full items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-4 text-sm text-emerald-400"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 shrink-0">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <span>
                <strong>¡Inscripción recibida!</strong> Te contactaremos pronto por WhatsApp.
              </span>
            </motion.div>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowForm((v) => !v)}
            className="inline-flex items-center gap-2.5 rounded-full border border-gold/50 bg-gold/15 px-7 py-3.5 text-sm font-medium tracking-[0.15em] text-gold shadow-[0_0_24px_rgba(196,163,90,0.15)] transition-all hover:border-gold/80 hover:bg-gold/25 hover:shadow-[0_0_32px_rgba(196,163,90,0.25)]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            {showForm ? "CANCELAR" : "REGISTRAR MI EQUIPO"}
          </motion.button>
        </div>

        {/* Registration form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              key="form"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <form
                onSubmit={handleSubmit}
                className="mt-6 rounded-2xl border border-white/8 bg-white/2 p-6 backdrop-blur-sm sm:p-8"
              >
                <p className="mb-6 text-[0.65rem] tracking-[0.25em] text-white/35 uppercase">
                  Datos del líder del equipo
                </p>

                <div className="grid gap-5 sm:grid-cols-2">
                  <FieldInput
                    label="Cédula de identidad"
                    id="cedula"
                    placeholder="0912345678"
                    value={form.cedula}
                    onChange={set("cedula")}
                    hint="10 dígitos, sin espacios"
                  />
                  <FieldInput
                    label="Correo electrónico"
                    id="email"
                    type="email"
                    placeholder="tu@correo.com"
                    value={form.email}
                    onChange={set("email")}
                  />
                  <FieldInput
                    label="Número de WhatsApp"
                    id="whatsapp"
                    type="tel"
                    placeholder="0991234567"
                    value={form.whatsapp}
                    onChange={set("whatsapp")}
                    hint="Te contactaremos aquí para confirmar"
                  />
                  <FieldInput
                    label="Carrera"
                    id="carrera"
                    placeholder="Ej. Ingeniería de Sistemas"
                    value={form.carrera}
                    onChange={set("carrera")}
                  />
                  <SelectInput
                    label="Nivel / semestre"
                    id="nivel"
                    value={form.nivel}
                    onChange={set("nivel")}
                    options={NIVELES}
                    placeholder="Selecciona tu nivel"
                  />
                  <FieldInput
                    label="Nombre del equipo"
                    id="nombre_equipo"
                    placeholder="Ej. Los Cracks del Bloque C"
                    value={form.nombre_equipo}
                    onChange={set("nombre_equipo")}
                  />
                </div>

                {state === "error" && (
                  <p className="mt-4 text-xs text-red-400">{errorMsg}</p>
                )}

                <div className="mt-8 flex items-center justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="text-xs tracking-[0.15em] text-white/30 transition-colors hover:text-white/60"
                  >
                    CANCELAR
                  </button>
                  <motion.button
                    type="submit"
                    disabled={state === "submitting"}
                    whileHover={{ scale: state === "submitting" ? 1 : 1.02 }}
                    whileTap={{ scale: state === "submitting" ? 1 : 0.98 }}
                    className="inline-flex items-center gap-2 rounded-full border border-gold/50 bg-gold/15 px-6 py-2.5 text-xs tracking-[0.18em] text-gold transition-all hover:border-gold/80 hover:bg-gold/25 disabled:opacity-50"
                  >
                    {state === "submitting" ? (
                      <>
                        <svg className="h-3.5 w-3.5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        ENVIANDO…
                      </>
                    ) : (
                      "ENVIAR INSCRIPCIÓN"
                    )}
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
            <p className="text-[0.65rem] tracking-[0.28em] text-white/30 uppercase">
              Tabla de posiciones
            </p>
            <div className="h-px flex-1 bg-white/6" />
          </div>

          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-[var(--font-display)] text-xl tracking-tight text-white">
                Grupo único
              </h2>
              <p className="mt-1 text-xs text-white/30">Fase de grupos · Torneo relámpago 2026</p>
            </div>
            <span className="rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-[0.6rem] tracking-[0.2em] text-gold">
              POR COMENZAR
            </span>
          </div>

          <StandingsTable />

          {/* Legend */}
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
            {[
              ["PJ", "Partidos jugados"],
              ["PG", "Ganados"],
              ["PE", "Empatados"],
              ["PP", "Perdidos"],
              ["GF", "Goles a favor"],
              ["GC", "Goles en contra"],
              ["DG", "Diferencia de goles"],
              ["PTS", "Puntos"],
            ].map(([abbr, full]) => (
              <p key={abbr} className="text-[0.6rem] text-white/25">
                <span className="font-medium text-white/40">{abbr}</span> · {full}
              </p>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-14 text-center">
          <Link
            href="/activate-uleam"
            className="inline-flex items-center gap-2 text-[0.7rem] tracking-[0.18em] text-white/30 transition-colors hover:text-white/60"
          >
            <BackArrow />
            VOLVER AL EVENTO
          </Link>
        </div>
      </div>
    </div>
  );
}

"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { insforge } from "@/lib/insforge/browser";
import {
  DISCIPLINAS,
  CARRERAS,
  AREAS,
  NIVELES,
  getDisciplina,
  type DisciplinaId,
  type DisciplinaConfig,
} from "@/data/olimpiadas";

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
          <h1 className="mt-4 font-[var(--font-display)] text-3xl tracking-tight text-white sm:text-4xl">
            Elige tu disciplina
          </h1>
          <p className="mx-auto mt-4 max-w-md text-sm leading-[1.85] text-white/45">
            Selecciona la disciplina en la que quieres competir. El formulario se adapta a cada una.
          </p>
        </div>

        {/* Discipline selector — segmented control, scrollable on mobile */}
        <div className="mt-10 overflow-x-auto">
          <div className="mx-auto flex w-full gap-1 rounded-2xl border border-white/10 bg-white/3 p-1">
            {DISCIPLINAS.map((d) => (
              <button
                key={d.id}
                onClick={() => switchDisciplina(d.id)}
                className={`flex min-w-max flex-1 items-center justify-center whitespace-nowrap rounded-xl px-4 py-2 text-[0.68rem] tracking-[0.16em] uppercase transition-all ${
                  disciplina === d.id
                    ? "border border-gold/50 bg-gold/15 text-gold"
                    : "border border-transparent text-white/40 hover:text-white/70"
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
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
              <p className="mt-4 text-sm leading-[1.85] text-white/50">{cfg.descripcion}</p>
            </div>

            {/* Form */}
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

            {/* Clasificatorias placeholder per discipline */}
            <div className="mt-6 rounded-2xl border border-dashed border-white/15 bg-white/2 p-6 text-center">
              <p className="text-[0.65rem] tracking-[0.28em] text-white/30 uppercase">Tabla clasificatoria</p>
              <p className="mt-2 text-sm text-white/40">
                {cfg.label} · las posiciones y resultados de esta disciplina se publicarán aquí.
              </p>
            </div>
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

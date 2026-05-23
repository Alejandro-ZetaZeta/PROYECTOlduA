"use client";

import Link from "next/link";
import { motion } from "framer-motion";

function Gear({
  size,
  duration,
  reverse = false,
  className = "",
}: {
  size: number;
  duration: number;
  reverse?: boolean;
  className?: string;
}) {
  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      animate={{ rotate: reverse ? -360 : 360 }}
      transition={{ duration, repeat: Infinity, ease: "linear" }}
      className={className}
    >
      <path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z" />
      <path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </motion.svg>
  );
}

export default function RegistroTorneoPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#0a0a0a] px-6 text-center">
      {/* Background gears — decorative */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.06]">
        <Gear size={420} duration={28} className="text-gold absolute -left-28 -top-20" />
        <Gear size={280} duration={18} reverse className="text-gold absolute -right-16 top-10" />
        <Gear size={200} duration={12} className="text-gold absolute -bottom-10 left-1/3" />
        <Gear size={160} duration={22} reverse className="text-gold absolute bottom-20 right-10" />
      </div>

      {/* Foreground gears */}
      <div className="relative mb-10 flex items-center gap-4">
        <Gear size={64} duration={8} reverse className="text-gold/40" />
        <Gear size={96} duration={12} className="text-gold/60" />
        <Gear size={64} duration={8} reverse className="text-gold/40" />
      </div>

      {/* Message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative flex flex-col items-center gap-5"
      >
        <p className="text-[0.65rem] tracking-[0.32em] text-gold">TORNEO RELÁMPAGO DE FÚTBOL</p>
        <h1 className="font-[var(--font-display)] text-3xl tracking-tight text-white sm:text-4xl">
          Inscripciones próximamente
        </h1>
        <p className="max-w-sm text-sm leading-[1.8] text-white/45">
          Estamos preparando el formulario de registro. Vuelve pronto — lo tendremos listo antes del evento.
        </p>

        <Link
          href="/activate-uleam"
          className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/5 px-5 py-2.5 text-xs tracking-[0.18em] text-white/60 transition-colors hover:border-white/25 hover:text-white/90"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          VOLVER AL EVENTO
        </Link>
      </motion.div>
    </div>
  );
}

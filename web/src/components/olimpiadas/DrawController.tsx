"use client";

import * as React from "react";
import { LayoutGroup, motion } from "framer-motion";
import { insforge } from "@/lib/insforge/browser";
import {
  buildTeamPool,
  computeGroupDistribution,
  generateFixture,
  targetGroupsFor,
  type Categoria,
  type FixtureMatch,
  type GrupoInfo,
  type PartidoResumen,
} from "./standings";

const CATEGORIAS: Categoria[] = ["Masculino", "Femenino"];
const DISCIPLINA = "futbol";
const DURACION_SEG = 900;
const ITERACIONES = 3;
const PAUSA_MS = 900;

type Phase = "loading" | "idle" | "shuffling" | "locked" | "persisting" | "fixture" | "error";

function sleep(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export function GroupCard({
  grupo,
  equipos,
  locked,
}: {
  grupo: string;
  equipos: string[];
  locked: boolean;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="rounded-2xl border border-white/10 bg-white/3 p-4"
    >
      <div className="flex items-center justify-between">
        <p className="font-display text-sm text-white">Grupo {grupo}</p>
        <span
          className={`text-[0.55rem] tracking-[0.2em] uppercase ${
            locked ? "text-gold" : "text-white/30"
          }`}
        >
          {locked ? "Oficial" : "Sorteando"}
        </span>
      </div>
      <ul className="mt-3 flex flex-col gap-1.5">
        {equipos.map((equipo, i) => (
          <motion.li
            layout
            layoutId={equipo}
            key={equipo}
            transition={{ type: "spring", stiffness: 55, damping: 14 }}
            className="flex items-center gap-2 rounded-xl border border-white/8 bg-white/2 px-3 py-2"
          >
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-gold/30 bg-gold/10 text-[0.55rem] text-gold">
              {grupo}
              {i + 1}
            </span>
            <span className="truncate text-xs text-white">{equipo}</span>
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
}

export function FixtureView({ fixture }: { fixture: FixtureMatch[] }) {
  const fechas = React.useMemo(
    () => [...new Set(fixture.map((f) => f.fecha))].sort((a, b) => a - b),
    [fixture],
  );
  const [fecha, setFecha] = React.useState(fechas[0] ?? 1);
  const activa = fechas.includes(fecha) ? fecha : (fechas[0] ?? 1);

  const grupos = React.useMemo(() => {
    const map = new Map<string, FixtureMatch[]>();
    for (const f of fixture) {
      if (f.fecha !== activa) continue;
      const list = map.get(f.grupo) ?? [];
      list.push(f);
      map.set(f.grupo, list);
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [fixture, activa]);

  if (fixture.length === 0) return null;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/3 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[0.62rem] tracking-[0.28em] text-gold uppercase">Fixture · Fase de grupos</p>
        <div className="flex flex-wrap gap-1.5">
          {fechas.map((f) => (
            <button
              key={f}
              onClick={() => setFecha(f)}
              className={`rounded-full border px-3 py-1 text-[0.6rem] tracking-[0.15em] uppercase transition-all ${
                activa === f
                  ? "border-gold/50 bg-gold/15 text-gold"
                  : "border-white/10 bg-white/3 text-white/40 hover:text-white/70"
              }`}
            >
              Fecha {f}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {grupos.map(([grupo, matches]) => (
          <div key={grupo} className="overflow-hidden rounded-2xl border border-white/8">
            <p className="border-b border-white/8 bg-white/2 px-4 py-2 text-xs text-white/60">Grupo {grupo}</p>
            <ul className="divide-y divide-white/5">
              {matches.map((m, i) => (
                <li key={`${m.local}-${m.visitante}-${i}`} className="flex items-center gap-2 px-4 py-2.5 text-xs">
                  <span className="flex-1 truncate text-right text-white">{m.local}</span>
                  <span className="shrink-0 rounded-md border border-white/10 bg-white/3 px-2 py-0.5 text-[0.5rem] tracking-[0.12em] text-white/30 uppercase">
                    vs
                  </span>
                  <span className="flex-1 truncate text-white">{m.visitante}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DrawController() {
  const [categoria, setCategoria] = React.useState<Categoria>("Masculino");
  const [phase, setPhase] = React.useState<Phase>("loading");
  const [teams, setTeams] = React.useState<string[]>([]);
  const [display, setDisplay] = React.useState<Map<string, string[]>>(new Map());
  const [groups, setGroups] = React.useState<Map<string, string[]>>(new Map());
  const [fixture, setFixture] = React.useState<FixtureMatch[]>([]);
  const [errorMsg, setErrorMsg] = React.useState("");
  const [armRedraw, setArmRedraw] = React.useState(false);
  const [armUndo, setArmUndo] = React.useState(false);
  const [hasFinalized, setHasFinalized] = React.useState(false);
  const cancelled = React.useRef(false);
  const loadSeq = React.useRef(0);

  React.useEffect(
    () => () => {
      cancelled.current = true;
    },
    [],
  );

  const cargar = React.useCallback(async () => {
    const seq = ++loadSeq.current;
    setPhase("loading");
    setErrorMsg("");
    setArmRedraw(false);
    setArmUndo(false);
    const [insc, gr, part] = await Promise.all([
      insforge.database
        .from("inscripciones_futbol")
        .select("nombre_equipo, representante")
        .eq("categoria", categoria),
      insforge.database
        .from("olimpiadas_grupos")
        .select("*")
        .eq("disciplina", DISCIPLINA)
        .eq("categoria", categoria),
      insforge.database
        .from("partidos_olimpiadas")
        .select("*")
        .eq("disciplina", DISCIPLINA)
        .eq("categoria", categoria),
    ]);
    if (seq !== loadSeq.current) return;
    const inscripciones = Array.isArray(insc.data)
      ? (insc.data as { nombre_equipo: string | null; representante: string | null }[])
      : [];
    setTeams(buildTeamPool(inscripciones));
    const gRows = Array.isArray(gr.data) ? (gr.data as unknown as GrupoInfo[]) : [];
    const pRows = Array.isArray(part.data) ? (part.data as unknown as PartidoResumen[]) : [];
    setHasFinalized(pRows.some((p) => p.grupo && p.estado === "finalizado"));
    if (gRows.length > 0) {
      const map = new Map<string, string[]>();
      for (const row of [...gRows].sort((a, b) => a.posicion - b.posicion)) {
        const list = map.get(row.grupo) ?? [];
        list.push(row.equipo);
        map.set(row.grupo, list);
      }
      setGroups(map);
      setDisplay(map);
      const fx = pRows
        .filter((p) => p.grupo && p.fecha != null)
        .map((p) => ({
          grupo: p.grupo as string,
          fecha: p.fecha as number,
          local: p.equipo_local,
          visitante: p.equipo_visitante,
        }));
      if (fx.length > 0) {
        setFixture(fx);
        setPhase("fixture");
      } else {
        setFixture([]);
        setPhase("locked");
      }
    } else {
      setGroups(new Map());
      setDisplay(new Map());
      setFixture([]);
      setPhase("idle");
    }
  }, [categoria]);

  React.useEffect(() => {
    void cargar();
  }, [cargar]);

  async function persistirSorteo(map: Map<string, string[]>) {
    const { error: delGruposErr } = await insforge.database
      .from("olimpiadas_grupos")
      .delete()
      .eq("disciplina", DISCIPLINA)
      .eq("categoria", categoria);
    if (delGruposErr) return delGruposErr;
    const { error: delPartidosErr } = await insforge.database
      .from("partidos_olimpiadas")
      .delete()
      .eq("disciplina", DISCIPLINA)
      .eq("categoria", categoria);
    if (delPartidosErr) return delPartidosErr;
    const rows: Record<string, unknown>[] = [];
    for (const [grupo, equipos] of map) {
      equipos.forEach((equipo, i) =>
        rows.push({ disciplina: DISCIPLINA, categoria, grupo, equipo, posicion: i + 1 }),
      );
    }
    if (rows.length === 0) return null;
    const { error } = await insforge.database.from("olimpiadas_grupos").insert(rows);
    return error;
  }

  async function iniciarSorteo() {
    if (phase === "shuffling" || phase === "persisting" || phase === "loading") return;
    if (teams.length < 2) {
      setErrorMsg("Se necesitan al menos 2 equipos registrados para realizar el sorteo.");
      return;
    }
    if ((groups.size > 0 || fixture.length > 0) && !armRedraw) {
      setArmRedraw(true);
      return;
    }
    setArmRedraw(false);
    setArmUndo(false);
    setErrorMsg("");
    cancelled.current = false;
    setPhase("shuffling");
    const target = targetGroupsFor(categoria);
    const passes: Map<string, string[]>[] = [];
    for (let i = 0; i < ITERACIONES; i++) {
      passes.push(computeGroupDistribution(teams, target));
    }
    for (let i = 0; i < passes.length; i++) {
      if (cancelled.current) return;
      setDisplay(passes[i]);
      await sleep(PAUSA_MS);
      if (cancelled.current) return;
    }
    const finalMap = passes[passes.length - 1];
    setDisplay(finalMap);
    setGroups(finalMap);
    setPhase("persisting");
    const err = await persistirSorteo(finalMap);
    if (err) {
      setErrorMsg("No se pudo guardar el sorteo en el servidor. Intenta de nuevo.");
      setPhase("error");
      return;
    }
    setFixture([]);
    setHasFinalized(false);
    setPhase("locked");
    window.dispatchEvent(new CustomEvent("olimpiadas:resultados"));
  }

  async function generarFixture() {
    if (phase === "persisting" || phase === "shuffling") return;
    if (groups.size === 0) {
      setErrorMsg("Primero realiza el sorteo de grupos.");
      return;
    }
    setArmUndo(false);
    setErrorMsg("");
    setPhase("persisting");
    const all = generateFixture(groups);
    const { error: delErr } = await insforge.database
      .from("partidos_olimpiadas")
      .delete()
      .eq("disciplina", DISCIPLINA)
      .eq("categoria", categoria);
    if (delErr) {
      setErrorMsg("No se pudo limpiar el calendario anterior. Intenta de nuevo.");
      setPhase("error");
      return;
    }
    const rows = all.map((m) => ({
      disciplina: DISCIPLINA,
      categoria,
      grupo: m.grupo,
      fecha: m.fecha,
      equipo_local: m.local,
      equipo_visitante: m.visitante,
      goles_local: 0,
      goles_visitante: 0,
      duracion_tiempo: DURACION_SEG,
      segundos_restantes: DURACION_SEG,
      num_tiempos: 2,
      tiempo_actual: 1,
      estado: "pendiente",
    }));
    const { error } = rows.length
      ? await insforge.database.from("partidos_olimpiadas").insert(rows)
      : { error: null };
    if (error) {
      setErrorMsg("No se pudo generar el fixture. Intenta de nuevo.");
      setPhase("error");
      return;
    }
    setFixture(all);
    setPhase("fixture");
    window.dispatchEvent(new CustomEvent("olimpiadas:resultados"));
  }

  async function deshacerSorteo() {
    if (phase === "persisting" || phase === "shuffling") return;
    if (!armUndo) {
      setArmUndo(true);
      return;
    }
    setArmUndo(false);
    setErrorMsg("");
    setPhase("persisting");
    const { error: e1 } = await insforge.database
      .from("olimpiadas_grupos")
      .delete()
      .eq("disciplina", DISCIPLINA)
      .eq("categoria", categoria);
    const { error: e2 } = await insforge.database
      .from("partidos_olimpiadas")
      .delete()
      .eq("disciplina", DISCIPLINA)
      .eq("categoria", categoria);
    if (e1 || e2) {
      setErrorMsg("No se pudo deshacer el sorteo. Intenta de nuevo.");
      setPhase("error");
      return;
    }
    setGroups(new Map());
    setDisplay(new Map());
    setFixture([]);
    setHasFinalized(false);
    setPhase("idle");
    window.dispatchEvent(new CustomEvent("olimpiadas:resultados"));
  }

  const gruposOrdenados = React.useMemo(
    () => [...display.entries()].sort((a, b) => a[0].localeCompare(b[0])),
    [display],
  );
  const sorteando = phase === "shuffling";
  const bloqueado = phase === "locked" || phase === "persisting" || phase === "fixture";

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[0.7rem] text-white/40">
            Sorteo real de la fase de grupos. Masculino: 4 grupos · Femenino: 2 grupos (se reparten
            de forma equitativa según los equipos registrados).
          </p>
          {hasFinalized && (
            <p className="mt-1 text-[0.65rem] text-gold/70">
              Hay partidos finalizados: un nuevo sorteo borrará el calendario y los resultados.
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {CATEGORIAS.map((c) => (
            <button
              key={c}
              onClick={() => setCategoria(c)}
              disabled={sorteando}
              className={`rounded-full border px-3.5 py-1.5 text-[0.62rem] tracking-[0.16em] uppercase transition-all disabled:opacity-50 ${
                categoria === c
                  ? "border-gold/50 bg-gold/15 text-gold"
                  : "border-white/10 bg-white/3 text-white/40 hover:border-white/25 hover:text-white/70"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {armRedraw ? (
          <>
            <span className="text-[0.65rem] text-red-300">
              Esto reemplazará el sorteo y los resultados de {categoria}. ¿Confirmas?
            </span>
            <button
              onClick={iniciarSorteo}
              className="rounded-xl border border-red-500/50 bg-red-500/15 px-4 py-2 text-[0.65rem] tracking-[0.18em] text-red-300 uppercase transition-colors hover:bg-red-500/25"
            >
              Sí, sortear de nuevo
            </button>
            <button
              onClick={() => setArmRedraw(false)}
              className="rounded-xl border border-white/10 bg-white/3 px-4 py-2 text-[0.65rem] tracking-[0.18em] text-white/60 uppercase transition-colors hover:text-white"
            >
              Cancelar
            </button>
          </>
        ) : (
          <button
            onClick={iniciarSorteo}
            disabled={sorteando || phase === "loading" || teams.length < 2}
            className="rounded-xl border border-gold/50 bg-gold/15 px-5 py-2.5 text-[0.65rem] tracking-[0.18em] text-gold uppercase transition-all hover:bg-gold/25 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {sorteando ? "Sorteando…" : gruposOrdenados.length > 0 ? "Volver a sortear" : "Iniciar Sorteo"}
          </button>
        )}
        {bloqueado && fixture.length === 0 && (
          <button
            onClick={generarFixture}
            disabled={phase === "persisting"}
            className="rounded-xl border border-gold/40 bg-white/5 px-5 py-2.5 text-[0.65rem] tracking-[0.18em] text-gold uppercase transition-all hover:bg-gold/15 disabled:opacity-50"
          >
            {phase === "persisting" ? "Generando…" : "Generar Fixture y Calendario"}
          </button>
        )}
        {gruposOrdenados.length > 0 &&
          !sorteando &&
          !armRedraw &&
          (armUndo ? (
            <>
              {hasFinalized && (
                <span className="text-[0.65rem] text-red-300/80">
                  Se borrarán también los resultados finalizados.
                </span>
              )}
              <button
                onClick={deshacerSorteo}
                className="rounded-xl border border-red-500/50 bg-red-500/15 px-4 py-2 text-[0.65rem] tracking-[0.18em] text-red-300 uppercase transition-colors hover:bg-red-500/25"
              >
                Sí, borrar sorteo
              </button>
              <button
                onClick={() => setArmUndo(false)}
                className="rounded-xl border border-white/10 bg-white/3 px-4 py-2 text-[0.65rem] tracking-[0.18em] text-white/60 uppercase transition-colors hover:text-white"
              >
                Cancelar
              </button>
            </>
          ) : (
            <button
              onClick={deshacerSorteo}
              title="Borra los grupos y el calendario de esta categoría"
              className="rounded-xl border border-white/15 bg-white/3 px-4 py-2 text-[0.65rem] tracking-[0.18em] text-white/50 uppercase transition-colors hover:border-red-500/40 hover:text-red-300"
            >
              Deshacer sorteo
            </button>
          ))}
        <span className="text-[0.65rem] text-white/30">
          {teams.length} equipos registrados · {categoria}
        </span>
      </div>

      {errorMsg && (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs text-red-300">
          {errorMsg}
        </p>
      )}

      {phase === "loading" ? (
        <div className="flex h-40 items-center justify-center text-xs text-white/30">Cargando sorteo…</div>
      ) : phase === "idle" && gruposOrdenados.length === 0 ? (
        <div className="flex h-40 flex-col items-center justify-center gap-1 rounded-2xl border border-dashed border-white/15 bg-white/2 text-xs text-white/35">
          <span>Aún no se ha realizado el sorteo de {categoria}.</span>
          <span className="text-white/25">Presiona “Iniciar Sorteo” para repartir los equipos.</span>
        </div>
      ) : (
        <>
          <LayoutGroup>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {gruposOrdenados.map(([grupo, equipos]) => (
                <GroupCard key={grupo} grupo={grupo} equipos={equipos} locked={bloqueado} />
              ))}
            </div>
          </LayoutGroup>
          {fixture.length > 0 && <FixtureView fixture={fixture} />}
        </>
      )}
    </div>
  );
}

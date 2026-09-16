"use client";

import * as React from "react";
import { insforge } from "@/lib/insforge/browser";
import {
  computeStandings,
  groupBlocks,
  partidosDeGrupo,
  type Categoria,
  type GrupoInfo,
  type PartidoResumen,
  type StandingRow,
} from "./standings";

const CATEGORIAS: Categoria[] = ["Masculino", "Femenino"];
const COLUMNS = ["Pos", "Equipo", "Pts", "PJ", "PG", "PE", "PP", "GF", "GC", "DG"];

interface Seccion {
  grupo: string;
  rows: StandingRow[];
}

export default function StandingsTable({
  disciplina = "futbol",
  categorias = CATEGORIAS,
}: {
  disciplina?: string;
  categorias?: Categoria[];
}) {
  const [categoria, setCategoria] = React.useState<Categoria>(categorias[0] ?? "Masculino");
  const [grupos, setGrupos] = React.useState<GrupoInfo[]>([]);
  const [partidos, setPartidos] = React.useState<PartidoResumen[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [updatedAt, setUpdatedAt] = React.useState<Date | null>(null);

  const cargar = React.useCallback(async () => {
    const [g, p] = await Promise.all([
      insforge.database
        .from("olimpiadas_grupos")
        .select("*")
        .eq("disciplina", disciplina)
        .eq("categoria", categoria),
      insforge.database
        .from("partidos_olimpiadas")
        .select("*")
        .eq("disciplina", disciplina)
        .eq("categoria", categoria),
    ]);
    if (Array.isArray(g.data)) setGrupos(g.data as unknown as GrupoInfo[]);
    if (Array.isArray(p.data)) setPartidos(p.data as unknown as PartidoResumen[]);
    setUpdatedAt(new Date());
    setLoading(false);
  }, [disciplina, categoria]);

  React.useEffect(() => {
    setLoading(true);
    void cargar();
  }, [cargar]);

  React.useEffect(() => {
    const onResultados = () => void cargar();
    const onVisible = () => {
      if (document.visibilityState === "visible") void cargar();
    };
    window.addEventListener("olimpiadas:resultados", onResultados);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("olimpiadas:resultados", onResultados);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [cargar]);

  const secciones = React.useMemo<Seccion[]>(() => {
    return groupBlocks(grupos).map((b) => ({
      grupo: b.grupo,
      rows: computeStandings(
        grupos.filter((g) => g.grupo === b.grupo),
        partidosDeGrupo(partidos, b.grupo),
      ),
    }));
  }, [grupos, partidos]);

  const hayDatos = secciones.length > 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl border border-white/10 bg-white/3 p-5 backdrop-blur-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[0.62rem] tracking-[0.28em] text-gold uppercase">Fase de grupos</p>
            <p className="mt-1 text-xs text-white/40">Fútbol · grupo y tabla clasificatoria</p>
          </div>
          <div className="flex items-center gap-2">
            {categorias.map((c) => (
              <button
                key={c}
                onClick={() => setCategoria(c)}
                className={`rounded-full border px-3.5 py-1.5 text-[0.62rem] tracking-[0.16em] uppercase transition-all ${
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

        {loading ? (
          <div className="flex h-32 items-center justify-center text-xs text-white/30">Cargando grupos…</div>
        ) : !hayDatos ? (
          <div className="mt-5 flex h-32 flex-col items-center justify-center gap-1 rounded-2xl border border-dashed border-white/15 text-center text-xs text-white/35">
            <span>El sorteo de grupos de la categoría {categoria} aún no se ha realizado.</span>
            <span className="text-white/25">Vuelve pronto para ver los grupos y la tabla en vivo.</span>
          </div>
        ) : (
          <>
            <div className="mt-5 flex items-center justify-between gap-3">
              <p className="text-[0.6rem] tracking-[0.22em] text-white/35 uppercase">
                Tabla clasificatoria · {categoria}
              </p>
              <p className="text-[0.58rem] text-white/30">Los 2 primeros de cada grupo avanzan a cuartos</p>
            </div>
            <div className="mt-3 overflow-x-auto rounded-2xl border border-white/8">
              <table className="w-full min-w-[560px] border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/8">
                    {COLUMNS.map((h) => (
                      <th
                        key={h}
                        className={`px-2.5 py-2.5 text-[0.55rem] tracking-[0.14em] font-medium text-white/35 uppercase ${
                          h === "Equipo" ? "text-left" : "text-center"
                        }`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {secciones.map((s) => (
                    <React.Fragment key={s.grupo}>
                      <tr className="border-b border-white/8 bg-white/4">
                        <td
                          colSpan={COLUMNS.length}
                          className="px-2.5 py-1.5 text-[0.55rem] tracking-[0.22em] text-gold/80 uppercase"
                        >
                          Grupo {s.grupo}
                        </td>
                      </tr>
                      {s.rows.map((r) => (
                        <tr
                          key={`${s.grupo}-${r.equipo}`}
                          className={`border-b border-white/4 last:border-0 ${
                            r.clasificado ? "bg-gold/5" : "hover:bg-white/2"
                          }`}
                        >
                          <td className="px-2.5 py-2 text-center">
                            <span
                              className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[0.6rem] ${
                                r.clasificado
                                  ? "border border-gold/40 bg-gold/15 text-gold"
                                  : "text-white/40"
                              }`}
                            >
                              {r.pos}
                            </span>
                          </td>
                          <td className="px-2.5 py-2 text-left text-white">
                            <span className="truncate">{r.equipo}</span>
                          </td>
                          <td className="px-2.5 py-2 text-center font-semibold text-white tabular-nums">{r.pts}</td>
                          <td className="px-2.5 py-2 text-center text-white/60 tabular-nums">{r.pj}</td>
                          <td className="px-2.5 py-2 text-center text-white/60 tabular-nums">{r.pg}</td>
                          <td className="px-2.5 py-2 text-center text-white/60 tabular-nums">{r.pe}</td>
                          <td className="px-2.5 py-2 text-center text-white/60 tabular-nums">{r.pp}</td>
                          <td className="px-2.5 py-2 text-center text-white/60 tabular-nums">{r.gf}</td>
                          <td className="px-2.5 py-2 text-center text-white/60 tabular-nums">{r.gc}</td>
                          <td className="px-2.5 py-2 text-center text-white tabular-nums">
                            {r.dg > 0 ? `+${r.dg}` : r.dg}
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {updatedAt && hayDatos && (
          <p className="mt-4 text-right text-[0.58rem] text-white/25">
            Actualizado {updatedAt.toLocaleTimeString("es-EC", { hour: "2-digit", minute: "2-digit" })}
          </p>
        )}
      </div>
    </div>
  );
}

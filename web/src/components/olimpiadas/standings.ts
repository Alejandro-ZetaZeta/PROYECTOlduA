export type Categoria = "Masculino" | "Femenino";

export type EstadoPartido = "pendiente" | "en_curso" | "finalizado";

export interface GrupoInfo {
  disciplina: string;
  categoria: Categoria;
  grupo: string;
  equipo: string;
  posicion: number;
}

export interface PartidoResumen {
  id: string;
  equipo_local: string;
  equipo_visitante: string;
  goles_local: number | null;
  goles_visitante: number | null;
  estado: EstadoPartido;
  disciplina: string;
  categoria: Categoria | null;
  grupo: string | null;
  fecha: number | null;
}

export interface StandingRow {
  equipo: string;
  pos: number;
  pts: number;
  pj: number;
  pg: number;
  pe: number;
  pp: number;
  gf: number;
  gc: number;
  dg: number;
  clasificado: boolean;
}

export interface FixtureMatch {
  grupo: string;
  fecha: number;
  local: string;
  visitante: string;
}

export interface GrupoBloque {
  grupo: string;
  equipos: { equipo: string; posicion: number }[];
}

export interface InscripcionEquipo {
  nombre_equipo: string | null;
  representante: string | null;
}

export function buildTeamPool(inscripciones: InscripcionEquipo[]): string[] {
  const used = new Map<string, number>();
  const out: string[] = [];
  for (const row of inscripciones) {
    const base = (row.nombre_equipo ?? "").trim() || "Equipo";
    const key = base.toLowerCase();
    const count = (used.get(key) ?? 0) + 1;
    used.set(key, count);
    out.push(count === 1 ? base : `${base} (${count})`);
  }
  return out;
}

export const GRUPO_LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H"] as const;

const BYE = "__BYE__";

export function targetGroupsFor(categoria: Categoria): number {
  return categoria === "Femenino" ? 2 : 4;
}

function randomInt(maxExclusive: number): number {
  if (maxExclusive <= 1) return 0;
  const cryptoObj = globalThis.crypto;
  if (cryptoObj && typeof cryptoObj.getRandomValues === "function") {
    const limit = Math.floor(0x100000000 / maxExclusive) * maxExclusive;
    const buffer = new Uint32Array(1);
    let value = 0;
    do {
      cryptoObj.getRandomValues(buffer);
      value = buffer[0];
    } while (value >= limit);
    return value % maxExclusive;
  }
  return Math.floor(Math.random() * maxExclusive);
}

export function shuffleFisherYates<T>(input: T[]): T[] {
  const arr = [...input];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
  return arr;
}

export function computeGroupDistribution(
  equipos: string[],
  targetGroups: number,
): Map<string, string[]> {
  const map = new Map<string, string[]>();
  const total = equipos.length;
  if (total === 0) return map;
  const num = Math.max(1, Math.min(targetGroups, total));
  const base = Math.floor(total / num);
  const rem = total % num;
  const shuffled = shuffleFisherYates(equipos);
  let idx = 0;
  for (let g = 0; g < num; g++) {
    const size = base + (g < rem ? 1 : 0);
    map.set(GRUPO_LETTERS[g], shuffled.slice(idx, idx + size));
    idx += size;
  }
  return map;
}

export function generateGroupFixture(grupo: string, teamPositions: string[]): FixtureMatch[] {
  const teams = teamPositions.filter((t) => Boolean(t));
  const n = teams.length;
  if (n < 2) return [];
  const ring = n % 2 === 0 ? [...teams] : [...teams, BYE];
  const size = ring.length;
  const fixed = ring[0];
  const rotating = ring.slice(1);
  const rotLen = rotating.length;
  const out: FixtureMatch[] = [];
  for (let r = 0; r < size - 1; r++) {
    const pairs: [string, string][] = [[fixed, rotating[r % rotLen]]];
    for (let i = 1; i < size / 2; i++) {
      pairs.push([
        rotating[(r + i) % rotLen],
        rotating[(r - i + rotLen) % rotLen],
      ]);
    }
    for (const [local, visitante] of pairs) {
      if (local === BYE || visitante === BYE) continue;
      out.push({ grupo, fecha: r + 1, local, visitante });
    }
  }
  return out;
}

export function generateFixture(groups: Map<string, string[]>): FixtureMatch[] {
  const out: FixtureMatch[] = [];
  for (const [grupo, equipos] of groups) {
    out.push(...generateGroupFixture(grupo, equipos));
  }
  return out.sort((a, b) => a.fecha - b.fecha || a.grupo.localeCompare(b.grupo));
}

export function computeStandings(
  equipos: GrupoInfo[],
  partidos: PartidoResumen[],
): StandingRow[] {
  const rows = new Map<string, StandingRow>();
  for (const e of equipos) {
    rows.set(e.equipo, {
      equipo: e.equipo,
      pos: 0,
      pts: 0,
      pj: 0,
      pg: 0,
      pe: 0,
      pp: 0,
      gf: 0,
      gc: 0,
      dg: 0,
      clasificado: false,
    });
  }
  for (const p of partidos) {
    if (p.estado !== "finalizado") continue;
    const loc = rows.get(p.equipo_local);
    const vis = rows.get(p.equipo_visitante);
    if (!loc || !vis) continue;
    const gl = p.goles_local ?? 0;
    const gv = p.goles_visitante ?? 0;
    loc.pj += 1;
    vis.pj += 1;
    loc.gf += gl;
    loc.gc += gv;
    vis.gf += gv;
    vis.gc += gl;
    if (gl > gv) {
      loc.pg += 1;
      vis.pp += 1;
      loc.pts += 3;
    } else if (gv > gl) {
      vis.pg += 1;
      loc.pp += 1;
      vis.pts += 3;
    } else {
      loc.pe += 1;
      vis.pe += 1;
      loc.pts += 1;
      vis.pts += 1;
    }
  }
  const list = [...rows.values()];
  for (const r of list) r.dg = r.gf - r.gc;
  list.sort(
    (a, b) =>
      b.pts - a.pts ||
      b.dg - a.dg ||
      b.gf - a.gf ||
      a.equipo.localeCompare(b.equipo, "es"),
  );
  list.forEach((r, i) => {
    r.pos = i + 1;
    r.clasificado = i < 2;
  });
  return list;
}

export function groupBlocks(grupos: GrupoInfo[]): GrupoBloque[] {
  const map = new Map<string, { equipo: string; posicion: number }[]>();
  for (const g of grupos) {
    const list = map.get(g.grupo) ?? [];
    list.push({ equipo: g.equipo, posicion: g.posicion });
    map.set(g.grupo, list);
  }
  return [...map.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([grupo, equipos]) => ({
      grupo,
      equipos: [...equipos].sort((a, b) => a.posicion - b.posicion),
    }));
}

export function partidosDeGrupo(partidos: PartidoResumen[], grupo: string): PartidoResumen[] {
  return partidos.filter((p) => p.grupo === grupo);
}

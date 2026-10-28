import assert from "node:assert/strict";
import test from "node:test";

const { computeStandings } = await import("../src/components/olimpiadas/standings.ts");

const equipo = (nombre) => ({
  disciplina: "futbol",
  categoria: "Masculino",
  grupo: "B",
  equipo: nombre,
  posicion: 1,
});

const partido = (local, gl, visitante, gv, penales) => ({
  id: `${local}-${visitante}`,
  equipo_local: local,
  equipo_visitante: visitante,
  goles_local: gl,
  goles_visitante: gv,
  estado: "finalizado",
  disciplina: "futbol",
  categoria: "Masculino",
  grupo: "B",
  fecha: 1,
  penales_local: penales?.[0] ?? null,
  penales_visitante: penales?.[1] ?? null,
});

test("igualdad en puntos y DG: gana la tanda de penales el desempate directo", () => {
  const equipos = ["INGENIERIAS", "RIVAL", "C", "D"].map(equipo);
  const partidos = [
    partido("INGENIERIAS", 2, "C", 0),
    partido("RIVAL", 2, "C", 0),
    partido("D", 1, "INGENIERIAS", 0),
    partido("D", 1, "RIVAL", 0),
    partido("INGENIERIAS", 1, "RIVAL", 1, [4, 2]),
  ];

  const tabla = computeStandings(equipos, partidos);
  assert.deepEqual(
    tabla.map((r) => r.equipo),
    ["D", "INGENIERIAS", "RIVAL", "C"],
  );
});

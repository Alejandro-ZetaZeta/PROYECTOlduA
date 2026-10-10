export function createDesfinalizarPatch(historial: { t: string }[]) {
  return {
    goles_local: 0,
    goles_visitante: 0,
    penales_local: null,
    penales_visitante: null,
    estado: "pendiente" as const,
    historial: historial.filter(({ t }) => t !== "gol_local" && t !== "gol_visitante"),
  };
}

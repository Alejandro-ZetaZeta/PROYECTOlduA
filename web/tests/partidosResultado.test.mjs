import assert from "node:assert/strict";
import test from "node:test";

const resultado = await import("../src/components/olimpiadas/partidosResultado.ts").catch(() => null);

test("desfinalizar limpia marcador y penales, conserva acciones de tarjetas", () => {
  assert.ok(resultado, "debe existir la lógica de desfinalizar");
  assert.deepEqual(
    resultado.createDesfinalizarPatch([
      { t: "gol_local" },
      { t: "amarilla_local" },
      { t: "gol_visitante" },
      { t: "roja_visitante" },
    ]),
    {
      goles_local: 0,
      goles_visitante: 0,
      penales_local: null,
      penales_visitante: null,
      estado: "pendiente",
      historial: [{ t: "amarilla_local" }, { t: "roja_visitante" }],
    },
  );
});

export type DisciplinaId = "futbol" | "basket" | "ecuavoley" | "ajedrez" | "pingpong";
export type TipoDisciplina = "equipo" | "individual";

export const CARRERAS = [
  "Tecnologías de la Información",
  "Administración de Empresas",
  "Agropecuaria",
  "Pedagogía de los Idiomas Nacionales y Extranjeros",
  "Pedagogía de las Ciencias Experimentales",
  "Artes Plásticas",
  "Educación Inicial",
  "Educación Inicial Bilingüe",
  "Enfermería",
  "Software",
  "Agronegocios",
  "Alimentos",
  "Psicología Educativa",
  "Eléctrica",
  "Ingeniería Civil",
  "Derecho",
  "Educación Básica",
  "Educación Básica Bilingüe",
  "Arquitectura",
  "Nutrición y Dietética",
  "Fisioterapia",
  "Entrenamiento Deportivo",
  "Gastronomía",
  "Medicina",
  "Odontología",
  "Electromecánica",
  "Educación Inicial -Tosagua",
  "Enfermería - Tosagua",
  "Educación Básica  - Tosagua",
  "Derecho - Tosagua",
] as const;

export const AREAS = [
  "Salud",
  "Derecho",
  "Artes",
  "Educación",
  "Idiomas",
  "Ciencias de la vida y tecnologías",
  "Ciencias Administrativas",
] as const;

export const NIVELES = [
  "1°",
  "2°",
  "3°",
  "4°",
  "5°",
  "6°",
  "7°",
  "8°",
  "9°",
  "10°",
] as const;

export const CATEGORIAS = ["Masculino", "Femenino"] as const;

export interface DisciplinaConfig {
  id: DisciplinaId;
  label: string;
  tipo: TipoDisciplina;
  categorias: readonly string[];
  table: string;
  descripcion: string;
  inscripcionAbierta: boolean;
  tablaActiva: boolean;
  sorteoActivo: boolean;
}

export const DISCIPLINAS: DisciplinaConfig[] = [
  {
    id: "futbol",
    label: "Fútbol",
    tipo: "equipo",
    categorias: CATEGORIAS,
    table: "inscripciones_futbol",
    descripcion:
      "Registros cerrados. Los equipos ya inscritos fueron sorteados en grupos A y B (femenino) y A, B, C y D (masculino). Consulta aquí el calendario y la tabla clasificatoria en vivo.",
    inscripcionAbierta: false,
    tablaActiva: true,
    sorteoActivo: true,
  },
  {
    id: "basket",
    label: "Basket",
    tipo: "equipo",
    categorias: CATEGORIAS,
    table: "inscripciones_basket",
    descripcion:
      "Registros cerrados. El torneo de baloncesto por equipos definirá su calendario próximamente.",
    inscripcionAbierta: false,
    tablaActiva: false,
    sorteoActivo: false,
  },
  {
    id: "ecuavoley",
    label: "Ecuavoley",
    tipo: "equipo",
    categorias: CATEGORIAS,
    table: "inscripciones_ecuavoley",
    descripcion:
      "Registros cerrados. El torneo de ecuavoley por equipos definirá su calendario próximamente.",
    inscripcionAbierta: false,
    tablaActiva: false,
    sorteoActivo: false,
  },
  {
    id: "ajedrez",
    label: "Ajedrez",
    tipo: "individual",
    categorias: [],
    table: "inscripciones_ajedrez",
    descripcion:
      "Inscripciones abiertas. Competencia individual de ajedrez, abierta a cualquier participante, sin distinción de género.",
    inscripcionAbierta: true,
    tablaActiva: false,
    sorteoActivo: false,
  },
  {
    id: "pingpong",
    label: "Ping Pong",
    tipo: "individual",
    categorias: [],
    table: "inscripciones_pingpong",
    descripcion:
      "Inscripciones abiertas. Competencia individual de ping pong, abierta a cualquier participante, sin distinción de género.",
    inscripcionAbierta: true,
    tablaActiva: false,
    sorteoActivo: false,
  },
];

export const INSCRIPCIONES_ABIERTAS = DISCIPLINAS.filter((d) => d.inscripcionAbierta).map(
  (d) => d.label,
);

export function getDisciplina(id: DisciplinaId): DisciplinaConfig {
  return DISCIPLINAS.find((d) => d.id === id) ?? DISCIPLINAS[0];
}

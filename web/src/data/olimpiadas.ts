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
}

export const DISCIPLINAS: DisciplinaConfig[] = [
  {
    id: "futbol",
    label: "Fútbol",
    tipo: "equipo",
    categorias: CATEGORIAS,
    table: "inscripciones_futbol",
    descripcion:
      "Torneo de fútbol por equipos. Inscribe a tu equipo eligiendo categoría masculina o femenina. Solo se registra al representante.",
  },
  {
    id: "basket",
    label: "Basket",
    tipo: "equipo",
    categorias: CATEGORIAS,
    table: "inscripciones_basket",
    descripcion:
      "Torneo de baloncesto por equipos. Elige la categoría e inscribe a tu equipo a través del representante.",
  },
  {
    id: "ecuavoley",
    label: "Ecuavoley",
    tipo: "equipo",
    categorias: CATEGORIAS,
    table: "inscripciones_ecuavoley",
    descripcion:
      "Torneo de ecuavoley por equipos. Elige la categoría e inscribe a tu equipo a través del representante.",
  },
  {
    id: "ajedrez",
    label: "Ajedrez",
    tipo: "individual",
    categorias: [],
    table: "inscripciones_ajedrez",
    descripcion:
      "Competencia individual de ajedrez. Abierta a cualquier participante, sin distinción de género.",
  },
  {
    id: "pingpong",
    label: "Ping Pong",
    tipo: "individual",
    categorias: [],
    table: "inscripciones_pingpong",
    descripcion:
      "Competencia individual de ping pong. Abierta a cualquier participante, sin distinción de género.",
  },
];

export function getDisciplina(id: DisciplinaId): DisciplinaConfig {
  return DISCIPLINAS.find((d) => d.id === id) ?? DISCIPLINAS[0];
}

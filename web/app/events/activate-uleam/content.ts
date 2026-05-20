export type RoadmapStop = {
  date: string;
  title: string;
  location?: string;
  time?: string;
  highlight?: string;
  details?: string;
};

export const activateUleam = {
  hero: {
    title: "Activate Uleam",
    subtitle1: "DEPORTE E INTEGRACIÓN ESTUDIANTIL",
    subtitle2: "MÁS QUE DEPORTE, SOMOS COMUNIDAD",
    presentedBy:
      "LDU-A ULEAM (Liga Deportiva Universitaria Amateur - Universidad Laica Eloy Alfaro de Manabí, Extensión Chone).",
  },
  roadmap: {
    kicker: "Cronograma",
    title: "Ruta de actividades",
    stops: [
      {
        date: "22 de mayo",
        title: "Seminario de defensa personal",
        time: "5:00 – 6:00 p. m.",
        location: "En la Explanada del Bloque C",
        details: "Es totalmente gratis, te esperamos!",
      },
      {
        date: "6 de junio",
        title: "Torneo relámpago de fútbol",
        time: "9:00 a. m.",
        location: "Cancha sintética “El Camping”",
      },
      {
        date: "20 de junio",
        title: "Gran carrera LDU 5K",
        time: "8:00 a. m.",
        details: "Con apoyo de CAI (atención médica para participantes)",
      },
      {
        date: "3 de julio",
        title: "Torneo de ajedrez",
        details: "Nuevos espacios recreativos",
      },
      {
        date: "10 de julio",
        title: "Instalación de mesas de ajedrez y ping pong",
      },
    ] satisfies RoadmapStop[],
  },
  cta: {
    title: "¡Participa, únete y gana premios!",
    pillars: ["Deporte", "Integración", "Salud", "Diversión"],
  },
  footer: {
    organizedBy:
      "Organiza: Liga Deportiva Universitaria Amateur ULEAM, Extensión Chone.",
    contacts: [
      {
        number: "0995662585",
        message:
          "Hola Josué, me gustaria saber mas de los eventos que organiza la LDU-A Chone",
      },
      {
        number: "0967483401",
        message:
          "Hola Nathali, me gustaria saber mas de los eventos que organiza la LDU-A Chone",
      },
    ],
    social: "Síguenos en nuestras redes sociales (Facebook, Instagram, TikTok).",
  },
} as const;

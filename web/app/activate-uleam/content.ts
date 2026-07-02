export type RoadmapStop = {
  date: string;
  title: string;
  location?: string;
  time?: string;
  highlight?: string;
  details?: string;
  videoUrl?: string;
  videoThumbnail?: string;
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
        videoUrl: "https://www.instagram.com/reel/DZIMSpkOCB-/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==",
        videoThumbnail: "/THUMbSeminar.png",
      },
      {
        date: "13 de junio",
        title: "Torneo relámpago de fútbol",
        time: "9:00 a. m.",
        location: "Cancha sintética “El Camping”",
      },
      {
        date: "4 de julio",
        title: "Gran carrera LDU 5K",
        time: "7:00 a. m.",
        details: "En colaboración con el GAD Municipal Chone <br> Contaremos con increíbles premios. <br> Con apoyo de CAI (atención médica para participantes)",
      },
      {
        date: "10 de julio",
        title: "Torneo de ajedrez",
        time: "10:00 a. m.",
        details: "Nuevos espacios recreativos",
      },
      {
        date: "10 de julio",
        title: "Instalación de mesas de ajedrez y ping pong",
        time: "5:00 p. m.",
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

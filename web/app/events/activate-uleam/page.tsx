import type { Metadata } from "next";

import { activateUleam } from "./content";
import { Hero } from "./sections/Hero";
import { Roadmap } from "./sections/Roadmap";
import { CTA } from "./sections/CTA";
import { EventFooter } from "./sections/Footer";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Activa ULEAM | LDU-A ULEAM",
  description:
    "Deporte e integracion estudiantil: cronograma de actividades de LDU-A ULEAM (Extension Chone).",
};

export default function ActivateUleamPage() {
  return (
    <div className="relative flex flex-1 flex-col overflow-x-hidden">
      <Hero hero={activateUleam.hero} />
      <Roadmap roadmap={activateUleam.roadmap} />
      <CTA cta={activateUleam.cta} />
      <EventFooter footer={activateUleam.footer} />
    </div>
  );
}

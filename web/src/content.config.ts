import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const events = defineCollection({
  loader: glob({ pattern: "**/*.json", base: "./src/content/events" }),
  schema: z.object({
    hero: z.object({
      title: z.string(),
      subtitle1: z.string(),
      subtitle2: z.string(),
      presentedBy: z.string(),
    }),
    roadmap: z.object({
      kicker: z.string(),
      title: z.string(),
      stops: z.array(
        z.object({
          date: z.string(),
          title: z.string(),
          period: z.string().optional(),
          historical: z.boolean().optional(),
          location: z.string().optional(),
          time: z.string().optional(),
          highlight: z.string().optional(),
          tags: z.array(z.string()).optional(),
          route: z.string().optional(),
          details: z.string().optional(),
          videoUrl: z.string().optional(),
          videoThumbnail: z.string().optional(),
        }),
      ),
    }),
    cta: z.object({
      title: z.string(),
      pillars: z.array(z.string()),
    }),
    footer: z.object({
      organizedBy: z.string(),
      contacts: z.array(
        z.object({
          number: z.string(),
          message: z.string(),
        }),
      ),
      social: z.string(),
    }),
  }),
});

export const collections = { events };

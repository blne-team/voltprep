import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { docsLoader, i18nLoader } from '@astrojs/starlight/loaders';
import { docsSchema, i18nSchema } from '@astrojs/starlight/schema';
import { postKinds, seriesKeys, tagKeys, topicKeys } from './config/taxonomy';

export const collections = {
  docs: defineCollection({
    loader: docsLoader(),
    schema: docsSchema({
      extend: z.object({
        // `article`: reading column with a table of contents. `tool`: wide workbench canvas.
        // `landing`: full-bleed page whose component renders its own h1 (homepage, topic hubs).
        pageType: z.enum(['article', 'tool', 'landing']).default('article'),
        // Posts set a topic (category). Pages without one, such as the standards page, are site pages.
        // Topic and tag ids come from src/config/taxonomy.json.
        topic: z.string().refine((id) => topicKeys.includes(id), {
          error: (issue) => `Unknown topic "${issue.input}". Use one of: ${topicKeys.join(', ')} (or add it to src/config/taxonomy.json).`,
        }).optional(),
        tags: z.array(z.string().refine((id) => tagKeys.includes(id), {
          error: (issue) => `Unknown tag "${issue.input}". Use one of: ${tagKeys.join(', ')} (or add it to src/config/taxonomy.json).`,
        })).default([]),
        kind: z.enum(postKinds).default('guide'),
        // Optional reading path from taxonomy.json `series`; `seriesOrder` sets the post's place in it
        // (lowest first, posts without one follow by title; a seriesOrder without a series fails in src/lib/series.ts).
        series: z.string().refine((id) => seriesKeys.includes(id), {
          error: (issue) => `Unknown series "${issue.input}". Use one of: ${seriesKeys.join(', ')} (or add it to src/config/taxonomy.json).`,
        }).optional(),
        seriesOrder: z.number().int().nonnegative().optional(),
        // Leave unset until the real publication date is known; it is shown only when present.
        published: z.coerce.date().optional(),
      }),
    }),
  }),
  i18n: defineCollection({ loader: i18nLoader(), schema: i18nSchema() }),
};

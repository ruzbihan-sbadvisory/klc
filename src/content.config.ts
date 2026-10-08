import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const artikel = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/artikel' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    category: z.string().default('Article'),
    author: z.string().optional(),
    cover: z.string().optional(),
    coverAlt: z.string().optional(),
    tags: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false)
  })
});

export const collections = { artikel };

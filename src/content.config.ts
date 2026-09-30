import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const blogCollection = defineCollection({
  loader: glob({ pattern: "**/[^_]*.md", base: "./src/content/blog" }),
  schema: ({ image }) => z.object({
    title: z.string(),
    pubDate: z.date(),
    description: z.string(),
    author: z.string(),
    cover: image(),
    alt: z.string(),
    tags: z.array(z.string()).optional(),
  }),
});

const techCollection = defineCollection({
  loader: glob({ pattern: "**/[^_]*.md", base: "./src/content/tech" }),
  schema: ({ image }) => z.object({
    name: z.string(),
    image: image(),
  }),
});

export const collections = {
  blog: blogCollection,
  tech: techCollection,
};

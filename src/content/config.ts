import { defineCollection, z } from "astro:content";

const blogCollection = defineCollection({
  schema:({image}) => z.object({
    layout: z.string(),
    title: z.string(),
    pubDate: z.date(),
    description: z.string(),
    author: z.string(),
    cover: image(),
    alt: z.string(),
    tags: z.array(z.string()).optional(),
  }),
});

export const collections = {
  blog: blogCollection,
};
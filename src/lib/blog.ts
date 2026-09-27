import { getCollection, type CollectionEntry } from "astro:content";

export type Post = CollectionEntry<"blog">;

export const PILLARS = {
  dev: "Dev",
  ai: "AI in practice",
  agencies: "AI for agencies",
  reviews: "Reviews",
  freelance: "Freelance",
} as const;

// Until posts carry a `pillar` field (see docs/redesign-plan.md §3.2), derive it from the slug.
const PILLAR_BY_ID: Record<string, keyof typeof PILLARS> = {
  "creating-a-custom-n8n-node-for-wordpress-managing-custom-post-types": "ai",
  "hidden-potential-by-adam-grant-review": "reviews",
  "freelance-and-full-remote-a-guide-to-surviving-part-1": "freelance",
  "freelance-and-full-remote-a-guide-to-surviving-part-2": "freelance",
};

export const pillarOf = (post: Post) => PILLARS[PILLAR_BY_ID[post.id] ?? "dev"];

export async function getPosts() {
  const posts = await getCollection("blog");
  return posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

export const postUrl = (post: Post) => `/blog/${post.id}/`;

export const wordCount = (post: Post) => (post.body ?? "").trim().split(/\s+/).length;
export const readingMinutes = (post: Post) => Math.max(1, Math.ceil(wordCount(post) / 220));

export const formatDate = (d: Date) =>
  d.toLocaleDateString("en-GB", { year: "numeric", month: "short", day: "2-digit" });

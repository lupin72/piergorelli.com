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

export type PillarKey = keyof typeof PILLARS;

export const pillarKeyOf = (post: Post): PillarKey => PILLAR_BY_ID[post.id] ?? "dev";
export const pillarOf = (post: Post) => PILLARS[pillarKeyOf(post)];

/** Copy for the blog index and the /blog/topic/[slug]/ pages. `tag`: outside the four pillars (plan §3.5). */
export const PILLAR_INFO: Record<PillarKey, {
  slug: string;
  tagline: string;
  body: string;
  seoTitle: string;
  seoDescription: string;
  tag?: boolean;
}> = {
  dev: {
    slug: "dev",
    tagline: "Front-end craft, CMS and performance: notes from the build.",
    body: "Astro, GSAP, WordPress and Drupal, performance budgets and accessibility: what actually works when an agency design has to ship. Plus the occasional homelab experiment.",
    seoTitle: "Web Development Articles: Astro, GSAP, CMS | Pier Gorelli",
    seoDescription: "Hands-on web development notes from agency projects: Astro, GSAP animations, WordPress and Drupal, performance, accessibility and homelab experiments.",
  },
  ai: {
    slug: "ai-in-practice",
    tagline: "LLMs, agents and automations, shipped for real.",
    body: "How I put language models into sites and products: RAG on existing content, agents, n8n workflows, real costs and pitfalls, and the AI-assisted setup I use every day.",
    seoTitle: "AI in Practice: LLM, Agents & n8n Articles | Pier Gorelli",
    seoDescription: "Practical AI engineering notes: LLM integrations, RAG, agents, n8n automations and AI-assisted development, written from real client work.",
  },
  agencies: {
    slug: "ai-for-agencies",
    tagline: "What AI changes inside a creative agency, without the jargon.",
    body: "Use cases, workflows and adoption notes for agency owners and producers: what to automate, what to keep human, how to brief an AI feature.",
    seoTitle: "AI for Creative Agencies: Use Cases & Workflows | Pier Gorelli",
    seoDescription: "AI for creative agencies in plain words: automation use cases, n8n workflows, adoption and briefing tips from a developer who works with agencies.",
  },
  reviews: {
    slug: "reviews",
    tagline: "Books and tools worth your time.",
    body: "Short, honest reviews of the books and tools that shape how I work: design systems, AI engineering, freelancing.",
    seoTitle: "Book & Tool Reviews for Developers | Pier Gorelli",
    seoDescription: "Honest reviews of books and tools for developers and freelancers: design systems, AI engineering, productivity and the craft of shipping.",
  },
  freelance: {
    slug: "freelance",
    tagline: "Remote freelancing, from someone who's done it for years.",
    body: "How to survive (and enjoy) full-remote freelance life: clients, time, tools and sanity.",
    seoTitle: "Freelance & Remote Work Articles | Pier Gorelli",
    seoDescription: "Notes on freelance, full-remote work from a developer freelancing since 2012: clients, time management, tools and staying sane.",
    tag: true,
  },
};

export const topicUrl = (key: PillarKey) => `/blog/topic/${PILLAR_INFO[key].slug}/`;

export async function getPosts() {
  const posts = await getCollection("blog");
  return posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

export const postUrl = (post: Post) => `/blog/${post.id}/`;

export const wordCount = (post: Post) => (post.body ?? "").trim().split(/\s+/).length;
export const readingMinutes = (post: Post) => Math.max(1, Math.ceil(wordCount(post) / 220));

export const formatDate = (d: Date) =>
  d.toLocaleDateString("en-GB", { year: "numeric", month: "short", day: "2-digit" });

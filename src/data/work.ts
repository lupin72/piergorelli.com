/**
 * PLACEHOLDER case studies for the prototype (decision Q36-A).
 * Replace with real, NDA-cleared projects before launch — see docs/redesign-status.md.
 */
export type Work = {
  slug: string;
  title: string;
  client: string;
  year: string;
  stack: string[];
  summary: string;
  visual: "orbit" | "bars" | "audit";
  placeholder: true;
};

export const work: Work[] = [
  {
    slug: "pharma-launch",
    title: "Launch site for a pharma brand",
    client: "For a creative agency · Milan",
    year: "2025",
    stack: ["Astro", "GSAP", "WebGL"],
    summary: "Scroll-driven storytelling, shipped white-label in six weeks, 98 on Lighthouse.",
    visual: "orbit",
    placeholder: true,
  },
  {
    slug: "fashion-headless",
    title: "Headless WordPress for a fashion group",
    client: "For a digital agency · Madrid",
    year: "2024",
    stack: ["WordPress", "Astro", "i18n"],
    summary: "Six markets, one editorial workflow, pages twice as fast as the old stack.",
    visual: "bars",
    placeholder: true,
  },
  {
    slug: "site-audit-ai",
    title: "Site Audit AI",
    client: "Lab · own product",
    year: "2026",
    stack: ["n8n", "LLM", "PageSpeed API"],
    summary: "Paste a URL, get a prioritised report on speed, accessibility, SEO and AI visibility.",
    visual: "audit",
    placeholder: true,
  },
];

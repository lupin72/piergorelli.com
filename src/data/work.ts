/**
 * Case studies. Entries with `placeholder: true` stand in for the prototype (decision Q36-A):
 * replace them with real, NDA-cleared projects before launch, see docs/redesign-status.md.
 */
export type Work = {
  slug: string;
  title: string;
  client: string;
  year: string;
  stack: string[];
  summary: string;
  visual: "orbit" | "bars" | "audit" | "blueprint";
  placeholder: boolean;
};

export const work: Work[] = [
  {
    slug: "piergorelli-com",
    title: "piergorelli.com, redesigned",
    client: "Own studio · Valencia",
    year: "2026",
    stack: ["Astro", "GSAP", "WebGL"],
    summary: "Blueprint concept, compile intro and View Transitions on showcase pages, a blog with almost no JavaScript, 97+ on Lighthouse mobile.",
    visual: "blueprint",
    placeholder: false,
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

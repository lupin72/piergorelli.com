/**
 * Work, told as anonymous field reports: no client names, links or screenshots (Pier has no
 * permission to publish them, see docs/content-facts.md). The visual is a blueprint drawing,
 * never a screenshot. Only piergorelli.com is a full case study.
 */
export type Work = {
  slug: string;
  title: string;
  client: string;
  year: string;
  stack: string[];
  summary: string;
  visual: "orbit" | "bars" | "audit" | "blueprint" | "tiles" | "diary" | "diagonals" | "captions";
};

export const work: Work[] = [
  {
    slug: "retail-k",
    title: "A retail site drawn from one letter",
    client: "Retail · through an agency",
    year: "2026",
    stack: ["WordPress", "GSAP", "Lenis"],
    summary: "Every diagonal comes from the K in the logo and holds from desktop to phone. A full-bleed slider hints at the next slide's colour in the last twelfth of the current one.",
    visual: "diagonals",
  },
  {
    slug: "seo-images",
    title: "Image SEO that runs every day",
    client: "Manufacturer · WordPress",
    year: "2026",
    stack: ["Claude Code", "MCP", "Search Console"],
    summary: "Search Console, keyword niches and computer vision decide what each image is called and how it's captioned. Hundreds of images a day, and nobody renames them by hand.",
    visual: "captions",
  },
  {
    slug: "piergorelli-com",
    title: "piergorelli.com, redesigned",
    client: "Own studio · Valencia",
    year: "2026",
    stack: ["Astro", "GSAP", "WebGL"],
    summary: "Blueprint concept, compile intro and View Transitions on showcase pages, a blog with almost no JavaScript. Lighthouse mobile, September 2026: 98 on the home, 99 on the blog.",
    visual: "blueprint",
  },
  {
    slug: "ceramics-wordpress",
    title: "WordPress site for a ceramics manufacturer",
    client: "Ceramics manufacturer",
    year: "2026",
    stack: ["WordPress", "Blockstudio", "GSAP"],
    summary: "Custom Blockstudio blocks the marketing team composes freely, GSAP motion that lets every surface and glaze take the stage, and a smart importer that turns the product catalogue into pages without manual entry.",
    visual: "tiles",
  },
  {
    slug: "migraine-psp",
    title: "Patient support program for migraine",
    client: "Healthcare · patient platform",
    year: "2026",
    stack: ["Laravel", "Angular", "Filament", "CI/CD"],
    summary: "An Angular app that stays with patients throughout their therapy, a Filament back office for the care team, one Laravel API behind both, and a CI/CD pipeline that tests and ships every release.",
    visual: "diary",
  },
];

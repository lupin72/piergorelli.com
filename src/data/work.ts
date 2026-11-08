/**
 * Work: named case studies where the client agreed, anonymous field reports everywhere else
 * (see docs/content-facts.md for who can be named). A field report has no client name, link or
 * screenshot, and its visual is a blueprint drawing.
 */
import coachMaiteFinch from "../assets/work/coachmaitefinch.webp";

export type Work = {
  slug: string;
  title: string;
  client: string;
  year: string;
  stack: string[];
  summary: string;
  /** Only a full case study has a page; field reports stay cards. */
  href?: string;
  /** Named clients only: the live site and a screenshot of it, shown as the live layer in WorkStage. */
  url?: string;
  shot?: ImageMetadata;
  /** Drawing for the service pages (WorkVisual). Not needed by a project shown only in the home stage. */
  visual?: "orbit" | "bars" | "audit" | "blueprint" | "tiles" | "diary" | "diagonals" | "captions" | "catalogue";
};

export const work: Work[] = [
  {
    slug: "coachmaitefinch",
    title: "coachmaitefinch.com, restyled",
    client: "Maite Finch · Psychologist and coach, Valencia",
    year: "2026",
    stack: ["WordPress", "Sage", "GSAP", "Lenis"],
    summary: "Every headline shares two typefaces, a plain sans and a green italic, on warm paper. A custom WordPress theme with GSAP and Lenis, for a practice built on conversation.",
    url: "https://coachmaitefinch.com",
    shot: coachMaiteFinch,
  },
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
    href: "/work/piergorelli-com/",
    client: "Own studio · Valencia",
    year: "2026",
    stack: ["Astro", "GSAP", "WebGL"],
    summary: "Blueprint concept, compile intro and View Transitions on showcase pages, plus a blog with almost no JavaScript. Lighthouse mobile, September 2026: 98 on the home, 99 on the blog.",
    visual: "blueprint",
  },
  {
    slug: "ceramics-wordpress",
    title: "WordPress site for a ceramics manufacturer",
    client: "Ceramics manufacturer",
    year: "2026",
    stack: ["WordPress", "Blockstudio", "GSAP"],
    summary: "Custom Blockstudio blocks the marketing team can compose freely, GSAP motion that lets every surface and glaze take the stage, and a smart importer that turns the product catalogue into pages without manual entry.",
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

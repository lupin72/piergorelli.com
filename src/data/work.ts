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
  visual: "orbit" | "bars" | "audit" | "blueprint" | "tiles" | "diary";
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
    slug: "ceramics-wordpress",
    title: "WordPress site for a ceramics manufacturer",
    client: "Ceramics manufacturer",
    year: "2025",
    stack: ["WordPress", "Blockstudio", "GSAP"],
    summary: "Custom Blockstudio blocks the marketing team composes freely, GSAP motion that lets every surface and glaze take the stage, and a smart importer that turns the product catalogue into pages without manual entry.",
    visual: "tiles",
    placeholder: false,
  },
  {
    slug: "migraine-psp",
    title: "Patient support program for migraine",
    client: "Healthcare · patient platform",
    year: "2025",
    stack: ["Laravel", "Angular", "Filament", "CI/CD"],
    summary: "An Angular app that stays with patients throughout their therapy, a Filament back office for the care team, one Laravel API behind both, and a CI/CD pipeline that tests and ships every release.",
    visual: "diary",
    placeholder: false,
  },
];

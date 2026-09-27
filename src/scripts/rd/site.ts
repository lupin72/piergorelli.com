/**
 * Site-wide behaviour, loaded on every page (kept tiny: no dependencies).
 * Heavy things are imported on demand:
 *  - ./motion   only on pages with <html data-motion="showcase">
 *  - ./palette  on the first ⌘K / Menu press
 */

const root = document.documentElement;
const ACCENTS = ["blue", "orange", "lime"] as const;

const store = {
  get: (k: string) => { try { return localStorage.getItem(k); } catch { return null; } },
  set: (k: string, v: string) => { try { localStorage.setItem(k, v); } catch { /* private mode */ } },
};

/* ── theme & accent ─────────────────────────────────────────── */

export function setTheme(theme: "light" | "dark") {
  root.dataset.theme = theme;
  store.set("pg-theme", theme);
  syncChrome();
}
export function toggleTheme() {
  setTheme(root.dataset.theme === "dark" ? "light" : "dark");
}
export function setAccent(accent: string) {
  root.dataset.accent = accent;
  store.set("pg-accent", accent);
  syncChrome();
}
export function cycleAccent() {
  const i = ACCENTS.indexOf(root.dataset.accent as (typeof ACCENTS)[number]);
  setAccent(ACCENTS[(i + 1) % ACCENTS.length]);
}
export function toggleGrid() {
  root.dataset.grid = root.dataset.grid === "on" ? "off" : "on";
}

/** Favicon and theme-color follow the current theme + accent. */
function syncChrome() {
  const styles = getComputedStyle(root);
  const bg = styles.getPropertyValue("--bg").trim();
  const ink = styles.getPropertyValue("--ink").trim();
  const accent = styles.getPropertyValue("--accent").trim();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-6 -8 80 56"><rect x="-6" y="-8" width="80" height="56" rx="12" fill="${bg}"/><g fill="none" stroke="${ink}" stroke-width="5" stroke-linecap="square"><path d="M6 37V3h12a9.5 9.5 0 0 1 0 19H6"/><path d="M57.3 8.7A16 16 0 1 0 62 20H48"/></g><circle cx="64" cy="36" r="3.4" fill="${accent}"/></svg>`;
  const link = document.getElementById("favicon") as HTMLLinkElement | null;
  if (link) link.href = `data:image/svg+xml,${encodeURIComponent(svg)}`;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", bg);
}

/* ── command palette (lazy) ─────────────────────────────────── */

async function openPalette() {
  const { open } = await import("./palette");
  open();
}

/* ── one-time listeners (survive client-side navigation) ────── */

document.addEventListener("click", (e) => {
  const btn = (e.target as HTMLElement).closest<HTMLElement>("[data-action]");
  if (!btn) return;
  const action = btn.dataset.action;
  if (action === "theme") toggleTheme();
  else if (action === "accent") cycleAccent();
  else if (action === "palette") openPalette();
});

document.addEventListener("keydown", (e) => {
  const t = e.target as HTMLElement;
  const typing = t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName);
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
    e.preventDefault();
    openPalette();
  } else if (!typing && !e.metaKey && !e.ctrlKey && !e.altKey && e.key.toLowerCase() === "g") {
    toggleGrid();
  }
});

console.log(
  `%c
   ██████╗  ██████╗
   ██╔══██╗██╔════╝
   ██████╔╝██║  ███╗
   ██╔═══╝ ██║   ██║
   ██║     ╚██████╔╝ ●
   ╚═╝      ╚═════╝
%cReading the source? We'll get along.
Built with Astro, GSAP & a lot of coffee → me@piergorelli.com`,
  "color:#2f5bff;font-family:monospace",
  "font-family:monospace",
);

/* ── page transitions (monogram sheet) ───────────────────────── */

type TransitionModule = typeof import("./transition");
let transition: Promise<TransitionModule> | undefined;
const loadTransition = () => (transition ??= import("./transition"));
const reducedMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

// Reading pages fetch the transition code only when a link is about to be used.
const onIntent = (e: Event) => {
  const a = (e.target as HTMLElement).closest?.("a[href]") as HTMLAnchorElement | null;
  if (a && a.origin === location.origin) loadTransition();
};
document.addEventListener("pointerover", onIntent, { passive: true });
document.addEventListener("focusin", onIntent);

document.addEventListener("astro:before-preparation", (e) => {
  if (reducedMotion()) return;
  const original = e.loader;
  e.loader = async () => {
    const t = await loadTransition();
    await Promise.all([t.cover(e.to), original()]);
  };
});
document.addEventListener("astro:after-swap", () => {
  if (transition && !reducedMotion()) transition.then((t) => t.reveal());
});

/* ── per-page setup ─────────────────────────────────────────── */

let cleanupMotion: (() => void) | undefined;

document.addEventListener("astro:page-load", async () => {
  syncChrome();

  // Re-plot the header monogram on every page, like a pen tracing it again.
  const mark = document.querySelector<SVGElement>(".site-header .monogram");
  if (mark && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    mark.classList.remove("is-plotting");
    void mark.getBoundingClientRect();
    mark.classList.add("is-plotting");
  }

  if (!root.dataset.preloaded) {
    try { sessionStorage.setItem("pg-preloaded", "1"); } catch { /* ignore */ }
  }

  if (root.dataset.motion === "showcase") {
    loadTransition();
    const { initMotion } = await import("./motion");
    cleanupMotion = initMotion();
  }
});

document.addEventListener("astro:before-swap", () => {
  cleanupMotion?.();
  cleanupMotion = undefined;
  // After the first page, never show the preloader again in this session.
  root.dataset.preloaded = "yes";
});

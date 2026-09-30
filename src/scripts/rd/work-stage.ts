/**
 * Home [02] Work (WorkStage.astro): each drawing is plotted, built into material, then goes live.
 * Desktop (≥ 1024 × 600): the stage pins and scroll plays the projects one after the other.
 * Smaller screens: each card plays its own plot → build → live as it crosses the viewport.
 * Loaded by motion.ts only on pages that have [data-work-stage]; never runs with reduced motion.
 */
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type Lenis from "lenis";
import { contours } from "../../lib/work-stage";

/** Scroll units per project in the pinned timeline: plot, build, live, then a beat to look at it. */
const SEG = 4;
const LIVE_AT = 2.85;
const GLYPHS = "01<>/_#*+=-xyz";

/** One project's drawing: plot (0 → 1), build (1 → 2), live (2 → 3). Start states are set at once. */
function drawing(item: HTMLElement) {
  const q = (sel: string) => Array.from(item.querySelectorAll<SVGElement>(sel));
  const tl = gsap.timeline({ paused: true, defaults: { ease: "power1.inOut" } });
  const each = (n: number, total: number) => total / Math.max(n, 1);

  const draws = q("[data-p-draw]");
  tl.fromTo(draws, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.75, stagger: each(draws.length, 0.3), ease: "power2.inOut" }, 0);
  const ins = q("[data-p-in]");
  tl.fromTo(ins, { opacity: 0 }, { opacity: 1, duration: 0.45, stagger: each(ins.length, 0.5) }, 0.1);

  tl.fromTo(q("[data-b-dim]"), { opacity: 1 }, { opacity: 0.2, duration: 0.6, immediateRender: false }, 0.9);
  const bDraws = q("[data-b-draw]");
  tl.fromTo(bDraws, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.7, stagger: 0.1, ease: "power2.inOut" }, 0.95);
  q("[data-b-clip]").forEach((r) => {
    tl.fromTo(r, { attr: { width: 0 } }, { attr: { width: r.getAttribute("width") ?? 0 }, duration: 0.9, ease: "power2.inOut" }, 1);
  });
  const wipes = q("[data-b-wipe]");
  tl.fromTo(wipes, { scaleX: 0 }, { scaleX: 1, transformOrigin: "0% 50%", duration: 0.6, stagger: each(wipes.length, 0.35), ease: "power2.inOut" }, 1.05);
  const bIns = q("[data-b-in]");
  tl.fromTo(bIns, { opacity: 0 }, { opacity: 1, duration: 0.5, stagger: each(bIns.length, 0.4) }, 1.15);
  q("[data-b-type]").forEach((el, i) => {
    const text = el.dataset.bType ?? "";
    const p = { v: 0 };
    el.textContent = "";
    tl.to(p, {
      v: 1,
      duration: 0.6,
      ease: "none",
      onUpdate: () => {
        const n = Math.floor(p.v * text.length);
        el.textContent = p.v >= 1 ? text : text.slice(0, n) + (p.v > 0 ? "▌" : "");
      },
    }, 1.3 + i * 0.12);
  });
  q("[data-b-move]").forEach((el) => {
    const [x, y, s] = (el.dataset.bMove ?? "0 0 1").split(" ");
    const to = el.getAttribute("transform") ?? "";
    tl.fromTo(el, { attr: { transform: `translate(${x} ${y}) scale(${s})` } }, { attr: { transform: to }, duration: 1, ease: "power3.inOut" }, 0.9);
  });

  q("[data-live-clip]").forEach((r) => {
    tl.fromTo(r, { attr: { width: 0 } }, { attr: { width: 800 }, duration: 0.9, ease: "power3.inOut" }, 2);
  });
  // An accent scan line rides the edge of the live wipe, like the plotter head.
  q("[data-live-scan]").forEach((line) => {
    tl.fromTo(line, { x: 0 }, { x: 800, duration: 0.9, ease: "power3.inOut" }, 2)
      .fromTo(line, { opacity: 0 }, { opacity: 1, duration: 0.05, immediateRender: false }, 2)
      .to(line, { opacity: 0, duration: 0.15 }, 2.8);
  });
  tl.set({}, {}, 3);
  return tl;
}

/** Types a label in with a short tail of random characters (the same voice as the hero compile). */
function scramble(el: Element, text: string) {
  const p = { v: 0 };
  return gsap.to(p, {
    v: 1,
    duration: 0.45,
    ease: "none",
    onUpdate: () => {
      const n = Math.floor(p.v * text.length);
      const tail = Array.from({ length: Math.min(3, text.length - n) }, () => GLYPHS[(Math.random() * GLYPHS.length) | 0]).join("");
      el.textContent = text.slice(0, n) + tail;
    },
    onComplete: () => { el.textContent = text; },
  });
}

/* ── live layer: what each finished piece does ─────────────── */

function retail(item: HTMLElement) {
  const track = item.querySelector<SVGGElement>("[data-ws-track]");
  const progress = item.querySelector<SVGRectElement>("[data-ws-progress]");
  const counter = item.querySelector<SVGTextElement>("[data-ws-counter]");
  const btn = item.querySelector<HTMLButtonElement>("[data-ws-try]");
  const art = item.querySelector<HTMLElement>(".ws__art");
  if (!track || !btn || !art) return () => {};
  let s = 0;
  const go = (dir: number) => {
    s = (s + dir + 3) % 3;
    gsap.to(track, { x: -800 * s, duration: 1, ease: "expo.inOut", overwrite: true });
    if (progress) gsap.to(progress, { attr: { width: 73.3 * (s + 1) }, duration: 0.6, ease: "power3.out" });
    if (counter) counter.textContent = `0${s + 1} / 03`;
  };
  let x0: number | null = null;
  const onDown = (e: PointerEvent) => { x0 = e.clientX; };
  const onUp = (e: PointerEvent) => {
    if (x0 === null) return;
    const dx = e.clientX - x0;
    x0 = null;
    go(dx > 30 ? -1 : 1);
  };
  const onBtn = () => go(1);
  btn.addEventListener("click", onBtn);
  art.addEventListener("pointerdown", onDown);
  art.addEventListener("pointerup", onUp);
  return () => {
    btn.removeEventListener("click", onBtn);
    art.removeEventListener("pointerdown", onDown);
    art.removeEventListener("pointerup", onUp);
  };
}

const SHOTS = [
  { view: "front", alt: ["Product from the front,", "on a light backdrop"] },
  { view: "detail", alt: ["Close-up of the finish,", "as the page describes it"] },
  { view: "in-use", alt: ["The product in use,", "in its real context"] },
];

function seo(item: HTMLElement) {
  const btn = item.querySelector<HTMLButtonElement>("[data-ws-try]");
  const art = item.querySelector<HTMLElement>(".ws__art");
  const photo = item.querySelector<SVGUseElement>("[data-ws-photo]");
  const f = (k: string) => item.querySelector(`[data-ws-f="${k}"]`);
  if (!btn || !art || !photo) return () => {};
  let i = 0;
  const next = () => {
    i = (i + 1) % SHOTS.length;
    const shot = SHOTS[i];
    gsap.timeline()
      .to(photo, { opacity: 0, duration: 0.2 })
      .add(() => photo.setAttribute("href", `#ws-shot-${i}`))
      .to(photo, { opacity: 1, duration: 0.35 });
    const set = [["was", `IMG_04${12 + i}.jpg`], ["name", `niche-keyword-product-${shot.view}.jpg`], ["alt0", shot.alt[0]], ["alt1", shot.alt[1]]] as const;
    set.forEach(([k, text], n) => { const el = f(k); if (el) gsap.delayedCall(n * 0.12, () => { scramble(el, text); }); });
  };
  btn.addEventListener("click", next);
  art.addEventListener("click", next);
  return () => { btn.removeEventListener("click", next); art.removeEventListener("click", next); };
}

function hero(item: HTMLElement) {
  const art = item.querySelector<HTMLElement>(".ws__art");
  const hills = Array.from(item.querySelectorAll<SVGPathElement>("[data-ws-hill]"));
  if (!art || !hills.length || !matchMedia("(pointer: fine)").matches) return () => {};
  const state = { x: 560, lift: 1 };
  const draw = () => contours(state.x, state.lift).forEach((d, n) => hills[n]?.setAttribute("d", d));
  const toX = gsap.quickTo(state, "x", { duration: 0.8, ease: "power3.out", onUpdate: draw });
  const toLift = gsap.quickTo(state, "lift", { duration: 0.8, ease: "power3.out", onUpdate: draw });
  const onMove = (e: PointerEvent) => {
    const r = art.getBoundingClientRect();
    toX(((e.clientX - r.left) / r.width) * 800);
    toLift(1.6 - ((e.clientY - r.top) / r.height) * 0.8);
  };
  const onLeave = () => { toX(560); toLift(1); };
  art.addEventListener("pointermove", onMove);
  art.addEventListener("pointerleave", onLeave);
  return () => { art.removeEventListener("pointermove", onMove); art.removeEventListener("pointerleave", onLeave); };
}

const LIVE: Record<string, { run: (item: HTMLElement) => () => void; cursor: string }> = {
  "retail-k": { run: retail, cursor: "drag ↔" },
  "seo-images": { run: seo, cursor: "rename ↻" },
  "piergorelli-com": { run: hero, cursor: "move the hill" },
};

/* ── stage ──────────────────────────────────────────────────── */

export function initWorkStage(lenis: Lenis): () => void {
  const root = document.querySelector<HTMLElement>("[data-work-stage]");
  if (!root) return () => {};
  const items = Array.from(root.querySelectorAll<HTMLElement>("[data-ws-item]"));
  const arts = items.map((it) => it.querySelector<HTMLElement>(".ws__art"));
  const live = (i: number, on: boolean) => {
    const art = arts[i];
    const cursor = LIVE[items[i].dataset.wsItem ?? ""]?.cursor;
    if (!art || !cursor) return;
    if (on) art.dataset.cursor = cursor;
    else delete art.dataset.cursor;
  };

  const offs = items.map((it) => LIVE[it.dataset.wsItem ?? ""]?.run(it) ?? (() => {}));
  const buttons = root.querySelectorAll<HTMLButtonElement>("[data-ws-try]");
  buttons.forEach((b) => (b.hidden = false));

  const mm = gsap.matchMedia();

  mm.add("(min-width: 1024px) and (min-height: 600px)", () => {
    root.classList.add("is-pinned");
    const n = items.length;
    const num = root.querySelector<HTMLElement>("[data-ws-n]");
    const stages = Array.from(root.querySelectorAll<HTMLElement>("[data-ws-stage]"));
    const dots = Array.from(root.querySelectorAll<HTMLElement>("[data-ws-dot]"));
    const layers = items.map((it) => [it.querySelector<HTMLElement>(".ws__text"), it.querySelector<HTMLElement>(".ws__art")] as const);
    const head = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 88;

    const master = gsap.timeline({ defaults: { ease: "none" } });
    items.forEach((it, i) => {
      const tl = drawing(it);
      tl.paused(false);
      master.add(tl, i * SEG);
      if (i > 0) {
        const [prevText, prevArt] = layers[i - 1];
        const [text, art] = layers[i];
        const at = i * SEG - 0.8;
        master
          .fromTo(prevText, { opacity: 1, y: 0 }, { opacity: 0, y: -24, duration: 0.6, ease: "power2.in", immediateRender: false }, at)
          .fromTo(prevArt, { opacity: 1, scale: 1 }, { opacity: 0, scale: 0.97, duration: 0.7, ease: "power2.inOut", immediateRender: false }, at)
          .fromTo(text, { opacity: 0, y: 32 }, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }, at + 0.45)
          .fromTo(art, { opacity: 0, scale: 1.03 }, { opacity: 1, scale: 1, duration: 0.9, ease: "power2.out" }, at + 0.35);
      }
    });
    master.set({}, {}, (n - 1) * SEG + 3.6);
    const total = master.duration();

    let current = -1;
    let stage = -1;
    const update = (t: number) => {
      const idx = Math.min(n - 1, Math.max(0, Math.floor((t + 0.3) / SEG)));
      const local = gsap.utils.clamp(0, 3, t - idx * SEG);
      if (idx !== current) {
        items.forEach((it, k) => it.toggleAttribute("data-current", k === idx));
        dots.forEach((d, k) => d.toggleAttribute("data-on", k <= idx));
        if (num && current >= 0) {
          const dir = idx > current ? 1 : -1;
          gsap.timeline()
            .to(num, { yPercent: -40 * dir, opacity: 0, duration: 0.2, ease: "power2.in", overwrite: true })
            .add(() => { num.textContent = String(idx + 1).padStart(2, "0"); })
            .fromTo(num, { yPercent: 40 * dir, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.45, ease: "power3.out" });
        }
        current = idx;
      }
      const s = Math.min(2, Math.floor(local));
      stages.forEach((el, j) => el.style.setProperty("--p", String(gsap.utils.clamp(0, 1, local - j))));
      if (s !== stage) { stages.forEach((el, j) => el.toggleAttribute("data-on", j === s)); stage = s; }
      items.forEach((_, k) => live(k, k === idx && local >= LIVE_AT));
    };

    const st = ScrollTrigger.create({
      trigger: root,
      start: `top top+=${head}`,
      end: () => `+=${innerHeight * 1.6 * n}`,
      pin: true,
      scrub: true,
      animation: master,
      onUpdate: (self) => update(self.progress * total),
    });
    update(0);

    // Keyboard: focusing a project's button or link scrolls the stage to that project, live.
    const onFocus = (e: FocusEvent) => {
      const i = items.findIndex((it) => it.contains(e.target as Node));
      if (i < 0 || i === current) return;
      lenis.scrollTo(st.start + ((i * SEG + 3) / total) * (st.end - st.start), { immediate: true });
    };
    root.addEventListener("focusin", onFocus);

    return () => {
      root.removeEventListener("focusin", onFocus);
      root.classList.remove("is-pinned");
      items.forEach((it, k) => { it.removeAttribute("data-current"); live(k, false); });
    };
  });

  mm.add("(max-width: 1023.98px), (max-height: 599.98px)", () => {
    items.forEach((it, i) => {
      const tl = drawing(it);
      ScrollTrigger.create({
        trigger: arts[i] ?? it,
        start: "top 85%",
        end: "bottom 30%",
        scrub: true,
        animation: tl,
        onUpdate: (self) => live(i, self.progress > 0.95),
      });
    });
  });

  ScrollTrigger.sort();
  ScrollTrigger.refresh();

  return () => {
    mm.revert();
    offs.forEach((fn) => fn());
    buttons.forEach((b) => (b.hidden = true));
  };
}

/**
 * Motion layer for showcase pages (home, services, work).
 * Never imported by blog pages: they stay free of animation JS.
 *
 * Markup hooks:
 *  [data-hero]                  hero container: gets the blueprint "compile" intro + WebGL contours
 *  [data-bp="label"]            element measured and boxed by the blueprint layer
 *  [data-hero-human]            outlined, then inked (the "hand-written" line)
 *  [data-hero-generate]         words appear token by token (the "machine" line)
 *  [data-gen-tokens] [data-gen-ms]  live counters for the generate effect
 *  [data-reveal="lines"]        masked line reveal on scroll
 *  [data-reveal="up"]           fade/slide up on scroll
 *  [data-wireframe]             outlined → solid text, scrubbed by scroll
 *  [data-draw]                  hairline that draws itself (scaleX), scrubbed
 *  [data-parallax="<percent>"]  scrubbed vertical drift
 *  [data-fill]                  full-row hover fill: [data-hot] set only by real pointer movement
 *  [data-plot]                  SVG figure: [pathLength="1"] strokes plot themselves, [data-plot-dot] pop in, scrubbed
 */
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";
import { initCursor } from "./cursor";

gsap.registerPlugin(ScrollTrigger, SplitText);

const EASE_OUT = "expo.out";
const EASE_IN_OUT = "power4.inOut";

/** Line masks clip descenders with tight leading: give them a little room. */
const roomForDescenders = (split: SplitText) =>
  (split.masks as HTMLElement[]).forEach((m) => { m.style.paddingBottom = "0.12em"; m.style.marginBottom = "-0.12em"; });

const idle = (cb: () => void) =>
  "requestIdleCallback" in window ? window.requestIdleCallback(cb, { timeout: 1500 }) : setTimeout(cb, 200);

export function initMotion(): () => void {
  const root = document.documentElement;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) {
    root.classList.add("motion-ready");
    return () => root.classList.remove("motion-ready");
  }

  // Smooth scroll, driven by GSAP's ticker so ScrollTrigger stays in sync.
  const lenis = new Lenis({ duration: 1.15, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
  lenis.on("scroll", ScrollTrigger.update);
  const tick = (time: number) => lenis.raf(time * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);

  const cleanups: (() => void)[] = [initCursor(), rowFills(lenis)];

  // First visit: start compiling while the preloader sheet lifts.
  const heroDelay = root.dataset.preloaded ? 0.1 : 1.45;

  const ctx = gsap.context(() => {});
  let cancelled = false;

  document.fonts.ready.then(() => {
    if (cancelled) return;
    let intro: gsap.core.Timeline | undefined;
    ctx.add(() => { intro = hero(heroDelay); });
    root.classList.add("motion-ready");

    // Below-the-fold work waits for an idle moment so the first paint stays responsive.
    idle(() => {
      if (cancelled) return;
      ctx.add(() => {
        reveals();
        wireframes();
        lines();
        parallax();
        plots();
      });
      ScrollTrigger.refresh();
    });

    // The WebGL contours arrive last, and only where they can run smoothly.
    const host = document.querySelector<HTMLElement>("[data-hero]");
    const capable = matchMedia("(pointer: fine) and (min-width: 900px)").matches;
    if (host && capable) {
      const startGL = () => idle(async () => {
        if (cancelled) return;
        const { initHeroGL } = await import("./hero-gl");
        if (!cancelled) cleanups.push(initHeroGL(host));
      });
      intro ? intro.then(startGL) : startGL();
    }
  });

  return () => {
    cancelled = true;
    cleanups.forEach((fn) => fn());
    ctx.revert();
    gsap.ticker.remove(tick);
    lenis.destroy();
    root.classList.remove("motion-ready");
  };
}

/* Full-row hover fills ([data-fill]): a row lights up ([data-hot]) only when the pointer really
   moves inside it, and goes dark as soon as the pointer is no longer over it. Rows sliding under
   a resting pointer (wheel, trackpad inertia, keyboard) never flicker. html.fill-js switches the
   pages' plain :hover rules off; without this layer (reduced motion) they work as usual. */
function rowFills(lenis: Lenis) {
  const root = document.documentElement;
  let hot: HTMLElement | null = null;
  const heat = (el: HTMLElement | null) => {
    if (el === hot) return;
    hot?.removeAttribute("data-hot");
    hot = el;
    hot?.setAttribute("data-hot", "");
  };
  const onMove = (e: PointerEvent) => {
    if (e.pointerType === "touch" || (!e.movementX && !e.movementY)) return;
    heat((e.target as Element).closest<HTMLElement>("[data-fill]"));
  };
  const onOut = (e: PointerEvent) => { if (hot && !hot.contains(e.relatedTarget as Node | null)) heat(null); };
  const onScroll = () => { if (hot && !hot.matches(":hover")) heat(null); };
  root.classList.add("fill-js");
  addEventListener("pointermove", onMove, { passive: true });
  addEventListener("pointerout", onOut, { passive: true });
  lenis.on("scroll", onScroll);
  return () => {
    removeEventListener("pointermove", onMove);
    removeEventListener("pointerout", onOut);
    lenis.off("scroll", onScroll);
    heat(null);
    root.classList.remove("fill-js");
  };
}

/* ── hero: blueprint compile → human line → machine line ────── */

const GLYPHS = "01<>/_#*+=-xyz";

/** Types a label in, with a short tail of random characters, like a plotter warming up. */
function scramble(el: HTMLElement, duration = 0.5) {
  const text = el.dataset.text ?? "";
  const state = { p: 0 };
  el.textContent = "";
  return gsap.to(state, {
    p: 1,
    duration,
    ease: "none",
    onUpdate: () => {
      const n = Math.floor(state.p * text.length);
      const tail = Array.from({ length: Math.min(4, text.length - n) }, () => GLYPHS[(Math.random() * GLYPHS.length) | 0]).join("");
      el.textContent = text.slice(0, n) + tail;
    },
    onComplete: () => { el.textContent = text; },
  });
}

/** Measures every [data-bp] element and draws construction boxes, guides and labels over it. */
function blueprint(host: HTMLElement) {
  const layer = document.createElement("div");
  layer.className = "bp";
  layer.setAttribute("aria-hidden", "true");
  host.append(layer);

  const hb = host.getBoundingClientRect();
  const boxes: HTMLElement[] = [];
  const labels: HTMLElement[] = [];
  const ys = new Set<number>();
  const xs = new Set<number>();

  gsap.utils.toArray<HTMLElement>("[data-bp]", host).forEach((el) => {
    const r = el.getBoundingClientRect();
    const box = document.createElement("div");
    box.className = "bp__box";
    box.style.cssText = `left:${r.left - hb.left}px;top:${r.top - hb.top}px;width:${r.width}px;height:${r.height}px`;
    const label = document.createElement("span");
    label.className = "bp__label note";
    label.dataset.text = `${el.dataset.bp} · ${Math.round(r.width)}×${Math.round(r.height)}`;
    box.append(label);
    layer.append(box);
    boxes.push(box);
    labels.push(label);
    ys.add(Math.round(r.top - hb.top));
    ys.add(Math.round(r.bottom - hb.top));
    xs.add(Math.round(r.right - hb.left));
  });

  const guidesH = [...ys].map((y) => {
    const g = document.createElement("span");
    g.className = "bp__guide bp__guide--h";
    g.style.top = `${y}px`;
    layer.append(g);
    return g;
  });
  const guidesV = [...xs].map((x) => {
    const g = document.createElement("span");
    g.className = "bp__guide bp__guide--v";
    g.style.left = `${x}px`;
    layer.append(g);
    return g;
  });

  return { layer, boxes, labels, guidesH, guidesV };
}

function hero(delay: number) {
  const host = document.querySelector<HTMLElement>("[data-hero]");
  const human = document.querySelector<HTMLElement>("[data-hero-human]");
  const machine = document.querySelector<HTMLElement>("[data-hero-generate]");
  const tl = gsap.timeline({ delay });

  // 1 — construction lines, boxes and measurements
  const bp = host ? blueprint(host) : undefined;
  if (bp) {
    gsap.set(bp.guidesH, { scaleX: 0 });
    gsap.set(bp.guidesV, { scaleY: 0 });
    gsap.set(bp.boxes, { opacity: 0 });
    tl.to(bp.guidesH, { scaleX: 1, duration: 1, ease: "expo.inOut", stagger: 0.04 }, 0)
      .to(bp.guidesV, { scaleY: 1, duration: 1, ease: "expo.inOut", stagger: 0.06 }, 0.1)
      .to(bp.boxes, { opacity: 1, duration: 0.3, stagger: 0.07 }, 0.35);
    bp.labels.forEach((label, i) => tl.add(scramble(label), 0.4 + i * 0.07));
  }

  // 2 — the hand-written line arrives as an outline, then gets inked
  if (human) {
    const split = SplitText.create(human, { type: "lines", mask: "lines", aria: "none" });
    roomForDescenders(split);
    gsap.set(human, { "--fill": 0 });
    tl.from(split.lines, { yPercent: 110, duration: 1.1, ease: EASE_OUT, stagger: 0.08 }, bp ? 0.55 : 0)
      .to(human, { "--fill": 1, duration: 0.7, ease: "power2.inOut" }, bp ? 1.35 : 0.8);
  }

  // 3 — the machine line generates token by token
  if (machine) {
    const split = SplitText.create(machine, { type: "words", wordsClass: "gen-word", tag: "span", aria: "none" });
    const words = split.words as HTMLElement[];
    const caret = document.createElement("span");
    caret.className = "gen-caret";
    caret.setAttribute("aria-hidden", "true");
    machine.append(caret);

    const tokensEl = document.querySelector<HTMLElement>("[data-gen-tokens]");
    const msEl = document.querySelector<HTMLElement>("[data-gen-ms]");
    gsap.set(words, { opacity: 0, filter: "blur(8px)", yPercent: 20 });

    // Irregular, LLM-like cadence: short bursts and small hesitations.
    let t = 0;
    const gen = gsap.timeline();
    words.forEach((word, i) => {
      gen.to(word, {
        opacity: 1,
        filter: "blur(0px)",
        yPercent: 0,
        duration: 0.5,
        ease: EASE_OUT,
        onStart: () => {
          word.after(caret);
          if (tokensEl) tokensEl.textContent = String(Math.round((i + 1) * 1.33));
        },
      }, t);
      t += gsap.utils.random(0.03, 0.12) + (/[.,—]$/.test(word.textContent ?? "") ? 0.22 : 0);
    });
    const counter = { ms: 0 };
    gen.to(counter, {
      ms: Math.round(t * 1000),
      duration: t,
      ease: "none",
      onUpdate: () => { if (msEl) msEl.textContent = String(Math.round(counter.ms)); },
    }, 0);
    gen.add(() => caret.classList.add("is-idle"));

    tl.add(gen, bp ? 1.6 : "-=0.7");
  }

  tl.from("[data-hero-fade]", { opacity: 0, y: 16, duration: 1, ease: EASE_OUT, stagger: 0.08 }, "-=0.6");

  // 4 — the scaffolding goes away, the page is "compiled"
  if (bp) {
    tl.to(bp.labels, { opacity: 0, duration: 0.4, stagger: 0.03 }, "+=0.2")
      .to(bp.boxes, { opacity: 0, duration: 0.6, stagger: 0.04 }, "<0.1")
      .to(bp.guidesH, { scaleX: 0, transformOrigin: "right center", duration: 0.9, ease: "expo.inOut", stagger: 0.03 }, "<")
      .to(bp.guidesV, { scaleY: 0, transformOrigin: "center bottom", duration: 0.9, ease: "expo.inOut" }, "<")
      .add(() => bp.layer.remove());
  }
  return tl;
}

/* ── scroll reveals ─────────────────────────────────────────── */

function reveals() {
  gsap.utils.toArray<HTMLElement>('[data-reveal="lines"]').forEach((el) => {
    SplitText.create(el, {
      type: "lines",
      mask: "lines",
      aria: "none",
      autoSplit: true,
      onSplit: (self) => {
        roomForDescenders(self);
        return gsap.from(self.lines, {
          yPercent: 110,
          duration: 1.1,
          ease: EASE_OUT,
          stagger: 0.07,
          scrollTrigger: { trigger: el, start: "top 85%", once: true },
        });
      },
    });
  });

  // Hide what is still below the trigger line up front: hiding on enter (gsap.from) made each
  // visible item blink out before fading back in, which read as a stutter.
  // Items already on screen when this runs (reload mid-page) simply stay visible.
  const ups = gsap.utils.toArray<HTMLElement>('[data-reveal="up"]')
    .filter((el) => el.getBoundingClientRect().top > innerHeight * 0.88);
  if (!ups.length) return;
  gsap.set(ups, { autoAlpha: 0, y: 48, force3D: true });
  ScrollTrigger.batch(ups, {
    start: "top 88%",
    once: true,
    onEnter: (batch) =>
      gsap.to(batch, {
        autoAlpha: 1, y: 0, duration: 1.3, ease: "power3.out", stagger: 0.09, overwrite: true,
        clearProps: "transform,opacity,visibility",
      }),
  });
}

/* Outlined "wireframe" text fills letter by letter as it scrolls through the viewport.
   Negative top/bottom insets so descenders (g, p) are filled too. */
function wireframes() {
  gsap.utils.toArray<HTMLElement>("[data-wireframe]").forEach((section) => {
    const solids = section.querySelectorAll<HTMLElement>("[data-wf-solid]");
    const notes = section.querySelectorAll<HTMLElement>("[data-wf-note]");
    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: { trigger: section, start: "top 65%", end: "bottom 60%", scrub: true },
    });
    tl.fromTo(solids,
      { clipPath: "inset(-0.35em 100% -0.45em 0em)" },
      { clipPath: "inset(-0.35em 0% -0.45em 0em)", stagger: 0.6 });
    tl.to(notes, { opacity: 0.15 }, 0.4);
  });
}

function lines() {
  gsap.utils.toArray<HTMLElement>("[data-draw]").forEach((el) => {
    gsap.fromTo(el, { scaleX: 0 }, {
      scaleX: 1,
      transformOrigin: "left center",
      ease: EASE_IN_OUT,
      scrollTrigger: { trigger: el, start: "top 90%", end: "top 45%", scrub: true },
    });
  });
}

function parallax() {
  gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((el) => {
    const amount = Number(el.dataset.parallax) || 12;
    gsap.fromTo(el, { yPercent: -amount }, {
      yPercent: amount,
      force3D: true,
      ease: "none",
      scrollTrigger: { trigger: el.parentElement ?? el, start: "top bottom", end: "bottom top", scrub: true },
    });
  });
}

/* Blueprint figures: strokes are plotted as the figure crosses the viewport.
   Without JS (or with reduced motion) the figure is simply drawn. */
function plots() {
  gsap.utils.toArray<SVGSVGElement>("[data-plot]").forEach((svg) => {
    const strokes = svg.querySelectorAll('[pathLength="1"]');
    const dots = svg.querySelectorAll("[data-plot-dot]");
    const labels = svg.querySelectorAll("text");
    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: { trigger: svg, start: "top 85%", end: "bottom 60%", scrub: true },
    });
    tl.fromTo(strokes, { strokeDashoffset: 1 }, { strokeDashoffset: 0, stagger: 0.12 }, 0)
      .fromTo(dots, { scale: 0 }, { scale: 1, transformOrigin: "50% 50%", stagger: 0.06, ease: "back.out(3)" }, 0.3)
      .fromTo(labels, { opacity: 0 }, { opacity: 1, stagger: 0.05 }, 0.4);
  });
}

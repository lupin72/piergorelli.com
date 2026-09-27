/**
 * Motion layer for showcase pages (home, services, work).
 * Never imported by blog pages: they stay free of animation JS.
 *
 * Markup hooks:
 *  [data-hero-human]            lines slide up from a mask (the "hand-written" line)
 *  [data-hero-generate]         words appear token by token (the "machine" line)
 *  [data-gen-tokens] [data-gen-ms]  live counters for the generate effect
 *  [data-reveal="lines"]        masked line reveal on scroll
 *  [data-reveal="up"]           fade/slide up on scroll
 *  [data-wireframe]             outlined → solid text, scrubbed by scroll
 *  [data-draw]                  hairline that draws itself (scaleX), scrubbed
 *  [data-parallax="<percent>"]  scrubbed vertical drift
 */
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger, SplitText);

const EASE_OUT = "expo.out";

/** Line masks clip descenders with tight leading: give them a little room. */
const roomForDescenders = (split: SplitText) =>
  (split.masks as HTMLElement[]).forEach((m) => { m.style.paddingBottom = "0.12em"; m.style.marginBottom = "-0.12em"; });
const EASE_IN_OUT = "power4.inOut";

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

  // Wait for the preloader sheet (first visit) before the hero plays.
  const heroDelay = root.dataset.preloaded ? 0.15 : 2.1;

  const ctx = gsap.context(() => {});
  let cancelled = false;

  document.fonts.ready.then(() => {
    if (cancelled) return;
    ctx.add(() => hero(heroDelay));
    root.classList.add("motion-ready");
    // Below-the-fold work waits for an idle moment so the first paint stays responsive.
    const idle = window.requestIdleCallback ?? ((cb: () => void) => setTimeout(cb, 200));
    idle(() => {
      if (cancelled) return;
      ctx.add(() => {
        reveals();
        wireframes();
        lines();
        parallax();
      });
      ScrollTrigger.refresh();
    });
  });

  return () => {
    cancelled = true;
    ctx.revert();
    gsap.ticker.remove(tick);
    lenis.destroy();
    root.classList.remove("motion-ready");
  };
}

/* ── hero: human line + machine line ────────────────────────── */

function hero(delay: number) {
  const human = document.querySelector<HTMLElement>("[data-hero-human]");
  const machine = document.querySelector<HTMLElement>("[data-hero-generate]");
  const tl = gsap.timeline({ delay });

  if (human) {
    const split = SplitText.create(human, { type: "lines", mask: "lines", aria: "none" });
    roomForDescenders(split);
    tl.from(split.lines, { yPercent: 110, duration: 1.2, ease: EASE_OUT, stagger: 0.08 });
  }

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
    const total = Math.round(t * 1000);
    gen.to(counter, {
      ms: total,
      duration: t,
      ease: "none",
      onUpdate: () => { if (msEl) msEl.textContent = String(Math.round(counter.ms)); },
    }, 0);
    gen.add(() => caret.classList.add("is-idle"));

    tl.add(gen, human ? "-=0.7" : 0);
  }

  tl.from("[data-hero-fade]", { opacity: 0, y: 16, duration: 1, ease: EASE_OUT, stagger: 0.08 }, "-=0.6");
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

  ScrollTrigger.batch('[data-reveal="up"]', {
    start: "top 88%",
    once: true,
    onEnter: (batch) =>
      gsap.from(batch, { opacity: 0, y: 40, duration: 1, ease: EASE_OUT, stagger: 0.08 }),
  });
}

/* Outlined "wireframe" text becomes solid as it scrolls through the viewport.
   The solid layer slides in from the left while its content slides the opposite way,
   so the glyphs stay put and only the edge moves — transforms only, no repaint. */
function wireframes() {
  gsap.utils.toArray<HTMLElement>("[data-wireframe]").forEach((section) => {
    const solids = gsap.utils.toArray<HTMLElement>("[data-wf-solid]", section);
    const inners = solids.map((el) => el.firstElementChild as HTMLElement);
    const notes = section.querySelectorAll<HTMLElement>("[data-wf-note]");
    gsap.set(solids, { xPercent: -101, force3D: true });
    gsap.set(inners, { xPercent: 101, force3D: true });
    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: { trigger: section, start: "top 65%", end: "bottom 60%", scrub: true },
    });
    solids.forEach((solid, i) => {
      tl.to(solid, { xPercent: 0 }, i * 0.6).to(inners[i], { xPercent: 0 }, i * 0.6);
    });
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

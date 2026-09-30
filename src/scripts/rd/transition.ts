/**
 * Page transition, in the preloader's language: an ink sheet rises over the page with the
 * 12-column grid, construction guides close in on the PG monogram, the monogram plots itself
 * inside a measured box while the destination is "typed" and a counter runs; then the
 * sheet lifts off the new page.
 * Loaded on showcase pages right away, on reading pages only on link intent.
 */
import gsap from "gsap";

const $ = <T extends Element>(sel: string, root: ParentNode = document) => root.querySelector<T>(sel);
const $$ = (sel: string, root: ParentNode) => [...root.querySelectorAll<HTMLElement>(sel)];

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/·×";

/** Types `text` into `el` with a short scramble, like the hero labels. */
function scramble(el: HTMLElement, text: string, duration = 0.5) {
  const state = { p: 0 };
  return gsap.to(state, {
    p: 1,
    duration,
    ease: "none",
    onUpdate() {
      const done = Math.floor(state.p * text.length);
      let out = text.slice(0, done);
      for (let i = done; i < Math.min(text.length, done + 3); i++) {
        out += text[i] === " " ? " " : GLYPHS[(Math.random() * GLYPHS.length) | 0];
      }
      el.textContent = out;
    },
    onComplete() { el.textContent = text; },
  });
}

function parts(sheet: HTMLElement) {
  return {
    cols: $$(".pt__cols span", sheet),
    meta: $$(".pt__meta", sheet),
    stage: $<HTMLElement>(".pt__stage", sheet)!,
    guidesH: $$(".pt__guide--h", sheet),
    guidesV: $$(".pt__guide--v", sheet),
    box: $<HTMLElement>(".pt__box", sheet)!,
    label: $<HTMLElement>(".pt__label", sheet)!,
    paths: [...sheet.querySelectorAll<SVGPathElement>(".pt__mark path")],
    dot: $<SVGCircleElement>(".pt__mark circle", sheet)!,
    to: $<HTMLElement>(".pt__to", sheet)!,
    count: $<HTMLElement>(".pt__count", sheet)!,
  };
}

let current: gsap.core.Timeline | undefined;

export function cover(to: URL): Promise<void> {
  const sheet = $<HTMLElement>(".pt");
  if (!sheet) return Promise.resolve();
  const p = parts(sheet);
  const counter = { n: 0 };

  current?.kill();
  gsap.set(sheet, { visibility: "visible", clipPath: "inset(100% 0% 0% 0%)" });
  gsap.set(p.stage, { yPercent: 0, opacity: 1 });
  gsap.set(p.cols, { scaleY: 0, transformOrigin: "50% 100%" });
  gsap.set(p.meta, { opacity: 0 });
  gsap.set(p.guidesH, { scaleX: 0, transformOrigin: "0% 50%" });
  gsap.set(p.guidesV, { scaleY: 0, transformOrigin: "50% 0%" });
  gsap.set(p.box, { opacity: 0 });
  gsap.set(p.paths, { strokeDashoffset: 1 });
  gsap.set(p.dot, { scale: 0, transformOrigin: "50% 50%" });
  p.label.textContent = "";
  p.to.textContent = "";
  p.count.textContent = "0%";

  return new Promise((resolve) => {
    current = gsap.timeline({ onComplete: resolve })
      .to(sheet, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.6, ease: "power4.inOut" })
      .to(p.cols, { scaleY: 1, duration: 0.7, ease: "expo.inOut", stagger: 0.025 }, 0.1)
      .to(p.meta, { opacity: 1, duration: 0.3 }, 0.35)
      .add(scramble(p.to, to.pathname.toUpperCase(), 0.45), 0.4)
      .to(counter, {
        n: 100, duration: 0.75, ease: "power2.inOut",
        onUpdate: () => { p.count.textContent = `${Math.round(counter.n)}%`; },
      }, 0.35)
      .to(p.guidesH, { scaleX: 1, duration: 0.6, ease: "expo.inOut", stagger: 0.05 }, 0.3)
      .to(p.guidesV, { scaleY: 1, duration: 0.6, ease: "expo.inOut", stagger: 0.05 }, 0.36)
      .to(p.box, { opacity: 1, duration: 0.25 }, 0.55)
      .add(scramble(p.label, p.label.dataset.text ?? "", 0.35), 0.55)
      .to(p.paths, { strokeDashoffset: 0, duration: 0.55, ease: "power2.inOut", stagger: 0.08 }, 0.45)
      .to(p.dot, { scale: 1, duration: 0.3, ease: "back.out(3)" }, 0.9);
  });
}

export function reveal(): Promise<void> {
  const sheet = $<HTMLElement>(".pt");
  if (!sheet || getComputedStyle(sheet).visibility === "hidden") return Promise.resolve();
  const p = parts(sheet);

  return new Promise((resolve) => {
    current = gsap.timeline({
      onComplete: () => {
        gsap.set(sheet, { visibility: "hidden" });
        resolve();
      },
    })
      // guides retract the way they came, the mark leaves upwards with the sheet
      .to(p.guidesH, { scaleX: 0, transformOrigin: "100% 50%", duration: 0.45, ease: "expo.in" }, 0)
      .to(p.guidesV, { scaleY: 0, transformOrigin: "50% 100%", duration: 0.45, ease: "expo.in" }, 0)
      .to([p.box, p.meta], { opacity: 0, duration: 0.2 }, 0.1)
      .to(p.stage, { yPercent: -60, opacity: 0, duration: 0.6, ease: "power3.in" }, 0.1)
      .to(sheet, { clipPath: "inset(0% 0% 100% 0%)", duration: 0.8, ease: "power4.inOut" }, 0.2);
  });
}

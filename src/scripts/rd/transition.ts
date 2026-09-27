/**
 * Page transition: an ink sheet rises while the PG monogram plots itself,
 * then the letters morph into a circle — the "lens" that opens onto the next page.
 * Loaded on showcase pages right away, on reading pages only on link intent.
 */
import gsap from "gsap";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";

gsap.registerPlugin(MorphSVGPlugin);

const P = "M6 37V3h12a9.5 9.5 0 0 1 0 19H6";
const G = "M57.3 8.7A16 16 0 1 0 62 20H48";
// two halves of a circle centred in the viewBox
const LEFT = "M34 38A18 18 0 0 1 34 2";
const RIGHT = "M34 2A18 18 0 0 1 34 38";

const $ = <T extends Element>(sel: string) => document.querySelector<T>(sel);

export function cover(to: URL): Promise<void> {
  const sheet = $<HTMLElement>(".pt");
  if (!sheet) return Promise.resolve();
  const p = sheet.querySelector<SVGPathElement>(".pt__p")!;
  const g = sheet.querySelector<SVGPathElement>(".pt__g")!;
  const dot = sheet.querySelector<SVGCircleElement>(".pt__dot")!;
  const label = sheet.querySelector<HTMLElement>(".pt__to")!;
  label.textContent = `→ ${to.pathname}`;

  gsap.killTweensOf([sheet, p, g, dot]);
  gsap.set(sheet, { visibility: "visible", clipPath: "inset(100% 0% 0% 0%)" });
  gsap.set(p, { attr: { d: P }, strokeDashoffset: 1 });
  gsap.set(g, { attr: { d: G }, strokeDashoffset: 1 });
  gsap.set(dot, { scale: 0, transformOrigin: "50% 50%" });
  gsap.set(".pt__lens", { scale: 1 });

  return new Promise((resolve) => {
    gsap.timeline({ onComplete: resolve })
      .to(sheet, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.65, ease: "power4.inOut" })
      .to([p, g], { strokeDashoffset: 0, duration: 0.55, ease: "power2.inOut", stagger: 0.08 }, 0.25)
      .to(dot, { scale: 1, duration: 0.3, ease: "back.out(3)" }, 0.6)
      .from(label, { opacity: 0, y: 8, duration: 0.4, ease: "power3.out" }, 0.35);
  });
}

export function reveal(): Promise<void> {
  const sheet = $<HTMLElement>(".pt");
  if (!sheet || getComputedStyle(sheet).visibility === "hidden") return Promise.resolve();
  const p = sheet.querySelector<SVGPathElement>(".pt__p")!;
  const g = sheet.querySelector<SVGPathElement>(".pt__g")!;
  const dot = sheet.querySelector<SVGCircleElement>(".pt__dot")!;

  return new Promise((resolve) => {
    gsap.timeline({
      onComplete: () => {
        gsap.set(sheet, { visibility: "hidden" });
        resolve();
      },
    })
      .to(dot, { scale: 0, duration: 0.25, ease: "power2.in" })
      .to(p, { morphSVG: LEFT, duration: 0.55, ease: "power3.inOut" }, 0)
      .to(g, { morphSVG: RIGHT, duration: 0.55, ease: "power3.inOut" }, 0)
      // the circle becomes a lens: it grows past the screen edges while the sheet opens
      .to(".pt__lens", { scale: 60, duration: 0.9, ease: "power4.in" }, 0.45)
      .to(sheet, { clipPath: "inset(0% 0% 100% 0%)", duration: 0.7, ease: "power4.inOut" }, 0.75);
  });
}

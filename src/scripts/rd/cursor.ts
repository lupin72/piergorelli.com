/**
 * Blueprint cursor (showcase pages, fine pointers only):
 * full-viewport crosshair hairlines, a live X/Y readout that turns into a label
 * over interactive elements, and magnetic buttons.
 */
import gsap from "gsap";

export function initCursor(): () => void {
  if (!matchMedia("(pointer: fine)").matches || matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return () => {};
  }

  const root = document.createElement("div");
  root.className = "cursor";
  root.setAttribute("aria-hidden", "true");
  root.innerHTML = `
    <span class="cursor__h"></span>
    <span class="cursor__v"></span>
    <span class="cursor__pt"><span class="cursor__ring"></span><span class="cursor__label note"></span></span>`;
  document.body.append(root);
  document.documentElement.classList.add("has-cursor");

  const h = root.querySelector<HTMLElement>(".cursor__h")!;
  const v = root.querySelector<HTMLElement>(".cursor__v")!;
  const pt = root.querySelector<HTMLElement>(".cursor__pt")!;
  const label = root.querySelector<HTMLElement>(".cursor__label")!;

  const fast = { duration: 0.12, ease: "power3.out" };
  const hy = gsap.quickTo(h, "y", fast);
  const vx = gsap.quickTo(v, "x", fast);
  const px = gsap.quickTo(pt, "x", { duration: 0.2, ease: "power3.out" });
  const py = gsap.quickTo(pt, "y", { duration: 0.2, ease: "power3.out" });

  let hovering: HTMLElement | null = null;
  let magnet: HTMLElement | null = null;

  const coords = (x: number, y: number) =>
    `x ${String(Math.round(x)).padStart(4, "0")} · y ${String(Math.round(y)).padStart(4, "0")}`;

  const onMove = (e: PointerEvent) => {
    root.classList.add("is-visible");
    hy(e.clientY);
    vx(e.clientX);
    px(e.clientX);
    py(e.clientY);
    if (!hovering) label.textContent = coords(e.clientX, e.clientY);

    // Magnetic buttons: pulled a quarter of the way towards the pointer.
    const btn = (e.target as HTMLElement).closest<HTMLElement>(".btn, .tool");
    if (btn !== magnet) {
      if (magnet) gsap.to(magnet, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.4)" });
      magnet = btn;
    }
    if (magnet) {
      const r = magnet.getBoundingClientRect();
      gsap.to(magnet, {
        x: (e.clientX - (r.left + r.width / 2)) * 0.25,
        y: (e.clientY - (r.top + r.height / 2)) * 0.35,
        duration: 0.4,
        ease: "power3.out",
      });
    }
  };

  const onOver = (e: PointerEvent) => {
    const el = (e.target as HTMLElement).closest<HTMLElement>("a, button, summary, [data-cursor]");
    if (el === hovering) return;
    hovering = el;
    root.classList.toggle("is-hover", !!el);
    if (el) {
      label.textContent =
        el.dataset.cursor ??
        (el.tagName === "A" && (el as HTMLAnchorElement).href.startsWith("mailto:") ? "write" :
         el.tagName === "A" && (el as HTMLAnchorElement).origin !== location.origin ? "visit ↗" :
         el.tagName === "A" ? "open →" : "click");
    }
  };

  const onLeave = () => root.classList.remove("is-visible");
  const onDown = () => root.classList.add("is-down");
  const onUp = () => root.classList.remove("is-down");

  window.addEventListener("pointermove", onMove, { passive: true });
  document.addEventListener("pointerover", onOver, { passive: true });
  document.documentElement.addEventListener("pointerleave", onLeave);
  window.addEventListener("pointerdown", onDown);
  window.addEventListener("pointerup", onUp);

  return () => {
    window.removeEventListener("pointermove", onMove);
    document.removeEventListener("pointerover", onOver);
    document.documentElement.removeEventListener("pointerleave", onLeave);
    window.removeEventListener("pointerdown", onDown);
    window.removeEventListener("pointerup", onUp);
    document.documentElement.classList.remove("has-cursor");
    root.remove();
  };
}

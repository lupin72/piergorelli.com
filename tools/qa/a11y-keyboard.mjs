// Keyboard walk (WCAG 2.1.1, 2.1.2, 2.4.3, 2.4.7, 1.4.11): tabs through every page and checks that each stop
// is visible, has a focus indicator with ≥ 3:1 contrast against the page, and is not hidden under the fixed header.
// Also checks reflow at 320 px (1.4.10) and text spacing (1.4.12) for horizontal overflow.
// Needs `astro preview`. Usage: QA_URL=http://localhost:4321 node tools/qa/a11y-keyboard.mjs · QA_PATHS to narrow.
import { chromium } from "playwright-core";

const base = process.env.QA_URL ?? "http://localhost:4330";
const sitemap = await fetch(`${base}/sitemap-0.xml`).then((r) => r.text());
let paths = [...sitemap.matchAll(/<loc>https?:\/\/[^/]+(\/[^<]*)<\/loc>/g)].map((m) => m[1]);
paths.push("/404/");
if (process.env.QA_PATHS) paths = process.env.QA_PATHS.split(",");
const themes = (process.env.QA_THEMES ?? "light/blue,light/lime,dark/blue").split(",");
const motion = process.env.QA_MOTION ?? "reduce";

const browser = await chromium.launch({ channel: "chrome", headless: true });
const problems = new Map(); // "issue · element" → Set<where>
const add = (issue, where) => { const s = problems.get(issue) ?? new Set(); s.add(where); problems.set(issue, s); };

for (const combo of themes) {
  const [theme, accent] = combo.split("/");
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: motion });
  await ctx.addInitScript(([t, a]) => {
    localStorage.setItem("pg-theme", t);
    localStorage.setItem("pg-accent", a);
    sessionStorage.setItem("pg-preloaded", "1");
  }, [theme, accent]);
  const page = await ctx.newPage();
  for (const path of paths) {
    await page.goto(base + path, { waitUntil: "networkidle" });
    await page.waitForTimeout(motion === "reduce" ? 300 : 3500);
    await page.mouse.move(0, 0);
    const seen = new Set();
    for (let i = 0; i < 400; i++) {
      await page.keyboard.press("Tab");
      await page.waitForTimeout(motion === "reduce" ? 80 : 900); // let focus transitions finish
      const r = await page.evaluate(() => {
        const el = document.activeElement;
        if (!el || el === document.body) return { done: true };
        const id = el.id ? `#${el.id}` : "";
        const txt = (el.getAttribute("aria-label") || el.textContent || el.getAttribute("name") || "").trim().replace(/\s+/g, " ").slice(0, 40);
        const desc = `${el.tagName.toLowerCase()}${id}.${[...el.classList].slice(0, 2).join(".")} "${txt}"`;
        const key = el.outerHTML.slice(0, 200) + (el.getBoundingClientRect().top + scrollY);

        const lum = (c) => {
          const m = c.match(/[\d.]+/g);
          if (!m) return null;
          const [r, g, b, a = 1] = m.map(Number);
          if (a < 0.5) return null;
          const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
          return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
        };
        const ratio = (a, b) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
        const bgOf = (node) => {
          for (let n = node; n; n = n.parentElement) {
            const c = getComputedStyle(n).backgroundColor;
            const l = lum(c);
            if (l !== null) return l;
          }
          return lum(getComputedStyle(document.body).backgroundColor);
        };

        // The indicator may live on the element or on a styled sibling (custom checkbox/chip).
        // …or on the label / field wrapper via :focus-within / :has(:focus-visible).
        const candidates = [el, el.nextElementSibling, el.closest("label"), el.closest(".field, .term__prompt, .palette__search")].filter(Boolean);
        let indicator = null;
        for (const c of candidates) {
          const s = getComputedStyle(c);
          if (s.outlineStyle !== "none" && parseFloat(s.outlineWidth) > 0) { indicator = { color: s.outlineColor, node: c.parentElement ?? c }; break; }
          if (s.boxShadow !== "none") { indicator = { color: s.boxShadow, node: c.parentElement ?? c }; break; }
          const after = getComputedStyle(c, "::after"); // .field underline that inks in on focus
          if (after.content !== "none" && after.transform !== "matrix(0, 0, 0, 1, 0, 0)" && lum(after.backgroundColor) !== null) {
            indicator = { color: after.backgroundColor, node: c };
            break;
          }
        }
        const rect = el.getBoundingClientRect();
        const target = rect.width || rect.height ? el : el.nextElementSibling ?? el.parentElement;
        const tr = target.getBoundingClientRect();
        // A visually hidden input is fine when its styled sibling or label shows the focus instead.
        const proxy = el.matches("input[type=checkbox], input[type=radio]") ? (el.nextElementSibling ?? el.closest("label")) : null;
        const shown = proxy ?? el;
        const pr = shown.getBoundingClientRect();
        let invisible = pr.width < 2 || pr.height < 2 || getComputedStyle(shown).visibility === "hidden";
        for (let n = shown; n; n = n.parentElement) if (parseFloat(getComputedStyle(n).opacity) < 0.1) invisible = true;
        const cx = Math.min(innerWidth - 1, Math.max(0, tr.left + tr.width / 2));
        const cy = Math.min(innerHeight - 1, Math.max(0, tr.top + Math.min(tr.height / 2, 10)));
        const hit = document.elementFromPoint(cx, cy);
        const header = document.querySelector(".site-header");
        const underHeader = !!(hit && header?.contains(hit) && !header.contains(el));
        const offscreen = tr.bottom < 0 || tr.top > innerHeight;
        let contrast = null;
        if (indicator) {
          const l = lum(indicator.color);
          if (l !== null) contrast = ratio(l, bgOf(indicator.node));
        }
        return { desc, key, hasIndicator: !!indicator, contrast, invisible, underHeader, offscreen, inDialog: !!el.closest("dialog") };
      });
      if (r.done) break;
      if (seen.has(r.key)) break; // wrapped around
      seen.add(r.key);
      const where = `${path} ${combo}`;
      if (!r.hasIndicator) add(`no focus indicator · ${r.desc}`, where);
      else if (r.contrast !== null && r.contrast < 3) add(`focus indicator ${r.contrast.toFixed(2)}:1 · ${r.desc}`, where);
      if (r.invisible) add(`focus on invisible element · ${r.desc}`, where);
      if (r.underHeader) add(`focused element under the fixed header · ${r.desc}`, where);
      if (r.offscreen) add(`focused element off screen · ${r.desc}`, where);
    }
    if (seen.size === 0) add("no focusable element reached", `${path} ${combo}`);
  }
  await ctx.close();
}

// Reflow at 320 CSS px (1.4.10) and text-spacing override at 1280 px (1.4.12): no horizontal scroll.
// Code blocks scroll inside themselves: that is allowed (content that needs two-dimensional layout).
const ctx = await browser.newContext({ viewport: { width: 320, height: 640 }, reducedMotion: "reduce" });
const page = await ctx.newPage();
const wide = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: "reduce" });
const widePage = await wide.newPage();
for (const path of paths) {
  await page.goto(base + path, { waitUntil: "networkidle" });
  const over = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  if (over > 0) {
    const culprit = await page.evaluate(() => {
      const w = innerWidth;
      const els = [...document.querySelectorAll("body *")].filter((e) => e.getBoundingClientRect().right > w + 1 && !e.closest("pre"));
      const e = els.find((x) => ![...x.children].some((c) => els.includes(c))) ?? els[0];
      return e ? `${e.tagName.toLowerCase()}.${[...e.classList].join(".")} "${(e.textContent ?? "").trim().slice(0, 40)}"` : "?";
    });
    add(`reflow 320px: ${over}px horizontal overflow · ${culprit}`, path);
  }
  await widePage.goto(base + path, { waitUntil: "networkidle" });
  await widePage.addStyleTag({
    content: "*{line-height:1.5!important;letter-spacing:0.12em!important;word-spacing:0.16em!important}p{margin-bottom:2em!important}",
  });
  await widePage.waitForTimeout(100);
  const over2 = await widePage.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  if (over2 > 0) add(`text spacing: ${over2}px horizontal overflow`, path);
}
await ctx.close();
await wide.close();
await browser.close();

if (!problems.size) {
  console.log(`keyboard/reflow: 0 problems on ${paths.length} pages`);
  process.exit(0);
}
for (const [issue, where] of problems) {
  const list = [...where];
  console.log(`■ ${issue}\n    ↳ ${list.length}× ${list.slice(0, 4).join(", ")}`);
}
process.exit(1);

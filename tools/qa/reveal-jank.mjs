/**
 * Reveal smoothness QA: scrolls each showcase page top to bottom like a
 * wheel user (pointer resting on the page, so rows get hovered), in light and dark theme.
 * Per frame it records the frame time and the opacity/translate of every [data-reveal] element,
 * then reports: frame stats, long animation frames, and "pops" (a revealed element that was
 * visible, then jumped back to hidden, which reads as a stutter).
 * Usage: `astro preview`, then `node tools/qa/reveal-jank.mjs [baseUrl]`.
 */
import { chromium } from "playwright-core";

const BASE = process.argv[2] ?? "http://localhost:4321";
const browser = await chromium.launch({ channel: "chrome", headless: true });

const PATHS = ["/", "/services/", "/services/ai-for-agencies/", "/services/web-development-for-agencies/", "/about/", "/contact/"];
for (const [path, theme] of PATHS.flatMap((p) => ["light", "dark"].map((t) => [p, t]))) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.addInitScript((t) => { localStorage.setItem("pg-theme", t); sessionStorage.setItem("pg-preloaded", "1"); }, theme);
  await page.goto(`${BASE}${path}?qa=reveal`);
  await page.waitForTimeout(9000);
  await page.mouse.move(720, 450);

  await page.evaluate(() => {
    const els = [...document.querySelectorAll("[data-reveal], [data-plot-dot], [data-hero-fade]")];
    window.__f = []; window.__pops = new Set(); window.__loaf = [];
    const seen = new Map();
    new PerformanceObserver((l) => l.getEntries().forEach((e) => window.__loaf.push([Math.round(e.duration), Math.round(e.startTime), ...e.scripts.map((s) => `${s.invoker}@${(s.sourceURL||"").split("/").pop()}:${Math.round(s.duration)}`)].join(" ")))).observe({ type: "long-animation-frame" });
    let last = performance.now();
    const loop = (t) => {
      window.__f.push(t - last); last = t;
      els.forEach((el, i) => {
        const r = el.getBoundingClientRect();
        if (r.bottom < 0 || r.top > innerHeight) return;
        const o = +getComputedStyle(el).opacity;
        const prev = seen.get(i) ?? null;
        if (prev !== null && prev > 0.95 && o < 0.3) window.__pops.add(el.className || el.tagName);
        seen.set(i, o);
      });
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  });

  const target = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
  for (let y = 0; y < target; y += 100) { await page.mouse.wheel(0, 100); await page.waitForTimeout(40); }
  await page.waitForTimeout(1500);

  const r = await page.evaluate(() => {
    const f = window.__f.slice(2); const s = [...f].sort((a, b) => a - b);
    return { frames: f.length, median: +s[s.length >> 1].toFixed(1), p95: +s[Math.floor(s.length * 0.95)].toFixed(1),
      over20: f.filter((x) => x > 20).length, over34: f.filter((x) => x > 34).length, max: Math.round(Math.max(...f)),
      loaf: window.__loaf, pops: [...window.__pops] };
  });
  console.log(path, theme, JSON.stringify(r));
  await page.close();
}
await browser.close();

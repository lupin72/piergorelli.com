/**
 * Motion QA in headless Chrome (rAF runs, unlike a background extension window).
 * Usage: start `astro preview` (default http://localhost:4321), then `pnpm qa:motion [baseUrl]`.
 * Writes screenshots to tools/qa/out/ and prints frame stats: scroll is healthy when
 * median ≈ 16.7 ms and over34 = 0.
 */
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";

const BASE = process.argv[2] ?? "http://localhost:4321";
const OUT = new URL("./out/", import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

const probe = () => page.evaluate(() => {
  window.__f = []; let last = performance.now();
  const loop = (t) => { window.__f.push(t - last); last = t; requestAnimationFrame(loop); };
  requestAnimationFrame(loop);
});
const stats = () => page.evaluate(() => {
  const f = window.__f.slice(2); const s = [...f].sort((a, b) => a - b);
  return { frames: f.length, median: +s[s.length >> 1].toFixed(1), p99: +s[Math.floor(s.length * 0.99)].toFixed(1),
    over34: f.filter((x) => x > 34).length, max: +Math.max(...f).toFixed(0) };
});
const scroll = async () => { for (let i = 0; i < 60; i++) { await page.mouse.wheel(0, 120); await page.waitForTimeout(50); } await page.waitForTimeout(1200); };

// 1. First visit: preloader + blueprint compile, then WebGL contours under the pointer
await page.goto(`${BASE}/?qa=intro`);
await page.waitForTimeout(2400); await page.screenshot({ path: `${OUT}intro-compile.png` });
await page.waitForTimeout(7000);
await page.mouse.move(1000, 300); await page.mouse.move(1050, 320, { steps: 10 }); await page.waitForTimeout(1200);
await page.screenshot({ path: `${OUT}hero-light.png` });

// 2. Dark theme + lime accent
await page.evaluate(() => { localStorage.setItem("pg-theme", "dark"); localStorage.setItem("pg-accent", "lime"); });
await page.goto(`${BASE}/?qa=dark`); await page.waitForTimeout(8000);
await page.mouse.move(1000, 400, { steps: 10 }); await page.waitForTimeout(1200);
await page.screenshot({ path: `${OUT}hero-dark.png` });
await page.evaluate(() => { localStorage.removeItem("pg-theme"); localStorage.removeItem("pg-accent"); });

// 3. Scroll smoothness
for (const path of ["/", "/services/", "/services/ai-for-agencies/", "/services/web-development-for-agencies/", "/about/", "/contact/"]) {
  await page.goto(`${BASE}${path}?qa=scroll`); await page.waitForTimeout(10000);
  await probe(); await scroll();
  console.log(`scroll ${path}`, JSON.stringify(await stats()));
}
await page.goto(`${BASE}/?qa=manifesto`); await page.waitForTimeout(4000);
for (let i = 0; i < 9; i++) { await page.mouse.wheel(0, 120); await page.waitForTimeout(60); }
await page.waitForTimeout(1500); await page.screenshot({ path: `${OUT}manifesto.png` });

// 4. Page transition home → service
await page.goto(`${BASE}/?qa=transition`); await page.waitForTimeout(3000);
await page.click('a[href="/services/ai-for-agencies/"] >> nth=0');
await page.waitForTimeout(700); await page.screenshot({ path: `${OUT}transition-mid.png` });
await page.waitForTimeout(2500); await page.screenshot({ path: `${OUT}transition-after.png` });
console.log("transition landed on", page.url());

// 5. Blog ships no animation JS until a link is hovered
await page.goto(`${BASE}/blog/is-it-still-worth-developing-on-wordpress-in-2025/`);
const animJs = () => page.evaluate(() => performance.getEntriesByType("resource").filter((e) => /gsap|transition|motion|hero-gl/.test(e.name)).map((e) => e.name.split("/").pop()));
console.log("blog animation JS on load:", JSON.stringify(await animJs()));

// 6. Reduced motion: no cursor, WebGL or intro scaffolding
const rm = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
await rm.goto(`${BASE}/`); await rm.waitForTimeout(1500);
await rm.screenshot({ path: `${OUT}reduced-motion.png` });
console.log("reduced motion:", JSON.stringify(await rm.evaluate(() => ({
  cursor: !!document.querySelector(".cursor"), webgl: !!document.querySelector(".hero-gl"), scaffolding: !!document.querySelector(".bp"),
}))));

await browser.close();
console.log(`screenshots → ${OUT}`);

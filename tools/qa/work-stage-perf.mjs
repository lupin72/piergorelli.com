// Frame stats while wheel-scrolling through the pinned home Work stage (headless, 1440×900).
// Usage: node tools/qa/work-stage-perf.mjs [baseUrl]  (default astro preview :4321)
import { chromium } from "playwright-core";
const base = process.argv[2] ?? "http://localhost:4321";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(base + "/?qa=wsperf", { waitUntil: "networkidle" });
await page.waitForTimeout(5000);
await page.evaluate(() => { const el = document.querySelector("[data-work-stage]"); window.scrollTo(0, el.getBoundingClientRect().top + scrollY - 400); });
await page.waitForTimeout(1500);
await page.mouse.move(700, 450);
await page.evaluate(() => {
  window.__f = []; let last = performance.now();
  const loop = (t) => { if (t - last > 34) (window.__slow ??= []).push([Math.round(t - last), Math.round(scrollY), Math.round(performance.now())]); window.__f.push(t - last); last = t; requestAnimationFrame(loop); };
  requestAnimationFrame(loop);
});
for (let i = 0; i < 80; i++) { await page.mouse.wheel(0, 60); await page.waitForTimeout(40); }
await page.waitForTimeout(1500);
const s = await page.evaluate(() => {
  const f = window.__f.slice(2); const s = [...f].sort((a, b) => a - b);
  return { frames: f.length, median: +s[s.length >> 1].toFixed(1), p95: +s[Math.floor(s.length * 0.95)].toFixed(1), over20: f.filter((x) => x > 20).length, over34: f.filter((x) => x > 34).length, max: +Math.max(...f).toFixed(0) };
});
console.log("work stage", JSON.stringify(s), JSON.stringify(await page.evaluate(() => [window.__slow, performance.getEntriesByType("resource").filter(r => r.name.includes("work-stage")).map(r => Math.round(r.responseEnd)), document.querySelector("[data-work-stage]").getBoundingClientRect().top + scrollY])));
await browser.close();

// Mobile Work cards at a few scroll offsets, to pick one where the drawing is live. Default: the live site.
import { chromium } from "playwright-core";
const base = process.argv[2] ?? "https://piergorelli.com";
const out = new URL("./out/aw/", import.meta.url).pathname;
const browser = await chromium.launch({ channel: "chrome", headless: true });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, colorScheme: "light", isMobile: true, hasTouch: true });
await ctx.route(/umami/, (r) => r.abort());
await ctx.addInitScript(() => { localStorage.setItem("pg-theme", "light"); localStorage.setItem("pg-accent", "blue"); });
const page = await ctx.newPage();
await page.goto(base + "/", { waitUntil: "networkidle" });
await page.waitForTimeout(6500);
const top = await page.evaluate(() => document.querySelector("[data-work-stage]").getBoundingClientRect().top + scrollY);
for (const d of [-250, -150, -50, 50, 150]) {
  for (let y = top - 300; y <= top + d; y += 60) { await page.evaluate((y) => window.scrollTo(0, y), y); await page.waitForTimeout(60); }
  await page.waitForTimeout(2500);
  await page.screenshot({ path: `${out}mw-${d}.png` });
}
await browser.close();

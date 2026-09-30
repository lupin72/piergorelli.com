// Work stage states for the Awwwards elements, cursor parked off the text. Default: the live site.
// Usage: node tools/qa/awwwards-work.mjs [baseUrl] [theme]
import { chromium } from "playwright-core";
const base = process.argv[2] ?? "https://piergorelli.com";
const theme = process.argv[3] ?? "dark";
const out = new URL("./out/aw/", import.meta.url).pathname;
const browser = await chromium.launch({ channel: "chrome", headless: true });
const ctx = await browser.newContext({ viewport: { width: 1200, height: 900 }, deviceScaleFactor: 4 / 3, colorScheme: theme });
await ctx.route(/umami/, (r) => r.abort());
await ctx.addInitScript((t) => { localStorage.setItem("pg-theme", t); localStorage.setItem("pg-accent", "blue"); }, theme);
const page = await ctx.newPage();
await page.goto(base + "/", { waitUntil: "networkidle" });
await page.waitForTimeout(6500);
await page.addStyleTag({ content: ".cursor{display:none!important}" }); // pointer parked: no stray crosshair
const top = await page.evaluate(() => document.querySelector("[data-work-stage]").getBoundingClientRect().top + scrollY);
for (const f of [0.3]) {
  await page.evaluate((y) => window.scrollTo(0, y), top - 88 + f * 900 * 4.8);
  await page.waitForTimeout(1800);
  await page.screenshot({ path: `${out}ws-${theme}-${String(Math.round(f * 100)).padStart(2, "0")}.png` });
}
await browser.close();

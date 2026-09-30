// Frames of the home Work stage (pinned on desktop, cards on mobile). Default dev server :4322.
// Usage: node tools/qa/work-stage-frames.mjs [baseUrl] [width] [theme]
import { chromium } from "playwright-core";
const base = process.argv[2] ?? "http://localhost:4322";
const w = Number(process.argv[3] ?? 1440);
const theme = process.argv[4] ?? "light";
const out = new URL("./out/", import.meta.url).pathname;
const browser = await chromium.launch({ channel: "chrome", headless: true });
const ctx = await browser.newContext({ viewport: { width: w, height: w > 800 ? 900 : 844 }, colorScheme: theme });
const page = await ctx.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
await page.goto(base + "/?qa=work", { waitUntil: "networkidle" });
await page.waitForTimeout(4000);
const top = await page.evaluate(() => document.querySelector("[data-work-stage]").getBoundingClientRect().top + scrollY);
const steps = w > 800 ? [0.05, 0.12, 0.2, 0.24, 0.27, 0.31, 0.45, 0.6, 0.62, 0.66, 0.8, 0.95] : [0, 0.2, 0.4, 0.6, 0.8, 1, 1.4, 1.8, 2.2];
for (const [k, f] of steps.entries()) {
  const y = w > 800 ? top - 88 + f * 900 * 4.8 : top - 700 + f * 600;
  await page.evaluate((y) => window.scrollTo(0, y), y);
  await page.waitForTimeout(1600);
  await page.screenshot({ path: `${out}ws_${w}-${theme}_${String(k).padStart(2, "0")}.png` });
}
console.log({ errors });
await browser.close();

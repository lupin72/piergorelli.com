// Full-page screenshots of the piergorelli.com case study (reduced motion: static layout preview).
// Needs `astro preview` (QA_URL, default :4330).
import { chromium } from "playwright-core";
const base = process.env.QA_URL ?? "http://localhost:4330";
const out = new URL("./out/", import.meta.url).pathname;
const browser = await chromium.launch({ channel: "chrome", headless: true });
for (const [w, theme] of [[1440, "light"], [1440, "dark"], [390, "light"]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 900 }, colorScheme: theme, reducedMotion: "reduce" });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(base + "/work/piergorelli-com/", { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: out + `case_${w}-${theme}.png`, fullPage: true });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  console.log(`case_${w}-${theme}`, { overflow, errors });
  await ctx.close();
}
await browser.close();

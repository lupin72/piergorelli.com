// Screenshots of the home (light/dark desktop, light mobile): hero, then each section after
// scrolling through it so reveals have run. Needs `astro preview` (QA_URL, default :4330).
import { chromium } from "playwright-core";
const base = process.env.QA_URL ?? "http://localhost:4330";
const out = new URL("./out/", import.meta.url).pathname;
const browser = await chromium.launch({ channel: "chrome", headless: true });

for (const [w, theme] of [[1440, "light"], [1440, "dark"], [390, "light"]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 900 }, colorScheme: theme, deviceScaleFactor: 1, reducedMotion: "no-preference" });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  await page.goto(base + "/", { waitUntil: "networkidle" });
  await page.waitForTimeout(6000);
  await page.screenshot({ path: out + `home_hero_${w}-${theme}.png` });
  for (const sel of [".manifesto", "#work", "#services", "#process", ".cta"]) {
    await page.locator(sel).first().scrollIntoViewIfNeeded();
    await page.waitForTimeout(1500);
    await page.locator(sel).first().screenshot({ path: out + `home_${sel.replace(/[#.]/g, "")}_${w}-${theme}.png` });
  }
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  console.log(`home_${w}-${theme}`, { overflow, errors });
  await ctx.close();
}
await browser.close();

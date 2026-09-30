// Display-font trial: injects a candidate face on the "human" lines of the live pages and shoots them.
// Nothing in the site changes. Usage: node tools/qa/font-trial.mjs [baseUrl]  → tools/qa/out/fonts/
import { chromium } from "playwright-core";
import fs from "node:fs";
const base = process.argv[2] ?? "https://piergorelli.com";
const out = new URL("./out/fonts/", import.meta.url).pathname;
fs.mkdirSync(out, { recursive: true });

const FONTS = {
  geist: null, // today, for comparison
  hubot: { css: "Hubot+Sans:wght@200..900", family: "Hubot Sans", weight: 700, track: "-0.035em" },
  bricolage: { css: "Bricolage+Grotesque:opsz,wght@12..96,200..800", family: "Bricolage Grotesque", weight: 700, track: "-0.05em", extra: "font-variation-settings:'opsz' 96;" },
  funnel: { css: "Funnel+Display:wght@300..800", family: "Funnel Display", weight: 600, track: "-0.045em" },
  shoulders: { css: "Big+Shoulders+Display:wght@100..900", family: "Big Shoulders Display", weight: 800, track: "-0.01em" },
};
const SEL = ".display, .ws__n, .ws__of, .cta__title";

const browser = await chromium.launch({ channel: "chrome", headless: true });
for (const [key, f] of Object.entries(FONTS)) {
  const ctx = await browser.newContext({ viewport: { width: 1200, height: 900 }, deviceScaleFactor: 4 / 3, colorScheme: "light" });
  await ctx.route(/umami/, (r) => r.abort());
  await ctx.addInitScript((f) => {
    localStorage.setItem("pg-theme", "light"); localStorage.setItem("pg-accent", "blue");
    sessionStorage.setItem("pg-preloaded", "1");
    if (!f) return;
    const add = () => {
      const l = document.createElement("link"); l.rel = "stylesheet";
      l.href = `https://fonts.googleapis.com/css2?family=${f.css}&display=block`;
      const s = document.createElement("style");
      s.textContent = `${f.sel}{font-family:"${f.family}",sans-serif!important;font-weight:${f.weight}!important;letter-spacing:${f.track}!important;${f.extra ?? ""}}`;
      document.head.append(l, s);
    };
    document.head ? add() : document.addEventListener("DOMContentLoaded", add);
  }, f && { ...f, sel: SEL });
  const page = await ctx.newPage();
  for (const [name, path] of [["home", "/"], ["about", "/about/"], ["services", "/services/"]]) {
    await page.goto(base + path, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    await page.addStyleTag({ content: ".cursor{display:none!important}" });
    await page.waitForTimeout(5000);
    await page.screenshot({ path: `${out}${key}-${name}.png` });
  }
  // Work stage counter + CTA
  await page.goto(base + "/", { waitUntil: "networkidle" });
  await page.addStyleTag({ content: ".cursor{display:none!important}" });
  await page.waitForTimeout(3000);
  const top = await page.evaluate(() => document.querySelector("[data-work-stage]").getBoundingClientRect().top + scrollY);
  await page.evaluate((y) => window.scrollTo(0, y), top - 88 + 0.3 * 900 * 4.8);
  await page.waitForTimeout(2200);
  await page.screenshot({ path: `${out}${key}-work.png` });
  await ctx.close();
  console.log(key);
}
await browser.close();

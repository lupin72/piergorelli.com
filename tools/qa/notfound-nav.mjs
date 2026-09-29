// 404 reached by client-side navigation (monogram sheet first) + reduced motion. Needs `astro preview`.
import { chromium } from "playwright-core";
const base = process.env.QA_URL ?? "http://localhost:4321";
const out = new URL("./out/", import.meta.url).pathname;
const browser = await chromium.launch({ channel: "chrome", headless: true });
let ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
let page = await ctx.newPage();
await page.goto(base + "/about/", { waitUntil: "networkidle" });
await page.waitForTimeout(4000);
await page.evaluate(() => { const a = document.createElement("a"); a.href = "/servizi/ai/"; a.id = "qa-broken"; a.textContent = "x"; document.body.append(a); });
await page.click("#qa-broken");
for (const t of [0.6, 1.4, 2.4, 5.5]) {
  await page.waitForTimeout(t === 0.6 ? 600 : (t - [0.6, 1.4, 2.4, 5.5][[0.6, 1.4, 2.4, 5.5].indexOf(t) - 1]) * 1000);
  await page.screenshot({ path: `${out}404-nav-${String(t).replace(".", "_")}.png` });
}
console.log("nav", { url: page.url(), value: await page.inputValue("#nf-q") });
await ctx.close();
ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
page = await ctx.newPage();
await page.goto(base + "/nope/", { waitUntil: "domcontentloaded" });
await page.waitForTimeout(150);
await page.screenshot({ path: `${out}404-reduced.png` });
console.log("reduced", { value: await page.inputValue("#nf-q") });
await browser.close();

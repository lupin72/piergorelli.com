// Frames of the 404 intro (compile → stall → fail → router answers). Needs `astro preview`.
import { chromium } from "playwright-core";
const base = process.env.QA_URL ?? "http://localhost:4321";
const out = new URL("./out/", import.meta.url).pathname;
const w = Number(process.env.QA_W ?? 1440);
const browser = await chromium.launch({ channel: "chrome", headless: true });
const ctx = await browser.newContext({ viewport: { width: w, height: 900 }, colorScheme: process.env.QA_THEME ?? "light" });
const page = await ctx.newPage();
await page.goto(base + "/blog/kubernets-cluster/", { waitUntil: "domcontentloaded" });
const t0 = Date.now();
for (const t of [0.2, 0.7, 1.2, 1.7, 2.1, 2.4, 2.9, 3.5, 4.3, 5.5]) {
  await page.waitForTimeout(Math.max(0, t * 1000 - (Date.now() - t0)));
  await page.screenshot({ path: `${out}404-frame-${w}-${String(t).replace(".", "_")}.png` });
}
const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
console.log({ overflow, value: await page.inputValue("#nf-q") });
await browser.close();

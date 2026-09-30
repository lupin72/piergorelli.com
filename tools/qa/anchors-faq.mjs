/**
 * Anchor + FAQ motion QA: samples scrollY after clicking same-page anchors (must glide, not jump,
 * and land clear of the header), and the height of a FAQ while it opens and closes (must tween).
 * Also screenshots the services figures mid-plot. Usage: `node tools/qa/anchors-faq.mjs [baseUrl]`.
 */
import { chromium } from "playwright-core";

const BASE = process.argv[2] ?? "http://localhost:4321";
const OUT = new URL("./out/", import.meta.url).pathname;
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.addInitScript(() => sessionStorage.setItem("pg-preloaded", "1"));

const sample = (fn, ms = 1600) => page.evaluate(([fn, ms]) => new Promise((res) => {
  const out = []; const t0 = performance.now();
  const loop = () => { out.push(Math.round(eval(fn))); performance.now() - t0 < ms ? requestAnimationFrame(loop) : res(out); };
  requestAnimationFrame(loop);
}), [fn, ms]);
const summary = (arr) => `${arr[0]} → ${arr.at(-1)}, ${new Set(arr).size} distinct values over ${arr.length} frames`;

// 1. home: "See the work" and the nav "Work"
await page.goto(`${BASE}/`); await page.waitForTimeout(5000);
let s = sample("scrollY"); await page.click('a[href="#work"]'); const a1 = await s;
const top1 = await page.evaluate(() => Math.round(document.getElementById("work").getBoundingClientRect().top));
console.log("home #work:", summary(a1), "| target top", top1, "| hash", await page.evaluate(() => location.hash), "| focus", await page.evaluate(() => document.activeElement.id));
await page.evaluate(() => scrollTo(0, 0)); await page.waitForTimeout(1500);
s = sample("scrollY"); await page.click('.site-header a[href="/#work"]'); console.log("nav /#work:", summary(await s));

// 2. services hub jump list + figures
await page.goto(`${BASE}/services/`); await page.waitForTimeout(5000);
s = sample("scrollY"); await page.click(".jump__link >> nth=1"); console.log("services jump:", summary(await s));
await page.screenshot({ path: `${OUT}anchor-services.png` });

// 3. FAQ on a service page
await page.goto(`${BASE}/services/ai-for-agencies/`); await page.waitForTimeout(5000);
await page.locator("details.faq").first().scrollIntoViewIfNeeded(); await page.waitForTimeout(3000);
s = sample('document.querySelector("details.faq").getBoundingClientRect().height', 1500);
await page.click("details.faq >> nth=0 >> summary"); console.log("faq open:", summary(await s), "open =", await page.evaluate(() => document.querySelector("details.faq").open));
await page.waitForTimeout(500); await page.screenshot({ path: `${OUT}faq-open.png` });
s = sample('document.querySelector("details.faq").getBoundingClientRect().height', 1000);
await page.click("details.faq >> nth=0 >> summary"); console.log("faq close:", summary(await s), "open =", await page.evaluate(() => document.querySelector("details.faq").open));
await page.focus("details.faq >> nth=1 >> summary"); await page.keyboard.press("Enter"); await page.waitForTimeout(900);
console.log("faq keyboard Enter opens:", await page.evaluate(() => document.querySelectorAll("details.faq")[1].open));
await browser.close();

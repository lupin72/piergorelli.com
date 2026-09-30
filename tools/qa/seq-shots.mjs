// Numbered sequences (line through the circles) and the AI in products figure mid-plot.
// Needs `astro preview`. Usage: QA_URL=http://localhost:4321 node tools/qa/seq-shots.mjs
import { chromium } from "playwright-core";
const BASE = process.env.QA_URL ?? "http://localhost:4321";
const OUT = new URL("./out/", import.meta.url).pathname;
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const settle = (ms) => page.waitForTimeout(ms);
async function open(path, w = 1440) {
  await page.setViewportSize({ width: w, height: 900 });
  await page.goto(BASE + path, { waitUntil: "networkidle" });
  await page.evaluate(() => sessionStorage.setItem("pg-preloaded", "1"));
  await settle(3000);
}
async function shot(sel, ratio, name) {
  const el = page.locator(sel).first();
  const y = await el.evaluate((n, r) => n.getBoundingClientRect().top + scrollY - innerHeight * r, ratio);
  await page.evaluate((y) => scrollTo(0, y), y);
  await settle(3000);
  const b = await el.boundingBox();
  const top = Math.max(0, b.y - 40);
  await page.screenshot({ path: `${OUT}seq-${name}.png`, clip: { x: 0, y: top, width: page.viewportSize().width, height: Math.min(b.height + 80, 900 - top) } });
}
await open("/services/");
await shot("#ai-in-products .sfig", 0.45, "hub-product-early");
await shot("#ai-in-products .sfig", 0.3, "hub-product-mid");
await shot(".models", 0.3, "hub-models");
await open("/services/web-development-for-agencies/");
await shot(".seq", 0.3, "webdev");
await open("/services/ai-for-agencies/");
await shot(".seq", 0.3, "aiag");
await open("/services/ai-product-integration/", 390);
await shot(".seq", 0.1, "aiprod-390");
await open("/services/ai-product-integration/", 900);
await shot(".seq", 0.1, "aiprod-900");
await browser.close();

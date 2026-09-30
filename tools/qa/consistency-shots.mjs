// Visual check for the consistency pass (30/09): work visuals plotted on scroll, AI for agencies hero,
// hero indices, CTAs. Needs `astro preview`. Usage: QA_URL=http://localhost:4321 node tools/qa/consistency-shots.mjs
import { chromium } from "playwright-core";
const BASE = process.env.QA_URL ?? "http://localhost:4321";
const OUT = new URL("./out/", import.meta.url).pathname;
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const settle = (ms) => page.waitForTimeout(ms);

async function open(path) {
  await page.goto(BASE + path, { waitUntil: "networkidle" });
  await page.evaluate(() => sessionStorage.setItem("pg-preloaded", "1"));
  await settle(3500);
}
// Scrolls so the element's top sits at `ratio` of the viewport, then shoots its parent card.
async function plotAt(sel, ratio, name, nth = 0) {
  const el = page.locator(sel).nth(nth);
  const y = await el.evaluate((n, r) => n.getBoundingClientRect().top + scrollY - innerHeight * r, ratio);
  await page.evaluate((y) => scrollTo(0, y), y);
  await settle(900);
  const box = await el.boundingBox();
  await page.screenshot({ path: `${OUT}cons-${name}.png`, clip: { x: box.x, y: Math.max(0, box.y), width: box.width, height: Math.min(box.height, 900 - Math.max(0, box.y)) } });
}

await open("/");
for (const [i, r] of [[0, 0.95], [0, 0.7], [0, 0.4]].entries()) await plotAt(".work .visual", r[1], `home-work0-${i}`);
await plotAt(".work .visual", 0.4, "home-work1", 1);
await plotAt(".work .visual", 0.4, "home-work2", 2);
await plotAt(".cta", 0.1, "home-cta");

await open("/services/ai-for-agencies/");
await page.screenshot({ path: `${OUT}cons-aiag-hero.png` });
await plotAt(".cases", 0.3, "aiag-cases");
await plotAt(".report__visual .visual", 0.5, "aiag-report-mid");
await plotAt(".report__visual .visual", 0.2, "aiag-report-end");

await open("/services/ai-product-integration/");
await plotAt(".visual--catalogue", 0.6, "aiprod-cat-mid");
await open("/services/web-development-for-agencies/");
await plotAt(".visual", 0.3, "webdev-proof");
await open("/about/");
await plotAt(".log__line", 0.7, "about-log");
await open("/blog/");
await page.screenshot({ path: `${OUT}cons-blog-top.png`, clip: { x: 0, y: 0, width: 1440, height: 260 } });

// Dark theme + mobile hero of the aligned page.
await page.setViewportSize({ width: 390, height: 844 });
await open("/services/ai-for-agencies/");
await page.screenshot({ path: `${OUT}cons-aiag-hero-390.png` });
await browser.close();

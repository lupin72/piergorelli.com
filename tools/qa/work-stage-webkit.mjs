// Safari check of the Work stage cards (WebKit, iPhone-sized): scrolls down through a card and back up,
// screenshotting its drawing, so clip/mask invalidation bugs show up. Default preview :4321.
// Usage: node tools/qa/work-stage-webkit.mjs [baseUrl] [slug]
import { webkit } from "playwright-core";
const base = process.argv[2] ?? "http://localhost:4321";
const slug = process.argv[3] ?? "piergorelli-com";
const out = new URL("./out/", import.meta.url).pathname;
const browser = await webkit.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
await page.goto(base + "/", { waitUntil: "networkidle" });
await page.waitForTimeout(4000);
const art = page.locator(`[data-ws-item="${slug}"] .ws__art`);
const top = await art.evaluate((el) => el.getBoundingClientRect().top + scrollY);
const ys = [0, 150, 300, 450, 600, 750, 450, 300, 150, 0];
for (const [k, dy] of ys.entries()) {
  await page.evaluate((y) => scrollTo(0, y), top - 844 * 0.85 + dy);
  await page.waitForTimeout(1300);
  await art.screenshot({ path: `${out}wk_${slug}_${String(k).padStart(2, "0")}.png` });
}
console.log({ errors });
await browser.close();

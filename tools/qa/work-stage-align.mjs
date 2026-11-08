// How far each headline word moves between the build drawing and the live screenshot of a Work stage card.
// Compares the two frames at high density and reports the best (dx, dy) in stage units (1 unit = 2 px of the site).
// Usage: node tools/qa/work-stage-align.mjs [baseUrl] [slug]  (needs astro preview)
import { chromium } from "playwright-core";
import sharp from "sharp";

const base = process.argv[2] ?? "http://localhost:4330";
const slug = process.argv[3] ?? "coachmaitefinch";
const DPR = 4;
const RANGE = 14;
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: DPR })).newPage();
await page.goto(base + "/?qa=align", { waitUntil: "networkidle" });
await page.waitForTimeout(4000);
const { top, n, index } = await page.evaluate((s) => {
  const items = [...document.querySelectorAll("[data-ws-item]")];
  return { top: document.querySelector("[data-work-stage]").getBoundingClientRect().top + scrollY, n: items.length, index: items.findIndex((i) => i.dataset.wsItem === s) };
}, slug);
const art = page.locator(".ws__art").nth(index);
const frame = async (t) => {
  await page.evaluate((y) => scrollTo(0, y), top - 88 + ((index * 4 + t) / ((n - 1) * 4 + 3.6)) * 900 * 1.6 * n);
  await page.waitForTimeout(1800);
  return art.screenshot();
};
const build = await frame(2);
const live = await frame(3);
const boxes = await art.evaluate((el) => {
  const a = el.getBoundingClientRect();
  return { unit: a.width / 800, words: [...el.querySelectorAll('.build g[clip-path] use')].map((u) => { const r = u.getBoundingClientRect(); return { id: u.getAttribute("href"), x: r.left - a.left, y: r.top - a.top, w: r.width, h: r.height }; }) };
});
await browser.close();

const gray = async (png) => {
  const { data, info } = await sharp(png).grayscale().raw().toBuffer({ resolveWithObject: true });
  return { data, w: info.width, h: info.height };
};
const A = await gray(build);
const B = await gray(live);
const score = (r, dx, dy) => {
  let sum = 0;
  for (let y = r.y; y < r.y + r.h; y += 2) for (let x = r.x; x < r.x + r.w; x += 2) sum += Math.abs(A.data[y * A.w + x] - B.data[(y + dy) * B.w + (x + dx)]);
  return sum;
};
for (const w of boxes.words) {
  const r = { x: Math.round(w.x * DPR), y: Math.round(w.y * DPR), w: Math.round(w.w * DPR), h: Math.round(w.h * DPR) };
  const parts = [["whole", r], ["left", { ...r, w: Math.round(r.w * 0.2) }], ["right", { ...r, x: r.x + Math.round(r.w * 0.8), w: Math.round(r.w * 0.2) }]];
  const out = parts.map(([name, p]) => {
    let best = { s: Infinity };
    for (let dy = -RANGE; dy <= RANGE; dy++) for (let dx = -RANGE; dx <= RANGE; dx++) {
      const s = score(p, dx, dy);
      if (s < best.s) best = { s, dx, dy };
    }
    const k = DPR * boxes.unit;
    return `${name} ${(best.dx / k).toFixed(2)},${(best.dy / k).toFixed(2)}`;
  });
  console.log(w.id.replace("#ws-mf-", "word "), out.join("  |  "));
}

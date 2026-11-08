// Frames of one project of the pinned home Work stage, by stage time (0–3: plot, build, live).
// Usage: node tools/qa/work-stage-case.mjs [baseUrl] [index] [theme]  → tools/qa/out/case_*.png
import { chromium } from "playwright-core";
const base = process.argv[2] ?? "http://localhost:4321";
const index = Number(process.argv[3] ?? 0);
const theme = process.argv[4] ?? "light";
const out = new URL("./out/", import.meta.url).pathname;
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: theme })).newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
await page.goto(base + "/?qa=work", { waitUntil: "networkidle" });
await page.waitForTimeout(4000);
const { top, n } = await page.evaluate(() => ({ top: document.querySelector("[data-work-stage]").getBoundingClientRect().top + scrollY, n: document.querySelectorAll("[data-ws-item]").length }));
const total = (n - 1) * 4 + 3.6;
for (const t of [0.5, 0.95, 1.5, 1.95, 2.45, 3]) {
  await page.evaluate((y) => window.scrollTo(0, y), top - 88 + ((index * 4 + t) / total) * 900 * 1.6 * n);
  await page.waitForTimeout(1600);
  await page.locator(".ws__art").nth(index).screenshot({ path: `${out}case_${index}-${theme}_${String(t).replace(".", "-")}.png` });
}
await page.screenshot({ path: `${out}case_${index}-${theme}_page.png` });
console.log({ errors });
await browser.close();

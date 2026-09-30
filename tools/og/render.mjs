// Renders the default social image (public/og-default.png) from tools/og/default.html.
// Usage: node tools/og/render.mjs [output path]
import { chromium } from "playwright-core";
import { fileURLToPath } from "node:url";

const src = new URL("./default.html", import.meta.url);
const out = process.argv[2] ?? fileURLToPath(new URL("../../public/og-default.png", import.meta.url));
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.goto(src.href);
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: out });
await browser.close();
console.log(out);

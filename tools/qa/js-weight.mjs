// JavaScript shipped per page type, as the browser loads it (gzip bytes on the wire, no interaction).
// Needs `astro preview` (QA_URL, default :4330). Feeds the Proof table of the piergorelli.com case study.
import { chromium } from "playwright-core";
import { gzipSync } from "node:zlib";
const base = process.env.QA_URL ?? "http://localhost:4330";
const paths = (process.env.QA_PATHS ?? "/,/services/,/about/,/contact/,/blog/,/blog/10-tips-to-start-ui-design-with-focus/,/privacy-policy/").split(",");
const browser = await chromium.launch({ channel: "chrome", headless: true });
for (const path of paths) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const files = new Map();
  page.on("response", async (r) => {
    if (r.request().resourceType() !== "script") return;
    try { files.set(new URL(r.url()).pathname, gzipSync(await r.body()).length); } catch {}
  });
  await page.goto(base + path, { waitUntil: "networkidle" });
  await page.waitForTimeout(3000);
  const total = [...files.values()].reduce((a, b) => a + b, 0);
  console.log(path.padEnd(48), (total / 1024).toFixed(1) + " KB", [...files.keys()].map((f) => f.split("/").pop().split(".")[0]).join(" "));
  await ctx.close();
}
await browser.close();

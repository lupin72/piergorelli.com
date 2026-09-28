/**
 * Records the page transition home → /about/ frame by frame (CDP screencast).
 * Usage: node tools/qa/transition-frames.mjs <baseUrl> <outDir> [light|dark] [width] [height]
 * Then contact-sheet the JPEGs, e.g. `montage out/light-*.jpg -tile 5x -geometry 480x300 sheet.jpg`.
 */
import { chromium } from "playwright-core";
const [,, base, out, theme="light", w="1440", h="900"] = process.argv;
const browser = await chromium.launch({ channel: "chrome", headless: true });
const ctx = await browser.newContext({ viewport: { width: +w, height: +h } });
await ctx.addInitScript(() => { try { sessionStorage.setItem("pg-preloaded","1"); } catch {} });
const page = await ctx.newPage();
await page.goto(`${base}/`); await page.waitForTimeout(3500);
if (theme === "dark") await page.evaluate(() => document.documentElement.dataset.theme = "dark");
const client = await page.context().newCDPSession(page);
const frames = [];
client.on("Page.screencastFrame", async (f) => { frames.push({ t: f.metadata.timestamp, d: f.data }); await client.send("Page.screencastFrameAck", { sessionId: f.sessionId }); });
await client.send("Page.startScreencast", { format: "jpeg", quality: 70, everyNthFrame: 1 });
await page.evaluate(() => { const a = [...document.querySelectorAll('a[href="/about/"]')].at(-1); a.click(); });
await page.waitForTimeout(3500);
await client.send("Page.stopScreencast");
const fs = await import("node:fs");
const t0 = frames[0]?.t ?? 0;
frames.forEach((f, i) => fs.writeFileSync(`${out}/${theme}-${String(i).padStart(3,"0")}-${Math.round((f.t-t0)*1000)}.jpg`, Buffer.from(f.d, "base64")));
console.log(frames.length, "frames");
await browser.close();

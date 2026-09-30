// Screen recordings for the Awwwards elements (1600×1200 MP4, needs ffmpeg). Default: the live site.
// Usage: node tools/qa/awwwards-video.mjs [baseUrl] [only]   → tools/qa/out/aw/video/*.mp4
import { chromium } from "playwright-core";
import fs from "node:fs";
import { execFileSync } from "node:child_process";
const base = process.argv[2] ?? "https://piergorelli.com";
const only = process.argv[3];
const out = new URL("./out/aw/video/", import.meta.url).pathname;
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true, args: ["--enable-gpu-rasterization", "--ignore-gpu-blocklist"] });
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function open(theme, { preloaded = true } = {}) {
  const ctx = await browser.newContext({ viewport: { width: 1200, height: 900 }, deviceScaleFactor: 4 / 3, colorScheme: theme });
  await ctx.route(/umami/, (r) => r.abort());
  await ctx.addInitScript(([t, p]) => {
    localStorage.setItem("pg-theme", t); localStorage.setItem("pg-accent", "blue");
    if (p) sessionStorage.setItem("pg-preloaded", "1");
  }, [theme, preloaded]);
  return ctx.newPage();
}

// CDP screencast → frames with timestamps → constant 30 fps MP4 through ffmpeg's concat demuxer.
async function record(page, name, act) {
  const dir = `${out}${name}/`;
  fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir);
  const cdp = await page.context().newCDPSession(page);
  const frames = [];
  cdp.on("Page.screencastFrame", async (f) => {
    frames.push({ t: f.metadata.timestamp, d: f.data });
    await cdp.send("Page.screencastFrameAck", { sessionId: f.sessionId }).catch(() => {});
  });
  await cdp.send("Page.startScreencast", { format: "jpeg", quality: 92, maxWidth: 1600, maxHeight: 1200, everyNthFrame: 1 });
  const t0 = Date.now() / 1000;
  await act();
  const t1 = Date.now() / 1000;
  await cdp.send("Page.stopScreencast");
  let list = "";
  frames.forEach((f, i) => {
    const file = `${String(i).padStart(4, "0")}.jpg`;
    fs.writeFileSync(dir + file, Buffer.from(f.d, "base64"));
    const next = frames[i + 1]?.t ?? t1;
    list += `file '${file}'\nduration ${Math.max(0.001, next - f.t).toFixed(4)}\n`;
  });
  list += `file '${String(frames.length - 1).padStart(4, "0")}.jpg'\n`;
  fs.writeFileSync(dir + "list.txt", list);
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", dir + "list.txt",
    "-vf", "scale=1600:1200:flags=lanczos,fps=30,format=yuv420p", "-c:v", "libx264", "-preset", "slow", "-crf", "24",
    "-movflags", "+faststart", "-an", `${out}${name}.mp4`]);
  const kb = Math.round(fs.statSync(`${out}${name}.mp4`).size / 1024);
  console.log(name, frames.length, "frames", (t1 - t0).toFixed(1) + "s", kb + " KB");
}

const glide = async (page, pts, steps = 40) => { for (const [x, y] of pts) await page.mouse.move(x, y, { steps }); };

// 1 · Hero: first visit, full compile intro, then the hill follows the pointer.
if (!only || only === "hero") {
  const page = await open("dark", { preloaded: false });
  await page.mouse.move(900, 450);
  await record(page, "el1-hero-compile", async () => {
    await page.goto(base + "/", { waitUntil: "commit" });
    await wait(7000);
    await glide(page, [[820, 420], [960, 560], [700, 600], [880, 380]], 60);
    await wait(800);
  });
  await page.context().close();
}

// 2 · Work stage: wheel through the pinned stage, three projects, plot → build → live.
if (!only || only === "work") {
  const page = await open("light");
  await page.goto(base + "/", { waitUntil: "networkidle" });
  await wait(3000);
  const top = await page.evaluate(() => document.querySelector("[data-work-stage]").getBoundingClientRect().top + scrollY);
  await page.evaluate((y) => window.scrollTo(0, y), top - 88);
  await page.addStyleTag({ content: ".cursor{display:none!important}" }); // pointer parked: no stray crosshair
  await wait(1500);
  await record(page, "el2-work-stage", async () => {
    for (let i = 0; i < 215; i++) { await page.mouse.wheel(0, 28); await wait(80); }
    await wait(1500);
  });
  await page.context().close();
}

// 3 · Page transitions with the monogram: home → About → Services.
if (!only || only === "transition") {
  const page = await open("dark");
  await page.goto(base + "/", { waitUntil: "networkidle" });
  await wait(3000);
  await record(page, "el3-monogram-transition", async () => {
    for (const to of ["/about/", "/services/"]) {
      const link = page.locator(`header a[href="${to}"]:visible`).first();
      const b = await link.boundingBox();
      await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 30 });
      await wait(500);
      await page.mouse.down(); await page.mouse.up();
      await wait(3200);
    }
  });
  await page.context().close();
}

// 4 · Blueprint layer: cursor and magnetic buttons, grid (⌥G), ⌘K palette.
if (!only || only === "blueprint") {
  const page = await open("light");
  await page.goto(base + "/about/", { waitUntil: "networkidle" });
  await wait(3500);
  await page.mouse.move(600, 500);
  await record(page, "el4-blueprint-layer", async () => {
    await glide(page, [[300, 300], [800, 420], [1050, 560]], 50);
    const talk = await page.locator("header .btn:visible").first().boundingBox();
    if (talk) await glide(page, [[talk.x + talk.width / 2 + 10, talk.y + talk.height / 2 + 6]], 40);
    await wait(900);
    await page.keyboard.press("Alt+KeyG"); await wait(1400);
    await glide(page, [[600, 520]], 40);
    await page.keyboard.press("Alt+KeyG"); await wait(600);
    await page.keyboard.press("Meta+KeyK"); await wait(900);
    await page.keyboard.type("ai", { delay: 180 }); await wait(1200);
    await page.keyboard.press("ArrowDown"); await wait(400);
    await page.keyboard.press("ArrowDown"); await wait(900);
    await page.keyboard.press("Escape"); await wait(800);
  });
  await page.context().close();
}

await browser.close();

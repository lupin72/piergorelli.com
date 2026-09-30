// Raw captures for the Awwwards submission (1600×1200 output). Default: the live site.
// Usage: node tools/qa/awwwards-shots.mjs [baseUrl] [outDir relative to tools/qa/]
import { chromium } from "playwright-core";
const base = process.argv[2] ?? "https://piergorelli.com";
const out = new URL(process.argv[3] ?? "./out/aw/", import.meta.url).pathname;
await import("node:fs").then((fs) => fs.mkdirSync(out, { recursive: true }));
const browser = await chromium.launch({ channel: "chrome", headless: true });
const errors = [];

async function open(path, { theme = "light", accent = "blue", w = 1200, h = 900, dpr = 4 / 3, mobile = false } = {}) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: dpr, colorScheme: theme, isMobile: mobile, hasTouch: mobile });
  await ctx.route(/umami|cloud\.umami/, (r) => r.abort()); // keep QA visits out of the stats
  await ctx.addInitScript(([t, a]) => { localStorage.setItem("pg-theme", t); localStorage.setItem("pg-accent", a); }, [theme, accent]);
  const page = await ctx.newPage();
  page.on("pageerror", (e) => errors.push(path + " " + e.message));
  await page.goto(base + path, { waitUntil: "networkidle" });
  await page.waitForTimeout(6500); // full compile intro
  return page;
}
const shot = (page, name) => page.screenshot({ path: `${out}${name}.png` });

for (const theme of ["light", "dark"]) {
  let p = await open("/", { theme });
  await p.mouse.move(820, 520, { steps: 20 });
  await p.waitForTimeout(1200);
  await shot(p, `home-hero-${theme}`);
  // Work stage, live state of each project (pinned, 1.6 viewports per project)
  const top = await p.evaluate(() => document.querySelector("[data-work-stage]").getBoundingClientRect().top + scrollY);
  for (const [k, f] of [0.3, 0.63, 0.95].entries()) {
    await p.evaluate((y) => window.scrollTo(0, y), top - 88 + f * 900 * 4.8);
    await p.waitForTimeout(2200);
    await shot(p, `home-work${k + 1}-${theme}`);
  }
  await p.context().close();

  for (const path of ["/about/", "/services/", "/work/piergorelli-com/", "/services/ai-for-agencies/", "/services/web-development-for-agencies/", "/services/ai-product-integration/", "/contact/", "/404"]) {
    p = await open(path, { theme });
    await shot(p, `page${path.replace(/\/$/, "").replace(/\//g, "-") || "-home"}-${theme}`);
    await p.context().close();
  }
}

// Mobile (iPhone-sized), light and dark
for (const theme of ["light", "dark"]) {
  const m = { theme, w: 390, h: 844, dpr: 3, mobile: true };
  let p = await open("/", m);
  await shot(p, `m-hero-${theme}`);
  const top = await p.evaluate(() => document.querySelector("[data-work-stage]").getBoundingClientRect().top + scrollY);
  await p.evaluate((y) => window.scrollTo(0, y), top + 200);
  await p.waitForTimeout(2500);
  await shot(p, `m-work-${theme}`);
  await p.context().close();
  p = await open("/about/", m);
  await shot(p, `m-about-${theme}`);
  await p.context().close();
}

console.log({ errors });
await browser.close();

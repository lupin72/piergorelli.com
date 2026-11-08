// Screenshots of /services/wordpress-redesign/: light/dark, desktop/mobile, before/after slider, animated hero.
// Needs `astro preview` (default :4330). Usage: node tools/qa/wpredesign-shots.mjs · QA_URL to change the server.
import { chromium } from "playwright-core";

const base = process.env.QA_URL ?? "http://localhost:4330";
const path = "/services/wordpress-redesign/";
const out = "tools/qa/out";
const browser = await chromium.launch({ channel: "chrome", headless: true });

async function open(w, h, theme, reducedMotion = "reduce") {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, reducedMotion });
  await ctx.addInitScript((t) => {
    localStorage.setItem("pg-theme", t);
    sessionStorage.setItem("pg-preloaded", "1");
  }, theme);
  const page = await ctx.newPage();
  const errors = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(base + path, { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  return { ctx, page, errors };
}

for (const [w, h, theme] of [[1440, 900, "light"], [1440, 900, "dark"], [390, 844, "light"]]) {
  const { ctx, page, errors } = await open(w, h, theme);
  const label = `wp-${w}-${theme}`;
  await page.screenshot({ path: `${out}/${label}.png`, fullPage: true });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  await page.locator("[data-ba]").scrollIntoViewIfNeeded();
  await page.waitForTimeout(800);
  await page.locator("[data-ba]").screenshot({ path: `${out}/${label}-compare.png` });
  console.log(label, "overflow", overflow, "errors", errors.length ? errors : 0);
  await ctx.close();
}

// Form: inline errors on an empty submit, then a mocked Netlify POST (real submissions only work on a deploy).
{
  const { ctx, page, errors } = await open(1440, 1400, "light");
  await page.route(`${base}/`, (r) => (r.request().method() === "POST" ? r.fulfill({ status: 200, body: "ok" }) : r.continue()));
  await page.locator("[data-estimate-send]").scrollIntoViewIfNeeded();
  await page.locator("[data-estimate-send]").click();
  const invalid = await page.locator('[data-estimate] [aria-invalid="true"]').count();
  const focused = await page.evaluate(() => document.activeElement?.id);
  await page.locator("#estimate").screenshot({ path: `${out}/wp-form-errors.png` });
  await page.fill("#e-url", "mybakery.com");
  await page.fill("#e-email", "a@b.co");
  await page.locator("label:has(#e-terms)").click({ position: { x: 8, y: 8 } });
  const [req] = await Promise.all([page.waitForRequest((r) => r.method() === "POST"), page.locator("[data-estimate-send]").click()]);
  await page.waitForSelector("[data-estimate-done]:not([hidden])");
  await page.locator("#estimate").screenshot({ path: `${out}/wp-form-done.png` });
  console.log("form: invalid", invalid, "focus", focused, "payload", req.postData(), "errors", errors.length ? errors : 0);

  // Proof image: lazy, so scroll to it before judging.
  const img = page.locator(".case__shot");
  await img.scrollIntoViewIfNeeded();
  await page.waitForTimeout(800);
  console.log("proof image loaded", await img.evaluate((i) => i.complete && i.naturalWidth));
  await page.locator(".cases").screenshot({ path: `${out}/wp-proof.png` });
  await ctx.close();
}

// With motion: the hero after its intro, and dragging the before/after slider.
const { ctx, page, errors } = await open(1440, 900, "light", "no-preference");
await page.waitForTimeout(4500);
await page.screenshot({ path: `${out}/wp-hero-motion.png` });
const ba = page.locator("[data-ba]");
await ba.scrollIntoViewIfNeeded();
await page.waitForTimeout(1800);
const box = await ba.boundingBox();
await page.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.5);
await page.mouse.down();
await page.mouse.move(box.x + box.width * 0.8, box.y + box.height * 0.5, { steps: 8 });
await page.mouse.up();
console.log("drag", await ba.evaluate((e) => e.style.getPropertyValue("--pos")));
await ba.screenshot({ path: `${out}/wp-compare-drag.png` });
console.log("motion errors", errors.length ? errors : 0);
await ctx.close();

await browser.close();

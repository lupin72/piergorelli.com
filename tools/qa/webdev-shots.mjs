// Screenshots of /services/web-development-for-agencies/ (light/dark, desktop/mobile) + the easing lab
// before/after Play. Needs `astro preview` (QA_URL, default :4330).
import { chromium } from "playwright-core";
const base = process.env.QA_URL ?? "http://localhost:4330";
const path = "/services/web-development-for-agencies/";
const out = new URL("./out/", import.meta.url).pathname;
const browser = await chromium.launch({ channel: "chrome", headless: true });

const settle = (page) => page.evaluate(async () => {
  for (let y = 0; y < document.body.scrollHeight; y += 400) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); }
  scrollTo(0, 0);
});

for (const [w, theme] of [[1440, "light"], [1440, "dark"], [390, "light"]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 900 }, colorScheme: theme, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  await page.goto(base + path, { waitUntil: "networkidle" });
  await page.waitForTimeout(3500);
  await page.screenshot({ path: out + `webdev_hero_${w}-${theme}.png` });
  await settle(page);
  await page.waitForTimeout(1600);
  await page.screenshot({ path: out + `webdev_${w}-${theme}.png`, fullPage: true });
  const lab = page.locator(".lab");
  await lab.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1200);
  await page.getByText("back.out", { exact: true }).click();
  await page.locator(".lab__play").click();
  await page.waitForTimeout(350);
  await lab.screenshot({ path: out + `webdev_lab_mid_${w}-${theme}.png` });
  await page.waitForTimeout(1200);
  await lab.screenshot({ path: out + `webdev_lab_${w}-${theme}.png` });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  console.log(`webdev_${w}-${theme}`, { overflow, errors });
  await ctx.close();
}
await browser.close();

// Screenshots of the blog index + a topic page (light/dark, desktop/mobile). Needs `astro preview` on :4330.
import { chromium } from "playwright-core";
const base = process.env.QA_URL ?? "http://localhost:4330";
const out = new URL("./out/", import.meta.url).pathname;
const browser = await chromium.launch({ channel: "chrome", headless: true });
const shots = [
  ["/blog/", 1440, "light"], ["/blog/", 1440, "dark"], ["/blog/", 390, "light"], ["/blog/topic/dev/", 1440, "light"],
];
for (const [path, w, theme] of shots) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 900 }, colorScheme: theme, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  await page.goto(base + path, { waitUntil: "networkidle" });
  await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 400) { scrollTo(0, y); await new Promise(r => setTimeout(r, 60)); } scrollTo(0, 0); });
  await page.waitForTimeout(1600);
  const name = `blog${path.replaceAll("/", "_")}${w}-${theme}.png`;
  await page.screenshot({ path: out + name, fullPage: true });
  if (w === 1440 && theme === "light" && path === "/blog/") {
    const row = page.locator(".entry").first();
    await row.scrollIntoViewIfNeeded(); await row.hover(); await page.waitForTimeout(1000);
    await page.screenshot({ path: out + "blog_hover.png" });
  }
  console.log(name);
  await ctx.close();
}
await browser.close();

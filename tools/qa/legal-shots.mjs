// Screenshots of the legal pages (light/dark, desktop/mobile) + footer. Needs `astro preview` on :4330.
import { chromium } from "playwright-core";
const base = process.env.QA_URL ?? "http://localhost:4330";
const out = new URL("./out/", import.meta.url).pathname;
const browser = await chromium.launch({ channel: "chrome", headless: true });
const shots = [
  ["/privacy-policy/", 1440, "light"], ["/privacy-policy/", 1440, "dark"], ["/privacy-policy/", 390, "light"],
  ["/cookie-policy/", 1440, "light"], ["/cookie-policy/", 390, "dark"],
];
for (const [path, w, theme] of shots) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 900 }, colorScheme: theme, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const errors = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  await page.goto(base + path, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
  const cookies = (await ctx.cookies()).length;
  const name = `legal${path.replaceAll("/", "_")}${w}-${theme}.png`;
  await page.screenshot({ path: out + name, fullPage: true });
  console.log(name, { overflow, cookies, errors });
  await ctx.close();
}
await browser.close();

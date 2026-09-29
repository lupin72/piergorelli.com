// Screenshots of the 404 (light/dark, desktop/mobile) on a mistyped URL. Needs `astro preview`.
import { chromium } from "playwright-core";
const base = process.env.QA_URL ?? "http://localhost:4321";
const out = new URL("./out/", import.meta.url).pathname;
const browser = await chromium.launch({ channel: "chrome", headless: true });
const shots = [
  ["/blog/kubernets-cluster/", 1440, "light"], ["/blog/kubernets-cluster/", 1440, "dark"],
  ["/blog/kubernets-cluster/", 390, "light"], ["/servizi/ai/", 1440, "light"],
];
for (const [path, w, theme] of shots) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 900 }, colorScheme: theme, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const errors = [];
  page.on("console", (m) => m.type() === "error" && !m.text().includes("404") && errors.push(m.text()));
  await page.goto(base + path, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
  const name = `404${path.replaceAll("/", "_")}${w}-${theme}.png`;
  await page.screenshot({ path: out + name, fullPage: w < 800 });
  console.log(name, { overflow, errors });
  await ctx.close();
}
await browser.close();

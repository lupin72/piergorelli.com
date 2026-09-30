// Screenshots of /contact/ (light/dark, desktop/mobile) + the brief form filled in and sent
// (the Netlify POST is mocked). Needs `astro preview` on :4330.
import { chromium } from "playwright-core";
const base = process.env.QA_URL ?? "http://localhost:4330";
const out = new URL("./out/", import.meta.url).pathname;
const browser = await chromium.launch({ channel: "chrome", headless: true });

const settle = (page) => page.evaluate(async () => {
  for (let y = 0; y < document.body.scrollHeight; y += 400) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); }
  scrollTo(0, 0);
});

for (const [w, theme] of [[1440, "light"], [1440, "dark"], [390, "light"]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 900 }, colorScheme: theme, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  await page.goto(base + "/contact/", { waitUntil: "networkidle" });
  await page.waitForTimeout(3500);
  await page.screenshot({ path: out + `contact_hero_${w}-${theme}.png` });
  await settle(page);
  await page.waitForTimeout(1600);
  await page.screenshot({ path: out + `contact_${w}-${theme}.png`, fullPage: true });
  console.log(`contact_${w}-${theme}.png`);
  await ctx.close();
}

// Filled + sent
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: "light" });
const page = await ctx.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
let posted = "";
await page.route("**/", (route) => {
  if (route.request().method() !== "POST") return route.continue();
  posted = route.request().postData() ?? "";
  return route.fulfill({ status: 200, body: "ok" });
});
await page.goto(base + "/contact/", { waitUntil: "networkidle" });
await page.waitForTimeout(2500);
await page.locator("#brief").scrollIntoViewIfNeeded();
await settle(page);
await page.fill("#f-name", "Ada Lovelace");
await page.fill("#f-email", "ada@agency.studio");
await page.fill("#f-company", "Analytical Engines");
for (const v of ["AI for agencies", "Web development", "1–3 months"]) await page.locator(`input[value="${v}"]`).check({ force: true });
await page.fill("#f-message", "A launch site for a new client, with a WebGL hero and a CMS the team can edit.");
await page.locator('input[name="nda"]').check({ force: true });
await page.locator('input[name="terms"]').check({ force: true });
await page.locator(".field").nth(3).scrollIntoViewIfNeeded();
await page.waitForTimeout(900);
await page.screenshot({ path: out + "contact_filled.png" });
await page.click("[data-brief-send]");
await page.waitForTimeout(900);
await page.screenshot({ path: out + "contact_sent.png" });
console.log("posted:", decodeURIComponent(posted));
console.log("errors:", errors.length ? errors : "none");
await browser.close();

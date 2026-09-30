// Mobile header menu (⌘K palette) and footer bottom at 360/390 px. QA_URL defaults to :4322 (dev).
import { chromium } from "playwright-core";
const base = process.env.QA_URL ?? "http://localhost:4322";
const out = new URL("./out/", import.meta.url).pathname;
const browser = await chromium.launch({ channel: "chrome", headless: true });
for (const w of [360, 390]) {
  for (const theme of ["light", "dark"]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: 800 }, colorScheme: theme, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
    const page = await ctx.newPage();
    await page.goto(base + "/about/", { waitUntil: "networkidle" });
    await page.waitForTimeout(3500);
    await page.locator(".tool--menu").click();
    await page.waitForTimeout(900);
    await page.screenshot({ path: out + `menu_${w}-${theme}.png` });
    await page.keyboard.press("Escape");
    await page.evaluate(() => scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1500);
    await page.locator(".site-footer .footer-sign").screenshot({ path: out + `footer-sign_${w}-${theme}.png` });
    await page.screenshot({ path: out + `footer_${w}-${theme}.png` });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    console.log(w, theme, { overflow });
    await ctx.close();
  }
}
await browser.close();
